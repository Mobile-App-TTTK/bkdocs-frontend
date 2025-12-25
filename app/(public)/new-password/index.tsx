import { api } from "@/api/apiClient";
import { API_PASSWORD_RESET } from "@/api/apiRoutes";
import NewPasswordForm from "@/components/auth/NewPasswordForm";
import { ROUTES } from "@/utils/routes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, View } from "react-native";

export default function NewPasswordScreen() {
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const savedToken = await AsyncStorage.getItem('reset_password_token');
                
                if (!savedToken) {
                    Alert.alert('Lỗi', 'Phiên đặt lại mật khẩu đã hết hạn', [
                        { text: 'OK', onPress: () => router.replace(ROUTES.FORGOT_PASSWORD) }
                    ]);
                    return;
                }
                
                setToken(savedToken);
            } catch (error) {
                console.error('Error loading reset password data:', error);
                router.replace(ROUTES.FORGOT_PASSWORD);
            }
        };
        
        loadData();
    }, []);

    const handleSubmit = async (password: string) => {
        if (!token) {
            Alert.alert('Lỗi', 'Thông tin không hợp lệ, vui lòng thử lại');
            return;
        }

        setIsLoading(true);
        try {
            // Sử dụng PATCH với body { token, newPassword }
            await api.patch(API_PASSWORD_RESET, {
                token,
                newPassword: password
            });
            
            // Xóa dữ liệu tạm
            await AsyncStorage.multiRemove([
                'reset_password_token',
                'forgot_password_temp_data'
            ]);
            
            Alert.alert('Thành công', 'Đặt lại mật khẩu thành công!', [
                { text: 'Đăng nhập', onPress: () => router.replace(ROUTES.LOGIN) }
            ]);
        } catch (error: any) {
            console.error('Password reset failed:', error);
            const message = error?.response?.data?.message || 'Đặt lại mật khẩu thất bại';
            Alert.alert('Lỗi', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-dark-900 justify-center">
            <NewPasswordForm onSubmit={handleSubmit} isLoading={isLoading} />
        </View>
    );
}