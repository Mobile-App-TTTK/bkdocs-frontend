import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { Image, Text, View } from "native-base";
import { useRef } from 'react';
import { Dimensions, GestureResponderEvent, ImageSourcePropType, Pressable } from "react-native";

export default function SuggestCard({id, title, image, subject, downloadCount, uploadDate, type}: {id: string, title: string, image: string | number, subject: string, downloadCount: number, uploadDate: string, type: string}) {
    const router = useRouter();

    const touchStartPos = useRef({ x: 0, y: 0 });
    const isSwiping = useRef(false);

    const { width, height } = Dimensions.get("window");
    const aspectRatio = height / width;

    const imageHeight = aspectRatio <= 667 / 375 ? "60%" : "70%";

    const handleTouchStart = (e: GestureResponderEvent) => {
        touchStartPos.current = {
            x: e.nativeEvent.pageX,
            y: e.nativeEvent.pageY
        };
        isSwiping.current = false;
    };

    const formatUploadDate = (input?: string) => {
        const s = String(input ?? "").trim();
        if (!s) return "";

        const pad2 = (n: string | number) => String(n).padStart(2, "0");

        const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (dmy) {
            const [, dd, mm, yyyy] = dmy;
            return `${pad2(dd)}-${pad2(mm)}-${yyyy}`;
        }

        const d = new Date(s);
        if (!Number.isNaN(d.getTime())) {
            return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`;
        }

        return s;
    };

    const handleTouchMove = (e: GestureResponderEvent) => {
        const dx = Math.abs(e.nativeEvent.pageX - touchStartPos.current.x);
        const dy = Math.abs(e.nativeEvent.pageY - touchStartPos.current.y);
        
        if (dx > 10 || dy > 10) {
            isSwiping.current = true;
        }
    };

    const handlePress = () => {
        if (!isSwiping.current) {
            router.push({
                pathname: ROUTES.DOWNLOAD_DOC as any,
                params: {
                    id: id,
                },
            });
        }
    };

    const normalizedSource: ImageSourcePropType | undefined = (() => {
        if (!image) return undefined;
    
        if (typeof image === 'string') {
        const trimmed = image.trim();
        if (trimmed === "") return undefined;
        return { uri: trimmed };
        }
    
        return image as ImageSourcePropType;
    })();

    return (
        <Pressable className="w-[60vw] h-[42vh] p-3 bg-white dark:!bg-dark-700 rounded-xl"
            style={{
                boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.25)',
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onPress={handlePress}
        >
            <Image
                source={normalizedSource}
                resizeMode={'cover'}
                width={"100%"}
                height={imageHeight}
                borderRadius={6}
                borderColor="primary.100"
                borderWidth={2}
                alt="SampleImage"
                onError={(e) => {
                    console.warn("[SuggestCard] image load failed", {
                    imageProp: image,
                    normalizedSource,
                    error: e?.nativeEvent, // { error?: string }
                    });
                }}
                onLoad={() => {
                    console.log("[SuggestCard] image loaded", { imageProp: image, normalizedSource });
                }}
            />

            <View style={{padding: 5}} className="my-auto mt-2">
                <View className="flex flex-row items-center gap-4">
                    <Text
                        className="!font-bold !text-primary-500 !text-lg flex-1"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </Text>

                    <View className="bg-primary-500 px-2 py-[2px]" style={{borderRadius: 6}}>
                        <Text className="!text-white !text-sm">
                            {type}
                        </Text>
                    </View>
                </View>

                <View className="flex flex-row gap-2 items-center mt-2">
                    <Ionicons name="book-outline" size={20} color="#6b7280"></Ionicons>
                    <Text className="font-semibold text-sm text-gray-500">{subject}</Text>
                </View>

                <View className="flex flex-row mt-2">
                    <View className="flex flex-row items-center gap-2">
                        <Ionicons name="calendar-clear-outline" size={20} color="#6b7280"></Ionicons>
                        <Text className="font-semibold text-sm text-gray-500">{formatUploadDate(uploadDate)}</Text>
                    </View>

                    <View className="flex-1"></View>
                    <View className="flex flex-row items-center gap-2">
                        <Ionicons name="download-outline" size={20} color="#6b7280"></Ionicons>
                        <Text className="font-semibold text-sm text-gray-500">{downloadCount}</Text>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}
