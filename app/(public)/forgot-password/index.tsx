import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { ROUTES } from "@/utils/routes";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";

export default function ForgotPasswordScreen() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (email: string) => {
        setIsLoading(true);
        try {
            router.push(ROUTES.OTP_CODE);
        } catch (e) {
            Alert.alert('Gửi mã OTP thất bại, vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-dark-900 justify-center">
          <ForgotPasswordForm isLoading={isLoading} onSubmit={handleSubmit} />
        </View>
  );
}
