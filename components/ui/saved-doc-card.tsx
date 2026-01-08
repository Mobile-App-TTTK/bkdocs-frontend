import { ROUTES } from "@/utils/routes";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { Image, Text, View } from "native-base";
import { useState } from "react";
import { Alert, Linking, Modal, Pressable } from "react-native";

export default function SavedDocCard({ id, title, uploadDate, subject, thumbnailUrl, type }: { id: string, title: string, uploadDate: string, subject: string, thumbnailUrl: string, type: string }) {
    const formattedUploadDate = uploadDate ? new Date(uploadDate).toLocaleDateString('vi-VN') : '';

    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const getSafeFileName = (title: string) => {
        return title
            .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
            .slice(0, 80);
    };

    const isImageExtension = (ext: string) => {
        return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'].includes(ext.toLowerCase());
    };

    const openSavedFile = async () => {
        try {
            const safeTitle = getSafeFileName(title);

            console.log('[SavedDocCard] Opening file:', { title, safeTitle, type });

            const extensions = ['.pdf', '.docx', '.doc', '.xlsx', '.xls', '.pptx', '.ppt', '.zip', '.png', '.jpg', '.jpeg', '.gif', '.webp'];
            let foundFile: FileSystem.File | null = null;
            let fileExt = '';

            for (const ext of extensions) {
                const file = new FileSystem.File(FileSystem.Paths.document, `${safeTitle}${ext}`);
                console.log('[SavedDocCard] Checking:', `${safeTitle}${ext}`, 'exists:', file.exists);

                if (file.exists) {
                    foundFile = file;
                    fileExt = ext;
                    break;
                }
            }

            console.log('[SavedDocCard] Found file:', foundFile?.uri, 'ext:', fileExt);

            if (!foundFile) {
                if (type && isImageType(type) && thumbnailUrl) {
                    console.log('[SavedDocCard] Using thumbnailUrl for image');
                    setImageUri(thumbnailUrl);
                    setImageModalVisible(true);
                    return;
                }

                Alert.alert(
                    "Không tìm thấy file",
                    "File có thể đã bị xóa. Bạn có muốn tải lại?",
                    [
                        { text: "Hủy", style: "cancel" },
                        {
                            text: "Tải lại",
                            onPress: () => router.push({
                                pathname: ROUTES.DOWNLOAD_DOC as any,
                                params: { id },
                            })
                        }
                    ]
                );
                return;
            }

            if (isImageExtension(fileExt) || isImageType(type)) {
                console.log('[SavedDocCard] Opening as image');
                setImageUri(foundFile.uri);
                setImageModalVisible(true);
                return;
            }

            if (fileExt === '.pdf') {
                console.log('[SavedDocCard] Opening as PDF');
                router.push({
                    pathname: ROUTES.PDF_VIEWER as any,
                    params: {
                        uri: foundFile.uri,
                        title: title,
                    },
                });
                return;
            }

            // Các file khác dùng Sharing
            console.log('[SavedDocCard] Opening with Sharing');
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(foundFile.uri, {
                    mimeType: getMimeType(foundFile.uri),
                    dialogTitle: `Mở ${title}`,
                });
            } else {
                await Linking.openURL(foundFile.uri);
            }
        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert("Lỗi", "Không thể mở file. Vui lòng thử lại.");
        }
    };

    const isImageType = (docType: string) => {
        if (!docType) return false;
        const imageTypes = ['image', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];
        return imageTypes.some(t => docType.toLowerCase().includes(t));
    };

    const getMimeType = (filePath: string): string => {
        const ext = filePath.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'zip': 'application/zip',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
        };
        return mimeTypes[ext || ''] || 'application/octet-stream';
    };

    return (
        <>
            <Pressable onPress={openSavedFile} className="relative w-full h-36 bg-white dark:!bg-dark-700 rounded-xl shadow-md flex flex-row items-center">
                <Image source={thumbnailUrl ? { uri: thumbnailUrl } : require("@/assets/images/sampleDoc6.png")} height={"100%"} width={124} borderLeftRadius={12} alt="thumbnail" />

                <Pressable
                    className="absolute top-5 right-5 ml-auto bg-primary-500 text-sm text-center px-2 py-[2px] font-medium text-white rounded-lg"
                    onPress={openSavedFile}
                >
                    <Text className="!text-white">
                        Xem
                    </Text>
                </Pressable>

                <View className="ml-5 w-7/12">
                    <View className="w-full flex flex-row items-center">
                        <Text className="!text-lg !font-bold mb-2 !text-black dark:!text-white mb-4 w-7/12 text-left line-clamp-2">{title}</Text>
                    </View>

                    <View className="flex flex-row gap-2">
                        <Ionicons name={"calendar-clear-outline"} size={18} color={"#6b7280"} />
                        <Text className="!font-medium">{formattedUploadDate}</Text>
                    </View>

                    <View className="flex flex-row gap-2">
                        <Ionicons name={"download-outline"} size={18} color={"#6b7280"} />
                        <Text className="!font-medium">{subject}</Text>
                    </View>
                </View>
            </Pressable>

            {/* Modal xem ảnh fullscreen */}
            <Modal
                visible={imageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    {/* Nút đóng */}
                    <Pressable
                        onPress={() => setImageModalVisible(false)}
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

                    <Text
                        style={{
                            position: 'absolute',
                            top: 68,
                            left: 20,
                            right: 70,
                            color: 'white',
                            fontSize: 16,
                            fontWeight: 'bold',
                        }}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>

                    {imageUri && (
                        <Image
                            source={{ uri: imageUri }}
                            alt="Full size image"
                            resizeMode="contain"
                            style={{
                                width: '95%',
                                height: '75%',
                            }}
                        />
                    )}
                </View>
            </Modal>
        </>
    )
}