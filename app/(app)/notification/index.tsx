import { NotificationProps } from "@/utils/notiInterface";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Image, Text } from "native-base";
import { useState } from "react";
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
export default function Notification() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    
    const [star, setStar] = useState<number>(0);
    const [content, setContent] = useState<string>("");

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
                        {sampleNotification.map((notification) => (
                            <View key={notification.id} className="flex flex-row gap-4">
                                <Image source={notification.image} width={12} height={12} alt={"User Avatar"} className="rounded-full !shadow-md"></Image>
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