import { useFetchUserProfile } from '@/components/Profile/api';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/models/user.type';
import React, { createContext, useContext, useMemo } from 'react';

type UserContextValue = {
  userProfile: UserProfile | undefined;
  isLoading: boolean;
  currentUserId: string | undefined;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Only fetch user profile when authenticated to avoid 401 errors on first app launch
  const { data: userProfile, isLoading } = useFetchUserProfile({ enabled: isAuthenticated });

  const value = useMemo<UserContextValue>(() => ({
    userProfile: isAuthenticated ? userProfile : undefined,
    isLoading: isAuthenticated ? isLoading : false,
    currentUserId: userProfile?.id,
  }), [userProfile, isLoading, isAuthenticated]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
};

