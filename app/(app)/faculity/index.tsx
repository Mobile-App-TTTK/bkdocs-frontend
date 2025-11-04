import { getBackgroundById, getDate } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'native-base';
import { Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DocCard = {
    id: string;
    title: string;
    subject?: string;
    uploadDate: string;
    downloadCount: number;
    fileKey: string; // e.g. "abc.pdf"
};

const mockDocs: DocCard[] = [
    {
        id: '1',
        title: 'Tên tài liệu',
        subject: 'Tên môn học',
        uploadDate: '2025-05-21',
        downloadCount: 1234,
        fileKey: 'file.pdf',
    },
    {
        id: '2',
        title: 'Tên tài liệu',
        subject: 'Tên môn học',
        uploadDate: '2025-04-10',
        downloadCount: 1234,
        fileKey: 'slide.pdf',
    },
];

export default function FacultyScreen() {
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
            <View
                style={{ marginTop: insets.top }}
                className="absolute top-0 left-0 right-0 z-10 px-3 py-2"
            >
                <View className='flex-row items-center gap-3'>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={30} className='!text-black dark:!text-white' />
                    </TouchableOpacity>
                    <Text className='!text-xl !font-semibold'>Khoa máy tính</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-2"
                style={{ marginTop: insets.top + 60 }}
                showsVerticalScrollIndicator={false}
            >
                <View className='mt-2'>
                    <Image
                        source={{
                            uri: 'https://elearning-cse.hcmut.edu.vn/pluginfile.php/1/core_admin/logo/0x150/1732503933/logo%20e-learning.png',
                        }}
                        className='w-full h-24 rounded-xl'
                        resizeMode='contain'
                    />

                    <View className='mt-4'>
                        <Text className='!text-3xl !font-bold'>Khoa Máy Tính</Text>
                        <Text className='!text-gray-600 dark:!text-gray-300 mt-1'>235 người theo dõi · 4123 tài liệu</Text>
                    </View>

                    <TouchableOpacity className='mt-4 w-full bg-primary-500 rounded-xl py-3 items-center'>
                        <Text className='!text-white !font-semibold'>Theo dõi</Text>
                    </TouchableOpacity>
                </View>

                <View className='mt-6'>
                    <View className='flex-row items-center justify-between mb-3'>
                        <Text className='!text-xl !font-bold'>Mô hình hoá toán học</Text>
                        <Text className='!text-blue-500 !font-semibold'>Theo dõi</Text>
                    </View>

                    <View className='flex-row flex-wrap justify-between'>
                        {mockDocs.map((item) => (
                            <View
                                key={`mh-${item.id}`}
                                className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                            >
                                <TouchableOpacity key={`mh-${item.id}`} onPress={() => router.push(ROUTES.DOWNLOAD_DOC)}>
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
                                        <View className='flex-row items-center gap-2'>
                                            <Ionicons name="book-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                                            <Text className="!text-gray-500 dark:!text-gray-400">{item.subject}</Text>
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

                <View className='mt-2 mb-6'>
                    <View className='flex-row items-center justify-between mb-3'>
                        <Text className='!text-xl !font-bold'>Kỹ thuật lập trình</Text>
                        <Text className='!text-blue-500 !font-semibold'>Đang theo dõi</Text>
                    </View>

                    <View className='flex-row flex-wrap justify-between'>
                        {mockDocs.map((item) => (
                            <View
                                key={`kt-${item.id}`}
                                className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                            >
                                <TouchableOpacity key={`kt-${item.id}`} onPress={() => router.push(ROUTES.DOWNLOAD_DOC)}>
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
                                        <View className='flex-row items-center gap-2'>
                                            <Ionicons name="book-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                                            <Text className="!text-gray-500 dark:!text-gray-400">{item.subject}</Text>
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
            </ScrollView>
        </View>
    );
}


