// utils/authenticatedFetch.ts - ENHANCED VERSION
import { API_ENDPOINTS } from '../config/apiConfig';
import { secureStorage } from './secureStorage';

const DEBUG = __DEV__;

interface AuthContextRef {
  token: string | null;
  refreshTokenValue: string | null;
  setToken: (token: string) => void;
  logout: () => Promise<void>;
}

let authRef: AuthContextRef | null = null;
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

// ✅ Queue for failed requests during token refresh
let requestQueue: Array<{
  resolve: (value: Response) => void;
  reject: (error: any) => void;
  url: string;
  options: RequestInit;
}> = [];

export const setAuthRef = (ref: AuthContextRef) => {
  authRef = ref;
  if (DEBUG) console.log('🔗 Auth ref set for authenticatedFetch');
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!authRef || !authRef.refreshTokenValue) {
    if (DEBUG) console.log('❌ No refresh token available');
    return null;
  }

  // ✅ If already refreshing, wait for that promise
  if (isRefreshing && refreshPromise) {
    if (DEBUG) console.log('⏳ Already refreshing, waiting...');
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      if (DEBUG) console.log('🔄 Refreshing token...');
      
      const response = await fetch(API_ENDPOINTS.REFRESH_TOKEN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: authRef!.refreshTokenValue }),
      });

      if (!response.ok) {
        if (DEBUG) console.log('❌ Refresh failed, status:', response.status);
        
        if (response.status === 401 || response.status === 403) {
          if (DEBUG) console.log('🚪 Refresh token invalid, logging out');
          await authRef!.logout();
        }
        
        return null;
      }

      const data = await response.json();
      const newToken = data.access_token;
      
      if (DEBUG) console.log('✅ Token refreshed successfully');
      
      // ✅ Update token in auth context AND secure storage
      authRef!.setToken(newToken);
      await secureStorage.storeAuthData(
        newToken,
        authRef!.refreshTokenValue || undefined,
        null // User data stays the same
      );
      
      // ✅ Process queued requests with new token
      if (requestQueue.length > 0) {
        if (DEBUG) console.log(`📤 Processing ${requestQueue.length} queued requests`);
        
        for (const queuedRequest of requestQueue) {
          try {
            const response = await fetch(queuedRequest.url, {
              ...queuedRequest.options,
              headers: {
                ...queuedRequest.options.headers,
                'Authorization': `Bearer ${newToken}`,
              },
            });
            queuedRequest.resolve(response);
          } catch (error) {
            queuedRequest.reject(error);
          }
        }
        
        requestQueue = [];
      }
      
      return newToken;
    } catch (error) {
      if (DEBUG) console.error('❌ Token refresh error:', error);
      
      // ✅ Reject all queued requests
      for (const queuedRequest of requestQueue) {
        queuedRequest.reject(new Error('Token refresh failed'));
      }
      requestQueue = [];
      
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ✅ Enhanced fetch with retry logic
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  if (!authRef) {
    throw new Error('Auth ref not initialized. Make sure AuthProvider is mounted.');
  }

  const makeRequest = async (token: string | null): Promise<Response> => {
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };

  // ✅ First attempt with current token
  let response = await makeRequest(authRef.token);

  // ✅ Handle 401 - token expired
  if (response.status === 401) {
    if (DEBUG) console.log('🔄 Got 401, attempting token refresh...');
    
    // ✅ If currently refreshing, queue this request
    if (isRefreshing) {
      if (DEBUG) console.log('⏳ Token refresh in progress, queuing request...');
      
      return new Promise((resolve, reject) => {
        requestQueue.push({ resolve, reject, url, options });
      });
    }
    
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      if (DEBUG) console.log('✅ Token refreshed, retrying request...');
      response = await makeRequest(newToken);
    } else {
      if (DEBUG) console.log('❌ Refresh failed, request will fail');
    }
  }

  return response;
};

// ✅ Helper for debugging - can remove in production
export const getAuthStatus = () => {
  return {
    hasAuthRef: !!authRef,
    hasToken: !!authRef?.token,
    hasRefreshToken: !!authRef?.refreshTokenValue,
    isRefreshing,
    queuedRequests: requestQueue.length,
  };
};