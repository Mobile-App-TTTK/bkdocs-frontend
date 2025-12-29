import { api } from '@/api/apiClient';
import { API_GET_DOC_RATINGS, API_GET_DOCUMENT_DETAIL } from '@/api/apiRoutes';
import { CommentProps } from '@/utils/commentInterface';
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Text } from "native-base";
import { useEffect, useState } from "react";
import { Modal, Pressable, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type ApiDocDetail = {
    id: string;
    title: string;
    description?: string;
    downloadCount?: number;
    uploadDate?: string;
    thumbnailUrl?: string;
}

type ApiDocRating = {
    userName: string;
    score: number;
    imageUrl: string | null;
    comment: any;
    rateAt: any;
}

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
    
    const params = useLocalSearchParams<{ id?: string }>();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0];

    const [star, setStar] = useState<number>(0);
    const [content, setContent] = useState<string>("");
    const [ratings, setRatings] = useState<ApiDocRating[]>([]);
    const [loading, setLoading] = useState(false);
    const [docDetail, setDocDetail] = useState<ApiDocDetail | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        let cancelled = false;
        (
            async () => {
                try {
                    setLoading(true);
                    const res = await api.get(API_GET_DOC_RATINGS(id));
                    const docRes = await api.get(API_GET_DOCUMENT_DETAIL(id));
                    const docData = docRes.data?.data;
                    const data = res.data?.data;
                    if (!cancelled) {
                        setRatings(data ?? []);
                        setDocDetail(docData ?? null);
                    }
                } catch (error) {
                    console.log('error', error);
                }
                finally {
                    if (!cancelled) setLoading(false);
                }
            }
        )();

        return () => {
            cancelled = true;
        }
    }, [id])
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
                        <Text numberOfLines={1} className="!text-2xl !font-bold !text-black dark:!text-white mb-4 w-7/12 text-center">{docDetail?.title}</Text>
                    </View>

                    <View className="mb-24 p-6">
                        <View className="flex flex-col gap-6">
                            {
                                ratings.map((comment, index) => (
                                    <View key={index} className='flex flex-row gap-4'>
                                        <Image 
                                            source={require("@/assets/images/userAvatar.jpg")} 
                                            width={12} 
                                            height={12} 
                                            alt={"User Avatar"} 
                                            className="rounded-full !shadow-md"
                                        />
                                        <View className='flex-1 flex-shrink'>
                                            <Text className='!font-bold'>{comment.userName}</Text>
                                            <View className='flex flex-row items-center gap-1'>
                                                {
                                                    Array.from({ length: comment.score }).map((_, index) => (
                                                        <Ionicons name="star" size={20} color={"#FFD336"} key={index} />
                                                    ))
                                                }
                                            </View>
                                            <Text className='mt-2'>{comment.comment}</Text>
                                            <View className='flex flex-row gap-2 flex-wrap mt-2'>
                                                {
                                                    comment.imageUrl && (
                                                        <Pressable onPress={() => setSelectedImageUrl(comment.imageUrl)}>
                                                            <Image 
                                                                source={{ uri: comment.imageUrl }} 
                                                                width={12} 
                                                                height={12} 
                                                                alt={"Image"} 
                                                                className="rounded-md !shadow-md"
                                                            />
                                                        </Pressable>
                                                    )
                                                }
                                            </View>
                                        </View>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
                </View>

                <Modal
                visible={selectedImageUrl !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedImageUrl(null)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 1)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <Pressable
                        onPress={() => setSelectedImageUrl(null)}
                        style={{
                            position: 'absolute',
                            top: 60,
                            right: 20,
                            zIndex: 10,
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: 25,
                            padding: 8,
                        }}
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </Pressable>

                    {selectedImageUrl && (
                        <Image
                            source={{ uri: selectedImageUrl }}
                            alt="Full size image"
                            resizeMode="contain"
                            style={{
                                width: '90%',
                                height: '70%',
                            }}
                        />
                    )}
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
}