import { api } from "@/api/apiClient";
import { API_REGISTER_COMPLETE, API_VERIFY_OTP } from "@/api/apiRoutes";
import OtpCodeForm from "@/components/auth/OtpCodeForm";
import { ROUTES } from "@/utils/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

export default function OtpCodeScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        const loadEmail = async () => {
            const tempData = await AsyncStorage.getItem('signup_temp_data');
            if (tempData) {
                const { email } = JSON.parse(tempData);
                setEmail(email);
            }
        };
        loadEmail();
    }, []);
    
    const handleSubmit = async (otpCode: string) => {
        setIsLoading(true);
        try {
            const tempData = await AsyncStorage.getItem('signup_temp_data');
            if (!tempData) {
                throw new Error('Không tìm thấy thông tin đăng ký');
            }
            
            const { name, email, password } = JSON.parse(tempData);

            console.log('Step 1: Verifying OTP...');
            const verifyResponse = await api.post(API_VERIFY_OTP, {
                email,
                otp: otpCode
            });

            const resetToken = verifyResponse.data?.data?.token;
            console.log('OTP verified, received token:', resetToken ? 'yes' : 'no');

            if (!resetToken) {
                throw new Error('Không nhận được token từ server');
            }

            console.log('Step 2: Completing registration...');
            // Bước 3: Complete registration với reset-token
            await api.post(API_REGISTER_COMPLETE, {
                name,
                email,
                password,
                token: resetToken // Dùng reset-token từ bước verify
            });

            console.log('Registration completed successfully');
            
            // Xóa thông tin tạm
            await AsyncStorage.removeItem('signup_temp_data');
            
            // Chuyển đến trang login
            Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
                { text: 'OK', onPress: () => router.replace(ROUTES.LOGIN) }
            ]);
        } catch (error: any) {
            console.error('Registration failed:', error);
            console.error('Error response:', error.response?.data);
            
            const message = error?.response?.data?.message || 'Xác thực OTP thất bại';
            Alert.alert('Lỗi', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-dark-900 justify-center">
            <OtpCodeForm onSubmit={handleSubmit} isLoading={isLoading} email={email} />
        </View>
    )
}