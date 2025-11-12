import { ROUTES } from '@/utils/routes';
import classNames from 'classnames';
import { router } from 'expo-router';
import { Spinner, Text, View } from 'native-base';
import { Alert, Image, TouchableOpacity } from 'react-native';
import { useToggleFollowUser } from './api';

export interface IUserCardProps {
    id: string;
    name: string;
    image_key: string;
    followersCount: number;
    documentsCount: number;
    isFollowing: boolean;
}
export default function UserCard(props: IUserCardProps) {
    const { id, name, image_key, followersCount, documentsCount, isFollowing } = props;
    const toggleFollowMutation = useToggleFollowUser();

    const handleToggleFollow = (e: any) => {
        e.stopPropagation(); // Prevent navigation when clicking follow button
        
        toggleFollowMutation.mutate(id, {
            onError: () => {
                Alert.alert(
                    "Lỗi",
                    "Không thể thực hiện hành động này",
                    [{ text: "OK" }]
                );
            },
        });
    };
    return (
        <TouchableOpacity
            onPress={() => router.push({ pathname: ROUTES.USER_PROFILE, params: { id: id.toString() } })}
            activeOpacity={0.7}
        >
            <View className="w-full flex flex-row items-center gap-4">
                <Image
                    source={image_key ? { uri: image_key } : { uri: "https://i.pinimg.com/1200x/24/bd/d9/24bdd9ec59a9f8966722063fe7791183.jpg" }}
                    width={70}
                    height={70}
                    borderRadius={100}
                    resizeMode="cover"
                    alt="background"
                />
                <View>
                    <View className="flex-row items-center gap-2">
                        <Text className="!text-lg !font-semibold">{name}</Text>
                        {/* <Octicons name="verified" size={20} color="#42A5F5" /> */}
                        <Text className="!text-lg !font-semibold">·</Text>
                        <TouchableOpacity 
                            onPress={handleToggleFollow}
                            disabled={toggleFollowMutation.isPending}
                        >
                            {toggleFollowMutation.isPending ? (
                                <Spinner size="sm" color="primary.500" />
                            ) : (
                                <Text className={classNames(
                                    "!font-bold",
                                    isFollowing 
                                        ? "!text-gray-600 dark:!text-gray-400" 
                                        : "!text-blue-500 dark:!text-blue-400"
                                )}>
                                    {isFollowing ? "Đang theo dõi" : "Theo dõi"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    <Text className="!text-gray-500 dark:!text-gray-400">{followersCount} người theo dõi · Tải lên {documentsCount} tài liệu</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}