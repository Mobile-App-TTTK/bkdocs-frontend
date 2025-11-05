import { useAuth } from '@/contexts/AuthContext';
import { getBackgroundById } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Text, View } from 'native-base';
import React from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const router = useRouter();
  const avatar = require('@/assets/images/userAvatar1.png');

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
        <View className="items-center px-6 pt-6 pb-4">
          <View className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <Image
              source={avatar}
              width="100%"
              height="100%"
              alt="User Avatar"
              resizeMode="cover"
            />
          </View>

          <Text
            className="!text-2xl !font-bold !text-black dark:!text-white mb-2"
          >
            Trần Thành Tài
          </Text>

          <Text
            className="!text-gray-500 mb-6"
          >
            tai.tranthanh@hcmut.edu.vn
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
                999
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
                238
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
                55
              </Text>
            </View>
          </View>
        </View>

        <View className="pt-2 px-4 mb-36 flex-row flex-wrap justify-between">
          {Array.from({ length: 10 }).map((_, index) => (

            <TouchableOpacity
              key={index}
              onPress={() => router.push(ROUTES.DOWNLOAD_DOC)}
              className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
            >
              <Image
                source={getBackgroundById(`${index}`)}
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
                    Tên tài liệu
                  </Text>

                  <View className='bg-primary-500 !py-[2px] !px-[5px] !rounded-lg'>
                    <Text className='!text-white !text-xs'>
                      pdf
                    </Text>
                  </View>
                </View>

                <View className='flex-row items-center gap-2'>
                  <Ionicons name="book-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                  <Text className="!text-gray-500 dark:!text-gray-400">Giải tích 1</Text>
                </View>
                <View className='flex-row items-center justify-between mt-1'>
                  <View className='flex-row items-center gap-2'>
                    <Ionicons name="calendar-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                    <Text className="!text-gray-500 dark:!text-gray-400">2025-01-01</Text>
                  </View>
                  <View className='flex-row items-center gap-2'>
                    <Ionicons name="download-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                    <Text className="!text-gray-500 dark:!text-gray-400">100</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
