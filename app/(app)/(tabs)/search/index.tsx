import { getBackgroundById } from '@/utils/functions';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { ScrollView, Text, View } from 'native-base';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchPage() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useFocusEffect(
    () => {
      setSearchQuery('');
      const timeout = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timeout);
    }
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(app)/search-result',
        params: { query: searchQuery },
      });
    }
  };

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
              ref={inputRef}
              placeholder="Tìm kiếm tài liệu, môn học..."
              autoCapitalize="none"
              returnKeyType="search"
              keyboardType="default"
              className="flex-1 h-full text-base text-black font-[Gilroy-Regular] leading-5"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
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
              onPress={handleSearch}
            >
              <View className='flex-row items-center justify-between gap-2'>
                <View className='flex-row items-center gap-3'>
                  <Ionicons name="search" size={20} className='!text-gray-700 dark:!text-gray-300' />
                  <Text className='!text-gray-700 dark:!text-gray-300'>Xác suất thống kê</Text>
                </View>
                <Feather name="arrow-up-left" size={20} className='!text-gray-700 dark:!text-gray-300' />
              </View>
            </Pressable>

            <Pressable onPress={handleSearch}>
              <View className='flex-row items-center justify-between gap-2'>
                <View className='flex-row items-center gap-3'>
                  <Ionicons name="search" size={20} className='!text-gray-700 dark:!text-gray-300' />
                  <Text className='!text-gray-700 dark:!text-gray-300'>Cấu trúc dữ liệu và giải thuật</Text>
                </View>
                <Feather name="arrow-up-left" size={20} className='!text-gray-700 dark:!text-gray-300' />
              </View>
            </Pressable>
          </View>
        ) : (
          <View>
            <Text className='!font-semibold'>Môn học gợi ý</Text>
            <View className="flex-row flex-wrap justify-between mt-2 mb-4">
              {[
                { id: 1, title: 'Toán cao cấp', count: 12 },
                { id: 2, title: 'Cơ sở dữ liệu', count: 8 },
                { id: 3, title: 'Mạng máy tính', count: 5 },
                { id: 4, title: 'Lập trình di động', count: 10 },
              ].map((item, index) => (
                <View
                  key={index}
                  className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-900 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                >
                  <Image
                    source={getBackgroundById(item.id)}
                    className="w-full h-20 rounded-t-xl"
                    resizeMode="cover"
                  />
                  <View className='p-3'>
                    <Text className="!font-semibold">{item.title}</Text>
                    <Text className="!text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.count} tài liệu
                    </Text>
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
