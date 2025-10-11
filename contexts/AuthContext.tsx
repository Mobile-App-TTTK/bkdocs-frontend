import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const stored = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
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
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
  }, []);

  const logout = useCallback(async () => {
    setToken(null);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: !!token,
    isLoading,
    token,
    login,
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


