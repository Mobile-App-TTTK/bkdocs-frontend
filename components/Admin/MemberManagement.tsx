import { AdminUser, useBanUser, useFetchAdminUsers, useUnbanUser } from '@/components/Admin/api';
import { Ionicons } from '@expo/vector-icons';
import { Image, Spinner, Text, View } from 'native-base';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput } from 'react-native';

export default function MemberManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const { data: users = [], isLoading } = useFetchAdminUsers();
    const banUserMutation = useBanUser();
    const unbanUserMutation = useUnbanUser();

    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBan = (user: AdminUser) => {
        Alert.alert(
            'Xác nhận',
            `Bạn có chắc chắn muốn cấm tài khoản "${user.name}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Cấm',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await banUserMutation.mutateAsync(user.id);
                            Alert.alert('Thành công', 'Đã cấm tài khoản');
                        } catch (error) {
                            Alert.alert('Lỗi', 'Không thể cấm tài khoản');
                        }
                    },
                },
            ]
        );
    };

    const handleUnban = async (user: AdminUser) => {
        try {
            await unbanUserMutation.mutateAsync(user.id);
            Alert.alert('Thành công', 'Đã bỏ cấm tài khoản');
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể bỏ cấm tài khoản');
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-dark-900">
            {/* Search Bar */}
            <View className="mx-6 mt-4 mb-4">
                <View style={{
                    height: 48,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#d1d5db',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 12,
                }}
                >
                    <Ionicons name="search-outline" size={20} color="#6b7280" style={{ marginRight: 8 }} />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Tìm kiếm tài liệu, người dùng,..."
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        keyboardType="default"
                        returnKeyType="search"
                        style={{
                            flex: 1,
                            fontSize: 16,
                            color: '#000000',
                            fontFamily: 'Gilroy-Regular'
                        }}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                            <Ionicons name="close" size={20} color="#6b7280" />
                        </Pressable>
                    )}
                </View>
            </View>


            <ScrollView className="flex-1 py-4" showsVerticalScrollIndicator={false}>

                {/* User List */}
                {isLoading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <Spinner size="lg" color="primary.500" />
                    </View>
                ) : (
                    <View className="px-6 pb-6">
                        {filteredUsers.map((user) => (
                            <View
                                key={user.id}
                                className={`rounded-2xl p-4 mb-4 flex-row items-center ${
                                    user.isBanned 
                                        ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800' 
                                        : 'bg-white dark:bg-dark-800'
                                }`}
                                style={{
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.1,
                                    shadowRadius: 8,
                                    elevation: 3,
                                }}
                            >
                                {/* Avatar */}
                                <View className="relative mr-4">
                                    <Image
                                        source={require('@/assets/images/userAvatar1.png')}
                                        width={60}
                                        height={60}
                                        borderRadius={30}
                                        alt="User Avatar"
                                        style={{ opacity: user.isBanned ? 0.5 : 1 }}
                                    />
                                    {user.isBanned && (
                                        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5 items-center justify-center">
                                            <Ionicons name="ban" size={12} color="#fff" />
                                        </View>
                                    )}
                                </View>

                                {/* User Info */}
                                <View className="flex-1">
                                    <View className="flex-row items-center gap-2 mb-1">
                                        <Text className="!text-lg !font-bold dark:!text-white">{user.name}</Text>
                                        {user.isBanned && (
                                            <View className="bg-red-500 px-2 py-0.5 rounded-full">
                                                <Text className="!text-xs !font-medium !text-white">Đã cấm</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text className="!text-sm !text-gray-500 dark:!text-gray-400 mb-2">
                                        {user.followerCount} người theo dõi. Đã tải lên {user.uploadedDocumentsCount} tài liệu
                                    </Text>

                                    {/* Action Buttons */}
                                    {user.isBanned ? (
                                        <Pressable
                                            onPress={() => handleUnban(user)}
                                            disabled={unbanUserMutation.isPending}
                                            className="bg-blue-50 dark:bg-blue-900/20 rounded-lg py-2 px-3 items-center"
                                        >
                                            <Text className="!text-sm !font-medium !text-blue-600 dark:!text-blue-400">
                                                Bỏ cấm tài khoản
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            onPress={() => handleBan(user)}
                                            disabled={banUserMutation.isPending}
                                            className="bg-red-50 dark:bg-red-900/20 rounded-lg py-2 px-3 items-center"
                                        >
                                            <Text className="!text-sm !font-medium !text-red-600 dark:!text-red-400">
                                                Cấm tài khoản
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        ))}

                        {filteredUsers.length === 0 && !isLoading && (
                            <View className="items-center justify-center py-20">
                                <Text className="!text-gray-500 dark:!text-gray-400">
                                    Không tìm thấy người dùng nào
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

