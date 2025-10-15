import { DocProps } from '@/utils/docInterface';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { Button, HStack, Image, ScrollView, Text, VStack } from 'native-base';
import { useCallback, useRef, useState } from "react";
import { Pressable, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

const sampleDoc: DocProps = {
    docId: "doc-001",
    docName: "Giáo trình chính thức Giải tích 1 Đại học BK",
    subject: "Giải tích 1",
    docDownload: 1250,
    ratings: 4.5,
    ratingsCount: 342,
    price: 0,
    docUploadDate: "2025-10-01",
    uploader: "Nguyễn Văn A",
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

export default function DownloadDoc(doc: DocProps) {
    // ref
    const bottomSheetRef = useRef<BottomSheet>(null);

    // callbacks
    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
    }, []);

    const userAvatar = require("@/assets/images/userAvatar.jpg");
    const [selectedImage, setSelectedImage] = useState<number>(0);

    const handleImageSelect = useCallback((index: number) => {
        setSelectedImage(index);
        // Animate to smaller snap point (index 0)
        bottomSheetRef.current?.snapToIndex(0);
    }, []);

    return (
        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: 'white',
        }}>
            <View className="w-full h-24 bg-white dark:bg-black absolute z-0 flex flex-row items-end p-4"
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
                <Pressable className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center" onPress={() => router.back()}>
                    <Ionicons name="chevron-back-outline" size={20} color={"#888888"} style={{marginLeft: -2}}/>
                </Pressable>
                <Text className="font-bold text-xl text-primary-500 flex-1 text-center">Chi tiết</Text>
                <View className="w-8 h-8" />
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
                enableDynamicSizing={true}
                snapPoints={['27%', '55%']}
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
                }}
            >
                <BottomSheetView style={{
                        flex: 1,
                        paddingHorizontal: 36,
                    }}
                >
                    <VStack space={4}>
                        <View className='flex flex-row items-center gap-10 mt-2'>
                            <View className="flex-1">
                                <Text className="font-bold text-xl overflow-ellipsis truncate">{sampleDoc.docName}</Text>
                                <HStack>
                                    <Text>{sampleDoc.uploader}</Text>
                                    <View className="flex-1"/>
                                    <Text>{sampleDoc.subject}</Text>
                                </HStack>
                            </View>

                            <View>
                                <Image source={userAvatar} width={16} height={16} alt={"User Avatar"} className="rounded-full shadow-md"/>
                            </View>
                        </View>

                        <HStack className="">
                            <View className="flex flex-row items-center justify-center gap-1">
                                <Ionicons name="download-outline" size={18} color={"gray.500"} />
                                <Text>{sampleDoc.docDownload} lượt</Text>
                            </View>

                            <View className="flex-1"/>

                            <View className="flex flex-row items-center justify-center gap-1">
                                <Ionicons name="star-outline" size={18} color={"gray.500"} />
                                <Text>{sampleDoc.ratings} ({sampleDoc.ratingsCount})</Text>
                            </View>

                            <View className="flex-1"/>
                            <Text className="font-bold text-primary-500">{sampleDoc.price === 0 ? "Miễn phí" : sampleDoc.price }</Text>
                        </HStack>

                        <ScrollView horizontal className="space-x-5" showsHorizontalScrollIndicator={false}>
                            {
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
                            }
                        </ScrollView>

                        <View className="mt-4">
                            <Text className="font-bold text-lg">Mô tả</Text>
                            <Text>{sampleDoc.description}</Text>
                        </View>

                        <Button className="rounded-lg mt-2">Tải về</Button>
                        <View className="h-6"></View>
                    </VStack>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    )
}
