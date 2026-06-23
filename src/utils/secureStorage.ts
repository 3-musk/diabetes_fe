import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const secureStorage = {
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`secureStorage setItem error for key "${key}":`, error);
      // Fallback to AsyncStorage just in case
      await AsyncStorage.setItem(key, value);
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`secureStorage getItem error for key "${key}":`, error);
      // Fallback to AsyncStorage
      return await AsyncStorage.getItem(key);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`secureStorage removeItem error for key "${key}":`, error);
      // Fallback to AsyncStorage
      await AsyncStorage.removeItem(key);
    }
  },
};

export default secureStorage;
