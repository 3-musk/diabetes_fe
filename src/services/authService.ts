import { STORAGE_KEYS } from '../constants/storageKeys';
import { apiClient } from '../utils/apiClient';
import { secureStorage } from '../utils/secureStorage';

export interface LoginResponse {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  isFirstTimeUser: boolean;
  isSubscriptionActive: boolean;
  tempToken?: string;        // For new users
  accessToken?: string;      // For existing users
  refreshToken?: string;     // For existing users
  flow?: string;             // REGISTER or LOGIN
  userId?: string;
}

export interface CreateUserRequest {
  name: string;
  yearOfBirth: number;
  diagnosisYear: number;
  gender: string;
  doctorReferralCode: string;
  email: string;
  dataCollectionConsent: boolean;
  aiAnalysisConsent: boolean;
  heightCm: number;
  targetWeightKg: number;
  fcmToken?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  isFirstTimeUser: boolean;
  isSubscriptionActive: boolean;
}

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  gender?: string;
  yearOfBirth?: number;
  heightCm?: number;
  currentWeightKg?: number;
  targetWeightKg?: number;
  diagnosisYear?: number;
  age?: number;
  isRegistered: boolean;
  isFirstTimeUser: boolean;
  isSubscriptionActive: boolean;
  hasBmiDetails?: boolean;
  hasCarePlan?: boolean;
  hasLifestyleQuestion?: boolean;
  subscriptionPlan?: string;
  subscriptionFeatures?: string[];
  createdAt: string;
  updatedAt: string;
}

// (getPhysicalDeviceId and getBaseUrl are handled automatically by apiClient interceptors)

// Helper to format phone number to E.164 format (+91 prefix)
const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) {
    return phone;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return phone.startsWith('+') ? phone : `+${cleaned}`;
};

