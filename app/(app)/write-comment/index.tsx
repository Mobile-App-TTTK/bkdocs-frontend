import { api } from "@/api/apiClient";
import { API_GET_DOC_RATINGS, API_GET_DOCUMENT_DETAIL } from "@/api/apiRoutes";
import { useFetchUserProfile } from "@/components/Profile/api";
import { ACCESS_TOKEN_KEY } from "@/utils/constants";
import { Colors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Image, Text } from "native-base";
import { useEffect, useState } from "react";
import { Alert, Keyboard, Pressable, TextInput, TouchableWithoutFeedback, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

type ApiDocRating = {
    userName: string;
    score: number;
    imageUrl: any[];
    comment: any;
    rateAt: any;
}

export default function WriteComment() {
    const params = useLocalSearchParams<{ id?: string }>();
    const id = typeof params.id === 'string' ? params.id : params.id?.[0];

    const [imageUris, setImageUris] = useState<string[]>([]);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const [rating, setRating] = useState<ApiDocRating | null>(null);
    const [succes, setSucces] = useState<boolean | null>(null);
    
    const [score, setScore] = useState<number>(0);
    const [comment, setComment] = useState<string>("");
    const [docTitle, setDocTitle] = useState<string>("");

    const submitComment = async () => {
        try {
          if (!id) {
            Alert.alert("Lỗi", "Thiếu document id");
            return;
          }
          if (!score) {
            Alert.alert("Thiếu đánh giá", "Vui lòng chọn số sao");
            return;
          }
          if (!comment.trim()) {
            Alert.alert("Thiếu nội dung", "Vui lòng nhập nội dung");
            return;
          }

          const trimmed = comment.trim();

            const form = new FormData();
            form.append("score", String(score));
            form.append("content", trimmed);

            for (let i = 0; i < imageUris.length; i++) {
            const rawUri = imageUris[i];
            const uri = await getLocalUri(rawUri);

            const fileNameFromUri = uri.split("/").pop() || `review-${i + 1}.jpg`;
            const ext = (fileNameFromUri.split(".").pop() || "jpg").toLowerCase();
            const mimeExt = ext === "jpg" ? "jpeg" : ext;

            form.append("image", {
                uri,
                name: fileNameFromUri,
                type: `image/${mimeExt}`,
            } as any);
            }

          const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
          const baseUrl = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");
          const url = `${baseUrl}${API_GET_DOC_RATINGS(id)}`;
          console.log("submitComment url", url, "id", id); // <-- log trước fetch
          
          const resp = await fetch(url, {
            method: "POST",
            headers: token
              ? { Authorization: `Bearer ${token}`, Accept: "application/json" }
              : { Accept: "application/json" },
            body: form,
          });
          
          const data = await resp.json().catch(() => null);
          
          if (!resp.ok) {
            console.log("submitComment failed", { url, status: resp.status, data });
            throw new Error(data?.message ?? `HTTP ${resp.status}`); // <-- ép vào catch
          }

          setSucces(!!data?.success);
          if (data?.success) router.back();
      
        } catch (e: any) {
          console.log("submitComment error", e?.response?.data ?? e);
          console.log("url", `${process.env.EXPO_PUBLIC_API_URL}${API_GET_DOC_RATINGS(id ?? "")}`);
          setSucces(false);
          Alert.alert("Lỗi", "Gửi đánh giá thất bại");
        }
      };
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';

    const {data: userProfile, isLoading: isLoadingUserProfile, error: errorUserProfile} = useFetchUserProfile();
    const userAvatar = userProfile?.imageUrl ? { uri: userProfile.imageUrl } : require("@/assets/images/userAvatar.jpg");

    const getLocalUri = async (uri: string): Promise<string> => {
        if (uri.startsWith("ph://") || uri.startsWith("ph-upload://")) {
          const assetId = uri.replace(/^ph(-upload)?:\/\//, "").split("/")[0];
          const asset = await MediaLibrary.getAssetInfoAsync(assetId);
          if (asset?.localUri) return asset.localUri;
        }
        return uri;
      };

      const pickImages = async () => {
        console.log("pickImages pressed");
        if (imageUris.length >= 2) {
          Alert.alert("Giới hạn", "Bạn chỉ có thể chọn tối đa 2 ảnh");
          return;
        }
      
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) {
          Alert.alert("Cần quyền truy cập", "Vui lòng cấp quyền truy cập thư viện ảnh");
          return;
        }
      
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: 1 - imageUris.length,
          quality: 0.8,
        });
      
        if (result.canceled) return;
      
        const newUris = (result.assets ?? []).map(a => a.uri).filter(Boolean);
        const merged = [...imageUris, ...newUris].slice(0, 2);
        setImageUris(merged);
      };
      
      const removeImage = (uri: string) => {
        setImageUris(prev => prev.filter(u => u !== uri));
      };

      useEffect(() => {
        if (!id) return;
        
        let cancelled = false;
        (async () => {
            try {
                const res = await api.get(API_GET_DOCUMENT_DETAIL(id));
                const data = res.data?.data;
                if (!cancelled) setDocTitle(data?.title ?? "");
            } catch (e) {
                console.log("Error fetching doc detail", e);
            }
        })();
    
        return () => { cancelled = true; };
    }, [id]);
    
    return (
        <GestureHandlerRootView style={{
            flex: 1,
        }} className="bg-white dark:bg-dark-900 justify-center">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View className="flex-1">
                    <View className="items-center justify-center relative !pt-[64px]"
                        style={{
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.1,
                            shadowRadius: 20,
                            elevation: 10,
                            backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background
                        }}
                    >
                        <Pressable
                            className="!absolute top-16 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                            onPress={() => router.back()}
                        >
                            <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                        </Pressable>
                        <Text numberOfLines={1} className="!text-2xl !font-bold !text-black dark:!text-white mb-4 w-7/12 text-center">{docTitle || "Đang tải..."}</Text>
                    </View>

                    <View className="flex flex-col gap-6 mt-6 px-[16px]">
                        <View className="flex flex-row items-center gap-4">
                            <Image source={userProfile?.imageUrl ? { uri: userProfile.imageUrl } : require("@/assets/images/userAvatar.jpg")} className="w-16 h-16 rounded-full" alt="User Avatar" />
                            <View>
                                <Text className="!text-xl !font-bold !text-black dark:!text-white">{userProfile?.name}</Text>
                                <Text className="!text-black dark:!text-white">Nhận xét với tên và ảnh đại diện của bạn</Text>
                            </View>
                        </View>

                        <View className="flex flex-row items-center justify-between mx-[16px]">
                            <Pressable onPress={() => setScore(1)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={score >= 1 ? "star" : "star-outline"} size={36} color={score >= 1 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setScore(2)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={score >= 2 ? "star" : "star-outline"} size={36} color={score >= 2 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setScore(3)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={score >= 3 ? "star" : "star-outline"} size={36} color={score >= 3 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setScore(4)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={score >= 4 ? "star" : "star-outline"} size={36} color={score >= 4 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                            <Pressable onPress={() => setScore(5)} android_ripple={{ color: 'transparent' }} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                                <Ionicons name={score >= 5 ? "star" : "star-outline"} size={36} color={score >= 5 ? "#FFD336" : isDarkMode ? "white" : "gray.500"} />
                            </Pressable>
                        </View>

                        <TextInput
                            placeholder="Nhập nội dung đánh giá hoặc trải nghiệm của bạn"
                            className="border border-gray-300 rounded-xl p-5 h-32"
                            value={comment}
                            onChangeText={setComment}
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

                        <Button className="!bg-primary-50 !rounded-xl !py-4" onPress={pickImages} colorScheme="primary">
                            <Text className="!text-primary-500 !font-bold !text-lg">Thêm ảnh (tối đa 1 ảnh)</Text>
                        </Button>

                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 }}>
                            {imageUris.map((uri) => (
                                <View key={uri} style={{ position: "relative" }}>
                                <Image source={{ uri }} alt="selected" style={{ width: 80, height: 80, borderRadius: 12 }} />
                                <Pressable
                                    onPress={() => removeImage(uri)}
                                    style={{ position: "absolute", top: -8, right: -8 }}
                                >
                                    <Ionicons name="close-circle" size={22} color="#ef4444" />
                                </Pressable>
                                </View>
                            ))}
                        </View>

                    </View>
                </View>
            </TouchableWithoutFeedback>
            
            <View className="absolute bottom-10 left-0 right-0 px-[16px]">
                <Button className="!bg-primary-500 !rounded-xl !py-4" onPress={submitComment}>
                    <Text className="!text-white !font-bold !text-lg">Gửi đánh giá</Text>
                </Button>
            </View>

            {
                succes === true && (
                    <View className="absolute bottom-10 left-0 right-0 px-[16px]">
                        <Text className="!text-white !font-bold !text-lg">Đánh giá thành công</Text>
                        <Button className="!bg-primary-500 !rounded-xl !py-4" onPress={() => router.back()}>
                            <Text className="!text-white !font-bold !text-lg">Đóng</Text>
                        </Button>
                    </View>
                )
            }
            {
                succes === false && (
                    <View className="absolute bottom-10 left-0 right-0 px-[16px]">
                        <Text className="!text-white !font-bold !text-lg">Đánh giá thất bại</Text>
                        <Button className="!bg-primary-500 !rounded-xl !py-4" onPress={() => router.back()}>
                            <Text className="!text-white !font-bold !text-lg">Đóng</Text>
                        </Button>
                    </View>
                )
            }
        </GestureHandlerRootView>
    );
}