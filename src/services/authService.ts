import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/storageKeys';

export interface LoginResponse {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
  isFirstTimeUser: boolean;
  isSubscriptionActive: boolean;
  tempToken?: string;        // For new users
  accessToken?: string;      // For existing users
  refreshToken?: string;     // For existing users
  userId?: string;
}

export interface CreateUserRequest {
  name: string;
  age: string;
  phoneNumber: string;
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
  age?: number;
  isRegistered: boolean;
  isSubscribed: boolean;
  isFirstTimeUser: boolean;
  isSubscriptionActive: boolean;
  subscriptionPlan?: string;
  createdAt: string;
  updatedAt: string;
}

// Send OTP to phone number
export const sendOtp = async (phoneNumber: string): Promise<LoginResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // TODO: Replace with actual API call
  // API: POST /api/auth/send-otp
  // Body: { phoneNumber }
  
  return {
    success: true,
    message: 'OTP sent successfully',
    verificationId: `dummy_verification_${phoneNumber}_` + Date.now(),
  };
};

// Verify OTP
export const verifyOtp = async (verificationId: string, otp: string): Promise<VerifyOtpResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // TODO: Replace with actual API call
  // API: POST /api/auth/verify-otp
  // Body: { verificationId, otp }
  
  // Extract phone number from verificationId if present
  let phoneNumber = '';
  const match = verificationId.match(/dummy_verification_(.*?)_\d+/);
  if (match) {
    phoneNumber = match[1];
  }

  // Determine user state based on phone number prefix
  let isNewUser = true;
  let isFirstTimeUser = true;
  let isSubscriptionActive = false;

  if (phoneNumber.includes('88888')) {
    isNewUser = false;
    isFirstTimeUser = false;
    isSubscriptionActive = true;
  } else if (phoneNumber.includes('77777')) {
    isNewUser = false;
    isFirstTimeUser = false;
    isSubscriptionActive = false;
  } else {
    // Default: new user flow
    isNewUser = true;
    isFirstTimeUser = true;
    isSubscriptionActive = false;
  }

  if (otp.length === 6) {
    const formattedPhone = phoneNumber || '+919876543210';
    return {
      success: true,
      message: 'OTP verified successfully',
      isNewUser,
      isFirstTimeUser,
      isSubscriptionActive,
      tempToken: isNewUser ? 'temp_token_' + Date.now() : undefined,
      accessToken: !isNewUser ? `access_token_${formattedPhone.includes('88888') ? '88888' : '77777'}_` + Date.now() : undefined,
      refreshToken: !isNewUser ? 'refresh_token_' + Date.now() : undefined,
      userId: 'user_' + Date.now(),
    };
  }

  return {
    success: false,
    message: 'Invalid OTP',
    isNewUser: false,
    isFirstTimeUser: false,
    isSubscriptionActive: false,
  };
};

// Create new user (after OTP verification for new users)
export const createUser = async (
  accessToken: string,
  userData: CreateUserRequest
): Promise<CreateUserResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // TODO: Replace with actual API call
  // API: POST /api/users
  // Headers: { Authorization: `Bearer ${accessToken}` }
  // Body: { name, age, phoneNumber }
  
  return {
    success: true,
    message: 'User created successfully',
    userId: 'user_' + Date.now(),
    accessToken: 'access_token_new_' + Date.now(),
    refreshToken: 'refresh_token_' + Date.now(),
    isFirstTimeUser: true,
    isSubscriptionActive: false,
  };
};

// Get user profile
export const getUser = async (accessToken: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // API: GET /api/users/me
  // Headers: { Authorization: `Bearer ${accessToken}` }
  
  let isFirstTimeUser = true;
  let isSubscriptionActive = false;

  const localActive = await AsyncStorage.getItem(STORAGE_KEYS.isSubscriptionActive);
  const hasLocalActive = localActive === 'true';

  if (accessToken.includes('88888')) {
    isFirstTimeUser = false;
    isSubscriptionActive = true;
  } else if (accessToken.includes('77777')) {
    isFirstTimeUser = false;
    isSubscriptionActive = hasLocalActive;
  } else if (accessToken.includes('new')) {
    isSubscriptionActive = hasLocalActive;
    isFirstTimeUser = !hasLocalActive;
  }

  return {
    id: 'user_demo',
    phoneNumber: '+919876543210',
    name: 'Demo User',
    age: 30,
    isRegistered: true,
    isSubscribed: isSubscriptionActive,
    isFirstTimeUser,
    isSubscriptionActive,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
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
export const logout = async (accessToken: string): Promise<{ success: boolean }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // API: POST /api/auth/logout
  // Headers: { Authorization: `Bearer ${accessToken}` }
  
  return {
    success: true,
  };
};

// Alias for backward compatibility
export const login = sendOtp;
export const registerUser = createUser;
export const updateSubscription = async (userId: string, planId: string) => ({ success: true, message: 'Subscription updated' });
