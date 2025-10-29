import { api } from '@/api/apiClient';
import { API_LOGIN } from '@/api/apiRoutes';
import { LoginRequestBody } from '@/models/auth.type';
import { ACCESS_TOKEN_KEY } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  loginWithCredentials: (body: LoginRequestBody) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
        if (stored) {
          setToken(stored);
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadToken();
  }, []);

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
    } catch (err: unknown) {
      const anyErr = err as { response?: { status?: number; data?: { message?: string } } };
      const apiMessage = anyErr?.response?.data?.message;
      const status = anyErr?.response?.status;
      const message = apiMessage ?? (status === 401 ? 'Email hoặc mật khẩu không đúng' : 'Đăng nhập thất bại');
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!token,
    isLoading,
    token,
    loginWithCredentials,
    logout,
  }), [isLoading, login, logout, token]);

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


