import { useFetchUserDocuments, useFetchUserProfile } from '@/components/Profile/api';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Skeleton, Spinner, Text, View } from 'native-base';
import React from 'react';
import { FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentCard from '../DocumentCard';

export default function MeScreen() {
  const router = useRouter();
  const { data: userProfile, isLoading } = useFetchUserProfile();
  const {
    data: documentsData,
    isLoading: isLoadingDocuments,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchUserDocuments(userProfile?.id || '', 10);
  
  const avatar = require('@/assets/images/userAvatar1.png');

  console.log("documentsData: ", documentsData?.pages);

  const documents = React.useMemo(() => {
    return documentsData?.pages.flat() || [];
  }, [documentsData]);

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
    </>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className="py-4">
        <Spinner color="primary.500" />
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (isLoadingDocuments) {
      return (
        <View className="flex-row flex-wrap justify-between px-4">
          {[1, 2, 3, 4].map((item) => (
            <View key={item} className="w-[48%] mb-4">
              <Skeleton h="24" rounded="xl" mb={2} />
              <Skeleton.Text lines={2} />
            </View>
          ))}
        </View>
      );
    }
    return (
      <View className="items-center py-8 px-4">
        <Text className="!text-gray-500">Chưa có tài liệu nào</Text>
      </View>
    );
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
        renderItem={({ item, index }) => (
          <DocumentCard
            key={item.id}
            id={item.id}
            title={item.title}
            type={getFileExtension(item.fileType)}
            uploadDate={item.uploadDate}
            downloadCount={item.downloadCount}
            thumbnail={item.thumbnailUrl || ''}
            subject={item.subject}
            score={item.overallRating || 0}
          />
        )}
      />
    </SafeAreaView>
  );
}
