import { api } from "@/api/apiClient";
import { API_PASSWORD_RESET_REQUEST } from "@/api/apiRoutes";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { ROUTES } from "@/utils/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function ForgotPasswordScreen() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (email: string) => {
        setIsLoading(true);
        try {
            await api.post(API_PASSWORD_RESET_REQUEST, { email });
            
            await AsyncStorage.removeItem('signup_temp_data');
            
            await AsyncStorage.setItem('forgot_password_temp_data', JSON.stringify({
                email,
                flow: 'forgot-password'
            }));
            
            router.push(ROUTES.OTP_CODE);
        } catch (error: any) {
            const message = error?.response?.data?.message || 'Gửi mã OTP thất bại';
            Alert.alert('Lỗi', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-dark-900">
          <ForgotPasswordForm isLoading={isLoading} onSubmit={handleSubmit} />
        </View>
  );
}
