import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Skeleton, Text, View } from 'native-base';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFetchUserProfile } from './api';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 px-4 border-b border-gray-200 dark:border-gray-700"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-4">
        <View className="w-10 h-10 items-center justify-center">
          <Ionicons name={icon} size={24} color="#333" />
        </View>
        <Text className="text-base font-medium" style={{ fontFamily: 'Gilroy-Medium' }}>
          {label}
        </Text>
      </View>
      <Ionicons name="chevron-forward-outline" size={20} color="#888" />
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const { data: userProfile, isLoading } = useFetchUserProfile();
  const avatar = require('@/assets/images/userAvatar1.png');

  console.log('User Profile:', userProfile);

  const handleLogout = async () => {
    await logout();
    router.replace(ROUTES.LOGIN);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:!bg-dark-900" edges={['top']}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back-outline" size={24} color="#888" />
        </TouchableOpacity>

        <Text
          className="!text-xl !font-bold !text-black dark:!text-white"
          style={{ fontFamily: 'Gilroy-Bold' }}
        >
          Hồ sơ
        </Text>

        <TouchableOpacity
          onPress={() => router.push(ROUTES.EDIT_PROFILE)}
          className="w-12 h-12 rounded-full bg-orange-50 !items-center !justify-center"
          activeOpacity={0.7}
        >
          <Ionicons name="create-outline" size={20} color="#FF9500" />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View className="items-center px-6 pt-6 pb-4">
            <Skeleton h="32" w="32" rounded="full" mb={4} />
            <Skeleton.Text lines={1} w="48" mb={2} />
            <Skeleton.Text lines={1} w="64" mb={6} />
            <View className="flex-row gap-8">
              <Skeleton h="16" w="20" />
              <Skeleton h="16" w="20" />
              <Skeleton h="16" w="20" />
            </View>
          </View>
        ) : userProfile ? (
          <View className="items-center px-6 pt-6 pb-4">
            <View className="w-32 h-32 rounded-full overflow-hidden mb-4">
              <Image
                source={userProfile.imageUrl ? { uri: userProfile.imageUrl } : avatar}
                width="100%"
                height="100%"
                alt="User Avatar"
                resizeMode="cover"
              />
            </View>

            <Text
              className="!text-2xl !font-bold !text-black dark:!text-white mb-2"
            >
              {userProfile.name}
            </Text>

            <Text
              className="!text-gray-500 mb-4"
            >
              {userProfile.email}
            </Text>

            <View className="flex-row gap-8">
              <View className="items-center">
                <Text
                  className="!text-lg text-gray-600 mb-1 !font-semibold"
                >
                  Người theo dõi
                </Text>
                <Text
                  className="!text-xl !font-bold !text-primary-500"
                >
                  {userProfile.numberFollowers}
                </Text>
              </View>

              <View className="items-center">
                <Text
                  className="!text-lg text-gray-600 mb-1 !font-semibold"
                >
                  Tài liệu tải lên
                </Text>
                <Text
                  className="!text-xl !font-bold !text-primary-500"
                >
                  {userProfile.documentCount}
                </Text>
              </View>

              <View className="items-center">
                <Text
                  className="!text-lg text-gray-600 mb-1 !font-semibold"
                >
                  Ngày tham gia
                </Text>
                <Text
                  className="!text-xl !font-bold !text-primary-500"
                >
                  {userProfile.participationDays}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="items-center px-6 pt-6 pb-4">
            <Text className="!text-gray-500">Không thể tải thông tin người dùng</Text>
          </View>
        )}

        <View className="pt-2 px-4">
          <View className="bg-white dark:bg-dark-800 rounded-2xl overflow-hidden">
            <MenuItem
              icon="person-outline"
              label="Trang cá nhân"
              onPress={() => {
                router.push(ROUTES.ME);
              }}
            />
            <MenuItem
              icon="heart-outline"
              label="Đã theo dõi"
              onPress={() => {
                router.push(ROUTES.FOLLOWING);
              }}
            />
            <MenuItem
              icon="download-outline"
              label="Tài liệu tải về"
              onPress={() => {
                // Handle navigation to downloaded documents
              }}
            />
            <MenuItem
              icon="mail-outline"
              label="Chatbot AI"
              onPress={() => {
                router.push(ROUTES.CHATBOT);
              }}
            />
          </View>
        </View>

        <View className="px-6 mt-6 mb-8">
          <TouchableOpacity
            onPress={handleLogout}
            className="w-full bg-gray-800 dark:bg-gray-700 rounded-2xl py-4 items-center justify-center"
            activeOpacity={0.8}
          >
            <Text
              className="!text-white !text-base !font-semibold"
              style={{ fontFamily: 'Gilroy-Semibold' }}
            >
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
