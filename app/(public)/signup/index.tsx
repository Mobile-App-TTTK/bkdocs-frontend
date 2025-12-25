import { api } from '@/api/apiClient';
import { API_REQUEST_OTP } from '@/api/apiRoutes';
import SignupForm from '@/components/auth/SignupForm';
import { ROUTES } from '@/utils/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Sending OTP request for email:', email);
      console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
      console.log('Endpoint:', API_REQUEST_OTP);
      
      const response = await api.post(API_REQUEST_OTP, { email });
      console.log('✅ OTP request successful:', response.data);
      
      // Lưu thông tin tạm thời để dùng ở bước 2
      await AsyncStorage.setItem('signup_temp_data', JSON.stringify({
        name,
        email,
        password
      }));
      
      // Chuyển sang trang OTP
      router.push(ROUTES.OTP_CODE);
    } catch (error: any) {
      console.error('OTP request failed:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      console.error('Error config:', error.config);
      
      const message = error?.response?.data?.message || 'Gửi mã OTP thất bại';
      Alert.alert('Lỗi', message);
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