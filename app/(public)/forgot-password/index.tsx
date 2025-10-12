import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import { View } from "react-native";

export default function ForgotPasswordScreen() {
  return (
    <View className="flex-1 bg-white dark:bg-dark-900 justify-center">
      <ForgotPasswordForm />
    </View>
  );
}