import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import { useRouter } from 'expo-router';
import { Button, Image, Text, View } from 'native-base';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServerErrorScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleRetry = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
        // ignore back
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      // ignore logout errors
    } finally {
      router.replace(ROUTES.LOGIN as any);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-900">
        <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-1 bg-white dark:bg-dark-900 px-6 justify-center items-center">
                <Image
                source={require('@/assets/images/server-error.png')}
                alt="Server error"
                resizeMode="contain"
                width="64"
                height="64"
                mb={6}
                />
                <Text className="!text-2xl !font-bold text-center mb-2">
                Hệ thống đang gặp sự cố
                </Text>
                <Text className="text-center text-gray-500 dark:text-gray-300 mb-8">
                  Máy chủ hiện không phản hồi hoặc kết nối mạng bị gián đoạn. Vui lòng thử lại sau.
                </Text>

                <View className="flex-row gap-3 w-full px-2">
                  <Button
                    flex={1}
                    variant="outline"
                    colorScheme="primary"
                    onPress={handleRetry}
                  >
                    Thử lại
                  </Button>
                  <Button
                    flex={1}
                    colorScheme="primary"
                    onPress={handleLogout}
                  >
                    Đăng xuất
                  </Button>
                </View>
            </View>
        </SafeAreaView>
    </View>
  );
}


