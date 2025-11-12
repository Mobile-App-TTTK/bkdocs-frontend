import { getBackgroundById, getDate } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, View } from 'native-base';
import { Image, TouchableOpacity } from 'react-native';

export interface IDocumentCardProps {
    id: string;
    title: string;
    downloadCount: number;
    uploadDate: string;
    subject?: string;
    faculty?: string;
    thumbnail: string;
    score: number;
    type: string;
}

export default function DocumentCard(props: IDocumentCardProps) {
    const { id, title, downloadCount, uploadDate, subject, thumbnail, type, score } = props;

    return (
        <TouchableOpacity
            onPress={() => router.push(ROUTES.DOWNLOAD_DOC)}
            activeOpacity={0.7}
            className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
        >
            <Image
                source={thumbnail ? { uri: thumbnail } : getBackgroundById(id)}
                className="w-full h-24 rounded-t-xl"
                resizeMode="cover"
                alt="background"
            />
            <View className='p-3'>
                <View className='flex-row items-center justify-between mb-1 gap-2'>
                    <Text
                        className="!font-semibold flex-1"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {title}
                    </Text>

                    <View className='bg-primary-500 !py-[2px] !px-[5px] !rounded-lg'>
                        <Text className='!text-white !text-xs'>
                            {type}
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center justify-between w-full">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="book-outline" size={16} className="!text-gray-500 dark:!text-gray-400" />
                        <Text className="!text-gray-500 dark:!text-gray-400" numberOfLines={1} ellipsizeMode="tail">{subject || 'Không xác định'}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="star" size={16} className="!text-yellow-500" />
                        <Text className="!text-gray-500 dark:!text-gray-400">{score || 0}</Text>
                    </View>
                    </View>
                <View className='flex-row items-center justify-between mt-1'>
                    <View className='flex-row items-center gap-2'>
                        <Ionicons name="calendar-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                        <Text className="!text-gray-500 dark:!text-gray-400">{getDate(uploadDate)}</Text>
                    </View>
                    <View className='flex-row items-center gap-2'>
                        <Ionicons name="download-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                        <Text className="!text-gray-500 dark:!text-gray-400">{downloadCount}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}