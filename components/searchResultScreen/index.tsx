import { FilterOptions } from '@/models/search.type';
import { SearchFileType, SearchSortOption } from '@/utils/constants';
import { Feather, Ionicons, Octicons } from '@expo/vector-icons';
import classNames from 'classnames';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, Skeleton, Text, View } from 'native-base';
import { useEffect, useState } from 'react';
import { Modal, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentCard from '../DocumentCard';
import FacultyCard from '../FacultyCard';
import { useGetSuggestionsKeyword } from '../searchScreen/api';
import { filterOptionsList } from '../searchScreen/utils/constants';
import SubjectCard from '../SubjectCard';
import UserCard from '../UserCard';
import { useFetchFacultiesAndSubjects, useFetchSearchResult } from './api';

export default function SearchResultScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ query?: string }>();
    const initialSearchQuery = typeof params.query === 'string' ? params.query : '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>();
    const [appliedFilters, setAppliedFilters] = useState<FilterOptions>();
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const { data: searchResult, isFetching: isFetchingSearchResult } = useFetchSearchResult(initialSearchQuery, appliedFilters);
    const { documents, users, subjects, faculties: searchFaculties } = searchResult || {};
    const [showSuggestions, setShowSuggestions] = useState(false);
    const { data: facultiesAndSubjects } = useFetchFacultiesAndSubjects();
    const { faculties } = facultiesAndSubjects || {};
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    const { data: suggestionsKeyword } = useGetSuggestionsKeyword(debouncedSearchQuery);

    console.log("searchResult: ", searchResult);

    useEffect(() => {
        const timeout = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery.trim());
        }, 100);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    useEffect(() => {
        if (initialSearchQuery && initialSearchQuery.trim() !== '') {
            setShowSuggestions(false);
        }
    }, [initialSearchQuery]);

    const handleSearch = (query: string) => {
        const searchTerm = query?.trim();

        if (searchTerm) {
            setShowSuggestions(false);

            router.push({
                pathname: '/(app)/(tabs)/search/result',
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
                                setDebouncedSearchQuery('');
                                setShowSuggestions(false);
                            }}>
                                <Ionicons name="close" size={20} className='!text-black dark:!text-white' />
                            </Pressable>
                        )}
                    </View>
                    <Pressable 
                        onPress={() => {
                            setFilterOptions(appliedFilters);
                            setShowFilterModal(true);
                        }} 
                        className="relative pl-2 pr-2 py-2"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Octicons name="sliders" size={24} className='!text-black dark:!text-white' />
                        {Object.keys(appliedFilters || {}).length > 0 && (
                            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                        )}
                    </Pressable>
                </View>

                <View className={classNames("flex-row items-center gap-2 py-4", showSuggestions ? 'hidden' : 'block')}>
                    {filterOptionsList.map((option) => (
                        <TouchableOpacity 
                            key={option.value} onPress={() => setSelectedFilter(option.value)} 
                            className={classNames(
                                "p-3 rounded-xl border border-gray-200 dark:border-gray-700", selectedFilter === option.value ? 'bg-primary-50 border-primary-500' : '')}
                        >
                            <Text className={classNames("!text-md !font-medium text-center px-2", selectedFilter === option.value ? '!text-primary-500' : '!text-gray-700 dark:!text-gray-300')}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
            <ScrollView
                className="flex-1 px-2"
                style={{ marginTop: insets.top + (showSuggestions ? 60 : 110) }}
                showsVerticalScrollIndicator={false}
            >
                {showSuggestions ? (
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
                                        <Text className='!text-gray-700 dark:!text-gray-300'>{suggestion}</Text>
                                    </View>
                                    <Feather name="arrow-up-left" size={20} className='!text-gray-700 dark:!text-gray-300' />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View className='pb-20'>
                        { (selectedFilter === 'all' ? (Array.isArray(users) && users?.length > 0) : selectedFilter === 'user') && (
                            <View className='pt-4'>
                                <Text className="!text-lg !font-semibold">Người dùng</Text>
                                {isFetchingSearchResult ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4 gap-6">
                                        {Array.from({ length: 4 }).map((_, index: number) => (
                                            <View key={index} className='w-full flex flex-row items-center gap-3'>
                                                <Skeleton h="16" w="16" rounded="full" />
                                                <View className='flex-1'>
                                                    <Skeleton.Text px="4" lines={2} />
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                ) : Array.isArray(users) && users?.length > 0 ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4 gap-6">
                                        {users.map((user, index) => (
                                            <UserCard
                                                key={index}
                                                id={user.id}
                                                name={user.name}
                                                image_key={user.image_url}
                                                followersCount={user.followersCount}
                                                documentsCount={user.documentsCount}
                                                isFollowing={user.isFollowing}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <View className="w-full flex items-center justify-center py-4">
                                        <Text className="text-gray-500 dark:text-gray-400">Không tìm thấy người dùng</Text>
                                    </View>
                                )}
                            </View>
                        ) }
                        { (selectedFilter === 'all' ? (Array.isArray(documents) && documents?.length > 0) : selectedFilter === 'document') && (
                            <View className='pt-4'>
                                <Text className="!text-lg !font-semibold">Tài liệu</Text>
                                {isFetchingSearchResult ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4">
                                        {Array.from({ length: 4 }).map((_, index: number) => (
                                            <View key={index} className='w-[48%] mb-4'>
                                                <Skeleton h="24" w="100%" rounded="xl" />
                                                <Skeleton.Text px="3" lines={2} mt="2" />
                                            </View>
                                        ))}
                                    </View>
                                ) : Array.isArray(documents) && documents?.length > 0 ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4">
                                        {documents.map((item, index) => (
                                            <DocumentCard
                                                key={index}
                                                id={item.id}
                                                title={item.title}
                                                downloadCount={item.downloadCount}
                                                uploadDate={item.uploadDate}
                                                subject={item.subject?.name}
                                                faculty={item.faculty?.name}
                                                thumbnail={item.thumbnail}
                                                score={item.score}
                                                type={item.type}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <View className="w-full flex items-center justify-center py-4">
                                        <Text className="text-gray-500 dark:text-gray-400">Không tìm thấy tài liệu</Text>
                                    </View>
                                )}
                            </View> 
                        )}
                        { (selectedFilter === 'all' ? (Array.isArray(searchFaculties) && searchFaculties?.length > 0) : selectedFilter === 'faculty') && (
                            <View className='pt-4'>
                                <Text className="!text-lg !font-semibold">Khoa</Text>
                                {isFetchingSearchResult ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4">
                                        {Array.from({ length: 4 }).map((_, index: number) => (
                                            <View key={index} className='w-[48%] mb-4'>
                                                <Skeleton h="24" w="100%" rounded="xl" />
                                                <Skeleton.Text px="3" lines={1} mt="2" />
                                            </View>
                                        ))}
                                    </View>
                                ) : Array.isArray(searchFaculties) && searchFaculties?.length > 0 ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4">
                                        {searchFaculties.map((item, index) => (
                                            <FacultyCard
                                                key={index}
                                                id={item.id}
                                                name={item.name}
                                                count={item.count}
                                                downloadUrl={item.image_url}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <View className="w-full flex items-center justify-center py-4">
                                        <Text className="text-gray-500 dark:text-gray-400">Không tìm thấy khoa</Text>
                                    </View>
                                )}
                            </View> 
                        )}

                        { (selectedFilter === 'all' ? (Array.isArray(subjects) && subjects?.length > 0) : selectedFilter === 'subject') && (
                            <View className='pt-4'>
                                <Text className="!text-lg !font-semibold">Môn học</Text>
                                {isFetchingSearchResult ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4">
                                        {Array.from({ length: 4 }).map((_, index: number) => (
                                            <View key={index} className='w-[48%] mb-4'>
                                                <Skeleton h="24" w="100%" rounded="xl" />
                                                <Skeleton.Text px="3" lines={1} mt="2" />
                                            </View>
                                        ))}
                                    </View>
                                ) : Array.isArray(subjects) && subjects?.length > 0 ? (
                                    <View className="flex-row flex-wrap justify-between mt-4 mb-4">
                                        {subjects.map((item, index) => (
                                            <SubjectCard
                                                key={index}
                                                id={item.id}
                                                name={item.name}
                                                count={item.count}
                                                downloadUrl={item.image_url}
                                            />
                                        ))}
                                    </View>
                                ) : (
                                    <View className="w-full flex items-center justify-center py-4">
                                        <Text className="text-gray-500 dark:text-gray-400">Không tìm thấy môn học</Text>
                                    </View>
                                )}
                            </View> 
                        )}
                        
                        {(!Array.isArray(users) || users?.length === 0) && (!Array.isArray(documents) || documents?.length === 0) && (!Array.isArray(searchFaculties) || searchFaculties?.length === 0) && (!Array.isArray(subjects) || subjects?.length === 0) && !isFetchingSearchResult && (
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
                <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
                    <View className="flex-1 bg-black/50 justify-end">
                        <TouchableWithoutFeedback onPress={() => {}}>
                            <View className="bg-white dark:bg-dark-800 rounded-t-3xl max-h-[80%] min-h-[50%]">
                        <View className="flex-row justify-between items-center p-5 border-b border-gray-200">
                            <Text className="!text-base !font-bold text-gray-800">Bộ lọc tìm kiếm</Text>
                            <View className="flex-row items-center gap-3">
                                {Object.keys(filterOptions || {}).length > 0 && (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setFilterOptions({});
                                        }}
                                        className="p-2 rounded-lg bg-red-50"
                                    >
                                        <Text className="!text-sm !font-medium !text-red-600">Xóa tất cả</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                    <Ionicons name="close" size={30} className='!text-gray-600 dark:!text-gray-400' />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
                            <View className="mb-6">
                                <Text className="!text-base !font-semibold mb-3">Sắp xếp theo</Text>
                                <View className="space-y-2 flex-row flex-wrap gap-3">
                                    {[
                                        { value: SearchSortOption.NEWEST, label: 'Mới nhất' },
                                        { value: SearchSortOption.OLDEST, label: 'Cũ nhất' },
                                        { value: SearchSortOption.DOWNLOAD_COUNT, label: 'Tải nhiều nhất' }
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => setFilterOptions(prev => ({ ...prev, sort: prev?.sort === option.value ? undefined : option.value }))}
                                            className={`p-3 rounded-xl border ${filterOptions?.sort === option.value
                                                    ? 'bg-primary-50 border-primary-500'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <Text className={`!font-medium ${filterOptions?.sort === option.value
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
                                        { value: SearchFileType.PDF, label: 'PDF' },
                                        { value: SearchFileType.WORD, label: 'Word' },
                                        { value: SearchFileType.POWERPOINT, label: 'PowerPoint' },
                                        { value: SearchFileType.IMAGE, label: 'Hình ảnh' },
                                    ].map((option) => (
                                        <TouchableOpacity
                                            key={option.value}
                                            onPress={() => setFilterOptions(prev => ({ ...prev, type: prev?.type === option.value ? undefined : option.value }))}
                                            className={`p-3 rounded-xl border ${filterOptions?.type === option.value
                                                    ? 'bg-primary-50 border-primary-500'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <Text className={`!font-medium ${filterOptions?.type === option.value
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
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View >
    );
}