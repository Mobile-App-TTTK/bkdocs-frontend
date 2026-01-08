import { api } from "@/api/apiClient";
import { API_MARK_NOTIFICATION_AS_READ, API_NOTIFICATIONS } from "@/api/apiRoutes";
import { Notification } from "@/models/notification.type";
import { NotificationProps } from "@/utils/notiInterface";
import { ROUTES } from "@/utils/routes";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { Text } from "native-base";
import { useCallback, useState } from "react";
import { Keyboard, Pressable, ScrollView, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const sampleNotification: NotificationProps[] = [
    {
        id: "1",
        title: "Thông báo",
        message: "Bạn có 1 đánh giá mới",
        image: require("@/assets/images/userAvatar.jpg"),
        isRead: false,
        createdAt: "2025-10-01",
    },
    {
        id: "2",
        title: "Hệ cơ sở dữ liệu",
        message: "Bạn có 1 đánh giá mới",
        image: require("@/assets/images/userAvatar.jpg"),
        isRead: true,
        createdAt: "2025-10-01",
    },
    {
        id: "3",
        title: "Hệ điều hành",
        message: "Giáo trình Hệ điều hành vừa upload",
        image: require("@/assets/images/userAvatar.jpg"),
        isRead: false,
        createdAt: "2025-10-01",
    },
    {
        id: "4",
        title: "Lập trình web",
        message: "Giáo trình Lập trình web vừa upload",
        image: require("@/assets/images/userAvatar.jpg"),
        isRead: false,
        createdAt: "2025-10-01",
    },
    {
        id: "5",
        title: "Lập trình web",
        message: "Bạn có 1 đánh giá mới",
        image: require("@/assets/images/userAvatar.jpg"),
        isRead: true,
        createdAt: "2025-10-01",
    },
];

export default function NotificationPage() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoading(true);

            console.log("[NOTI] fetching...", {
                url: API_NOTIFICATIONS,
                page,
                limit,
            });

            const response = await api.get(API_NOTIFICATIONS, {
                params: { page, limit },
            });

            console.log("[NOTI] status:", response.status);
            console.log("[NOTI] raw response:", JSON.stringify(response.data, null, 2));

            const raw = response.data?.data;

            // backend đang trả list ở raw.data (không phải raw.notifications)
            const list = raw?.data ?? [];

            console.log("[NOTI] parsed list length:", Array.isArray(list) ? list.length : "not-array");
            console.log("[NOTI] parsed list:", list);

            setNotifications(Array.isArray(list) ? list : []);
        } catch (error: any) {
            console.log("[NOTI] error message:", error?.message);
            console.log("[NOTI] error response:", JSON.stringify(error?.response?.data, null, 2));
            console.log("[NOTI] error status:", error?.response?.status);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit]);

    useFocusEffect(
        useCallback(() => {
            console.log("[NOTI] screen focused -> refetch");
            fetchNotifications();
            return () => console.log("[NOTI] screen unfocused");
        }, [fetchNotifications])
    );

    const loadMoreNotifications = () => {
        setPage(prevPage => prevPage + 1);
    }

    const markAsRead = async (notificationId: string) => {
        try {
            await api.patch(API_MARK_NOTIFICATION_AS_READ(notificationId));

            // Update local state to reflect the change
            setNotifications(prev =>
                prev.map(noti =>
                    noti.id === notificationId
                        ? { ...noti, isRead: true }
                        : noti
                )
            );
        } catch (error: any) {
            console.log("[NOTI] mark as read error:", error?.message);
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 1) return "Vừa xong";
            if (diffMins < 60) return `${diffMins} phút trước`;
            if (diffHours < 24) return `${diffHours} giờ trước`;
            if (diffDays < 7) return `${diffDays} ngày trước`;

            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <GestureHandlerRootView style={{
            flex: 1,
        }} className="bg-white dark:bg-dark-900 justify-center">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1">
                    <View className="items-center justify-center relative !pt-[64px] bg-white dark:bg-dark-700 "
                        style={{
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.1,
                            shadowRadius: 20,
                            elevation: 10,
                        }}
                    >
                        <Pressable
                            testID="back-button"
                            className="!absolute top-16 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                        </Pressable>
                        <Text numberOfLines={1} className="!text-2xl !font-bold !text-black dark:!text-white mb-4 w-7/12 text-center">Thông báo</Text>
                    </View>

                    <ScrollView
                        className="p-6"
                        contentContainerStyle={{
                            paddingBottom: 100,
                        }}
                    >
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <Pressable
                                    key={notification.id}
                                    className={`p-4 mb-3 rounded-xl ${notification.isRead ? 'bg-gray-50 dark:bg-dark-800' : 'bg-primary-50 dark:bg-dark-700'}`}
                                    onPress={() => {
                                        if (!notification.isRead) {
                                            markAsRead(notification.id);
                                        }

                                        if (notification.targetId) {
                                            router.push({
                                                pathname: ROUTES.DOWNLOAD_DOC as any,
                                                params: { id: notification.targetId }
                                            } as any);
                                        }
                                    }}
                                >
                                    <View className="flex flex-row gap-4">
                                        <View className={`w-12 h-12 rounded-full items-center justify-center ${notification.isRead ? 'bg-gray-200 dark:bg-dark-600' : 'bg-primary-100'}`}>
                                            <Ionicons
                                                name="document-text"
                                                size={24}
                                                color={notification.isRead ? "#6b7280" : "#ff3300"}
                                            />
                                        </View>
                                        <View className="flex-1 flex-shrink">
                                            <Text className={`!font-bold ${!notification.isRead ? '!text-primary-600' : ''}`}>
                                                Thông báo
                                            </Text>
                                            <Text className="!text-gray-600 dark:!text-gray-300 mt-1" numberOfLines={2}>
                                                {notification.message}
                                            </Text>
                                            <Text className="!text-gray-400 !text-sm mt-2">
                                                {formatDate(notification.createdAt)}
                                            </Text>
                                        </View>
                                        {!notification.isRead && (
                                            <View className="w-3 h-3 rounded-full bg-primary-500 self-start mt-1" />
                                        )}
                                    </View>
                                </Pressable>
                            ))
                        ) : (
                            !isLoading && (
                                <View className="flex-1 items-center justify-center pt-20">
                                    <Text className="!text-gray-500 dark:!text-gray-400 !text-lg text-center">
                                        Không có thông báo nào
                                    </Text>
                                </View>
                            )
                        )}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </GestureHandlerRootView>
    );
}