import { getBackgroundById } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { router } from 'expo-router';
import { Text, View } from 'native-base';
import { Image, TouchableOpacity } from 'react-native';

export interface IFacultyCardProps {
    id: string;
    name: string;
    count: number;
    downloadUrl: string | null;
}

export default function FacultyCard(props: IFacultyCardProps) {
    const { id, name, count, downloadUrl } = props;
    return (
        <TouchableOpacity
            onPress={() => router.push({ pathname: ROUTES.FACULTY, params: { id: id.toString() } })}
            activeOpacity={0.7}
            className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
        >
            <Image
                source={downloadUrl ? { uri: downloadUrl } : getBackgroundById(id.toString())}
                className="w-full h-20 rounded-t-xl"
                resizeMode="cover"
            />
            <View className='p-3'>
            <Text className="!font-semibold line-clamp-1">{name}</Text>
                <Text className="!text-sm mt-1">
                    {count} tài liệu
                </Text>
            </View>
        </TouchableOpacity>
    );
}