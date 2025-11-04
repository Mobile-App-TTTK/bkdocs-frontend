import { removeDiacritics } from '@/utils/functions';
import { getSelectedLists, setSelectedLists } from '@/utils/selectionStore';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Text, View } from 'native-base';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LISTS = [
  'Slide bài giảng',
  'Giáo trình môn học',
  'Bài tập rèn luyện',
  'Quizz',
  'Đề thi giữa kỳ',
  'Đề thi cuối kỳ',
];

export default function SelectListScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const initial = getSelectedLists();
  const [selected, setSelected] = useState<string | null>(() => initial[0] ?? null);

  const filtered = useMemo(
    () => LISTS.filter((f) => removeDiacritics(f).toLowerCase().includes(removeDiacritics(query).trim().toLowerCase())),
    [query]
  );

  const selectedCount = useMemo(() => (selected ? 1 : 0), [selected]);

  const toggle = (name: string) => setSelected((prev) => (prev === name ? null : name));

  return (
    <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
      <View style={{ marginTop: insets.top }} className="absolute top-0 left-0 right-0 z-10 px-3 py-2">
        <View className='flex-row items-center justify-between relative'>
          <TouchableOpacity onPress={() => router.back()} className='w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center'>
            <Ionicons name="chevron-back" size={24} className='!text-gray-700 dark:!text-gray-300' />
          </TouchableOpacity>
          <Text className='absolute left-1/2 -translate-x-1/2 !text-xl !font-semibold !text-black dark:!text-white'>Chọn danh sách</Text>
          <View className='w-20' />
        </View>
      </View>

      <View className='flex-1 px-3' style={{ marginTop: insets.top + 60 }}>
        <View className='bg-gray-100 dark:bg-dark-800 rounded-xl px-3 py-2'>
          <TextInput
            placeholder='Tìm kiếm khoa'
            placeholderTextColor={'#9CA3AF'}
            value={query}
            onChangeText={setQuery}
            className='text-black dark:text-white h-10 font-[Gilroy-Regular] leading-5'
          />
        </View>

        <FlatList
          className='mt-4'
          data={filtered}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Pressable onPress={() => toggle(item)} className='flex-row items-center py-5 border-b border-gray-200 dark:border-gray-700'>
              <View className='w-6 h-6 mr-4 rounded-full border-2 border-primary-500 items-center justify-center'>
                {selected === item && <View className='w-3.5 h-3.5 rounded-full bg-primary-500' />}
              </View>
              <Text className='!text-lg !text-black dark:!text-white'>{item}</Text>
            </Pressable>
          )}
        />

        <View className='absolute left-3 right-3' style={{ bottom: insets.bottom + 12 }}>
          <Button className='!rounded-2xl !py-4' bg='primary.500' isDisabled={!selected} _disabled={{ bg: 'gray.300' }} onPress={() => {
            const chosen = selected ? [selected] : [];
            setSelectedLists(chosen);
            router.back();
          }}>
            <Text className='!text-white !font-semibold !text-lg'>Lưu</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}


