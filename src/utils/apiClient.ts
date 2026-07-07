import axios from 'axios';
import { secureStorage } from './secureStorage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { getBaseUrl, getPhysicalDeviceId } from './deviceAndConfig';

// Create a custom Axios instance
export const apiClient = axios.create({
  timeout: 15000,
  headers: {
    'content-type': 'application/json',
  },
});

// Request Interceptor: Attach dynamic base URL, device ID, and authorization token
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Fetch dynamic base URL from Remote Config
    const baseUrl = await getBaseUrl();
    if (baseUrl) {
      config.baseURL = baseUrl;
    }

    // 2. Fetch and attach physical device ID
    const deviceId = await getPhysicalDeviceId();
    if (deviceId) {
      config.headers['deviceid'] = deviceId;
    }

    // 3. Retrieve and attach token if it exists (skip for public OTP endpoints)
    const isPublicOtpEndpoint = config.url && (
      config.url.includes('/otp/send') || 
      config.url.includes('/otp/verify') || 
      config.url.includes('/otp/resend')
    );

    if (!isPublicOtpEndpoint) {
      const accessToken = await secureStorage.getItem(STORAGE_KEYS.accessToken);
      const tempToken = await secureStorage.getItem(STORAGE_KEYS.tempToken);
      const token = accessToken || tempToken;

      if (token) {
        // AWS Gateway case-sensitivity workaround: clean up uppercase Authorization to avoid duplication
        if (config.headers.Authorization) {
          config.headers.authorization = config.headers.Authorization;
          delete config.headers.Authorization;
        }

        if (!config.headers.authorization) {
          config.headers.authorization = `Bearer ${token}`;
        }
        if (!config.headers['x-authorization']) {
          config.headers['x-authorization'] = `Bearer ${token}`;
        }
      }
    }

    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, JSON.stringify({
      headers: typeof config.headers.toJSON === 'function' ? config.headers.toJSON() : config.headers,
      data: config.data,
    }, null, 2));

    return config;
  },
  (error) => {
    console.warn('[API Request Error]', error.message || error);
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle successful responses and automatically retry on 401 using the refresh token
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, JSON.stringify(response.data, null, 2));
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    console.warn(`[API Response Error] ${error.response?.status} ${originalRequest?.url}`, JSON.stringify(error.response?.data || error.message, null, 2));

    // If 401 Unauthorized and we haven't retried this request yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStorage.getItem(STORAGE_KEYS.refreshToken);

        if (refreshToken) {
          console.log('[API Auth] Attempting token refresh...');
          const baseUrl = await getBaseUrl();
          const deviceId = await getPhysicalDeviceId();

          // Create a raw axios request (no interceptors) to avoid loops
          const refreshResponse = await axios.post(`${baseUrl}/api/auth/token/refresh`, {
            refreshToken,
          }, {
            headers: {
              'content-type': 'application/json',
              'deviceid': deviceId,
            },
          });

          if (refreshResponse.data?.success) {
            const data = refreshResponse.data.data || refreshResponse.data;
            const newAccessToken = data.accessToken;
            const newRefreshToken = data.refreshToken;

            if (newAccessToken) {
              console.log('[API Auth] Token refresh successful, updating storage.');
              await secureStorage.setItem(STORAGE_KEYS.accessToken, newAccessToken);
              if (newRefreshToken) {
                await secureStorage.setItem(STORAGE_KEYS.refreshToken, newRefreshToken);
              }

              // Update the authorization header of the original request and retry it
              originalRequest.headers.authorization = `Bearer ${newAccessToken}`;
              if (originalRequest.headers.Authorization) {
                delete originalRequest.headers.Authorization;
              }
              return apiClient(originalRequest);
            }
          }
        }
      } catch (refreshError) {
        console.error('[API Auth] Token refresh failed, clearing session.', refreshError);
        
        // Clear all session tokens on refresh failure to force relogin
        await Promise.all([
          secureStorage.removeItem(STORAGE_KEYS.accessToken),
          secureStorage.removeItem(STORAGE_KEYS.refreshToken),
          secureStorage.removeItem(STORAGE_KEYS.tempToken),
        ]);
        
        // Reject the promise so the app handles the error (redirecting to login)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
