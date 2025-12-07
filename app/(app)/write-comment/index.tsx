import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button, Image, Text } from "native-base";
import { useState } from "react";
import { Keyboard, Pressable, TextInput, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function WriteComment() {
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
                        <Text numberOfLines={1} className="!text-2xl !font-bold !text-black dark:!text-white mb-4 w-7/12 text-center">Giáo trình chính thức Giải tích 1</Text>
                    </View>

                    <View className="flex flex-col gap-6 mt-6 px-[16px]">
                        <View className="flex flex-row items-center gap-4">
                            <Image source={require("@/assets/images/userAvatar.jpg")} className="w-16 h-16 rounded-full" alt="User Avatar" />
                            <View>
                                <Text className="!text-xl !font-bold !text-black dark:!text-white">Nguyễn Minh Khánh</Text>
                                <Text className="!text-black dark:!text-white">Nhận xét với tên và ảnh đại diện của bạn</Text>
                            </View>
                        </View>

                        <View className="flex flex-row items-center justify-between mx-[16px]">
                            <Pressable onPress={() => setStar(1)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={star >= 1 ? "star" : "star-outline"} size={36} color={star >= 1 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setStar(2)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={star >= 2 ? "star" : "star-outline"} size={36} color={star >= 2 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setStar(3)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={star >= 3 ? "star" : "star-outline"} size={36} color={star >= 3 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setStar(4)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={star >= 4 ? "star" : "star-outline"} size={36} color={star >= 4 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setStar(5)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={star >= 5 ? "star" : "star-outline"} size={36} color={star >= 5 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                        </View>

                        <TextInput
                            placeholder="Nhập nội dung đánh giá hoặc trải nghiệm của bạn"
                            className="border border-gray-300 rounded-xl p-5 h-32"
                            value={content}
                            onChangeText={setContent}
                            multiline={true}
                            numberOfLines={4}
                            textAlignVertical="top"
                            style={{
                                height: 100,
                                textAlignVertical: 'top',
                                color: isDarkMode ? "white" : "black",
                                fontFamily: 'Gilroy-Regular',
                            }}
                            placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
                        />

                        <Button className="!bg-primary-50 !rounded-xl !py-4" onPress={() => {}} colorScheme="primary">
                            <Text className="!text-primary-500 !font-bold !text-lg">Thêm ảnh (tối đa 2 ảnh)</Text>
                        </Button>

                    </View>
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