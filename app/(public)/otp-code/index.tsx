import { api } from "@/api/apiClient";
import { API_REGISTER_COMPLETE, API_VERIFY_OTP } from "@/api/apiRoutes";
import OtpCodeForm from "@/components/auth/OtpCodeForm";
import { logSignUp, logSignupFunnelStep, SignupFunnel } from "@/services/analytics";
import { ROUTES } from "@/utils/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

export default function OtpCodeScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [flow, setFlow] = useState<'register' | 'forgot-password'>('register');

    useEffect(() => {
        const loadData = async () => {
            // Check forgot-password flow FIRST (has priority)
            const forgotData = await AsyncStorage.getItem('forgot_password_temp_data');
            if (forgotData) {
                const { email } = JSON.parse(forgotData);
                setEmail(email);
                setFlow('forgot-password');
                return;
            }
            
            // Then check registration flow
            const signupData = await AsyncStorage.getItem('signup_temp_data');
            if (signupData) {
                const { email } = JSON.parse(signupData);
                setEmail(email);
                setFlow('register');
            }
        };
        loadData();
    }, []);
    
    const handleSubmit = async (otpCode: string) => {
        setIsLoading(true);
        try {
            // Verify OTP (dùng chung cho cả 2 flow)
            const verifyResponse = await api.post(API_VERIFY_OTP, {
                email,
                otp: otpCode
            });

            const token = verifyResponse.data?.data?.token;
            if (!token) {
                throw new Error('Không nhận được token từ server');
            }

            if (flow === 'register') {
                // Flow đăng ký
                const tempData = await AsyncStorage.getItem('signup_temp_data');
                if (!tempData) throw new Error('Không tìm thấy thông tin đăng ký');
                
                const { name, email, password } = JSON.parse(tempData);
                
                await api.post(API_REGISTER_COMPLETE, {
                    name, email, password, token
                });
                
                await AsyncStorage.removeItem('signup_temp_data');
                
                // Log analytics
                await logSignUp('email');
                await logSignupFunnelStep(SignupFunnel.SUCCESS);
                
                Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
                    { text: 'OK', onPress: () => router.replace(ROUTES.LOGIN) }
                ]);
            } else {
                // Flow quên mật khẩu - chuyển sang trang đặt mật khẩu mới
                await AsyncStorage.setItem('reset_password_token', token);
                router.push(ROUTES.NEW_PASSWORD);
            }
        } catch (error: any) {
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