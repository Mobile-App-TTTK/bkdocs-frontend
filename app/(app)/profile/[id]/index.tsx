import DocumentCard from '@/components/DocumentCard';
import { useFetchUserDocuments, useFetchUserProfileById } from '@/components/Profile/api';
import { useUser } from '@/contexts/UserContext';
import { getDate } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, Skeleton, Spinner, Text, View } from 'native-base';
import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() { 
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0] || '';
  const router = useRouter();
  const { currentUserId } = useUser();
  const avatar = require('@/assets/images/userAvatar1.png');

  const { data: userProfile, isLoading, error } = useFetchUserProfileById(id);
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchUserDocuments(id, 10);

  const documents = React.useMemo(() => {
    return documentsData?.pages.flat() || [];
  }, [documentsData]);

  const isCurrentUser = currentUserId === id;

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const getFileExtension = (fileType?: string) => {
    if (!fileType) return 'file';
    const lowerFileType = fileType.toLowerCase();
    if (lowerFileType.includes('pdf')) return 'pdf';
    if (lowerFileType.includes('word') || lowerFileType.includes('document')) return 'doc';
    if (lowerFileType.includes('powerpoint') || lowerFileType.includes('presentation')) return 'ppt';
    if (lowerFileType.includes('excel') || lowerFileType.includes('sheet')) return 'xls';
    return 'file';
  };

  const renderHeader = () => (
    <>
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
            className="!text-gray-500 mb-6"
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
      ) : null}
    </>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4 items-center">
        <Spinner size="sm" color="primary.500" />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoadingDocuments) return null;
    return (
      <View className="py-8 items-center">
        <Text className="!text-gray-500 dark:!text-gray-400">
          Chưa có tài liệu nào
        </Text>
      </View>
    );
  };

  if (error) {
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

          <View className="w-12" />
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="!text-lg !font-semibold !text-gray-700 dark:!text-gray-300 mt-4 mb-2">
            Không thể tải thông tin người dùng
          </Text>
          <Text className="!text-gray-500 dark:!text-gray-400 text-center">
            Vui lòng thử lại sau
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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

        {isCurrentUser ? (
          <TouchableOpacity
            onPress={() => router.push(ROUTES.EDIT_PROFILE)}
            className="w-12 h-12 rounded-full bg-orange-50 !items-center !justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={20} color="#FF9500" />
          </TouchableOpacity>
        ) : (
          <View className="w-12" />
        )}
      </View>

      <FlatList
        data={documents}
        numColumns={2}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <DocumentCard
            id={item.id}
            title={item.title}
            type={getFileExtension(item.fileType)}
            uploadDate={getDate(item.uploadDate)}
            downloadCount={item.downloadCount}
            thumbnail={item.thumbnailUrl}
            subject={item.subject}
            score={0}
          />
        )}
      />
    </SafeAreaView>
  );
}
