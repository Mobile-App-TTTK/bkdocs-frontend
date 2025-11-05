import { getBackgroundById } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { ScrollView, Text, View } from 'native-base';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetSuggestions, useGetSuggestionsKeyword } from './api';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { data: suggestions } = useGetSuggestions();
  const { data: suggestionsKeyword } = useGetSuggestionsKeyword(debouncedSearchQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 100);

    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useFocusEffect(
    () => {
      setSearchQuery('');
      setDebouncedSearchQuery('');
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timeout);
    }
  );

  const handleSearch = (query: string) => {    
    if (query?.trim()) {
      router.push({
        pathname: '/(app)/(tabs)/search/result',
        params: { query: query.trim() },
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
            <Ionicons name="chevron-back" size={30} className='!text-black dark:!text-white' />
          </Pressable>
          <View className="flex-row items-center flex-1 bg-gray-100 dark:bg-dark-800 h-12 px-3 rounded-2xl">
            <TextInput
              ref={inputRef}
              placeholder="Tìm kiếm tài liệu, môn học..."
              autoCapitalize="none"
              returnKeyType="search"
              keyboardType="default"
              className="flex-1 h-full text-base text-black dark:text-white font-[Gilroy-Regular] leading-5"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => handleSearch(searchQuery)}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => {
                setSearchQuery('');
                setDebouncedSearchQuery('');
              }}>
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
            {suggestionsKeyword?.map((suggestion, index) => (
              <View
                key={index}
                onTouchStart={() => handleSearch(suggestion)}
                style={{ paddingVertical: 3 }}
              >
                <View className='flex-row items-center justify-between gap-2'>
                  <View className='flex-row items-center gap-3'>
                    <Ionicons name="search" size={20} className='!text-gray-700 dark:!text-gray-300' />
                    <Text numberOfLines={1} ellipsizeMode="tail" className='!text-gray-700 dark:!text-gray-300'>{suggestion}</Text>
                  </View>
                  <Feather name="arrow-up-left" size={20} className='!text-gray-700 dark:!text-gray-300' />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View>
            <Text className='!font-semibold'>Môn học gợi ý</Text>
            <View className="flex-row flex-wrap justify-between mt-2 mb-4">
              {suggestions?.map((item, index) => (
                <View
                  onTouchStart={() => router.push(ROUTES.DOWNLOAD_DOC)}
                  key={index}
                  className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                >
                  <Image
                    source={getBackgroundById(item.id.toString())}
                    className="w-full h-20 rounded-t-xl"
                    resizeMode="cover"
                  />
                  <View className='p-3'>
                    <Text className="!font-semibold">{item.title}</Text>
                    <Text className="!text-sm mt-1">
                      {item.downloadCount} lượt tải xuống
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
