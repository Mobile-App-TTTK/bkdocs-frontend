import SavedDocCard from "@/components/ui/saved-doc-card";
import {View, Text, Pressable} from "native-base";
import { ScrollView } from "react-native";
import React, {useState} from "react";
import {Ionicons} from "@expo/vector-icons";
import {useRouter} from "expo-router";

export default function SavedDoc() {
    const router = useRouter();

    const [scroll, setScroll] = useState(false);
    return (
        <View className="flex-1 bg-white dark:!bg-gray-900">
            <View className="flex items-center justify-center relative !pt-16">
                <Pressable
                    className="!absolute top-14 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                </Pressable>
                <Text className="!text-2xl !font-bold mb-4">Danh sách tài liệu</Text>
            </View>

            <ScrollView className="p-6">
                <View className="flex flex-col gap-6 mb-8">
                    <SavedDocCard />
                    <SavedDocCard />
                    <SavedDocCard />
                    <SavedDocCard />
                    <SavedDocCard />
                    <SavedDocCard />
                    <SavedDocCard />
                    <SavedDocCard />
                </View>
            </ScrollView>
        </View>
    )
}
