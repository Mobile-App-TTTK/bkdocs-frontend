import { filterOptionsList } from "@/components/searchScreen/utils/constants";
import { getBackgroundById } from "@/utils/functions";
import { ROUTES } from "@/utils/routes";
import { Ionicons, Octicons } from "@expo/vector-icons";
import classNames from "classnames";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FollowingScreen() {
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    return (
        <SafeAreaView className="flex-1 bg-white dark:!bg-dark-900" edges={['top']}>
            <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back-outline" size={24} color="#888" />
                </TouchableOpacity>

                <Text
                    className="!text-xl !font-bold text-black dark:text-white"
                    style={{ fontFamily: 'Gilroy-Bold' }}
                >
                    Đã theo dõi
                </Text>
                <View className="w-12" />
            </View>

            <View className="flex-row items-center gap-2 py-4 px-4">
                {filterOptionsList.map((option) => (
                    <TouchableOpacity
                        key={option.value} onPress={() => setSelectedFilter(option.value)}
                        className={classNames(
                            "p-3 rounded-xl border border-gray-200 dark:border-gray-700", selectedFilter === option.value ? 'bg-primary-50 border-primary-500' : '')}
                    >
                        <Text className={classNames("!text-md !font-medium text-center px-2", selectedFilter === option.value ? '!text-primary-500' : '!text-gray-700 dark:!text-gray-300')}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap justify-between mt-2 mb-10 px-4">
                    <Text className="!text-lg !font-bold text-gray-800 dark:text-white">Người dùng</Text>
                    <View className="flex-col gap-6">
                        <TouchableOpacity
                            onPress={() => router.push(ROUTES.FACULTY)}
                        >
                            <View className="w-full flex flex-row items-center gap-4">
                                <Image
                                    source={{ uri: "https://i.pinimg.com/1200x/24/bd/d9/24bdd9ec59a9f8966722063fe7791183.jpg" }}
                                    width={70}
                                    height={70}
                                    borderRadius={100}
                                    resizeMode="cover"
                                    alt="background"
                                />
                                <View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="!text-lg !font-semibold">Trần Thành Tài</Text>
                                        <Octicons name="verified" size={20} color="#42A5F5" />
                                        <Text className="!text-lg !font-semibold">·</Text>
                                        <TouchableOpacity>
                                            <Text className="!text-blue-500 dark:!text-blue-400 !font-bold">Theo dõi</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text className="!text-gray-500 dark:!text-gray-400 !font-[Gilroy-Regular]">200,9M người theo dõi · Tải lên 124 tài liệu</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push(ROUTES.SUBJECT)}
                        >
                            <View className="w-full flex flex-row items-center gap-4">
                                <Image
                                    source={{ uri: "https://i.pinimg.com/1200x/5a/ac/e1/5aace12a908e7de89dd6fa73ce5ce53b.jpg" }}
                                    width={70}
                                    height={70}
                                    borderRadius={100}
                                    resizeMode="cover"
                                    alt="background"
                                />
                                <View>
                                    <View className="flex-row items-center gap-2">
                                        <Text className="!text-lg !font-semibold">Nguyễn Minh Khánh</Text>
                                    </View>
                                    <Text className="!text-gray-500 dark:!text-gray-400 !font-[Gilroy-Regular]">Đã theo dõi</Text>
                                    <Text className="!text-gray-500 dark:!text-gray-400 !font-[Gilroy-Regular]">500 người theo dõi · Tải lên 124 tài liệu</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <View className="w-full flex flex-row items-center gap-4">
                            <Image
                                source={{ uri: "https://i.pinimg.com/1200x/fd/2d/98/fd2d98b5506a612231fc99a5eb00a335.jpg" }}
                                width={70}
                                height={70}
                                borderRadius={100}
                                resizeMode="cover"
                                alt="background"
                            />
                            <View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="!text-lg !font-semibold">Nguyễn Trường Thịnh</Text>
                                    <Text className="!text-lg !font-semibold">·</Text>
                                    <TouchableOpacity>
                                        <Text className="!text-blue-500 dark:!text-blue-400 !font-bold">Theo dõi</Text>
                                    </TouchableOpacity>
                                </View>
                                <Text className="!text-gray-500 dark:!text-gray-400 !font-[Gilroy-Regular]">100,2K người theo dõi · Tải lên 124 tài liệu</Text>
                            </View>
                        </View>
                    </View>
                    <Text className="!text-lg !font-bold text-gray-800 dark:text-white py-2">Khoa</Text>
                    <View className="flex-row flex-wrap justify-between mt-2 mb-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                             <TouchableOpacity
                                onPress={() => router.push(ROUTES.DOWNLOAD_DOC)}
                                key={index}
                                className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                            >
                                <Image
                                source={getBackgroundById(index.toString())}
                                className="w-full h-20 rounded-t-xl"
                                resizeMode="cover"
                                />
                                <View className='p-3'>
                                <Text className="!font-semibold">Khoa</Text>
                                <Text className="!text-sm mt-1 font-[Gilroy-Regular]">
                                    100 tài liệu
                                </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}