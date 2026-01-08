import { api } from "@/api/apiClient";
import { API_DOWNLOAD_DOCUMENT, API_GET_DOCUMENT_DETAIL } from "@/api/apiRoutes";
import { useApproveDocument, useRejectDocument } from '@/components/Admin/api';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system";
import * as FileSystemLegacy from "expo-file-system/legacy";
import * as IntentLauncher from "expo-intent-launcher";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, Text } from 'native-base';
import React, { useEffect, useState } from "react";
import { Alert, Dimensions, FlatList, Modal, Platform, Pressable, useColorScheme, View } from 'react-native';
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
    downloadUrl?: string;
};
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DocumentManagementScreen() {
    const { userProfile } = useAuth();
    const router = useRouter();
    const isAdmin = userProfile?.role === 'admin';

    useEffect(() => {
        if (!isAdmin) {
            router.replace(ROUTES.HOME);
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }
    const params = useLocalSearchParams<{ id?: string; downloadUrl?: string }>();
    const [docDetail, setDocDetail] = useState<ApiDocDetail | null>(null);

    useEffect(() => {
        if (params.id) {
            fetchDocDetail(params.id);
        }
    }, [params.id]);


    // ...

    const fetchDocDetail = async (id: string) => {
        try {
            const response = await api.get(API_GET_DOCUMENT_DETAIL(id));
            setDocDetail(response.data?.data);
        } catch (error) {
            console.error(error);
        }
    };


    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [ratingsCount, setRatingsCount] = useState<number>(0);
    const [ratingsAverage, setRatingsAverage] = useState<number>(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [hasUserRated, setHasUserRated] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState<'success' | 'cancelled' | 'error'>('success');

    const approveMutation = useApproveDocument();
    const rejectMutation = useRejectDocument();
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    const SCREEN_WIDTH = Dimensions.get('window').width;
    const handleApprove = async () => {
        if (!docDetail?.id) return;
        try {
            await approveMutation.mutateAsync(docDetail.id);
            Alert.alert('Thành công', 'Đã duyệt tài liệu', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Lỗi', 'Không thể duyệt tài liệu');
        }
    };

    const handleReject = async () => {
        if (!docDetail?.id) return;

        Alert.alert(
            'Xác nhận',
            'Bạn có chắc chắn muốn từ chối tài liệu này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Từ chối',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await rejectMutation.mutateAsync(docDetail.id);
                            Alert.alert('Thành công', 'Đã từ chối tài liệu', [
                                { text: 'OK', onPress: () => router.back() }
                            ]);
                        } catch (error) {
                            console.error(error);
                            Alert.alert('Lỗi', 'Không thể từ chối tài liệu');
                        }
                    },
                },
            ]
        );
    };

    const handlePreview = async () => {
        if (!docDetail?.id) {
            Alert.alert('Lỗi', 'Không tìm thấy tài liệu');
            return;
        }

        try {

            // Step 1: Get download URL
            // Priority: params.downloadUrl (from list) -> API_DOWNLOAD_DOCUMENT -> docDetail fields
            let downloadUrl: string | undefined;
            const paramsDownloadUrl = params.downloadUrl as string;

            if (paramsDownloadUrl) {
                downloadUrl = paramsDownloadUrl;
            } else {
                const res = await api.get(API_DOWNLOAD_DOCUMENT(docDetail.id));
                const data = res.data?.data;
                downloadUrl =
                    (typeof data === "string" ? data : undefined) ??
                    data?.downloadUrl ??
                    data?.url ??
                    data?.fileUrl;
            }

            if (!downloadUrl || typeof downloadUrl !== "string") {
                Alert.alert("Lỗi", "Không lấy được link tải về.");
                return;
            }

            // Construct full URL if relative
            if (!downloadUrl.startsWith('http')) {
                const baseUrl = process.env.EXPO_PUBLIC_API_URL || '';
                const cleanBaseUrl = baseUrl.replace(/\/$/, '');
                const cleanPath = downloadUrl.startsWith('/') ? downloadUrl : `/${downloadUrl}`;
                downloadUrl = `${cleanBaseUrl}${cleanPath}`;
            }

            if (!downloadUrl || typeof downloadUrl !== "string") {
                Alert.alert("Lỗi", "Không lấy được link tải về từ server.");
                return;
            }

            // Step 2: Download file temporarily
            const safeTitle = (docDetail?.title ?? "document")
                .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
                .slice(0, 80);

            const extMatch = downloadUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
            const ext = extMatch?.[1] ? `.${extMatch[1]}` : ".pdf";

            const destFile = new FileSystem.File(FileSystem.Paths.cache, `preview_${safeTitle}${ext}`);

            if (destFile.exists) {
                destFile.delete();
            }

            console.log('Downloading file...');
            const downloadedFile = await FileSystem.File.downloadFileAsync(downloadUrl, destFile);
            const localUri = downloadedFile.uri;

            console.log('File downloaded to:', localUri);

            // Step 3: Open in PDF viewer
            if (Platform.OS === 'android') {
                // Use Android's native PDF viewer via IntentLauncher
                const contentUri = await FileSystemLegacy.getContentUriAsync(localUri);
                console.log('Content URI:', contentUri);

                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    flags: 1,
                    type: 'application/pdf',
                });
            } else {
                // Use custom PDF viewer for iOS
                router.push({
                    pathname: '/(app)/pdf-viewer',
                    params: { uri: localUri, title: docDetail.title }
                });
            }
        } catch (error) {
            console.error('Error in handlePreview:', error);
            Alert.alert('Lỗi', 'Không thể tải file xem trước. Vui lòng thử lại.');
        }
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

    return (
        <GestureHandlerRootView style={{
            flex: 1,
            backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
        }}>
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
                            </View>

                            <View className="mt-4 flex flex-row items-center gap-3">
                                <View>
                                    <View className="flex flex-row items-center gap-1.5">
                                        <Text className="!font-bold !text-xl">Người tải lên: {docDetail?.uploader?.name ?? "N/A"}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="mt-4">
                        <Text className="!font-bold !text-xl">Danh mục tài liệu</Text>
                        <Text>Khoa: {docDetail?.faculty ?? ""} {docDetail?.faculty?.length > 1 ? `+ ${docDetail?.faculty?.length - 1}` : ""}</Text>
                        <Text>Môn học: {docDetail?.subject ?? ""}</Text>
                    </View>

                    <View className="mt-6 mb-20">
                        <Text className="!font-bold !text-xl">Mô tả</Text>
                        <Text>{docDetail?.description ?? ""}</Text>
                    </View>
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-gray-800 flex-row gap-4">
                <Pressable
                    onPress={handlePreview}
                    className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl py-3 items-center justify-center"
                >
                    <Text className="!text-blue-600 dark:!text-blue-400 !font-bold">Xem trước</Text>
                </Pressable>

                <Pressable
                    onPress={handleReject}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-xl py-3 items-center justify-center"
                >
                    <Text className="!text-red-600 dark:!text-red-400 !font-bold">Từ chối</Text>
                </Pressable>

                <Pressable
                    onPress={handleApprove}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl py-3 items-center justify-center"
                >
                    <Text className="!text-green-600 dark:!text-green-400 !font-bold">Duyệt</Text>
                </Pressable>
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
    );
}


