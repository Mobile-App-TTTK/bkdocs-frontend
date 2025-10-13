import { getBackgroundById } from '@/utils/functions';
import { Feather, Ionicons } from '@expo/vector-icons';
import classnames from 'classnames';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Button, Image, Pressable, ScrollView, Text, View } from 'native-base';
import { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchResultPage() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ query?: string }>();
  const [initialSearchQuery, setInitialSearchQuery] = useState(
    typeof params.query === 'string' ? params.query : '',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const groupedResults = [
    {
      id: 'all',
      title: "Tất cả"
    },
    {
      id: 'course',
      title: "Môn học"
    },
    {
      id: 'faculty',
      title: "Khoa"
    },
  ];
  const [selectedGroup, setSelectedGroup] = useState(groupedResults[0].id);

  useEffect(() => {
    if (typeof params.query === 'string') {
      setInitialSearchQuery(params.query);
    }
  }, [params.query]);

   useFocusEffect(
      () => {
        setSearchQuery('');
      }
    );

  return (
    <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
      <View
        style={{ marginTop: insets.top }}
        className="absolute top-0 left-0 right-0 z-10 px-3 py-2"
      >
        <View className='flex-row items-center justify-between gap-2'>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </Pressable>
          <View className="flex-row items-center flex-1 bg-gray-100 dark:bg-dark-800 h-10 px-3 rounded-2xl">
            <TextInput
              placeholder="Tìm kiếm tài liệu, môn học..."
              autoCapitalize="none"
              returnKeyType="search"
              keyboardType="default"
              className="flex-1 h-full text-base text-black font-[Gilroy-Regular] leading-5"
              value={searchQuery || initialSearchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                if (text === '') {
                  setInitialSearchQuery('');
                }
              }}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close" size={20} />
              </Pressable>
            )}
          </View>

        </View>
      </View>
      <ScrollView
        className="flex-1 px-2"
        style={{ marginTop: insets.top + 60 }}
        showsVerticalScrollIndicator={false}
      >
        {searchQuery ? (
          <View className='flex-col gap-6'>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/search-result',
                  params: { query: searchQuery },
                })
              }
            >
              <View className='flex-row items-center justify-between gap-2'>
                <View className='flex-row items-center gap-3'>
                  <Ionicons name="search" size={20} className='!text-gray-700 dark:!text-gray-300' />
                  <Text className='!text-gray-700 dark:!text-gray-300'>Xác suất thống kê</Text>
                </View>
                <Feather name="arrow-up-left" size={20} className='!text-gray-700 dark:!text-gray-300' />
              </View>
            </Pressable>

            <View className='flex-row items-center justify-between gap-2'>
              <View className='flex-row items-center gap-3'>
                <Ionicons name="search" size={20} className='!text-gray-700 dark:!text-gray-300' />
                <Text className='!text-gray-700 dark:!text-gray-300'>Cấu trúc dữ liệu và giải thuật</Text>
              </View>
              <Feather name="arrow-up-left" size={20} className='!text-gray-700 dark:!text-gray-300' />
            </View>
          </View>
        ) : (
          <View>
            <View className='flex-row gap-2 items-center'>
              {groupedResults.map((group) => (
                <Button
                  key={group.id}
                  variant={selectedGroup === group.id ? "subtle" : "ghost"}
                  borderRadius={20}
                  className='!px-4 !py-2'
                  onPress={() => setSelectedGroup(group.id)}
                >
                  <Text
                    className={classnames(
                      '!font-semibold',
                      selectedGroup === group.id ? '!text-primary-500' : '!text-gray-700'
                    )}
                  >
                    {group.title}
                  </Text>
                </Button>
              ))}
            </View>
            <View className="flex-row flex-wrap justify-between mt-4 mb-4">
              {[
                { id: 1, title: 'Slide chương 1', docType: 'pdf', courseName: 'Toán cao cấp', downloadCount: 120, uploadDate: '2023-10-01' },
                { id: 2, title: 'Cơ sở dữ liệu', docType: 'docx', courseName: 'Cơ sở dữ liệu', downloadCount: 80, uploadDate: '2023-09-15' },
                { id: 3, title: 'Mạng máy tính', docType: 'pptx', courseName: 'Mạng máy tính', downloadCount: 50, uploadDate: '2023-08-20' },
                { id: 4, title: 'Lập trình di động', docType: 'pdf', courseName: 'Lập trình di động', downloadCount: 100, uploadDate: '2023-07-10' },
              ].map((item, index) => (
                <View
                  key={index}
                  className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-900 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                >
                  <Image
                    source={getBackgroundById(item.id)}
                    className="w-full h-24 rounded-t-xl"
                    resizeMode="cover"
                    alt="background"
                  />
                  <View className='p-3'>
                    <View className='flex-row items-center justify-between mb-1'>
                      <Text className="!font-semibold">{item.title}</Text>
                      <View className='bg-primary-500 !px-2 !py-1 !rounded-lg'>
                        <Text className='!text-white !text-sm'>{item.docType}</Text>
                      </View>
                    </View>
                    <View className='flex-row items-center gap-2'>
                      <Ionicons name="book-outline" size={16} color={"gray.500"} />
                      <Text className="!text-gray-500 dark:!text-gray-400">{item.courseName}</Text>
                    </View>
                    <View className='flex-row items-center justify-between mt-1'>
                      <View className='flex-row items-center gap-2'>
                        <Ionicons name="calendar-outline" size={16} color={"gray.500"} />
                        <Text className="!text-gray-500 dark:!text-gray-400">{item.uploadDate}</Text>
                      </View>
                      <View className='flex-row items-center gap-2'>
                        <Ionicons name="download-outline" size={16} color={"gray.500"} />
                        <Text className="!text-gray-500 dark:!text-gray-400">{item.downloadCount}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
          
        )}
        

      </ScrollView>
    </View >
  );
}
