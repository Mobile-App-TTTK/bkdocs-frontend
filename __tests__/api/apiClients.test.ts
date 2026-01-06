import { triggerLogout } from '@/utils/authEvents';
import { ACCESS_TOKEN_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
  },
}));

jest.mock('@/utils/authEvents', () => ({
  triggerLogout: jest.fn(),
}));

import { api, resetLogoutFlag, resetServerErrorFlag } from '../../api/apiClient';

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetLogoutFlag();
    resetServerErrorFlag();
  });

  describe('api instance', () => {
    it('should have correct baseURL', () => {
      expect(api.defaults.baseURL).toBe(process.env.EXPO_PUBLIC_API_URL);
    });

    it('should have correct default headers', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('resetLogoutFlag', () => {
    it('should be a function', () => {
      expect(typeof resetLogoutFlag).toBe('function');
    });

    it('should not throw when called', () => {
      expect(() => resetLogoutFlag()).not.toThrow();
    });
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token exists and not login endpoint', async () => {
      const mockToken = 'test-token-123';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);

      const config = {
        url: '/api/documents',
        headers: {},
      };

      const requestInterceptor = (api.interceptors.request as any).handlers[0];
      const result = await requestInterceptor.fulfilled(config);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    });

    it('should NOT add Authorization header for login endpoint', async () => {
      const mockToken = 'test-token-123';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);

      const config = {
        url: '/auth/login',
        headers: {},
      };

      const requestInterceptor = (api.interceptors.request as any).handlers[0];
      const result = await requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should NOT add Authorization header when no token', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const config = {
        url: '/api/documents',
        headers: {},
      };

      const requestInterceptor = (api.interceptors.request as any).handlers[0];
      const result = await requestInterceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should reject request errors', async () => {
      const error = new Error('Request failed');
      const requestInterceptor = (api.interceptors.request as any).handlers[0];
      
      await expect(requestInterceptor.rejected(error)).rejects.toThrow('Request failed');
    });
  });

  describe('Response Interceptor', () => {
    it('should pass through successful responses', async () => {
      const mockResponse = { data: { id: 1 }, status: 200 };
      
      const responseInterceptor = (api.interceptors.response as any).handlers[0];
      const result = responseInterceptor.fulfilled(mockResponse);

      expect(result).toEqual(mockResponse);
    });

    it('should handle 401 error - logout and redirect', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('some-token');
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      (triggerLogout as jest.Mock).mockResolvedValue(undefined);

      const error = {
        response: { status: 401 },
        config: { url: '/api/documents' },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0];

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(triggerLogout).toHaveBeenCalled();
      expect(Alert.alert).toHaveBeenCalledWith(
        'Phiên đăng nhập đã hết hạn',
        'Vui lòng đăng nhập lại.'
      );
      expect(router.replace).toHaveBeenCalledWith('/(public)/login');
    });

    it('should NOT logout for 401 on auth endpoints', async () => {
      const error = {
        response: { status: 401 },
        config: { url: '/auth/login' },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0];

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
      expect(triggerLogout).not.toHaveBeenCalled();
    });

    it('should redirect to server-error on 500 error when logged in', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('some-token');

      const error = {
        response: { status: 500 },
        config: { url: '/api/documents' },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0];

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

      expect(router.replace).toHaveBeenCalledWith('/server-error');
    });

    it('should redirect to server-error on network error when logged in', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('some-token');

      const error = {
        response: undefined,
        config: { url: '/api/documents' },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0];

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

      expect(router.replace).toHaveBeenCalledWith('/server-error');
    });

    it('should NOT redirect to server-error when NOT logged in', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); 
      const error = {
        response: { status: 500 },
        config: { url: '/api/documents' },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0];

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

      expect(router.replace).not.toHaveBeenCalledWith('/server-error');
    });

    it('should handle 400 error without special handling', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('some-token');

      const error = {
        response: { status: 400 },
        config: { url: '/api/documents' },
      };

      const responseInterceptor = (api.interceptors.response as any).handlers[0];

      await expect(responseInterceptor.rejected(error)).rejects.toEqual(error);

      // Should not logout or redirect
      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe('API Methods', () => {
    it('should be able to make GET request', () => {
      expect(typeof api.get).toBe('function');
    });

    it('should be able to make POST request', () => {
      expect(typeof api.post).toBe('function');
    });

    it('should be able to make PUT request', () => {
      expect(typeof api.put).toBe('function');
    });

    it('should be able to make DELETE request', () => {
      expect(typeof api.delete).toBe('function');
    });
  });
});