import { api } from '@/api/apiClient';
import { API_DOWNLOAD_DOCUMENT, API_GET_DOC_RATINGS, API_GET_DOC_RECENT_RATINGS, API_GET_DOCUMENT_DETAIL } from '@/api/apiRoutes';
import { useFetchUserProfile, useFetchUserProfileById } from '@/components/Profile/api';
import { CommentProps } from '@/utils/commentInterface';
import { DocProps } from '@/utils/docInterface';
import { ROUTES } from '@/utils/routes';
import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from "expo-sharing";
import { Button, Image, ScrollView, Text } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from "react-native-gesture-handler";

type ApiDocDetail = {
    id: string;
    title: string;
    description?: string;
    downloadCount?: number;
    uploadDate?: string;
    thumbnailUrl?: string;
    uploader?: { 
        name?: string; 
        id?: string;
        isVerified?: boolean;
    };
    subject?: any;
    images?: string[];
    score?: number;
    ratingsCount?: number;
    faculty?: any;
  };

type ApiDocRating = {
    userName: string;
    score: number;
    imageUrl: string | null;
    comment: any;
    rateAt: any;
}

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
export default function DownloadDoc() {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const params = useLocalSearchParams<{ id?: string }>();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0];
    console.log('id', id);

    const [docDetail, setDocDetail] = useState<ApiDocDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [docRecentRatings, setDocRecentRatings] = useState<ApiDocRating[]>([]);
    const [ratingsCount, setRatingsCount] = useState<number>(0);
    const [ratingsAverage, setRatingsAverage] = useState<number>(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [hasUserRated, setHasUserRated] = useState(false);

    useEffect(() => {
        if (!id) return;
        
        let cancelled = false;
        (async () => {
          try {
            setLoading(true);
            const res = await api.get(API_GET_DOCUMENT_DETAIL(id));
            const data = res.data?.data;
            if (!cancelled) setDocDetail(data);
          } finally {
            if (!cancelled) setLoading(false);
          }
        })();
    
        return () => {
          cancelled = true;
        };
    }, [id]);
    
    useEffect(() => {
        if (!id) return;
    
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(API_GET_DOC_RECENT_RATINGS(id), {
                    params: { k: 5 }
                });
                const res1 = await api.get(API_GET_DOC_RATINGS(id));
                const data = res.data?.data;
                const data1 = res1.data?.data;
                if (!cancelled) {
                    setDocRecentRatings(data ?? []);
                    setRatingsCount(data1?.length ?? 0);
                    setRatingsAverage(data1?.reduce((acc: number, comment: ApiDocRating) => acc + comment.score, 0) / data1?.length);

                    if (userProfile?.name && data1) {
                        const userRating = data1.find((rating: ApiDocRating) => 
                            rating.userName === userProfile.name
                        );
                        setHasUserRated(!!userRating);
                    }
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
    
        return () => {
            cancelled = true;
        };
    }, [id]);

    const [currentSnapIndex, setCurrentSnapIndex] = useState<number>(1);

    const handleSheetChanges = useCallback((index: number) => {
        console.log('handleSheetChanges', index);
        setCurrentSnapIndex(index);
    }, []);

    const rawImg = docDetail?.images?.[selectedImage]; 

    console.log('docDetail:', docDetail);
    console.log('images:', docDetail?.images);
    console.log('thumbnailUrl:', docDetail?.thumbnailUrl);
    console.log('rawImg:', rawImg);
    
    const imageSource =
      typeof rawImg === 'string' && rawImg.trim().length > 0
        ? { uri: rawImg.trim() }
        : docDetail?.thumbnailUrl && docDetail.thumbnailUrl.trim().length > 0
          ? { uri: docDetail.thumbnailUrl.trim() }
          : require('@/assets/images/sampleDoc1.png');

    const { data: uploaderProfile, isLoading: isLoadingUploaderProfile, error: errorUploaderProfile } = useFetchUserProfileById(docDetail?.uploader?.id ?? "");
    const uploaderAvatar = uploaderProfile?.imageUrl ? { uri: uploaderProfile.imageUrl } : require("@/assets/images/userAvatar.jpg");

    const {data: userProfile, isLoading: isLoadingUserProfile, error: errorUserProfile} = useFetchUserProfile();
    const userAvatar = userProfile?.imageUrl ? { uri: userProfile.imageUrl } : require("@/assets/images/userAvatar.jpg");

    const handleImageSelect = useCallback((index: number) => {
        setSelectedImage(index);
        bottomSheetRef.current?.snapToIndex(0);
    }, []);

    const [following, setFollowing] = useState(false);

    const handleDownload = async () => {
        if (!id) return;
        if (isDownloading) return;
      
        setIsDownloading(true);

        try {
          const res = await api.get(API_DOWNLOAD_DOCUMENT(id));
          const data = res.data?.data;
      
          const downloadUrl =
            (typeof data === "string" ? data : undefined) ??
            data?.downloadUrl ??
            data?.url ??
            data?.fileUrl ??
            (docDetail as any)?.downloadUrl ??
            (docDetail as any)?.fileUrl;
      
          if (!downloadUrl || typeof downloadUrl !== "string") {
            Alert.alert("Lỗi", "Không lấy được link tải về từ server.");
            return;
          }
      
          const safeTitle = (docDetail?.title ?? "document")
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
            .slice(0, 80);

        const extMatch = downloadUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        const ext = extMatch?.[1] ? `.${extMatch[1]}` : ".pdf";
      
        const destFile = new FileSystem.File(FileSystem.Paths.document, `${safeTitle}${ext}`);

        if (destFile.exists) {
          destFile.delete();
        }
        
        const downloadedFile = await FileSystem.File.downloadFileAsync(downloadUrl, destFile);
        const uri = downloadedFile.uri;
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        } else {
          await Linking.openURL(uri);
        }
              
        } catch (error) {
          console.error("Error downloading document", error);
          Alert.alert("Lỗi", "Tải về thất bại. Vui lòng thử lại.");
        } finally {
          setIsDownloading(false);
        }
      };

    return (
        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,

        }}>
            
            <View className="flex items-center justify-center relative !pt-[64px] bg-none"
            style={{ zIndex: 1 }}
            >
                <Pressable
                    className="!absolute top-16 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                </Pressable>
                
                <Pressable
                    className="!absolute top-16 right-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                    onPress={() => router.push(ROUTES.SEARCH)}
                >
                    <Ionicons name="search-outline" size={24} color={"#888888"} />
                </Pressable>
            </View>


            <Image
                source={imageSource}
                alt="sampleDoc"
                resizeMode="cover"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '45%',
                    zIndex: 0,
                }}
            />

                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    style={{ 
                        position: 'absolute',
                        top: '45%',      // Bắt đầu từ dưới hình ảnh
                        bottom: 0,       // Kéo dài đến cuối màn hình
                        left: 0,
                        right: 0,
                        paddingHorizontal: 24,
                        paddingTop: 16,
                        backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                    }}
                    contentContainerStyle={{
                        paddingBottom: 100,  // Để tránh bị che bởi nút "Tải về"
                    }}
                >
                    <View className='flex flex-row items-center gap-10 mt-2'>
                        <View className="flex-1">
                            
                            {/*Tên doc*/}
                            <Text className="!font-bold !text-3xl !overflow-ellipsis !truncate">{docDetail?.title ?? ""}</Text> 
                            
                            {/*Lượt tải + đánh giá*/}
                            <View className="mt-1 flex flex-row gap-4"> 
                                <View className="flex flex-row items-center justify-center gap-1">
                                    <Ionicons name="download-outline" size={18} color={isDarkMode ? "white" : "gray.500"} />
                                    <Text>{docDetail?.downloadCount ?? 0} lượt</Text>
                                </View>

                                <View className="flex flex-row items-center justify-center gap-1">
                                    <Ionicons name="star-outline" size={18} color={isDarkMode ? "white" : "gray.500"} />
                                    <Text>{docRecentRatings.length > 0 
                                    ? (docRecentRatings.reduce((acc, comment) => acc + comment.score, 0) / docRecentRatings.length).toFixed(1) 
                                    : 0} ({docRecentRatings.length ?? 0})</Text>
                                </View>
                            </View>

                            {/*Thông tin uploader*/}
                            <View className="mt-4 flex flex-row items-center gap-3">
                                <Image source={uploaderAvatar} width={16} height={16} alt={"User Avatar"} className="rounded-full !shadow-md"/>
                            
                                <View>
                                    <View className="flex flex-row items-center gap-1.5">
                                        <Text className="!font-bold !text-xl">{docDetail?.uploader?.name ?? ""}</Text>
                                        <Text className="!text-xl !font-bold">•</Text>
                                        <Pressable onPress={() => setFollowing(!following)} className="!text-xl !font-bold !text-gray-500">
                                            <Text className={`!text-xl !font-bold ${following ? "!text-gray-500" : "!text-primary-500"}`}>
                                                {
                                                    following ? "Bỏ theo dõi" : "Theo dõi"
                                                }
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <Text>{uploaderProfile?.faculty ?? ""}</Text>    
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
                        <Text>Khoa: {docDetail?.faculty ?? ""} {docDetail?.faculty?.length > 1 ? `+ ${docDetail?.faculty?.length - 1}` : ""}</Text>
                        <Text>Môn học: {docDetail?.subject ?? ""}</Text>
                    </View>

                    <View className="mt-6">
                        <Text className="!font-bold !text-xl">Mô tả</Text>
                        <Text>{docDetail?.description ?? ""}</Text>
                    </View>

                    <View className="mt-6">
                        <Text className="!font-bold !text-xl">Gửi đánh giá và nhận xét</Text>
                        {
                            hasUserRated ? (
                                <View className='flex flex-row items-center gap-2 mt-2'>
                                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                                <Text className='text-gray-500'>Bạn đã đánh giá tài liệu này</Text>
                            </View>
                            ) : (
                                <View className='flex flex-row items-center gap-1 mt-2'>
                                    <Image source={userAvatar} width={12} height={12} alt={"User Avatar"} className="rounded-full !shadow-md"/>
                                    <Pressable className='flex flex-row gap-1 ml-1' onPress={() => router.push({
                                    pathname: ROUTES.WRITE_COMMENT,
                                    params: {id: id}
                                        } as any
                                    )}>
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                        <Ionicons name="star-outline" size={28} color={isDarkMode ? "white" : "gray.500"} />
                                    </Pressable>
                                </View>
                            )
                        }
                    </View>

                    <View className="flex flex-row items-center justify-between mt-4">
                        <View className="flex flex-row items-center gap-1">
                            <Text className="!font-bold !text-xl">Đánh giá ({ratingsCount ?? 0})</Text>
                            <Text className="!text-xl !font-bold">•</Text>
                            <Text className=" !text-xl">{ratingsAverage ? ratingsAverage.toFixed(1) : 0}</Text>
                            <Ionicons name="star" size={20} color={"#FFD336"} className='mb-1' />
                        </View>

                        <Pressable className="flex flex-row gap-1" onPress={() => router.push({
                            pathname: ROUTES.ALL_COMMENT,
                            params: { id: id }
                        } as any)}>
                            <Text className=" !text-xl">Tất cả</Text>
                            <Ionicons name="chevron-forward-outline" size={20} color={isDarkMode ? "white" : "gray.500"} />
                        </Pressable>
                    </View>

                    
                    <View className="mt-4 mb-24">
                        <View className="flex flex-col gap-6">
                            {
                                docRecentRatings.map((comment, index) => (
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
                                                        <Image 
                                                            source={{ uri: comment.imageUrl }} 
                                                            width={12} 
                                                            height={12} 
                                                            alt={"Image"} 
                                                            className="rounded-md !shadow-md"
                                                        />
                                                    )
                                                }
                                            </View>
                                        </View>
                                    </View>
                                ))
                            }
                        </View>
                    </View>
            </ScrollView>

            <Button 
                className="!rounded-xl h-14 absolute z-10 bottom-[60px]"
                style={{ left: 32, right: 32 }}
                onPress={handleDownload}
            >
                <Text className="!text-xl !font-bold !text-white">{isDownloading ? "Đang tải..." : "Tải về"}</Text>
            </Button>
        </GestureHandlerRootView>
    )
}
