// Auth Service - Handles all authentication API calls
// TODO: Replace with actual API calls when backend is ready

export interface LoginResponse {
  success: boolean;
  message: string;
  verificationId?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  isNewUser: boolean;
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
}

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  age?: number;
  isRegistered: boolean;
  isSubscribed: boolean;
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
    verificationId: 'dummy_verification_' + Date.now(),
  };
};

// Verify OTP
export const verifyOtp = async (verificationId: string, otp: string): Promise<VerifyOtpResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // TODO: Replace with actual API call
  // API: POST /api/auth/verify-otp
  // Body: { verificationId, otp }
  
  // For demo: accept any 6-digit OTP
  if (otp.length === 6) {
    return {
      success: true,
      message: 'OTP verified successfully',
      isNewUser: true, // In production, this comes from backend
      tempToken: 'temp_token_' + Date.now(),           // For new users
      accessToken: 'access_token_' + Date.now(),      // For existing users
      refreshToken: 'refresh_token_' + Date.now(),    // For existing users
      userId: 'user_' + Date.now(),
    };
  }

  return {
    success: false,
    message: 'Invalid OTP',
    isNewUser: false,
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
    accessToken: 'access_token_' + Date.now(),
    refreshToken: 'refresh_token_' + Date.now(),
  };
};

// Get user profile
export const getUser = async (accessToken: string): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // TODO: Replace with actual API call
  // API: GET /api/users/me
  // Headers: { Authorization: `Bearer ${accessToken}` }
  
  return {
    id: 'user_demo',
    phoneNumber: '+919876543210',
    name: 'Demo User',
    age: 30,
    isRegistered: true,
    isSubscribed: false,
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