import { getSelectedFaculties, getSelectedImages, getSelectedLists, getSelectedSubjects } from '@/utils/selectionStore';
import { Ionicons } from '@expo/vector-icons';
// import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Button, Text, View } from 'native-base';
import React, { useMemo, useState } from 'react';
import { Alert, Image, Keyboard, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UploadDetailScreen() {
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams<{ name?: string; faculties?: string }>();
    const pickedName = useMemo(() => (typeof params.name === 'string' ? params.name : ''), [params]);
    const [selectedFaculties, setSelectedFaculties] = useState<string[]>(() => {
        try {
            if (typeof params.faculties === 'string' && params.faculties) {
                return JSON.parse(params.faculties) as string[];
            }
        } catch {}
        return [] as string[];
    });
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedLists, setSelectedLists] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [coverUri, setCoverUri] = useState<string | null>(null);

    useFocusEffect(() => {
        setSelectedFaculties(getSelectedFaculties());
        setSelectedSubjects(getSelectedSubjects());
        setSelectedLists(getSelectedLists());
        setSelectedImages(getSelectedImages());
        setCoverUri(coverUri);
        return () => {};
    });

    const handlePickCover = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [3, 4],
                quality: 1,
            });

            console.log(result);

            if (!result.canceled && result.assets[0]) {
                setCoverUri(result.assets[0].uri);
            }
        } catch (e) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh bìa');
        }
    };

    console.log("coverUri", coverUri);

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
        <View className="flex-1 px-2 !bg-white dark:!bg-dark-900">
            <View style={{ marginTop: insets.top }} className="absolute top-0 left-0 right-0 z-10 px-3 py-2">
                <View className='flex-row items-center justify-between'>
                    <TouchableOpacity onPress={() => router.back()} className='w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center'>
                        <Ionicons name="chevron-back" size={24} className='!text-gray-700 dark:!text-gray-300' />
                    </TouchableOpacity>
                    <Text className='!text-xl !font-semibold !text-black dark:!text-white'>Thêm mô tả chi tiết</Text>
                    <View className='w-10' />
                </View>
            </View>

            <View className='flex-1 px-3' style={{ marginTop: insets.top + 60 }}>
                <View className="flex-row items-start gap-4">
                    <TouchableOpacity onPress={handlePickCover} className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-dark-800 items-center justify-center overflow-hidden">
                        {coverUri ? (
                            <Image source={{ uri: coverUri }} style={{ width: '100%', height: '100%' }} />
                        ) : (
                            <Ionicons name="pencil" size={22} className="!text-gray-500 dark:!text-gray-400" />
                        )}
                    </TouchableOpacity>

                    <View className="flex-1">
                        <TextInput
                            placeholder="Nhập tiêu đề cho tài liệu"
                            defaultValue={pickedName}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor={'#9CA3AF'}
                            className="h-24 border-b border-gray-200 dark:border-gray-700 text-lg font-[Gilroy-Regular] text-black dark:text-white"
                        />
                    </View>
                </View>

                <View className='flex-row items-center gap-3 mt-6'>
                    <Image source={{ uri: 'https://i.pinimg.com/1200x/24/bd/d9/24bdd9ec59a9f8966722063fe7791183.jpg' }} className='w-16 h-16 rounded-full' />
                    <View>
                        <Text className='!font-semibold !text-black dark:!text-white'>Trần Thành Tài</Text>
                        <Text className='!text-gray-500 dark:!text-gray-400'>199 tài liệu</Text>
                    </View>
                </View>

                <TextInput
                    placeholder='Nhập mô tả cho tài liệu'
                    placeholderTextColor={'#9CA3AF'}
                    className='mt-6 h-20 border-b border-gray-200 dark:border-gray-700 text-lg font-[Gilroy-Regular] text-black dark:text-white'
                    multiline
                    textAlignVertical="top"
                />

                <View className='mt-6'>
                    <TouchableOpacity onPress={() => router.push('/(app)/select-images')} className='flex-row items-center justify-between py-5 border-b border-gray-200 dark:border-gray-700'>
                        <View className='flex-row items-center gap-3'>
                            <Ionicons name='images-outline' size={22} className='!text-gray-700 dark:!text-gray-300' />
                            <Text className='!text-lg !text-black dark:!text-white'>Thêm ảnh</Text>
                        </View>
                        <View className='flex-row items-center gap-2'>
                            {selectedImages.length > 0 && (
                                <Text className='!text-gray-600 dark:!text-gray-400'>
                                    {selectedImages.length} ảnh
                                </Text>
                            )}
                            <Ionicons name='chevron-forward' size={20} className='!text-gray-700 dark:!text-gray-300' />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push({ pathname: '/(app)/select-faculty', params: { name: pickedName, faculties: JSON.stringify(selectedFaculties) } })} className='flex-row items-center justify-between py-5 border-b border-gray-200 dark:border-gray-700'>
                        <View className='flex-row items-center gap-3'>
                            <Ionicons name='cube-outline' size={22} className='!text-gray-700 dark:!text-gray-300' />
                            <Text className='!text-lg !text-black dark:!text-white'>Chọn khoa</Text>
                        </View>
                        <View className='flex-row items-center gap-2'>
                            {selectedFaculties.length > 0 && (
                                <Text className='!text-gray-600 dark:!text-gray-400'>
                                    {selectedFaculties[0]}{selectedFaculties.length > 1 ? ` +${selectedFaculties.length - 1} khoa` : ''}
                                </Text>
                            )}
                            <Ionicons name='chevron-forward' size={20} className='!text-gray-700 dark:!text-gray-300' />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className='flex-row items-center justify-between py-5 border-b border-gray-200 dark:border-gray-700' onPress={() => router.push('/(app)/select-subject')}>
                        <View className='flex-row items-center gap-3'>
                            <Ionicons name='book-outline' size={22} className='!text-gray-700 dark:!text-gray-300' />
                            <Text className='!text-lg !text-black dark:!text-white'>Chọn môn học</Text>
                        </View>
                        <View className='flex-row items-center gap-2'>
                            {selectedSubjects.length > 0 && (
                                <Text className='!text-gray-600 dark:!text-gray-400'>
                                    {selectedSubjects[0]}{selectedSubjects.length > 1 ? ` +${selectedSubjects.length - 1}` : ''}
                                </Text>
                            )}
                            <Ionicons name='chevron-forward' size={20} className='!text-gray-700 dark:!text-gray-300' />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity className='flex-row items-center justify-between py-5 border-b border-gray-200 dark:border-gray-700' onPress={() => router.push('/(app)/select-list')}>
                        <View className='flex-row items-center gap-3'>
                            <Ionicons name='list-outline' size={22} className='!text-gray-700 dark:!text-gray-300' />
                            <Text className='!text-lg !text-black dark:!text-white'>Chọn danh sách</Text>
                        </View>
                        <View className='flex-row items-center gap-2'>
                            {selectedLists.length > 0 && (
                                <Text className='!text-gray-600 dark:!text-gray-400'>
                                    {selectedLists[0]}{selectedLists.length > 1 ? ` +${selectedLists.length - 1}` : ''}
                                </Text>
                            )}
                            <Ionicons name='chevron-forward' size={20} className='!text-gray-700 dark:!text-gray-300' />
                        </View>
                    </TouchableOpacity>
                </View>

                <View className='absolute left-3 right-3' style={{ bottom: insets.bottom + 12 }}>
                    <Button isDisabled className='!rounded-2xl !py-4' bg="primary.500" _disabled={{ bg: 'gray.300' }} _text={{ color: 'white' }}>
                        <Text className='!text-white !font-semibold !text-lg'>Tải tài liệu lên</Text>
                    </Button>
                </View>
            </View>
         </View>
        </TouchableWithoutFeedback>
     );
}


