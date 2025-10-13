import OtpCodeForm from "@/components/auth/OtpCodeForm";
import { View } from "react-native";

export default function OtpCodeScreen() {
    return (
        <View className="flex-1 bg-white dark:bg-dark-900 justify-center">
            <OtpCodeForm />
        </View>
    )
}
