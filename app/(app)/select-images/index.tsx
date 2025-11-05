import { getCoverImage, getSelectedImages, setCoverImage, setSelectedImages } from '@/utils/selectionStore';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text, View } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SelectImagesScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ single?: string }>();
  const singleMode = typeof params.single === 'string' && params.single === '1';
  const initial = singleMode ? (getCoverImage() ? [getCoverImage() as string] : []) : getSelectedImages();
  const [selected, setSelected] = useState<string[]>(() => [...initial]);
  const [libraryImages, setLibraryImages] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Cần quyền truy cập thư viện ảnh!');
        return;
      }

      const result = await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.photo,
        first: 100,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      setLibraryImages(result.assets.map((asset) => asset.uri ?? ''));
    })();
  }, []);

  const toggle = (uri: string) => {
    if (singleMode) {
      setSelected((prev) => (prev[0] === uri ? [] : [uri]));
      return;
    }
    setSelected((prev) => {
      const index = prev.indexOf(uri);
      if (index >= 0) return prev.filter((u) => u !== uri);
      return [...prev, uri];
    });
  };

  const remove = (uri: string) => {
    setSelected((prev) => prev.filter((u) => u !== uri));
  };

  const selectedCount = selected.length;

  return (
    <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
      <View style={{ marginTop: insets.top }} className="absolute top-0 left-0 right-0 z-10 px-3 py-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center">
            <Ionicons name="chevron-back" size={24} className="!text-gray-700 dark:!text-gray-300" />
          </TouchableOpacity>
          <Text className="!text-xl !font-semibold !text-black dark:!text-white">Thêm ảnh</Text>
          <View className="w-12" />
        </View>
      </View>

      <View className="flex-1 px-3" style={{ marginTop: insets.top + 60 }}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex-row flex-wrap justify-between">
            {libraryImages.map((uri, index) => {
              const isSelected = selected.includes(uri);
              const selectedIndex = isSelected ? selected.indexOf(uri) + 1 : 0;

              return (
                <Pressable
                  key={uri}
                  onPress={() => toggle(uri)}
                  className="w-[32%] aspect-square mb-2 rounded-lg overflow-hidden"
                >
                  <ExpoImage source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                  {isSelected && (
                    <View className="absolute top-1 right-1 w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                      <Text className="!text-white !text-xs !font-semibold">{selectedIndex}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {selected.length > 0 && (
            <View className="mt-4 mb-20">
              <Text className="!text-lg !font-semibold !text-black dark:!text-white mb-2">Ảnh đã chọn</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {selected.map((uri) => (
                  <View key={uri} className="mr-3 relative">
                    <ExpoImage source={{ uri }} style={{ width: 80, height: 80, borderRadius: 12 }} contentFit="cover" />
                    <TouchableOpacity
                      onPress={() => remove(uri)}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-black/50 rounded-full items-center justify-center"
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <View className="absolute left-0 right-0 flex-row gap-3 bg-white dark:bg-dark-900 px-3" style={{ bottom: 0, paddingBottom: insets.bottom + 8, paddingTop: 30 }}>
          <Button
            flex={1}
            className="!rounded-2xl !py-4"
            bg="gray.200"
            _pressed={{ bg: 'gray.300' }}
            onPress={() => router.back()}
          >
            <Text className="!text-gray-700 !font-semibold !text-lg">Huỷ</Text>
          </Button>
          <Button
            flex={1}
            className="!rounded-2xl !py-4"
            bg="primary.500"
            _disabled={{ bg: 'gray.300' }}
            isDisabled={selectedCount === 0}
            onPress={() => {
              if (singleMode) {
                setCoverImage(selected[0] ?? null);
              } else {
                setSelectedImages(selected);
              }
              router.back();
            }}
          >
            <Text className="!text-white !font-semibold !text-lg">Lưu ({selectedCount})</Text>
          </Button>
        </View>
      </View>
    </View>
  );
}


