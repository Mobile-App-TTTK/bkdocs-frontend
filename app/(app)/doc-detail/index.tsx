import { api } from '@/api/apiClient';
import { API_DOWNLOAD_DOCUMENT, API_GET_DOC_RATINGS, API_GET_DOCUMENT_DETAIL } from '@/api/apiRoutes';
import { useFetchUserProfile, useFetchUserProfileById } from '@/components/Profile/api';
import { Features, logDownloadDocument, logFeatureUsage, logShareDocument, logViewDocument } from '@/services/analytics';
import { DocProps } from '@/utils/docInterface';
import { downloadedDocsStorage } from '@/utils/downloadDocStorage';
import { ROUTES } from '@/utils/routes';
import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system";
import * as FSLegacy from "expo-file-system/legacy";
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as Sharing from "expo-sharing";
import { Button, Image, ScrollView, Spinner, Text } from 'native-base';
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Linking, Modal, Platform, Pressable, useColorScheme, View } from 'react-native';
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


const { width: SCREEN_WIDTH } = Dimensions.get('window');
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


export default function DownloadDoc() {
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
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'cancelled' | 'error'>('success');

    useEffect(() => {
        if (!id) return;

        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const res = await api.get(API_GET_DOCUMENT_DETAIL(id));
                const data = res.data?.data;
                if (!cancelled) {
                    setDocDetail(data);
                    // Log view document
                    if (data) logViewDocument(id, data.title || '', data.faculty?.name);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const DownloadPopup = () => {
        if (!showPopup) return null;

        const config = {
            success: {
                bg: '#FF3300', // primary500
                icon: 'checkmark-circle',
                title: 'Tải về thành công',
                message: 'File đã được lưu vào thư mục bạn chọn',
            },
            cancelled: {
                bg: '#FFAA00', // yellow500
                icon: 'alert-circle',
                title: 'Đã hủy',
                message: "File vẫn có sẵn trong 'Tài liệu đã tải'",
            },
            error: {
                bg: '#EF443F', // red500
                icon: 'close-circle',
                title: 'Lỗi',
                message: 'Tải về thất bại. Vui lòng thử lại.',
            },
        }[popupType];

        useEffect(() => {
            if (showPopup) {
                const timer = setTimeout(() => setShowPopup(false), 3000);
                return () => clearTimeout(timer);
            }
        }, [showPopup]);

        return (
            <View style={{
                position: 'absolute',
                top: 60,
                left: 20,
                right: 20,
                zIndex: 9999,
            }}>
                <View style={{
                    backgroundColor: config.bg,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                }}>
                    <Ionicons name={config.icon as any} size={28} color="white" />
                    <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                            {config.title}
                        </Text>
                        <Text style={{ color: 'white', fontSize: 13, marginTop: 2 }}>
                            {config.message}
                        </Text>
                    </View>
                    <Pressable onPress={() => setShowPopup(false)}>
                        <Ionicons name="close" size={20} color="white" />
                    </Pressable>
                </View>
            </View>
        );
    };
    const allImages = React.useMemo(() => {
        const images: string[] = [];

        if (docDetail?.thumbnailUrl && docDetail.thumbnailUrl.trim().length > 0) {
            images.push(docDetail.thumbnailUrl.trim());
        }

        if (docDetail?.images && docDetail.images.length > 0) {
            docDetail.images.forEach(img => {
                if (typeof img === 'string' && img.trim().length > 0 && img.trim() !== docDetail.thumbnailUrl?.trim()) {
                    images.push(img.trim());
                }
            });
        }

        return images;
    }, [docDetail?.thumbnailUrl, docDetail?.images]);

    const getMimeType = (ext: string): string => {
        const mimeTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.xls': 'application/vnd.ms-excel',
            '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            '.ppt': 'application/vnd.ms-powerpoint',
            '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            '.zip': 'application/zip',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
        };
        return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
    };

    useEffect(() => {
        if (!id) return;

        let cancelled = false;
        (async () => {
            try {
                const res1 = await api.get(API_GET_DOC_RATINGS(id));
                const data1 = res1.data?.data;

                if (!cancelled) {
                    // Lấy 5 comment gần nhất
                    const recentRatings = (data1 ?? []).slice(0, 5);
                    setDocRecentRatings(recentRatings);

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

    const { data: userProfile, isLoading: isLoadingUserProfile, error: errorUserProfile } = useFetchUserProfile();
    const userAvatar = userProfile?.imageUrl ? { uri: userProfile.imageUrl } : require("@/assets/images/userAvatar.jpg");


    const [following, setFollowing] = useState(false);

    type DownloadResult =
        | { status: "saved"; uri?: string }      // Android SAF: uri là content://...
        | { status: "shared" }                  // iOS: chỉ biết đã mở share sheet
        | { status: "cancelled" }
        | { status: "error"; error: unknown };

    async function saveWithSAFAndroid(sourceUri: string, fileName: string, mimeType: string) {
        try {
            const SAF = FSLegacy.StorageAccessFramework;

            const perm = await SAF.requestDirectoryPermissionsAsync();
            if (!perm.granted) return { status: "cancelled" as const };

            const destUri = await SAF.createFileAsync(perm.directoryUri, fileName, mimeType);

            const base64 = await FSLegacy.readAsStringAsync(sourceUri, {
                encoding: FSLegacy.EncodingType.Base64,
            });

            await FSLegacy.writeAsStringAsync(destUri, base64, {
                encoding: FSLegacy.EncodingType.Base64,
            });

            return { status: "saved" as const, uri: destUri };
        } catch (e) {
            return { status: "error" as const, error: e };
        }
    }

    const refetchDocDetail = useCallback(async () => {
        if (!id) return;
        try {
            const res = await api.get(API_GET_DOCUMENT_DETAIL(id));
            const data = res.data?.data;
            setDocDetail(data);
        } catch (error) {
            console.error('Error refetching doc detail:', error);
        }
    }, [id]);

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
            await downloadedDocsStorage.addDownloadedDoc(id);
            // Log download document
            logDownloadDocument(id, docDetail?.title || '');
            logFeatureUsage(Features.DOWNLOAD, 'complete');

            if (Platform.OS === 'android') {
                const mimeType = getMimeType(ext);
                const saved = await saveWithSAFAndroid(uri, `${safeTitle}${ext}`, mimeType);

                if (saved.status === "saved") {
                    setPopupType('success');
                    setShowPopup(true);
                } else if (saved.status === "cancelled") {
                    setPopupType('cancelled');
                    setShowPopup(true);
                } else {
                    setPopupType('error');
                    setShowPopup(true);
                }
                await refetchDocDetail();
            } else {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(uri);
                    // Log share document analytics for iOS
                    logShareDocument(id, 'ios_share_sheet');
                    logFeatureUsage(Features.SHARE, 'complete');
                } else {
                    await Linking.openURL(uri);
                }
                await refetchDocDetail();
            }
        } catch (error) {
            console.error("Error downloading document", error);
            Alert.alert("Lỗi", "Tải về thất bại. Vui lòng thử lại.");
        } finally {
            setIsDownloading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            if (!id) return;

            let cancelled = false;
            (async () => {
                try {

                    const resDoc = await api.get(API_GET_DOCUMENT_DETAIL(id));
                    if (!cancelled) {
                        setDocDetail(resDoc.data?.data);
                    }

                    const res1 = await api.get(API_GET_DOC_RATINGS(id));
                    const data1 = res1.data?.data;
                    if (!cancelled) {
                        const recentRatings = (data1 ?? []).slice(0, 5);
                        setDocRecentRatings(recentRatings);

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
        }, [id, userProfile?.name])
    );

    return (
        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
        }}>
            <DownloadPopup />

            {/* Header buttons - Fixed at top */}
            <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                paddingTop: 56,
                paddingHorizontal: 24,
                flexDirection: 'row',
                justifyContent: 'space-between',
            }}>
                <Pressable
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                    onPress={() => router.back()}
                    testID="btn-back"
                >
                    <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                </Pressable>

                <Pressable
                    className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                    onPress={() => router.push(ROUTES.SEARCH)}
                    testID="btn-search"
                >
                    <Ionicons name="search-outline" size={24} color={"#888888"} />
                </Pressable>
            </View>

            {loading || !docDetail ? (
                <View className="flex-1 items-center justify-center">
                    <Spinner size="lg" color="primary.500" />
                </View>
            ) : (
                <>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 100,
                        }}
                    >
                        {/* Image Carousel */}
                        <View style={{ height: SCREEN_WIDTH * 1.3, position: 'relative' }}>
                            <FlatList
                                data={allImages.length > 0 ? allImages : [null]}
                                horizontal
                                pagingEnabled
                                showsHorizontalScrollIndicator={false}
                                scrollEnabled={allImages.length > 1}
                                onMomentumScrollEnd={(event) => {
                                    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                                    setSelectedImage(index);
                                }}
                                keyExtractor={(_, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <Pressable onPress={() => setSelectedImageUrl(allImages[selectedImage])} testID="btn-open-image">
                                        <Image
                                            source={
                                                typeof item === 'string' && item.trim().length > 0
                                                    ? { uri: item.trim() }
                                                    : require('@/assets/images/sampleDoc1.png')
                                            }
                                            alt="Document Image"
                                            resizeMode="cover"
                                            style={{
                                                width: SCREEN_WIDTH,
                                                height: SCREEN_WIDTH * 1.3,
                                            }}
                                        />
                                    </Pressable>
                                )}
                            />

                            {/* Image Index Indicator */}
                            {allImages.length > 1 && (
                                <View style={{
                                    position: 'absolute',
                                    bottom: 40,
                                    right: 16,
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    paddingHorizontal: 12,
                                    paddingVertical: 6,
                                    borderRadius: 16,
                                }}>
                                    <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                        {selectedImage + 1} / {allImages.length}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Content Section */}
                        <View style={{
                            paddingHorizontal: 24,
                            paddingTop: 20,
                            backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
                            marginTop: -24,
                        }}>
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

                                    <View className="mt-4 flex flex-row items-center gap-3">
                                        <Image source={uploaderAvatar} width={16} height={16} alt={"User Avatar"} className="rounded-full !shadow-md" />

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

                            <View className="mt-4">
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
                                            <Image source={userAvatar} width={12} height={12} alt={"User Avatar"} className="rounded-full !shadow-md" />
                                            <Pressable className='flex flex-row gap-1 ml-1' onPress={() => router.push({
                                                pathname: ROUTES.WRITE_COMMENT,
                                                params: { id: id }
                                            } as any
                                            )} testID="btn-write-comment">
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
                    </ScrollView>

                    {/* Download Button - Fixed at bottom */}
                    <Button
                        className="!rounded-xl h-14 absolute z-10 bottom-[60px]"
                        style={{ left: 32, right: 32 }}
                        onPress={handleDownload}
                    >
                        <Text className="!text-xl !font-bold !text-white">{isDownloading ? "Đang tải..." : "Tải về"}</Text>
                    </Button>
                </>
            )}
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
                        testID="btn-close-modal"
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
    )
}
