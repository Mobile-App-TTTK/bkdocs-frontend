import {Image, Text, View} from "native-base";
import { Ionicons } from '@expo/vector-icons';
import {Dimensions} from "react-native";

export default function SuggestCard() {
    const SampleImage = require('@/assets/images/sampleDoc1.png')

    const { width, height } = Dimensions.get("window");
    const aspectRatio = height / width;

    const imageHeight = aspectRatio <= 667 / 375 ? "60%" : "70%";

    return (
        <View className="w-[60vw] h-[42vh] p-3 bg-white rounded-xl"
        style={{
            boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.25)',
        }}>
            <Image source={SampleImage} resizeMode={'cover'} width={"100%"} height={imageHeight} borderRadius={6} borderColor="primary.100" borderWidth={2} alt="SampleImage"/>

            <View style={{padding: 5}} className="my-auto mt-2">
                <View className="flex flex-row items-center gap-4 justify-center">
                    <Text className="font-bold text-primary-500 text-base overflow-ellipsis truncate">Giáo trình Giải tích 1 Đại học BK</Text>

                    <Text className="bg-primary-500 text-white text-sm px-2" style={{borderRadius: 6}}>pdf</Text>
                </View>

                <View className="flex flex-row gap-2 items-center mt-2">
                    <Ionicons name="book-outline" size={20} color="#6b7280"></Ionicons>
                    <Text className="font-semibold text-sm text-gray-500">Giải tích 1</Text>
                </View>

                <View className="flex flex-row mt-1">
                    <View className="flex flex-row items-center gap-2">
                        <Ionicons name="calendar-clear-outline" size={20} color="#6b7280"></Ionicons>
                        <Text className="font-semibold text-sm text-gray-500">dd/mm/yyyy</Text>
                    </View>

                    <View className="flex-1"></View>
                    <View className="flex flex-row items-center gap-2">
                        <Ionicons name="download-outline" size={20} color="#6b7280"></Ionicons>
                        <Text className="font-semibold text-sm text-gray-500">1234</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}
