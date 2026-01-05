import { api, resetLogoutFlag } from '@/api/apiClient';
import { API_LOGIN, API_USER_PROFILE } from '@/api/apiRoutes';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { setLogoutHandler } from '@/utils/authEvents';
import { ACCESS_TOKEN_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
  resetLogoutFlag: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('@sentry/react-native', () => ({
  setUser: jest.fn(),
}));

jest.mock('@/utils/authEvents', () => ({
  setLogoutHandler: jest.fn(),
}));

describe('AuthContext', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    // Default: no stored token
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('Initial State', () => {
    it('should start with isLoading true', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should be unauthenticated when no token stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
      expect(result.current.userProfile).toBeNull();
    });

    it('should load token from AsyncStorage on mount', async () => {
      const mockToken = 'stored-token-123';
      const mockProfile = { id: 'user-1', name: 'John', email: 'john@test.com' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockProfile } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should fetch user profile when token exists', async () => {
      const mockToken = 'valid-token';
      const mockProfile = { id: 'user-1', name: 'Test User', email: 'test@test.com' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockProfile } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.userProfile).toEqual(mockProfile);
      });

      expect(api.get).toHaveBeenCalledWith(API_USER_PROFILE);
      expect(Sentry.setUser).toHaveBeenCalledWith({
        id: mockProfile.id,
        email: mockProfile.email,
        username: mockProfile.name,
      });
    });

    it('should handle profile fetch error on init gracefully', async () => {
      const mockToken = 'expired-token';

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
      (api.get as jest.Mock).mockRejectedValue(new Error('Token expired'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Token is still set but profile is null
      expect(result.current.token).toBe(mockToken);
      expect(result.current.userProfile).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loginWithCredentials', () => {
    it('should login successfully with valid credentials', async () => {
      const mockToken = 'new-access-token';
      const mockProfile = { id: 'user-1', name: 'User', email: 'user@test.com' };
      const credentials = { email: 'user@test.com', password: 'password123' };

      (api.post as jest.Mock).mockResolvedValue({
        data: { data: { access_token: mockToken } },
      });
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockProfile } });
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.loginWithCredentials(credentials);
      });

      expect(api.post).toHaveBeenCalledWith(API_LOGIN, credentials);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY, mockToken);
      expect(resetLogoutFlag).toHaveBeenCalled();
      expect(result.current.token).toBe(mockToken);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should throw error when login response has no token', async () => {
      (api.post as jest.Mock).mockResolvedValue({
        data: { data: {} },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // "Invalid login response" is thrown inside try block, but caught and re-thrown as generic error
      await expect(
        act(async () => {
          await result.current.loginWithCredentials({ email: 'test@test.com', password: '123' });
        })
      ).rejects.toThrow('Đăng nhập thất bại');
    });

    it('should throw custom error message on 401', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 401 },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.loginWithCredentials({ email: 'test@test.com', password: 'wrong' });
        })
      ).rejects.toThrow('Email hoặc mật khẩu không đúng');
    });

    it('should use API error message if available', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { 
          status: 400, 
          data: { message: 'Account is banned' } 
        },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.loginWithCredentials({ email: 'test@test.com', password: '123' });
        })
      ).rejects.toThrow('Account is banned');
    });

    it('should throw generic error for other failures', async () => {
      (api.post as jest.Mock).mockRejectedValue({
        response: { status: 500 },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.loginWithCredentials({ email: 'test@test.com', password: '123' });
        })
      ).rejects.toThrow('Đăng nhập thất bại');
    });
  });

  describe('logout', () => {
    it('should clear all auth state on logout', async () => {
      const mockToken = 'valid-token';
      const mockProfile = { id: 'user-1', name: 'User', email: 'user@test.com' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockProfile } });
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.token).toBeNull();
      expect(result.current.userProfile).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(ACCESS_TOKEN_KEY);
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it('should register logout handler on mount', async () => {
      renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(setLogoutHandler).toHaveBeenCalled();
      });
    });
  });

  describe('refreshUserProfile', () => {
    it('should refresh user profile when authenticated', async () => {
      const mockToken = 'valid-token';
      const mockProfile = { id: 'user-1', name: 'User', email: 'user@test.com' };
      const updatedProfile = { id: 'user-1', name: 'Updated User', email: 'user@test.com' };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockToken);
      (api.get as jest.Mock)
        .mockResolvedValueOnce({ data: { data: mockProfile } })
        .mockResolvedValueOnce({ data: { data: updatedProfile } });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.userProfile?.name).toBe('User');
      });

      await act(async () => {
        await result.current.refreshUserProfile();
      });

      expect(result.current.userProfile?.name).toBe('Updated User');
    });

    it('should not fetch profile when not authenticated', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Clear any previous calls
      (api.get as jest.Mock).mockClear();

      await act(async () => {
        await result.current.refreshUserProfile();
      });

      expect(api.get).not.toHaveBeenCalled();
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Context Value', () => {
    it('should provide all required values and functions', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('token');
      expect(result.current).toHaveProperty('userProfile');
      expect(result.current).toHaveProperty('loginWithCredentials');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('refreshUserProfile');

      expect(typeof result.current.loginWithCredentials).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refreshUserProfile).toBe('function');
    });
  });
});

