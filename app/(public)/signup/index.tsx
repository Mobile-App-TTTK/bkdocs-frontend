import SignupForm from '@/components/auth/SignupForm';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      router.replace(ROUTES.HOME);
    } catch (e) {
      Alert.alert('Đăng ký thất bại', 'Vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-900 justify-center">
      <SignupForm onSubmit={handleSubmit} isLoading={isLoading} />
    </View>
  );
}