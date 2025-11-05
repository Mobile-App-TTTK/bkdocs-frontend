import SavedDocCard from "@/components/ui/saved-doc-card";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "native-base";
import React, { useState } from "react";
import { ScrollView } from "react-native";

export default function SavedDoc() {
    const router = useRouter();

    const [scroll, setScroll] = useState(false);
    return (
        <View className="flex-1 bg-white dark:!bg-gray-900">
            <View className="flex items-center justify-center relative !pt-[64px] bg-white dark:bg-black-700"
                  style={{
                      shadowColor: "#000",
                      shadowOffset: {
                          width: 0,
                          height: 2,
                      },
                      shadowOpacity: 0.1,
                      shadowRadius: 20,
                      elevation: 10,
                  }}
            >
                <Pressable
                    className="!absolute top-16 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
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
