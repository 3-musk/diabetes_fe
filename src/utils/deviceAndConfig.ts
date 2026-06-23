import remoteConfig from '@react-native-firebase/remote-config';
import * as Application from 'expo-application';
import { Platform } from 'react-native';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { secureStorage } from './secureStorage';

// Helper to get physical device ID (with persistent fallback in secure storage)
export const getPhysicalDeviceId = async (): Promise<string> => {
  let physicalId: string | null = null;
  
  try {
    if (Platform.OS === 'android') {
      physicalId = await Application.getAndroidId();
    } else if (Platform.OS === 'ios') {
      physicalId = await Application.getIosIdForVendorAsync();
    }
  } catch (error) {
    console.error('Error fetching physical device ID natively:', error);
  }

  // If a valid physical ID is found, return it
  if (physicalId) {
    return physicalId;
  }

  // Fallback: Check secure storage or generate a unique persistent ID
  try {
    let fallbackId = await secureStorage.getItem(STORAGE_KEYS.deviceId);
    if (!fallbackId) {
      fallbackId = 'device_fallback_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
      await secureStorage.setItem(STORAGE_KEYS.deviceId, fallbackId);
      console.log(`Generated and stored new fallback device ID: ${fallbackId}`);
    } else {
      console.log(`Retrieved existing fallback device ID: ${fallbackId}`);
    }
    return fallbackId;
  } catch (storageError) {
    console.error('Error accessing secure storage for fallback device ID:', storageError);
    return 'temp_device_id_' + Date.now();
  }
};

// Helper to fetch dynamic base URL from Firebase Remote Config (no fallback URL)
export const getBaseUrl = async (): Promise<string> => {
  try {
    // Configure remote config settings
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 300000 : 43200000, // 5 minutes in dev, 12 hours in production
    });

    // Set defaults (no fallback URL for base URL)
    await remoteConfig().setDefaults({
      api_base_url: '',
    });

    // Fetch and activate values
    await remoteConfig().fetchAndActivate();

    const baseUrl = remoteConfig().getValue('api_base_url').asString();
    return baseUrl;
  } catch (error) {
    console.error('Error fetching base URL from Firebase Remote Config:', error);
    return '';
  }
};

// Helper to check if app is under maintenance
export const checkMaintenanceMode = async (): Promise<boolean> => {
  try {
    // Configure remote config settings
    await remoteConfig().setConfigSettings({
      minimumFetchIntervalMillis: __DEV__ ? 300000 : 43200000,
    });

    // Set defaults
    await remoteConfig().setDefaults({
      api_base_url: '',
      under_maintanance: false,
      under_maintenance: false,
    });

    // Fetch and activate values
    await remoteConfig().fetchAndActivate();

    const baseUrl = remoteConfig().getValue('api_base_url').asString();
    const underMaint1 = remoteConfig().getValue('under_maintanance').asBoolean();
    const underMaint2 = remoteConfig().getValue('under_maintenance').asBoolean();

    console.log(`Maintenance check - Base URL: "${baseUrl}", under_maintanance: ${underMaint1}, under_maintenance: ${underMaint2}`);

    // Under maintenance if baseUrl is not set (empty) OR under_maintanance is true OR under_maintenance is true
    if (!baseUrl || underMaint1 || underMaint2) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error checking maintenance mode from Remote Config:', error);
    // If Remote Config fails and we have no base URL, treat it as under maintenance (no fallback URL)
    return true;
  }
};
