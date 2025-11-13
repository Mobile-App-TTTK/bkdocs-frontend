import { getBackgroundById, getDate } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Skeleton, Spinner, Text, View } from 'native-base';
import { Alert, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetchSubjectInfo, useSubscribeSubject, useUnsubscribeSubject } from './api';

type DocCard = {
    id: string;
    title: string;
    uploadDate: string;
    downloadCount: number;
    fileKey: string;
};

const mockDocs: DocCard[] = [
    { id: '1', title: 'Tên tài liệu', uploadDate: '2025-05-21', downloadCount: 1234, fileKey: 'slide.pdf' },
    { id: '2', title: 'Tên tài liệu', uploadDate: '2025-04-10', downloadCount: 1234, fileKey: 'pdf.pdf' },
];

export default function SubjectScreen() {
    const insets = useSafeAreaInsets();
    const { id: localId } = useLocalSearchParams<{ id?: string }>();
    const { data: subjectInfo, isLoading } = useFetchSubjectInfo(localId);
    
    const subscribeSubjectMutation = useSubscribeSubject(localId);
    const unsubscribeSubjectMutation = useUnsubscribeSubject(localId);

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
                                        {subjectInfo.isFollowingSubject ? 'Đang theo dõi' : 'Theo dõi'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View className='mt-6'>
                            <View className='flex-row items-center justify-between mb-3'>
                                <Text className='!text-xl !font-bold'>Tài liệu</Text>
                            </View>

                            <View className='flex-row flex-wrap justify-between'>
                                {mockDocs.map((item) => (
                            <View
                                key={`slide-${item.id}`}
                                className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                            >
                                <TouchableOpacity onPress={() => router.push(ROUTES.DOWNLOAD_DOC)}>
                                    <Image
                                        source={getBackgroundById(item.id)}
                                        className="w-full h-24 rounded-t-xl"
                                        resizeMode="cover"
                                    />
                                    <View className='p-3'>
                                        <View className='flex-row items-center justify-between mb-1 gap-2'>
                                            <Text className="!font-semibold flex-1" numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
                                            <View className='bg-primary-500 !py-[2px] !px-[5px] !rounded-lg'>
                                                <Text className='!text-white !text-xs'>{item.fileKey.split('.').pop()}</Text>
                                            </View>
                                        </View>
                                        <View className='flex-row items-center justify-between mt-1'>
                                            <View className='flex-row items-center gap-2'>
                                                <Ionicons name="calendar-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                                                <Text className="!text-gray-500 dark:!text-gray-400">{getDate(item.uploadDate)}</Text>
                                            </View>
                                            <View className='flex-row items-center gap-2'>
                                                <Ionicons name="download-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                                                <Text className="!text-gray-500 dark:!text-gray-400">{item.downloadCount}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        ))}
                            </View>
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


