import { useFetchFacultiesAndSubjects } from '@/components/searchResultScreen/api';
import { logUploadFunnelStep, UploadFunnel } from '@/services/analytics';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedSubjects } from '@/store/uploadSlice';
import { removeDiacritics } from '@/utils/functions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Button, Skeleton, Text, View } from 'native-base';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectSubjectScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const selectedSubjectsFromRedux = useAppSelector(state => state.upload.selectedSubjects);
  const hasLoggedSubjectStep = useRef(false);

  // Log upload funnel step when entering this screen
  useEffect(() => {
    if (!hasLoggedSubjectStep.current) {
      logUploadFunnelStep(UploadFunnel.SELECT_SUBJECT, true);
      hasLoggedSubjectStep.current = true;
    }
  }, []);
  
  const { data: facultiesData, isLoading } = useFetchFacultiesAndSubjects();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(() => selectedSubjectsFromRedux[0] ?? null);

  const subjects = useMemo(() => {
    return facultiesData?.subjects || [];
  }, [facultiesData]);

  const filtered = useMemo(
    () => subjects.filter((f: any) => removeDiacritics(f.name).toLowerCase().includes(removeDiacritics(query).trim().toLowerCase())),
    [query, subjects]
  );

  const toggle = (name: string) => setSelected((prev) => (prev === name ? null : name));

  return (
    <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
      <View style={{ marginTop: insets.top }} className="absolute top-0 left-0 right-0 z-10 px-3 py-2">
        <View className='flex-row items-center justify-between'>
          <TouchableOpacity onPress={() => router.back()} className='w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center'>
            <Ionicons name="chevron-back" size={24} className='!text-gray-700 dark:!text-gray-300' />
          </TouchableOpacity>
          <Text className='!text-xl !font-semibold !text-black dark:!text-white'>Chọn môn học</Text>
          <View className='w-12' />
        </View>
      </View>

      <View className='flex-1 px-3' style={{ marginTop: insets.top + 60 }}>
        <View className='bg-gray-100 dark:bg-dark-800 rounded-xl px-3 py-2'>
          <TextInput
            placeholder='Tìm kiếm môn học'
            placeholderTextColor={'#9CA3AF'}
            value={query}
            onChangeText={setQuery}
            className='text-black dark:text-white h-10 font-[Inter-Regular] leading-5'
          />
        </View>

        {isLoading ? (
          <View className='mt-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} className='flex-row items-center py-5 border-b border-gray-200 dark:border-gray-700'>
                <Skeleton h="6" w="6" mr={4} rounded="full" />
                <Skeleton.Text lines={1} w="40" />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            className='mt-4'
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => toggle(item.name)} className='flex-row items-center py-5 border-b border-gray-200 dark:border-gray-700'>
                <View className='w-6 h-6 mr-4 rounded-full border-2 border-primary-500 items-center justify-center'>
                  {selected === item.name && <View className='w-3.5 h-3.5 rounded-full bg-primary-500' />}
                </View>
                <Text className='!text-lg !text-black dark:!text-white'>{item.name}</Text>
              </Pressable>
            )}
            ListEmptyComponent={
              <View className='py-8 items-center'>
                <Text className='!text-gray-500'>Không tìm thấy môn học nào</Text>
              </View>
            }
          />
        )}

        <View className='absolute left-3 right-3' style={{ bottom: insets.bottom + 12 }}>
          <Button
            className='!rounded-2xl !py-4'
            bg='primary.500'
            onPress={() => {
              const chosen = selected ? [selected] : [];
              dispatch(setSelectedSubjects(chosen));
              router.back();
            }}
          >
            <Text className='!text-white !font-semibold !text-lg'>Lưu</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}


