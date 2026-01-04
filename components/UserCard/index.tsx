import { useUser } from '@/contexts/UserContext';
import { Features, logFeatureUsage, logFollowUser } from '@/services/analytics';
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
    const { currentUserId } = useUser();
    const toggleFollowMutation = useToggleFollowUser();
    const avatar = require('@/assets/images/userAvatar1.png');
    
    const isCurrentUser = currentUserId === id;

    const handleToggleFollow = (e: any) => {
        e.stopPropagation(); // Prevent navigation when clicking follow button
        
        toggleFollowMutation.mutate(id, {
            onSuccess: () => {
                // Log follow user analytics (only when following, not unfollowing)
                if (!isFollowing) {
                    logFollowUser(id);
                    logFeatureUsage(Features.FOLLOW_USER, 'complete');
                }
            },
            onError: () => {
                Alert.alert(
                    "Lỗi",
                    "Không thể thực hiện hành động này",
                    [{ text: "OK" }]
                );
            },
        });
    };

    const handlePress = () => {
        router.push({ pathname: ROUTES.USER_PROFILE, params: { id: id.toString() } });
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <View className="w-full flex flex-row items-center gap-4">
                <View className="w-[70px] h-[70px] rounded-full overflow-hidden">
                    <Image
                        source={image_key ? { uri: image_key } : avatar}
                        style={{ width: 70, height: 70 }}
                        resizeMode="cover"
                        alt="background"
                    />
                </View>
                <View>
                    <View className="flex-row items-center gap-2">
                        <Text className="!text-lg !font-semibold">{name}</Text>
                        {/* <Octicons name="verified" size={20} color="#42A5F5" /> */}
                        {!isCurrentUser && (
                            <>
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
                                            {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                    <Text className="!text-gray-500 dark:!text-gray-400">{followersCount} người theo dõi · Tải lên {documentsCount} tài liệu</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}