import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook that provides API methods with automatic token refresh
 */
export const useApi = () => {
  const { authenticatedFetch } = useAuth();

  return {
    get: (url: string, options?: RequestInit) =>
      authenticatedFetch(url, { ...options, method: 'GET' }),

    post: (url: string, body?: any, options?: RequestInit) =>
      authenticatedFetch(url, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      }),

    put: (url: string, body?: any, options?: RequestInit) =>
      authenticatedFetch(url, {
        ...options,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
      }),

    delete: (url: string, options?: RequestInit) =>
      authenticatedFetch(url, { ...options, method: 'DELETE' }),
  };
};