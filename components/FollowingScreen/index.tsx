import FacultyCard from "@/components/FacultyCard";
import { useFetchFollowList } from "@/components/Profile/api";
import { filterOptionsList } from "@/components/searchScreen/utils/constants";
import SubjectCard from "@/components/SubjectCard";
import UserCard from "@/components/UserCard";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { Skeleton, Text, View } from "native-base";
import { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

interface FollowingScreenProps {
    onBack?: () => void;
}

export default function FollowingScreen({ onBack }: FollowingScreenProps) {
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const { data: followList, isLoading } = useFetchFollowList();

    return (
        <SafeAreaView className="flex-1 bg-white dark:!bg-dark-900" edges={['top']}>
            <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
                {onBack && (
                    <TouchableOpacity
                        onPress={onBack}
                        className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back-outline" size={24} color="#888" />
                    </TouchableOpacity>
                )}
                {!onBack && <View className="w-12" />}

                <Text
                    className="!text-xl !font-bold text-black dark:text-white"
                    style={{ fontFamily: 'Inter-Bold' }}
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
                {isLoading ? (
                    <View className="px-4 py-8">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <View key={index} className="flex-row items-center gap-4 mb-6">
                                <Skeleton h="16" w="16" rounded="full" />
                                <View className="flex-1">
                                    <Skeleton.Text lines={2} />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : followList ? (
                    <View className="px-4 pb-4">
                        {(selectedFilter === 'all' || selectedFilter === 'user') && 
                         followList.followingUsers && followList.followingUsers.length > 0 && (
                            <View className="mt-4 mb-4">
                                <Text className="!text-lg !font-bold text-gray-800 dark:text-white mb-4">
                                    Người dùng
                                </Text>
                                <View className="flex-col gap-6">
                                    {followList.followingUsers.map((user) => (
                                        <UserCard
                                            key={user.id}
                                            id={user.id}
                                            name={user.name}
                                            image_key={user.imageUrl}
                                            followersCount={0}
                                            documentsCount={user.documentCount}
                                            isFollowing={true}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {(selectedFilter === 'all' || selectedFilter === 'faculty') && 
                         followList.subscribedFacultyIds && followList.subscribedFacultyIds.length > 0 && (
                            <View className="mb-4">
                                <Text className="!text-lg !font-bold text-gray-800 dark:text-white mb-4">
                                    Khoa
                                </Text>
                                <View className="flex-row flex-wrap justify-between">
                                    {followList.subscribedFacultyIds.map((faculty) => (
                                        <FacultyCard
                                            key={faculty.id}
                                            id={faculty.id}
                                            name={faculty.name}
                                            count={faculty.documentCount}
                                            downloadUrl={faculty.imageUrl}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {(selectedFilter === 'all' || selectedFilter === 'subject') && 
                         followList.subscribedSubjectIds && followList.subscribedSubjectIds.length > 0 && (
                            <View className="mb-4">
                                <Text className="!text-lg !font-bold text-gray-800 dark:text-white mb-4">
                                    Môn học
                                </Text>
                                <View className="flex-row flex-wrap justify-between">
                                    {followList.subscribedSubjectIds.map((subject) => (
                                        <SubjectCard
                                            key={subject.id}
                                            id={subject.id}
                                            name={subject.name}
                                            count={subject.documentCount}
                                            downloadUrl={subject.imageUrl}
                                        />
                                    ))}
                                </View>
                            </View>
                        )}

                        {(!followList.followingUsers || followList.followingUsers.length === 0) &&
                         (!followList.subscribedFacultyIds || followList.subscribedFacultyIds.length === 0) &&
                         (!followList.subscribedSubjectIds || followList.subscribedSubjectIds.length === 0) && (
                            <View className="py-16 items-center">
                                <Text className="!text-gray-500 dark:!text-gray-400">
                                    Chưa theo dõi ai hoặc khoa/môn học nào
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="py-16 items-center">
                        <Text className="!text-gray-500 dark:!text-gray-400">
                            Không thể tải dữ liệu
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

