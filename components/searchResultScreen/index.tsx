import { FilterOptions } from '@/models/search.type';
import { getBackgroundById, getDate } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { Feather, Ionicons, Octicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, ScrollView, Text, View } from 'native-base';
import { useEffect, useState } from 'react';
import { Modal, TextInput, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetSuggestions } from '../searchScreen/api';
import { useFetchFacultiesAndSubjects, useFetchSearchResult } from './api';

export default function SearchResultScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ query?: string }>();
    const initialSearchQuery = typeof params.query === 'string' ? params.query : '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>();
    const [appliedFilters, setAppliedFilters] = useState<FilterOptions>();
    const { data: searchResult } = useFetchSearchResult(initialSearchQuery, appliedFilters);
    const { data: suggestions } = useGetSuggestions();
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { data: facultiesAndSubjects } = useFetchFacultiesAndSubjects();
    const { faculties, subjects } = facultiesAndSubjects || {};

    useEffect(() => {
        if (initialSearchQuery && initialSearchQuery.trim() !== '') {
            setShowSuggestions(false);
        }
    }, [initialSearchQuery]);

    const handleSearch = (query?: string) => {
        const searchTerm = query?.trim() || searchQuery.trim();

        if (searchTerm) {
            setShowSuggestions(false);

            console.log('query', searchTerm);

            router.push({
                pathname: '/(app)/search-result',
                params: { query: searchTerm },
            });
        }
    };

    return (
        <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
            <View
                style={{ marginTop: insets.top }}
                className="absolute top-0 left-0 right-0 z-10 px-3 py-2"
            >
                <View className='flex-row items-center justify-between gap-3'>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={30} className='!text-black dark:!text-white' />
                    </Pressable>
                    <View className="flex-row items-center flex-1 bg-gray-100 dark:bg-dark-800 h-12 px-3 rounded-2xl">
                        <TextInput
                            placeholder="Tìm kiếm tài liệu, môn học..."
                            autoCapitalize="none"
                            returnKeyType="search"
                            keyboardType="default"
                            className="flex-1 h-full text-base text-black dark:text-white font-[Gilroy-Regular] leading-5"
                            value={searchQuery}
                            onChangeText={(text) => {
                                setSearchQuery(text);
                                if (text.trim() !== '' && text.trim() !== initialSearchQuery.trim()) {
                                    setShowSuggestions(true);
                                } else {
                                    setShowSuggestions(false);
                                }
                            }}
                            onSubmitEditing={() => handleSearch(searchQuery)}
                        />
                        {searchQuery.length > 0 && (
                            <Pressable onPress={() => {
                                setSearchQuery('');
                                setShowSuggestions(false);
                            }}>
                                <Ionicons name="close" size={20} className='!text-black dark:!text-white' />
                            </Pressable>
                        )}
                    </View>
                    <Pressable onPress={() => {
                        setFilterOptions(appliedFilters);
                        setShowFilterModal(true);
                    }} className="relative">
                        <Octicons name="sliders" size={23} className='!text-black dark:!text-white' />
                        {Object.keys(appliedFilters || {}).length > 0 && (
                            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                    </Pressable>
                </View>
            </View>
            <ScrollView
                className="flex-1 px-2"
                style={{ marginTop: insets.top + 60 }}
                showsVerticalScrollIndicator={false}
            >
                {showSuggestions ? (
                    <View className='flex-col gap-6'>
                        {suggestions?.map((suggestion) => (
                            <View
                                key={suggestion.id}
                                onTouchStart={() => handleSearch(suggestion.title)}
                                style={{ paddingVertical: 3 }}
                            >
                                <View className='flex-row items-center justify-between gap-2'>
                                    <View className='flex-row items-center gap-3'>
                                        <Ionicons name="search" size={20} className='!text-gray-700 dark:!text-gray-300' />
                                        <Text className='!text-gray-700 dark:!text-gray-300'>{suggestion.title}</Text>
                                    </View>
                                    <Feather name="arrow-up-left" size={20} className='!text-gray-700 dark:!text-gray-300' />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className="flex-row flex-wrap justify-between mt-4 mb-4">
                        {searchResult && searchResult.length > 0 ? searchResult.map((item, index) => (
                            <View
                                onTouchStart={() => router.push(ROUTES.DOWNLOAD_DOC)}
                                key={index}
                                className="!rounded-2xl !p-0 !bg-gray-50 dark:!bg-dark-700 w-[48%] mb-4 border border-gray-200 dark:border-gray-700"
                            >
                                <Image
                                    source={getBackgroundById(item.id)}
                                    className="w-full h-24 rounded-t-xl"
                                    resizeMode="cover"
                                    alt="background"
                                />
                                <View className='p-3'>
                                    <View className='flex-row items-center justify-between mb-1 gap-2'>
                                        <Text
                                            className="!font-semibold flex-1"
                                            numberOfLines={1}
                                            ellipsizeMode="tail"
                                        >
                                            {item.title}
                                        </Text>

                                        <View className='bg-primary-500 !py-[2px] !px-[5px] !rounded-lg'>
                                            <Text className='!text-white !text-xs'>
                                                {item.fileKey.split('.').pop()}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className='flex-row items-center gap-2'>
                                        <Ionicons name="book-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                                        <Text className="!text-gray-500 dark:!text-gray-400">{item.subject?.name || 'Không xác định'}</Text>
                                    </View>
                                    <View className='flex-row items-center justify-between mt-1'>
                                        <View className='flex-row items-center gap-2'>
                                            <Ionicons name="calendar-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                                            <Text className="!text-gray-500 dark:!text-gray-400">{getDate(item.uploadDate)}</Text>
                                        </View>
                                        <View className='flex-row items-center gap-2'>
                                            <Ionicons name="download-outline" size={16} className='!text-gray-500 dark:!text-gray-400' />
                                            <Text className="!text-gray-500 dark:!text-gray-400">{item.downloadCount}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )) : (
                            <View className="w-full flex items-center justify-center py-8">
                                <Text className="text-gray-500 dark:text-gray-400">Không tìm thấy kết quả nào</Text>
                            </View>
                        )}
                    </View>
                )}


            </ScrollView>

            <Modal
                visible={showFilterModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowFilterModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-dark-800 rounded-t-3xl max-h-[80%] min-h-[50%]">
                        <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                            <Text className="!text-base !font-bold text-gray-800">Bộ lọc tìm kiếm</Text>
                            <View className="flex-row items-center gap-3">
                                {Object.keys(appliedFilters || {}).length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setAppliedFilters({});
                                            setFilterOptions({});
                                        }}
                                        className="p-2 rounded-lg bg-red-50"
                                    >
                                        <Text className="!text-sm !font-medium !text-red-600">Xóa tất cả</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                    <Ionicons name="close" size={24} className='!text-gray-600 dark:!text-gray-400' />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                            <View className="mb-6">
                                <Text className="!text-base !font-semibold mb-3">Sắp xếp theo</Text>
                                <View className="space-y-2 flex-row flex-wrap gap-3">
                                    {[
                                        { value: 'newest', label: 'Mới nhất' },
                                        { value: 'oldest', label: 'Cũ nhất' },
                                        { value: 'mostDownloaded', label: 'Tải nhiều nhất' }
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => setFilterOptions(prev => ({ ...prev, sortBy: prev?.sortBy === option.value ? undefined : option.value }))}
                                            className={`p-3 rounded-xl border ${filterOptions?.sortBy === option.value
                                                    ? 'bg-primary-50 border-primary-500'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <Text className={`!font-medium ${filterOptions?.sortBy === option.value
                                                    ? '!text-primary-500'
                                                    : '!text-gray-700'
                                                }`}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="!text-base !font-semibold mb-3">Loại tài liệu</Text>
                                <View className="space-y-2 flex-row flex-wrap gap-3">
                                    {[
                                        { value: 'all', label: 'Tất cả' },
                                        { value: 'pdf', label: 'PDF' },
                                        { value: 'doc', label: 'Word' },
                                        { value: 'ppt', label: 'PowerPoint' }
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => setFilterOptions(prev => ({ ...prev, fileType: prev?.fileType === option.value ? undefined : option.value }))}
                                            className={`p-3 rounded-xl border ${filterOptions?.fileType === option.value
                                                    ? 'bg-primary-50 border-primary-500'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <Text className={`!font-medium ${filterOptions?.fileType === option.value
                                                    ? '!text-primary-500'
                                                    : '!text-gray-700'
                                                }`}>
                                                {option.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="!text-base !font-semibold mb-3">Khoa</Text>
                                <View className="space-y-2 flex-row flex-wrap gap-3">
                                    {faculties?.map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            onPress={() => setFilterOptions(prev => ({ ...prev, faculty: prev?.faculty === option.name ? undefined : option.name }))}
                                            className={`p-3 rounded-xl border ${filterOptions?.faculty === option.name
                                                    ? 'bg-primary-50 border-primary-500'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <Text className={`!font-medium ${filterOptions?.faculty === option.name
                                                    ? '!text-primary-500'
                                                    : '!text-gray-700'
                                                }`}>
                                                {option.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="!text-base !font-semibold mb-3">Môn học</Text>
                                <View className="space-y-2 flex-row flex-wrap gap-3">
                                    {subjects?.map((option) => (
                                        <TouchableOpacity
                                            key={option.id}
                                            onPress={() => setFilterOptions(prev => ({ ...prev, subject: prev?.subject === option.name ? undefined : option.name }))}
                                            className={`p-3 rounded-xl border ${filterOptions?.subject === option.name
                                                    ? 'bg-primary-50 border-primary-500'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <Text className={`!font-medium ${filterOptions?.subject === option.name
                                                    ? '!text-primary-500'
                                                    : '!text-gray-700'
                                                }`}>
                                                {option.name}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        <View className="flex-row p-5 gap-3 border-t border-gray-200">
                            <TouchableOpacity
                                className="flex-1 p-4 rounded-xl border border-gray-300 items-center"
                                onPress={() => setShowFilterModal(false)}
                            >
                                <Text className="!text-base !font-medium !text-gray-600 dark:!text-white">Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className="flex-1 p-4 rounded-xl bg-primary-500 items-center"
                                onPress={() => {
                                    setAppliedFilters(filterOptions);
                                    console.log('Applied filters:', filterOptions);
                                    setShowFilterModal(false);
                                }}
                            >
                                <Text className="!text-base !font-semibold !text-white">Áp dụng</Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
        </View >
    );
}