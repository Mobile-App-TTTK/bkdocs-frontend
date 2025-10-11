import LoginForm from '@/components/auth/LoginForm';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const fakeToken = `token:${email}`;
      await login(fakeToken);
      router.replace(ROUTES.HOME);
    } catch (e) {
      Alert.alert('Đăng nhập thất bại', 'Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-900 justify-center">
      <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
    </View>
  );
}


