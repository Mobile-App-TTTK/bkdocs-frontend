import { SubjectDocument, SubjectTypeList } from '@/models/subject.type';
import { logViewSubject } from '@/services/analytics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Skeleton, Spinner, Text, View } from 'native-base';
import { useEffect, useMemo } from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentCard from '../DocumentCard';
import { useFetchSubjectInfo, useSubscribeSubject, useUnsubscribeSubject } from './api';

export default function SubjectScreen() {
    const insets = useSafeAreaInsets();
    const { id: localId } = useLocalSearchParams<{ id?: string }>();
    const { data: subjectInfo, isLoading } = useFetchSubjectInfo(localId);
    
    console.log("localId: ", localId);

    console.log("subjectInfo: ", subjectInfo);
    
    const subscribeSubjectMutation = useSubscribeSubject(localId);
    const unsubscribeSubjectMutation = useUnsubscribeSubject(localId);

    // Log view subject when data loads
    useEffect(() => {
        if (subjectInfo && localId) {
            logViewSubject(localId, subjectInfo.name || '');
        }
    }, [subjectInfo, localId]);

    // Lấy typeList từ subjectInfo
    const typeList = useMemo(() => {
        if (!subjectInfo) return [];
        return subjectInfo.typeList || subjectInfo.types || [];
    }, [subjectInfo]);

    const handleToggleFollowSubject = () => {
        if (!localId) return;
        
        if (subjectInfo?.isFollowingSubject) {
            unsubscribeSubjectMutation.mutate(localId, {
                onError: () => {
                    Alert.alert(
                        "Lỗi",
                        "Không thể hủy theo dõi môn học",
                        [{ text: "OK" }]
                    );
                },
            });
        } else {
            subscribeSubjectMutation.mutate(localId, {
                onError: () => {
                    Alert.alert(
                        "Lỗi",
                        "Không thể theo dõi môn học",
                        [{ text: "OK" }]
                    );
                },
            });
        }
    };

    const isSubjectFollowLoading = subscribeSubjectMutation.isPending || unsubscribeSubjectMutation.isPending;

    return (
        <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
            <View
                style={{ marginTop: insets.top }}
                className="absolute top-0 left-0 right-0 z-10 px-3 py-2 bg-white dark:bg-dark-900"
            >
                <View className='flex-row items-center gap-3'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={30} className='!text-black dark:!text-white' />
                    </TouchableOpacity>
                    <Text className='!text-xl !font-semibold' numberOfLines={1}>
                        {isLoading ? 'Đang tải...' : subjectInfo?.name || 'Môn học'}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-2"
                style={{ marginTop: insets.top + 60 }}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View className='mt-2'>
                        <Skeleton h="24" w="full" rounded="xl" />
                        <View className='mt-4'>
                            <Skeleton.Text lines={2} />
                        </View>
                        <Skeleton h="12" w="full" rounded="xl" className='mt-4' />
                    </View>
                ) : subjectInfo ? (
                    <>
                        <View className='mt-2'>
                            {subjectInfo.imageUrl && (
                                <Image
                                    source={{ uri: subjectInfo.imageUrl }}
                                    className='w-full h-24 rounded-xl'
                                    resizeMode='cover'
                                />
                            )}

                            <View className='mt-4'>
                                <Text className='!text-3xl !font-bold'>{subjectInfo.name}</Text>
                                <Text className='!text-gray-600 dark:!text-gray-300 mt-1'>
                                    {subjectInfo.followers_count} người theo dõi · {subjectInfo.document_count} tài liệu
                                </Text>
                            </View>

                            <TouchableOpacity 
                                onPress={handleToggleFollowSubject}
                                disabled={isSubjectFollowLoading}
                                className={`mt-4 w-full rounded-xl py-3 items-center ${
                                    subjectInfo.isFollowingSubject 
                                        ? 'bg-gray-200 dark:bg-gray-700' 
                                        : 'bg-primary-500'
                                }`}
                            >
                                {isSubjectFollowLoading ? (
                                    <Spinner size="sm" color={subjectInfo.isFollowingSubject ? 'gray.700' : 'white'} />
                                ) : (
                                    <Text className={`!font-semibold ${
                                        subjectInfo.isFollowingSubject 
                                            ? '!text-gray-700 dark:!text-gray-300' 
                                            : '!text-white'
                                    }`}>
                                        {subjectInfo.isFollowingSubject ? 'Bỏ theo dõi' : 'Theo dõi'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className='mt-6'>
                 

                            {typeList.length > 0 ? (
                                <View className='space-y-6'>
                                    {typeList.map((typeItem: SubjectTypeList, typeIndex: number) => {
                                        if (!typeItem.documents || typeItem.documents.length === 0) {
                                            return null;
                                        }
                                        return (
                                            <View key={typeIndex} className='mb-6'>
                                                <Text className='!text-xl !font-semibold mb-3'>
                                                    {typeItem.name}
                                                </Text>
                                                <View className='flex-row flex-wrap justify-between'>
                                                    {typeItem.documents.map((item: SubjectDocument) => (
                                                        <DocumentCard
                                                            key={item.id}
                                                            id={item.id}
                                                            title={item.title}
                                                            downloadCount={item.downloadCount}
                                                            uploadDate={item.uploadDate}
                                                            thumbnail={item.thumbnail}
                                                            score={item.score || 0}
                                                            type={item.type}
                                                            subject={item.subject?.name}
                                                            faculty={item.faculty?.name}
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                        );
                                    })}
                                </View>
                            ) : (
                                <View className='py-8 items-center'>
                                    <Text className='!text-gray-500 dark:!text-gray-400'>
                                        Chưa có tài liệu nào
                                    </Text>
                                </View>
                            )}
                        </View>
                    </>
                ) : (
                    <View className='py-8 items-center'>
                        <Text className='!text-gray-500 dark:!text-gray-400'>
                            Không tìm thấy thông tin môn học
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}


