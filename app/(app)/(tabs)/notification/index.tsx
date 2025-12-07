import { api } from "@/api/apiClient";
import { API_NOTIFICATIONS } from "@/api/apiRoutes";
import { Notification } from "@/models/notification.type";
import { NotificationProps } from "@/utils/notiInterface";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Image, Text } from "native-base";
import { useEffect, useState } from "react";
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

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                console.log('Fetching notifications...');
                console.log('API URL:', API_NOTIFICATIONS);
                console.log('Params:', { page, limit });
                const response = await api.get(API_NOTIFICATIONS, {
                    params: {
                        page,
                        limit,
                    },
                });

                console.log('Notifications:', response.data);

                const Notifications: Notification[] = response.data?.data?.notifications || [];
                setNotifications(Notifications);

                console.log('Response status:', response.status);
                console.log('Response data:', JSON.stringify(response.data, null, 2));

            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setIsLoading(false);
            }
        };

    fetchNotifications();
    }, [page]);

    const loadMoreNotifications = () => {
        setPage(prevPage => prevPage + 1);
    }

    return (
        <GestureHandlerRootView style={{
            flex: 1,
        }} className="bg-white dark:bg-dark-900 justify-center">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1">
                    <View className="items-center justify-center relative !pt-[64px] bg-white dark:bg-black "
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
                            className="!absolute top-16 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                        </Pressable>
                        <Text numberOfLines={1} className="!text-2xl !font-bold !text-black dark:!text-white mb-4 w-7/12 text-center">Thông báo</Text>
                    </View>
                    <ScrollView className="p-6">
                        {notifications.length === 0 && (
                            <View className="flex flex-col flex-1 items-center justify-center">
                                <Text className="!text-gray-500 !font-bold !text-xl">Không có thông báo</Text>
                            </View>
                        )}
                        {notifications.length > 0 && notifications.map((notification) => (
                            <View key={notification.id} className="flex flex-row gap-4">
                                <Image source={{ uri: notification.image }} width={12} height={12} alt={"User Avatar"} className="rounded-full !shadow-md"></Image>
                                <View className="flex-1 flex-shrink">
                                    <Text className="!font-bold">{notification.title}</Text>
                                    <Text>{notification.message}</Text>
                                    <Text>{notification.createdAt}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
            
            <View className="absolute bottom-10 left-0 right-0 px-[16px]">
                <Button className="!bg-primary-500 !rounded-xl !py-4" onPress={() => {}}>
                    <Text className="!text-white !font-bold !text-lg">Gửi đánh giá</Text>
                </Button>
            </View>
        </GestureHandlerRootView>
    );
}