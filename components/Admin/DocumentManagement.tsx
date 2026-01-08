import { PendingDocument, useApproveDocument, useFetchPendingDocuments, useRejectDocument } from '@/components/Admin/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, Spinner, Text, View } from 'native-base';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput } from 'react-native';

export default function DocumentManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFetchPendingDocuments(searchQuery || undefined);

  const approveMutation = useApproveDocument();
  const rejectMutation = useRejectDocument();

  const documents = data?.pages.flatMap((page) => page.data) ?? [];

  const handleApprove = async (doc: PendingDocument) => {
    try {
      await approveMutation.mutateAsync(doc.id);
      Alert.alert('Thành công', 'Đã duyệt tài liệu');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể duyệt tài liệu');
    }
  };

  const handleReject = async (doc: PendingDocument) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn từ chối tài liệu này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              await rejectMutation.mutateAsync(doc.id);
              Alert.alert('Thành công', 'Đã từ chối tài liệu');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối tài liệu');
            }
          },
        },
      ]
    );
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-900">
      {/* Search Bar */}
      <View className="mx-6 mt-4 mb-4">
        <View
          style={{
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
              fontFamily: 'Inter-Regular',
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close" size={20} color="#6b7280" />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1 py-4"
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Document List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <Spinner size="lg" color="primary.500" />
          </View>
        ) : (
          <View className="px-6 pb-6">
            {documents.map((doc) => (
              <Pressable
                key={doc.id}
                onPress={() => router.push({ pathname: '/(app)/admin/document-management-detail' as any, params: { id: doc.id, downloadUrl: doc.downloadUrl } })}
                className="bg-white dark:bg-dark-800 rounded-2xl p-4 mb-4 flex-row items-start"
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Thumbnail */}
                <Image
                  source={doc.thumbnailUrl ? { uri: doc.thumbnailUrl } : require('@/assets/images/sampleDoc1.png')}
                  width={60}
                  height={75}
                  borderRadius={8}
                  alt="Document Thumbnail"
                  className="mr-4"
                  resizeMode="cover"
                />

                {/* Document Info */}
                <View className="flex-1">
                  <Text className="!text-base !font-bold mb-2 dark:!text-white" numberOfLines={2}>
                    {doc.title}
                  </Text>

                  <Text className="!text-sm !text-gray-600 dark:!text-gray-400 mb-1">
                    Khoa: {doc.faculties.length > 0 ? doc.faculties[0] : 'N/A'}
                    {doc.faculties.length > 1 && ` +${doc.faculties.length - 1} khoa khác`}
                  </Text>

                  <Text className="!text-sm !text-gray-600 dark:!text-gray-400 mb-1">
                    Môn học: {doc.subject}
                  </Text>

                  <Text className="!text-sm !text-gray-600 dark:!text-gray-400 mb-3">
                    Người tải lên: {doc.uploader.name}
                  </Text>

                  {/* Action Buttons */}
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => handleApprove(doc)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg py-2 items-center"
                    >
                      <Text className="!text-sm !font-medium !text-green-600 dark:!text-green-400">
                        Duyệt
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleReject(doc)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex-1 bg-red-50 dark:bg-red-900/20 rounded-lg py-2 items-center"
                    >
                      <Text className="!text-sm !font-medium !text-red-600 dark:!text-red-400">
                        Từ chối
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </Pressable>
            ))}

            {documents.length === 0 && !isLoading && (
              <View className="items-center justify-center py-20">
                <Text className="!text-gray-500 dark:!text-gray-400">
                  Không có tài liệu nào chờ duyệt
                </Text>
              </View>
            )}

            {isFetchingNextPage && (
              <View className="items-center justify-center py-4">
                <Spinner size="sm" color="primary.500" />
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

