import { CommentProps } from '@/utils/commentInterface';
import { DocProps } from '@/utils/docInterface';
import { ROUTES } from '@/utils/routes';
import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Button, Image, ScrollView, Text, VStack } from 'native-base';
import React, { useCallback, useRef, useState } from "react";
import { Pressable, View, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

const sampleDoc: DocProps = {
    docId: "doc-001",
    docName: "Giáo trình chính thức Giải tích 1",
    subject: "Giải tích 1",
    docDownload: 1250,
    ratings: 4.5,
    ratingsCount: 342,
    price: 0,
    docUploadDate: "2025-10-01",
    uploader: "Nguyễn Văn A",
    faculty: ["Máy tính", "Xây dựng", "Cơ khí"],
    description: "Giáo trình Giải tích cung cấp kiến thức nền tảng về giới hạn, đạo hàm và tích phân, giúp sinh viên hiểu và mô hình hóa các hiện tượng biến thiên trong tự nhiên và kỹ thuật. Đây là môn học cơ bản nhưng quan trọng trong chương trình đại học, giúp sinh viên có định hướng và nền tảng vững chắc trong việc học các môn học tiếp theo.",
    images: [
        require("@/assets/images/sampleDoc1.png"),
        require("@/assets/images/sampleDoc2.png"),
        require("@/assets/images/sampleDoc3.png"),
        require("@/assets/images/sampleDoc4.png"),
        require("@/assets/images/sampleDoc5.png"),
        require("@/assets/images/sampleDoc6.png"),
        require("@/assets/images/sampleDoc7.png"),
    ]
};

const sampleComment: CommentProps[] = [
    {
        star: 5,
        content: "Tài liệu hay, đầy đủ, nội dung rất dễ hiểu, rất giải trí, mỗi khi áp lực tôi thường lấy 10 bài tập ra để giải.",
        commenterAvatar: require("@/assets/images/userAvatar.jpg"),
        commenterName: "Nguyễn Minh Khánh",
        images: [
            require("@/assets/images/sampleDoc1.png"),
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
export default function DownloadDoc(doc: DocProps) {
    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const [currentSnapIndex, setCurrentSnapIndex] = useState<number>(1);

    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
        setCurrentSnapIndex(index);
    }, []);

    const userAvatar = require("@/assets/images/userAvatar.jpg");
    const [selectedImage, setSelectedImage] = useState<number>(0);

    const handleImageSelect = useCallback((index: number) => {
        setSelectedImage(index);
        // Animate to smaller snap point (index 0)
        bottomSheetRef.current?.snapToIndex(0);
    }, []);

    const [following, setFollowing] = useState(false);
    return (
        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: 'white',
        }}>
            <View className="flex items-center justify-center relative !pt-[64px] bg-white dark:bg-black "
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
                <Text className="!text-2xl !font-bold mb-4">Chi tiết</Text>
            </View>

            <Image
                source={sampleDoc.images[selectedImage]}
                alt="sampleDoc"
                resizeMode={"cover"}
                width={"100%"}
                height={"70%"}
                marginTop={50}
                style={{position: "absolute", zIndex: -10}}
            />

            <BottomSheet
                ref={bottomSheetRef}
                onChange={handleSheetChanges}
                enableDynamicSizing={false}
                snapPoints={['30%', '55%', '85%']}
                index={1}
                backgroundStyle={{
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -4,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                    backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
                }}
            >
                <BottomSheetView style={{
                        flex: 1,
                        paddingHorizontal: 32,
                        position: 'relative',
                    }}
                >
                    <VStack space={4} height={'53%'}>
                        <ScrollView
                            scrollEnabled={currentSnapIndex === 2}
                            showsVerticalScrollIndicator={false}
                            style={{
                                paddingBottom: 24,
                                marginBottom: 24,
                            }}
                        >
                            <View className='flex flex-row items-center gap-10 mt-2'>
                                <View className="flex-1">
                                    
                                    {/*Tên doc*/}
                                    <Text className="!font-bold !text-3xl !overflow-ellipsis !truncate">{sampleDoc.docName}</Text> 
                                    
                                    {/*Lượt tải + đánh giá*/}
                                    <View className="mt-1 flex flex-row gap-4"> 
                                        <View className="flex flex-row items-center justify-center gap-1">
                                            <Ionicons name="download-outline" size={18} color={isDarkMode ? "white" : "gray.500"} />
                                            <Text>{sampleDoc.docDownload} lượt</Text>
                                        </View>

                                        <View className="flex flex-row items-center justify-center gap-1">
                                            <Ionicons name="star-outline" size={18} color={isDarkMode ? "white" : "gray.500"} />
                                            <Text>{sampleDoc.ratings} ({sampleDoc.ratingsCount})</Text>
                                        </View>
                                    </View>

                                    {/*Thông tin uploader*/}
                                    <View className="mt-4 flex flex-row items-center gap-3">
                                        <Image source={userAvatar} width={16} height={16} alt={"User Avatar"} className="rounded-full !shadow-md"/>
                                    
                                        <View>
                                            <View className="flex flex-row items-center gap-1.5">
                                                <Text className="!font-bold !text-xl">Nguyễn Minh Khánh</Text>
                                                <Text className="!text-xl !font-bold">•</Text>
                                                <Pressable onPress={() => setFollowing(!following)} className="!text-xl !font-bold !text-gray-500">
                                                    <Text className={`!text-xl !font-bold ${following ? "!text-gray-500" : "!text-primary-500"}`}>
                                                        {
                                                            following ? "Bỏ theo dõi" : "Theo dõi"
                                                        }
                                                    </Text>
                                                </Pressable>
                                            </View>
                                            <Text>Tham gia tháng 10 năm 2025</Text>    
                                        </View>
                                    </View>
                                </View>

                            </View>

                            <ScrollView horizontal className="space-x-8 mt-4" showsHorizontalScrollIndicator={false}>
                                {/*
                                    sampleDoc.images.map((image, index) => (
                                        <Pressable onPress={() => handleImageSelect(index)} key={index}>
                                            <Image
                                                source={image}
                                                width={70}
                                                height={70}
                                                alt={"Images"}
                                                borderRadius="lg"
                                                marginRight={2}
                                                className="transition-all"
                                                borderWidth={selectedImage === index ? 3 : 1}
                                                borderColor={selectedImage === index ? "primary.500" : "gray.300"}
                                            />
                                        </Pressable>
                                    ))
                                */}
                            </ScrollView>

                            <View>
                                <Text className="!font-bold !text-xl">Danh mục tài liệu</Text>
                                <Text>Khoa: {sampleDoc.faculty[0]} {sampleDoc.faculty.length > 1 ? `+ ${sampleDoc.faculty.length - 1}` : ""}</Text>
                                <Text>Môn học: {sampleDoc.subject}</Text>
                            </View>

                            <View className="mt-6">
                                <Text className="!font-bold !text-xl">Mô tả</Text>
                                <Text>{sampleDoc.description}</Text>
                            </View>

                            <View className="mt-4">
                                <Text className="!font-bold !text-xl">Gửi đánh giá và nhận xét</Text>
                                <View className='flex flex-row items-center gap-1'>
                                    <Image source={userAvatar} width={12} height={12} alt={"User Avatar"} className="rounded-full !shadow-md"/>
                                    <Pressable className='flex flex-row gap-1 ml-1' onPress={() => router.push(ROUTES.WRITE_COMMENT as any)}>
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                    </Pressable>
                                </View>
                            </View>

                            <View className="flex flex-row items-center justify-between mt-4">
                                <View className="flex flex-row items-center gap-1">
                                    <Text className="!font-bold !text-xl">Đánh giá (342)</Text>
                                    <Text className="!text-xl !font-bold">•</Text>
                                    <Text className=" !text-xl">4.5</Text>
                                    <Ionicons name="star" size={20} color={"#FFD336"} className='mb-1' />
                                </View>

                                <Pressable className="flex flex-row gap-1" onPress={() => router.push(ROUTES.ALL_COMMENT as any)}>
                                    <Text className=" !text-xl">Tất cả</Text>
                                    <Ionicons name="chevron-forward-outline" size={20} color={isDarkMode ? "white" : "gray.500"} />
                                </Pressable>
                            </View>

                            
                            <View className="mt-4 mb-24">
                                <View className="flex flex-col gap-6">
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

                        </ScrollView>
                    </VStack>
                </BottomSheetView>

                <Button 
                    className="!rounded-xl h-14 absolute z-10 bottom-[150px]"
                    style={{ left: 32, right: 32 }}
                >
                    <Text className="!text-xl !font-bold !text-white">Tải về</Text>
                </Button>
            </BottomSheet>
        </GestureHandlerRootView>
    )
}
