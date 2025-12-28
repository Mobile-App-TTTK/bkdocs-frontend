import { NotificationProps } from "@/utils/notiInterface";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "native-base";
import { useMemo } from "react";
import { Pressable, ScrollView, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function NotificationDetail() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const params = useLocalSearchParams<{ id?: string, notification?: string }>();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0];

    const router = useRouter();

    const notification = useMemo<NotificationProps | null>(() => {
        try {
            if (params.notification) {
                return JSON.parse(params.notification as string);
            }
            return null;
        } catch {
            return null;
        }
    }, [params.notification]);
    console.log('id', id);

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <GestureHandlerRootView style={{ flex: 1 }} className="bg-white dark:bg-dark-900">
            {/* Header */}
            <View className="items-center justify-center relative !pt-[64px] bg-white dark:bg-dark-700"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                }}
            >
                <Pressable
                    className="!absolute top-16 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                </Pressable>
                <Text numberOfLines={1} className="!text-2xl !font-bold !text-black dark:!text-white mb-4 w-7/12 text-center">
                    Chi tiết thông báo
                </Text>
            </View>

            {/* Content */}
            <ScrollView className="flex-1 p-6">
                {notification ? (
                    <View className="bg-gray-50 dark:bg-dark-800 rounded-xl p-5">
                        <View className="mb-4">
                            <Text>
                                {formatDate(notification.createdAt)}
                            </Text>
                        </View>
                        <View className="border-t border-gray-200 dark:border-dark-600 pt-4">
                            <Text className="!text-gray-700 dark:!text-gray-300 !text-base leading-6">
                                {notification.message}
                            </Text>
                        </View>

                        {!notification.isRead && (
                            <View className="mt-4 flex flex-row items-center gap-2">
                                <View className="w-2 h-2 rounded-full bg-primary-500" />
                                <Text className="!text-primary-500 !text-sm">Chưa đọc</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="items-center justify-center py-10">
                        <Text className="!text-gray-500">Không tìm thấy thông báo</Text>
                    </View>
                )}
            </ScrollView>
        </GestureHandlerRootView>
    );
}