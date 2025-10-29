import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return <Redirect href={isAuthenticated ? ROUTES.HOME : ROUTES.ONBOARD} />;
}



