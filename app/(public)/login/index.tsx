import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function LoginScreen() {
  const { loginWithCredentials } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await loginWithCredentials({ email, password });
      router.replace(ROUTES.HOME);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Vui lòng thử lại';
      Alert.alert('Đăng nhập thất bại', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-900">
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
    </View>
  );
}


