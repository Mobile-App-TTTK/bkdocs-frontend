import { api, resetLogoutFlag } from '@/api/apiClient';
import { API_LOGIN, API_USER_PROFILE } from '@/api/apiRoutes';
import { LoginRequestBody } from '@/models/auth.type';
import { UserProfile } from '@/models/user.type';
import { setLogoutHandler } from '@/utils/authEvents';
import { ACCESS_TOKEN_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  userProfile: UserProfile | null;
  loginWithCredentials: (body: LoginRequestBody) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Hàm fetch thông tin user
  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await api.get(API_USER_PROFILE);
      const profile = res.data.data;
      setUserProfile(profile);
      
      // Set user context for Sentry
      Sentry.setUser({
        id: profile.id,
        email: profile.email,
        username: profile.name,
      });
      
      return profile;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setUserProfile(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (stored) {
          setToken(stored);
          // Fetch user profile sau khi load token
          try {
            await fetchUserProfile();
          } catch (error) {
            // Nếu fetch profile fail, có thể token đã hết hạn
            console.error('Failed to load user profile on init');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, [fetchUserProfile]);

  const login = useCallback(async (newToken: string) => {
    setToken(newToken);
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, newToken);
  }, []);

  const loginWithCredentials = useCallback(async (body: LoginRequestBody) => {
    try {
      const res = await api.post(API_LOGIN, body);
      const accessToken: string | undefined = res?.data?.data?.access_token;
      if (!accessToken) {
        throw new Error('Invalid login response');
      }
      setToken(accessToken);
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      resetLogoutFlag();
      // Fetch user profile sau khi login thành công
      await fetchUserProfile();
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    } catch (err: unknown) {
      const anyErr = err as { response?: { status?: number; data?: { message?: string } } };
      const apiMessage = anyErr?.response?.data?.message;
      const status = anyErr?.response?.status;
      const message = apiMessage ?? (status === 401 ? 'Email hoặc mật khẩu không đúng' : 'Đăng nhập thất bại');
      throw new Error(message);
    }
  }, [fetchUserProfile]);

  const logout = useCallback(async () => {
    setToken(null);
    setUserProfile(null);
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    
    // Clear user context from Sentry
    Sentry.setUser(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    setLogoutHandler(logout);
  }, [logout]);

  const refreshUserProfile = useCallback(async () => {
    if (token) {
      await fetchUserProfile();
    }
  }, [token, fetchUserProfile]);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!token,
    isLoading,
    token,
    userProfile,
    loginWithCredentials,
    logout,
    refreshUserProfile,
  }), [isLoading, token, userProfile, loginWithCredentials, logout, refreshUserProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

// Register logout handler for non-React contexts (e.g., axios interceptors)
// Keep this effect outside value memoization to always have the latest logout reference.
export const _registerAuthEvents = (() => {
  let initialized = false;
  return (logoutRef: () => Promise<void>) => {
    if (!initialized) {
      setLogoutHandler(logoutRef);
      initialized = true;
    } else {
      setLogoutHandler(logoutRef);
    }
  };
})();


