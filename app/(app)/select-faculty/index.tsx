import { useFetchFacultiesAndSubjects } from '@/components/searchResultScreen/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedFaculties } from '@/store/uploadSlice';
import { removeDiacritics } from '@/utils/functions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Skeleton, Text, View } from 'native-base';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectFacultyScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  
  // Get selected faculties from Redux
  const selectedFacultiesFromRedux = useAppSelector(state => state.upload.selectedFaculties);
  
  const { data: facultiesData, isLoading } = useFetchFacultiesAndSubjects();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    // Initialize from Redux state
    return selectedFacultiesFromRedux.reduce<Record<string, boolean>>((acc, cur) => {
      acc[cur] = true;
      return acc;
    }, {});
  });

  const faculties = useMemo(() => {
    return facultiesData?.faculties || [];
  }, [facultiesData]);

  const filtered = useMemo(
    () => faculties.filter((f: any) => removeDiacritics(f.name).toLowerCase().includes(removeDiacritics(query).trim().toLowerCase())),
    [query, faculties]
  );

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const toggle = (name: string) => {
    setSelected((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const allSelected = useMemo(() => faculties.every((f: any) => selected[f.name]), [selected, faculties]);
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const next: Record<string, boolean> = {};
      faculties.forEach((f: any) => (next[f.name] = true));
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


      <View className='flex-1' style={{ marginTop: insets.top + 60 }}>
        <View className='bg-gray-100 dark:bg-dark-800 rounded-xl px-3 py-2 mx-3'>
          <TextInput
            placeholder='Tìm kiếm khoa'
            placeholderTextColor={'#9CA3AF'}
            value={query}
            onChangeText={setQuery}
            className='text-black dark:text-white h-10 font-[Gilroy-Regular] leading-5'
          />
        </View>

        {isLoading ? (
          <View className='mt-4 px-3'>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} className='flex-row items-center py-5 border-b border-gray-200 dark:border-gray-700'>
                <Skeleton h="6" w="6" mr={4} rounded="md" />
                <Skeleton.Text lines={1} w="40" />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            className='mt-4 px-3'
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <Pressable onPress={() => toggle(item.name)} className='flex-row items-center py-5 border-b border-gray-200 dark:border-gray-700'>
                <View className='w-6 h-6 mr-4 rounded-md border-2 border-primary-500 items-center justify-center'>
                  {selected[item.name] && <View className='w-4 h-4 rounded-sm bg-primary-500' />}
                </View>
                <Text className='!text-lg !text-black dark:!text-white'>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className='py-8 items-center'>
                <Text className='!text-gray-500'>Không tìm thấy khoa nào</Text>
              </View>
            }
          />
        )}

        <View className='absolute left-3 right-3' style={{ bottom: insets.bottom + 12 }}>
          <Button
            className='!rounded-2xl !py-4'
            bg='primary.500'
            _disabled={{ bg: 'gray.300' }}
            isDisabled={selectedCount === 0}
            onPress={() => {
              const chosen = Object.keys(selected).filter((k) => selected[k]);
              // Save to Redux store
              dispatch(setSelectedFaculties(chosen));
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


