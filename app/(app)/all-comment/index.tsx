import { CommentProps } from '@/utils/commentInterface';
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text } from "native-base";
import { useState } from "react";
import { Pressable, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const sampleComment: CommentProps[] = [
    {
        star: 5,
        content: "Tài liệu hay, đầy đủ, nội dung rất dễ hiểu, rất giải trí, mỗi khi áp lực tôi thường lấy 10 bài tập ra để giải.",
        commenterAvatar: require("@/assets/images/userAvatar.jpg"),
        commenterName: "Nguyễn Minh Khánh",
        images: [
            require("@/assets/images/sampleDoc1.png"),
            require("@/assets/images/sampleDoc2.png"),
        ]
    }, 
    {
        star: 4,
        content: "Sách viết khó hiểu tôi học quài không vô nên tôi cho sách này 3 sao",
        commenterAvatar: require("@/assets/images/userAvatar.jpg"),
        commenterName: "Nguyễn Trường Thịnh",
    },
    {
        star: 5,
        content: "Sách quá hay rất!!",
        commenterAvatar: require("@/assets/images/userAvatar.jpg"),
        commenterName: "Trần Thành Tài",
        images: [
            require("@/assets/images/sampleDoc2.png"),
        ]
    },
    {
        star: 5,
        content: "Nội dung sách rất phù hợp với đề cương môn học, cảm ơn admin và các bạn đã chia sẻ tài liệu cho mình tải về học trước nên mình đã được 10.0 môn này!",
        commenterAvatar: require("@/assets/images/userAvatar.jpg"),
        commenterName: "Dương Minh Thuận",
        images: [
            require("@/assets/images/sampleDoc3.png"),
        ]
    }
];

export default function AllComment() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    
    const [star, setStar] = useState<number>(0);
    const [content, setContent] = useState<string>("");

    return (
        <GestureHandlerRootView style={{
            flex: 1,
        }} className="bg-white dark:bg-dark-900 justify-center">
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

                    <View className='flex flex-col gap-6 p-4'>
                        {
                            sampleComment.map((comment, index) => (
                                <View key={index} className='flex flex-row gap-4'>
                                    <Image source={comment.commenterAvatar} width={12} height={12} alt={"User Avatar"} className="rounded-full !shadow-md"></Image>
                                    <View className='flex-1 flex-shrink'>
                                        <Text className='!font-bold'>{comment.commenterName}</Text>
                                        <View className='flex flex-row items-center gap-1'>
                                            {
                                                Array.from({ length: comment.star }).map((_, index) => (
                                                    <Ionicons name="star" size={20} color={"#FFD336"} key={index} />
                                                ))
                                            }
                                        </View>
                                        <Text className='mt-2'>{comment.content}</Text>
                                        <View className='flex flex-row gap-2 flex-wrap mt-2'>
                                            {
                                                comment.images?.map((image, index) => (
                                                    <Image source={image} width={12} height={12} alt={"Image"} className="rounded-md !shadow-md" key={index}></Image>
                                                ))
                                            }
                                        </View>
                                    </View>
                                </View>
                            ))
                        }
                    </View>
                </View>
        </GestureHandlerRootView>
    );
}