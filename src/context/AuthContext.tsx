import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    sendOtp,
    verifyOtp as apiVerifyOtp,
    createUser as apiCreateUser,
    getUser as apiGetUser,
    logout as apiLogout,
    User,
    CreateUserRequest
} from '../services/authService';
import { getSubscription } from '../services/subscriptionService';

interface AuthContextType {
    isLoggedIn: boolean;
    isSubscribed: boolean;
    isLoading: boolean;
    userPhoneNumber: string | null;
    userId: string | null;
    isNewUser: boolean | null;
    tempToken: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    verificationId: string | null;
    user: User | null;
    login: (phoneNumber: string) => Promise<void>;
    verifyOtp: (otp: string) => Promise<boolean>;
    resendOtp: () => Promise<void>;
    completeRegistration: (registrationData: { name: string; age: string }) => Promise<void>;
    completeSubscription: () => Promise<void>;
    logout: () => Promise<void>;
    setVerificationId: (id: string) => void;
    refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userPhoneNumber, setUserPhoneNumber] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState<boolean | null>(null);
    const [tempToken, setTempToken] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [verificationId, setVerificationId] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    // Check auth status on app start
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const [storedPhone, storedAccessToken, storedRefreshToken, storedUserId, newUser, subscribed] =
                    await Promise.all([
                        AsyncStorage.getItem('userPhoneNumber'),
                        AsyncStorage.getItem('accessToken'),
                        AsyncStorage.getItem('refreshToken'),
                        AsyncStorage.getItem('userId'),
                        AsyncStorage.getItem('isNewUser'),
                        AsyncStorage.getItem('isSubscribed'),
                    ]);

                if (storedAccessToken) {
                    setIsLoggedIn(true);
                    setAccessToken(storedAccessToken);
                    setRefreshToken(storedRefreshToken);
                    setUserPhoneNumber(storedPhone);
                    setUserId(storedUserId);
                    setIsNewUser(newUser === 'true');
                    setIsSubscribed(subscribed === 'true');

                    // Fetch user profile
                    const userProfile = await apiGetUser(storedAccessToken);
                    if (userProfile) {
                        setUser(userProfile);
                        setIsSubscribed(userProfile.isSubscribed);
                    }
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (phoneNumber: string) => {
        try {
            const response = await sendOtp(phoneNumber);
            console.log("login response : ",response)
            if (response.success) {
                await AsyncStorage.setItem('userPhoneNumber', phoneNumber);
                setUserPhoneNumber(phoneNumber);

                if (response.verificationId) {
                    setVerificationId(response.verificationId);
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    };

    const verifyOtp = async (otp: string): Promise<boolean> => {
        try {
            const response = await apiVerifyOtp(verificationId || '', otp);
            console.log("verify OTP : ",response);
            if (response.success) {
                // Store tokens based on user type
                if (response.isNewUser && response.tempToken) {
                    // New user gets temp token
                    setTempToken(response.tempToken);
                    await AsyncStorage.setItem('tempToken', response.tempToken);
                } else if (response.accessToken && response.refreshToken) {
                    // Existing user gets access & refresh tokens
                    setAccessToken(response.accessToken);
                    setRefreshToken(response.refreshToken);
                    await AsyncStorage.setItem('accessToken', response.accessToken);
                    await AsyncStorage.setItem('refreshToken', response.refreshToken);
                }

                if (response.userId) {
                    setUserId(response.userId);
                    await AsyncStorage.setItem('userId', response.userId);
                }

                setIsNewUser(response.isNewUser);
                setIsLoggedIn(true);

                return true;
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            throw error;
        }
    };

    const resendOtp = async (): Promise<void> => {
        try {
            const response = await sendOtp(userPhoneNumber || '');
            if (response.verificationId) {
                setVerificationId(response.verificationId);
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            throw error;
        }
    };

    const completeRegistration = async (registrationData: { name: string; age: string }) => {
        if (!tempToken || !userPhoneNumber) {
            throw new Error('Invalid session. Please login again.');
        }

        try {
            const requestData: CreateUserRequest = {
                name: registrationData.name,
                age: registrationData.age,
                phoneNumber: userPhoneNumber,
            };

            const response = await apiCreateUser(tempToken, requestData);

            if (response.success) {
                // Replace temp token with real tokens
                setAccessToken(response.accessToken);
                setRefreshToken(response.refreshToken);
                setTempToken(null);
                setIsNewUser(false)

                await Promise.all([
                    AsyncStorage.setItem('accessToken', response.accessToken),
                    AsyncStorage.setItem('refreshToken', response.refreshToken),
                    AsyncStorage.setItem('isNewUser', 'false'),
                    AsyncStorage.removeItem('tempToken'),
                    AsyncStorage.setItem('userData', JSON.stringify(registrationData || {})),
                ]);

                setIsNewUser(false);

                // Fetch user profile
                const userProfile = await apiGetUser(response.accessToken);
                if (userProfile) {
                    setUser(userProfile);
                }
            } else {
                throw new Error(response.message);
            }
        } catch (error) {
            console.error('Error completing registration:', error);
            throw error;
        }
    };

    const completeSubscription = async () => {
        if (!accessToken) {
            throw new Error('Invalid session. Please login again.');
        }

        try {
            // Get subscription to verify it's active
            const subscription = await getSubscription(accessToken);

            if (subscription) {
                await AsyncStorage.setItem('isSubscribed', 'true');
                setIsSubscribed(true);
            } else {
                throw new Error('No active subscription found');
            }
        } catch (error) {
            console.error('Error completing subscription:', error);
            throw error;
        }
    };

    const refreshAuth = async () => {
        if (!accessToken) return;

        try {
            const userProfile = await apiGetUser(accessToken);
            if (userProfile) {
                setUser(userProfile);
                setIsSubscribed(userProfile.isSubscribed);
            }
        } catch (error) {
            console.error('Error refreshing auth:', error);
        }
    };

    const logout = async () => {
        try {
            if (accessToken) {
                await apiLogout(accessToken);
            }

            await Promise.all([
                AsyncStorage.removeItem('userPhoneNumber'),
                AsyncStorage.removeItem('userId'),
                AsyncStorage.removeItem('accessToken'),
                AsyncStorage.removeItem('refreshToken'),
                AsyncStorage.removeItem('tempToken'),
                AsyncStorage.removeItem('isRegistered'),
                AsyncStorage.removeItem('isSubscribed'),
                AsyncStorage.removeItem('userData'),
                AsyncStorage.removeItem('subscriptionPlan'),
            ]);

            // Reset all state
            setUserPhoneNumber(null);
            setUserId(null);
            setIsLoggedIn(false);
            setIsSubscribed(false);
            setIsNewUser(null);
            setTempToken(null);
            setAccessToken(null);
            setRefreshToken(null);
            setVerificationId(null);
            setUser(null);
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            isSubscribed,
            isLoading,
            userPhoneNumber,
            userId,
            isNewUser,
            tempToken,
            accessToken,
            refreshToken,
            verificationId,
            user,
            login,
            verifyOtp,
            resendOtp,
            completeRegistration,
            completeSubscription,
            logout,
            setVerificationId,
            refreshAuth,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};