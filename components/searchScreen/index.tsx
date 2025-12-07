import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { ScrollView, Skeleton, Text, View } from 'native-base';
import { useEffect, useRef, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SubjectCard from '../SubjectCard';
import { useGetSuggestions, useGetSuggestionsKeyword } from './api';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const inputRef = useRef<TextInput>(null);
  const { data: suggestions, isLoading: isLoadingSuggestions } = useGetSuggestions();
  const { data: suggestionsKeyword } = useGetSuggestionsKeyword(debouncedSearchQuery);

  console.log("suggestions: ", suggestions);

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
      }, 500);
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
            {(Array.isArray(suggestionsKeyword) ? suggestionsKeyword : []).map((suggestion, index) => (
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

              {isLoadingSuggestions ? (
                Array.from({ length: 4 }).map((_, index: number) => (
                  <View key={index} className='w-[48%] mb-4'>
                    <Skeleton h="32" rounded="xl" />
                  </View>
                ))
              ) : (Array.isArray(suggestions) ? suggestions : []).map((item, index) => (
                <SubjectCard
                  key={index}
                  id={item.id}
                  name={item.name}
                  count={item.count}
                  downloadUrl={item.downloadUrl}
                />
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </View >
  );
}