// Send OTP to phone number
export const sendOtp = async (phoneNumber: string): Promise<LoginResponse> => {
  const formattedPhone = formatPhoneNumber(phoneNumber);

  try {
    const response = await apiClient.post('/api/auth/otp/send', {
      phoneNumber: formattedPhone,
    });

    const result = response.data;

    if (result.success && result.data?.otpToken) {
      return {
        success: true,
        message: result.message || 'OTP sent successfully',
        verificationId: result.data.otpToken,
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to send OTP',
      };
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    const apiMessage = (error as any).response?.data?.message || (error as Error).message || 'Network request failed';
    return {
      success: false,
      message: apiMessage,
    };
  }
};

// Resend OTP
export const resendOtp = async (phoneNumber: string): Promise<LoginResponse> => {
  const formattedPhone = formatPhoneNumber(phoneNumber);

  try {
    const response = await apiClient.post('/api/auth/otp/resend', {
      phoneNumber: formattedPhone,
    });

    const result = response.data;

    if (result.success && result.data?.otpToken) {
      return {
        success: true,
        message: result.message || 'OTP sent successfully',
        verificationId: result.data.otpToken,
      };
    } else {
      return {
        success: false,
        message: result.message || 'Failed to resend OTP',
      };
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    const apiMessage = (error as any).response?.data?.message || (error as Error).message || 'Network request failed';
    return {
      success: false,
      message: apiMessage,
    };
  }
};

// Verify OTP
export const verifyOtp = async (verificationId: string, otp: string): Promise<VerifyOtpResponse> => {
  const rawPhone = await secureStorage.getItem(STORAGE_KEYS.userPhoneNumber) || '';
  const fcmToken = await secureStorage.getItem(STORAGE_KEYS.fcmToken) || '';
  const formattedPhone = formatPhoneNumber(rawPhone);

  try {
    const response = await apiClient.post('/api/auth/otp/verify', {
      otpToken: verificationId,
      otp: otp,
      phoneNumber: formattedPhone,
      fcmToken: fcmToken,
    });

    const result = response.data;

    if (result.success && result.data) {
      const flow = result.data.flow || (result.data.verifiedToken ? 'REGISTER' : 'LOGIN');
      const isFirstTimeUser = result.data.isFirstTimeUser ?? true;
      const isSubscriptionActive = result.data.isSubscriptionActive ?? false;
      const verifiedToken = result.data.verifiedToken;
      const accessToken = result.data.accessToken || (flow === 'LOGIN' ? verifiedToken : undefined);
      const refreshToken = result.data.refreshToken;
      const tempToken = flow === 'REGISTER' ? verifiedToken : undefined;

      return {
        success: true,
        message: result.message || 'OTP verified successfully',
        isFirstTimeUser,
        isSubscriptionActive,
        tempToken,
        accessToken,
        refreshToken,
        flow,
        userId: result.data.userId || 'user_' + Date.now(),
      };
    } else {
      return {
        success: false,
        message: result.message || 'Invalid OTP',
        isFirstTimeUser: false,
        isSubscriptionActive: false,
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    const apiMessage = (error as any).response?.data?.message || (error as Error).message || 'Network request failed';
    return {
      success: false,
      message: apiMessage,
      isFirstTimeUser: false,
      isSubscriptionActive: false,
    };
  }
};

// Create new user (after OTP verification for new users)
export const createUser = async (
  accessToken: string,
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  try {
    const fcmToken = await secureStorage.getItem(STORAGE_KEYS.fcmToken) || '';
    const payload = {
      ...userData,
      fcmToken,
    };

    const response = await apiClient.post('/api/user/register', payload, {
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });

    const result = response.data;

    if (result.success && result.data) {
      return {
        success: true,
        message: result.message || 'User registered successfully.',
        userId: result.data.id,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
        isFirstTimeUser: result.data.isFirstTimeUser ?? true,
        isSubscriptionActive: result.data.isSubscriptionActive ?? false,
      };
    } else {
      throw new Error(result.message || 'Failed to register user');
    }
  } catch (error) {
    console.error('Error registering user:', error);
    const apiMessage = (error as any).response?.data?.message || (error as Error).message || 'Failed to register user';
    throw new Error(apiMessage);
  }
};

// Get user profile
export const getUser = async (accessToken?: string): Promise<User | null> => {
  try {
    const headers = accessToken ? { authorization: `Bearer ${accessToken}` } : undefined;
    const response = await apiClient.get('/api/internal/ai/user-details/by-email', { headers });

    const result = response.data;
    if (result.success && result.data) {
      const u = result.data;
      
      const isFirstTimeUser = u.isFirstTimeUser ?? (u.name ? false : true);
      const isSubscriptionActive = u.isSubscriptionActive ?? false;

      return {
        id: u.id,
        phoneNumber: u.phoneNumber || '',
        name: u.name || '',
        email: u.email || '',
        gender: u.gender || '',
        yearOfBirth: u.yearOfBirth,
        heightCm: u.heightCm,
        currentWeightKg: u.currentWeightKg,
        targetWeightKg: u.targetWeightKg,
        diagnosisYear: u.diagnosisYear,
        isRegistered: !!u.name,
        isFirstTimeUser,
        isSubscriptionActive,
        hasBmiDetails: u.hasBmiDetails,
        hasCarePlan: u.hasCarePlan,
        hasLifestyleQuestion: u.hasLifestyleQuestion,
        subscriptionFeatures: u.subscriptionFeatures || [],
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
      };
    }
  } catch (error) {
    console.error('Error fetching user profile from API:', error);
  }
  return null;
};

export const updateUser = async (userData: any): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.put('/api/user/update', userData);
    if (response.data && response.data.success) {
      return { success: true };
    }
    return { success: false, message: response.data?.message || 'Update failed' };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, message: 'Update failed' };
  }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // API: POST /api/auth/refresh-token
  // Body: { refreshToken }
  
  return {
    accessToken: 'new_access_token_' + Date.now(),
    refreshToken: 'new_refresh_token_' + Date.now(),
  };
};

// Logout
export const logout = async (refreshToken: string): Promise<{ success: boolean }> => {
  try {
    await apiClient.post('/api/auth/logout', null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
  } catch (err) {
    // Even if the API call fails (e.g. token already expired), we still
    // clear local data so the user is logged out on-device.
    console.warn('Logout API error (ignoring):', err);
  }
  return { success: true };
};

// Alias for backward compatibility
export const login = sendOtp;
export const registerUser = createUser;
export const updateSubscription = async (userId: string, planId: string) => ({ success: true, message: 'Subscription updated' });
