import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

const ONBOARDING_KEY = 'hasSeenOnboarding';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasSeenOnboarding(value === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isLoading || hasSeenOnboarding === null) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  // If authenticated, go to home
  if (isAuthenticated) {
    return <Redirect href={ROUTES.HOME} />;
  }

  // If not seen onboarding, show onboarding
  if (!hasSeenOnboarding) {
    return <Redirect href={ROUTES.ONBOARD} />;
  }

  // Otherwise go to login
  return <Redirect href={ROUTES.LOGIN} />;
}



