import { removeDiacritics } from '@/utils/functions';
import { setSelectedFaculties } from '@/utils/selectionStore';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text, View } from 'native-base';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FACULTIES = [
  'Khoa Máy tính',
  'Khoa Điện - Điện tử',
  'Khoa Kỹ thuật Hoá học',
  'Khoa Xây dựng',
  'Khoa Khoa học Ứng dụng',
  'Khoa Cơ khí',
  'Khoa Vật liệu',
];

export default function SelectFacultyScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ name?: string; faculties?: string }>();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    try {
      if (typeof params.faculties === 'string' && params.faculties) {
        const list = JSON.parse(params.faculties) as string[];
        return list.reduce<Record<string, boolean>>((acc, cur) => {
          acc[cur] = true;
          return acc;
        }, {});
      }
    } catch {}
    return {};
  });

  const filtered = useMemo(
    () => FACULTIES.filter((f) => removeDiacritics(f).toLowerCase().includes(removeDiacritics(query).trim().toLowerCase())),
    [query]
  );

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const toggle = (name: string) => {
    setSelected((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const allSelected = useMemo(() => FACULTIES.every((f) => selected[f]), [selected]);
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const next: Record<string, boolean> = {};
      FACULTIES.forEach((f) => (next[f] = true));
      setSelected(next);
    }
  };

  return (
    <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
      <View
        style={{ marginTop: insets.top }}
        className="absolute top-0 left-0 right-0 z-10 px-3 py-2"
        >
        <View className="flex-row items-center justify-between relative">
            <TouchableOpacity
            onPress={() => router.back()}
            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center"
            >
            <Ionicons name="chevron-back" size={24} className="!text-gray-700 dark:!text-gray-300" />
            </TouchableOpacity>
            <Text className="absolute left-1/2 -translate-x-1/2 !text-xl !font-semibold !text-black dark:!text-white">
            Chọn khoa
            </Text>

            <TouchableOpacity onPress={toggleSelectAll}>
            <Text className="!text-primary-500 !font-semibold">
                {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </Text>
            </TouchableOpacity>
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
              <View className='w-6 h-6 mr-4 rounded-md border-2 border-primary-500 items-center justify-center'>
                {selected[item] && <View className='w-4 h-4 rounded-sm bg-primary-500' />}
              </View>
              <Text className='!text-lg !text-black dark:!text-white'>{item}</Text>
            </Pressable>
          )}
        />

        <View className='absolute left-3 right-3' style={{ bottom: insets.bottom + 12 }}>
          <Button
            className='!rounded-2xl !py-4'
            bg='primary.500'
            _disabled={{ bg: 'gray.300' }}
            isDisabled={selectedCount === 0}
            onPress={() => {
              const chosen = Object.keys(selected).filter((k) => selected[k]);
              setSelectedFaculties(chosen);
              router.back();
            }}
          >
            <Text className='!text-white !font-semibold !text-lg'>Lưu (đã chọn {selectedCount})</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}


