import { Ionicons } from "@expo/vector-icons";
import { Image, Text, View } from "native-base";
import { Pressable } from "react-native";

export default function SavedDocCard({id, title, uploadDate, subject, thumbnailUrl, type}: {id: string, title: string, uploadDate: string, subject: string, thumbnailUrl: string, type: string}) {
    const formattedUploadDate = uploadDate ? new Date(uploadDate).toLocaleDateString('vi-VN') : '';
    return (
        <View className="relative w-full h-36 bg-white dark:!bg-dark-700 rounded-xl shadow-md flex flex-row items-center">
            <Image source={thumbnailUrl ? { uri: thumbnailUrl } : require("@/assets/images/sampleDoc6.png")} height={"100%"} width={124} borderLeftRadius={12} />

            <Pressable className="absolute top-5 right-5 ml-auto bg-primary-500 text-sm text-center px-2 py-[2px] font-medium text-white rounded-lg">
                <Text>
                    Xem
                </Text>
            </Pressable>

            <View className="ml-5 w-7/12">
                <View className="w-full flex flex-row items-center">
                    <Text className="!text-lg !font-bold mb-2 !text-black dark:!text-white mb-4 w-7/12 text-left line-clamp-2">{title}</Text>
                </View>

                <View className="flex flex-row gap-2">
                    <Ionicons name={"calendar-clear-outline"} size={18} color={"#6b7280"}/>
                    <Text className="!font-medium">{formattedUploadDate}</Text>
                </View>

                <View className="flex flex-row gap-2">
                    <Ionicons name={"download-outline"} size={18} color={"#6b7280"}/>
                    <Text className="!font-medium">{subject}</Text>
                </View>
            </View>
        </View>
    )
}
