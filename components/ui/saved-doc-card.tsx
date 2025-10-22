import {Image, View, Text} from "native-base";
import {Ionicons} from "@expo/vector-icons";

export default function SavedDocCard() {
    const samppleImage = require("@/assets/images/sampleDoc6.png")
    return (
        <View className="relative w-full h-36 bg-white dark:!bg-dark-700 rounded-xl shadow-md flex flex-row items-center">
            <Image source={samppleImage} height={"100%"} width={124} borderLeftRadius={12} />

            <View className="absolute top-5 right-5 ml-auto bg-primary-500 text-sm text-center px-2 py-[2px] font-medium text-white rounded-lg">
                <Text>
                    Xem
                </Text>
            </View>

            <View className="ml-5">
                <View className="w-full flex flex-row items-center">
                    <Text className="!text-lg !font-bold mb-2">Sơ đồ use-case</Text>
                </View>

                <View className="flex flex-row gap-2">
                    <Ionicons name={"calendar-clear-outline"} size={18} />
                    <Text className="!font-medium">dd/mm/yyyy</Text>
                </View>

                <View className="flex flex-row gap-2">
                    <Ionicons name={"download-outline"} size={18} />
                    <Text className="!font-medium">18 kB</Text>
                </View>
            </View>
        </View>
    )
}
