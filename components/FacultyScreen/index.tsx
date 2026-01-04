import { DocumentItem, Subject } from '@/models/faculty.type';
import { logFollowUser, logViewFaculty } from '@/services/analytics';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Skeleton, Spinner, Text, View } from 'native-base';
import { useEffect } from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentCard from '../DocumentCard';
import { useFetchFacultyInfo, useSubscribeFaculty, useSubscribeSubject, useUnsubscribeFaculty, useUnsubscribeSubject } from './api';

export default function FacultyScreen() {
    const insets = useSafeAreaInsets();
    const { id: localId } = useLocalSearchParams<{ id?: string }>();
    const { data: facultyInfo, isLoading } = useFetchFacultyInfo(localId);
    
    const subscribeFacultyMutation = useSubscribeFaculty(localId);
    const unsubscribeFacultyMutation = useUnsubscribeFaculty(localId);
    const subscribeSubjectMutation = useSubscribeSubject();
    const unsubscribeSubjectMutation = useUnsubscribeSubject();

    // Log view faculty when data loads
    useEffect(() => {
        if (facultyInfo && localId) {
            logViewFaculty(localId, facultyInfo.name || '');
        }
    }, [facultyInfo, localId]);

    const handleToggleFollowFaculty = () => {
        if (!localId) return;
        
        if (facultyInfo?.isFollowingFaculty) {
            unsubscribeFacultyMutation.mutate(localId, {
                onError: () => {
                    Alert.alert(
                        "Lỗi",
                        "Không thể hủy theo dõi khoa",
                        [{ text: "OK" }]
                    );
                },
            });
        } else {
            subscribeFacultyMutation.mutate(localId, {
                onSuccess: () => {
                    logFollowUser(localId); // Log follow faculty
                },
                onError: () => {
                    Alert.alert(
                        "Lỗi",
                        "Không thể theo dõi khoa",
                        [{ text: "OK" }]
                    );
                },
            });
        }
    };

    const handleToggleFollowSubject = (subjectId: string, isFollowing: boolean) => {
        if (isFollowing) {
            unsubscribeSubjectMutation.mutate(subjectId, {
                onError: () => {
                    Alert.alert(
                        "Lỗi",
                        "Không thể hủy theo dõi môn học",
                        [{ text: "OK" }]
                    );
                },
            });
        } else {
            subscribeSubjectMutation.mutate(subjectId, {
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

    const isFacultyFollowLoading = subscribeFacultyMutation.isPending || unsubscribeFacultyMutation.isPending;
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
                        {isLoading ? 'Đang tải...' : facultyInfo?.name || 'Khoa'}
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
                ) : facultyInfo ? (
                    <>
                        <View className='mt-2'>
                            {facultyInfo.imageUrl && (
                                <Image
                                    source={{ uri: facultyInfo.imageUrl }}
                                    className='w-full h-24 rounded-xl'
                                    resizeMode='cover'
                                />
                            )}

                            <View className='mt-4'>
                                <Text className='!text-3xl !font-bold'>{facultyInfo.name}</Text>
                                <Text className='!text-gray-600 dark:!text-gray-300 mt-1'>
                                    {facultyInfo.followers_count} người theo dõi · {facultyInfo.document_count} tài liệu
                                </Text>
                            </View>

                            <TouchableOpacity 
                                onPress={handleToggleFollowFaculty}
                                disabled={isFacultyFollowLoading}
                                className={`mt-4 w-full rounded-xl py-3 items-center ${
                                    facultyInfo.isFollowingFaculty 
                                        ? 'bg-gray-200 dark:bg-gray-700' 
                                        : 'bg-primary-500'
                                }`}
                            >
                                {isFacultyFollowLoading ? (
                                    <Spinner size="sm" color={facultyInfo.isFollowingFaculty ? 'gray.700' : 'white'} />
                                ) : (
                                    <Text className={`!font-semibold ${
                                        facultyInfo.isFollowingFaculty 
                                            ? '!text-gray-700 dark:!text-gray-300' 
                                            : '!text-white'
                                    }`}>
                                        {facultyInfo.isFollowingFaculty ? 'Bỏ theo dõi' : 'Theo dõi'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {facultyInfo.subjects && facultyInfo.subjects.length > 0 ? (
                            facultyInfo.subjects.map((subject: Subject) => (
                                <View key={subject.id} className='mt-6'>
                                    <View className='flex-row items-center justify-between mb-3'>
                                        <Text className='!text-xl !font-bold'>{subject.name}</Text>
                                        <TouchableOpacity 
                                            onPress={() => handleToggleFollowSubject(subject.id, subject.isFollowing)}
                                            disabled={isSubjectFollowLoading}
                                        >
                                            {isSubjectFollowLoading ? (
                                                <Spinner size="sm" color="primary.500" />
                                            ) : (
                                                <Text className={`!font-semibold ${
                                                    subject.isFollowing 
                                                        ? '!text-gray-600 dark:!text-gray-400' 
                                                        : '!text-blue-500'
                                                }`}>
                                                    {subject.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {subject.documents && subject.documents.length > 0 ? (
                                        <View className='flex-row flex-wrap justify-between'>
                                            {subject.documents.map((doc: DocumentItem) => (
                                                <DocumentCard
                                                    key={doc.id}
                                                    id={doc.id}
                                                    title={doc.title}
                                                    downloadCount={doc.downloadCount}
                                                    uploadDate={doc.uploadDate}
                                                    subject={subject.name}
                                                    faculty={facultyInfo.name}
                                                    thumbnail={doc.thumbnail}
                                                    score={doc.score || 0}
                                                    type={doc.type}
                                                />
                                            ))}
                                        </View>
                                    ) : (
                                        <View className='py-8 items-center'>
                                            <Text className='!text-gray-500 dark:!text-gray-400'>
                                                Chưa có tài liệu nào
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            ))
                        ) : (
                            <View className='py-8 items-center'>
                                <Text className='!text-gray-500 dark:!text-gray-400'>
                                    Chưa có môn học nào
                                </Text>
                            </View>
                        )}
                    </>
                ) : (
                    <View className='py-8 items-center'>
                        <Text className='!text-gray-500 dark:!text-gray-400'>
                            Không tìm thấy thông tin khoa
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}


