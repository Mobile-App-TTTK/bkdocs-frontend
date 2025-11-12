import { useFetchUserProfile } from '@/components/Profile/api';
import { useFetchFacultiesAndSubjects } from '@/components/searchResultScreen/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearUploadState, setCoverImage as setReduxCoverImage, setDescription as setReduxDescription, setTitle as setReduxTitle } from '@/store/uploadSlice';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { router, useFocusEffect } from 'expo-router';
import { Button, Spinner, Text, View } from 'native-base';
import React from 'react';
import { Alert, Image, Keyboard, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUploadDocument } from './api';

export default function UploadDetailScreen() {
    const insets = useSafeAreaInsets();
    const { data: facultiesData } = useFetchFacultiesAndSubjects();
    const { data: userProfile } = useFetchUserProfile();
    const uploadMutation = useUploadDocument();
    
    const dispatch = useAppDispatch();
    const uploadState = useAppSelector(state => state.upload);

    console.log("upload params")
    
    // Use Redux state - all values come from store
    const documentFile = uploadState.documentFile;
    const title = uploadState.title;
    const description = uploadState.description;
    const selectedFaculties = uploadState.selectedFaculties;
    const selectedSubjects = uploadState.selectedSubjects;
    const selectedLists = uploadState.selectedLists;
    const selectedImages = uploadState.selectedImages;
    const coverUri = uploadState.coverImage;

    useFocusEffect(() => {
        console.log("Upload state from Redux:", uploadState);
        
        // Auto-fill title from document name if empty
        if (documentFile && !title) {
            dispatch(setReduxTitle(documentFile.name));
        }
        return () => { };
    });

    const handlePickCover = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [3, 4],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                dispatch(setReduxCoverImage(result.assets[0].uri));
            }
        } catch {
            Alert.alert('Lỗi', 'Không thể chọn ảnh bìa');
        }
    };

    const handleUpload = async () => {
        // Request media library permissions if needed
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để upload');
            return;
        }

        // Validate inputs
        if (!title.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề tài liệu');
            return;
        }

        if (!documentFile?.uri) {
            Alert.alert('Lỗi', 'Không tìm thấy file tài liệu');
            return;
        }

        if (selectedFaculties.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một khoa');
            return;
        }

        if (selectedSubjects.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn môn học');
            return;
        }

        if (selectedLists.length === 0) {
            Alert.alert('Lỗi', 'Vui lòng chọn loại tài liệu');
            return;
        }

        // Get IDs from names
        const facultyIds = facultiesData?.faculties
            ?.filter((f: any) => selectedFaculties.includes(f.name))
            .map((f: any) => f.id) || [];

        const subjectId = facultiesData?.subjects
            ?.find((s: any) => s.name === selectedSubjects[0])?.id;

        const documentTypeId = facultiesData?.documentTypes
            ?.find((d: any) => d.name === selectedLists[0])?.id;

        if (!subjectId || !documentTypeId) {
            Alert.alert('Lỗi', 'Không thể xác định ID của môn học hoặc loại tài liệu');
            return;
        }

        try {
            // Prepare file object
            const fileName = documentFile.uri.split('/').pop() || 'document.pdf';
            const fileType = fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';

            // Helper function to get local file URI from photo library URIs
            const getLocalUri = async (uri: string): Promise<string> => {
                if (uri.startsWith('ph://') || uri.startsWith('ph-upload://')) {
                    try {
                        // Extract asset ID from ph:// URI
                        const assetId = uri.replace(/^ph(-upload)?:\/\//, '').split('/')[0];
                        console.log('Getting local URI for asset:', assetId);
                        
                        // Get asset info from media library
                        const asset = await MediaLibrary.getAssetInfoAsync(assetId);
                        console.log('Asset info:', asset);
                        
                        if (asset && asset.localUri) {
                            console.log('Converted ph:// to local URI:', uri, '->', asset.localUri);
                            return asset.localUri;
                        }
                        
                        throw new Error('Could not get local URI for photo library asset');
                    } catch (error) {
                        console.error('Error getting local URI for photo library file:', error);
                        throw error;
                    }
                }
                return uri;
            };

            // Prepare thumbnail
            let thumbnailFile;
            if (coverUri) {
                const processedCoverUri = await getLocalUri(coverUri);
                const thumbnailName = processedCoverUri.split('/').pop() || 'thumbnail.jpg';
                const thumbnailType = `image/${thumbnailName.split('.').pop()}`;
                thumbnailFile = {
                    uri: processedCoverUri,
                    type: thumbnailType,
                    name: thumbnailName,
                };
            }

            console.log("thumbnailFile:", thumbnailFile);

            // Prepare images - get local URIs from photo library if needed
            const imageFiles = await Promise.all(
                selectedImages.map(async (uri) => {
                    const processedUri = await getLocalUri(uri);
                    const imageName = processedUri.split('/').pop() || 'image.jpg';
                    const imageType = `image/${imageName.split('.').pop()}`;
                    return {
                        uri: processedUri,
                        type: imageType,
                        name: imageName,
                    };
                })
            );

            console.log("imageFiles:", imageFiles);

            console.log('Uploading document with data:', {
                file: {
                    uri: documentFile.uri,
                    type: fileType,
                    name: fileName,
                },
                facultyIds,
                subjectId,
                documentTypeId,
                description: description.trim(),
                title: title.trim(),
                thumbnailFile,
                images: imageFiles.length > 0 ? imageFiles : undefined,
            });

            await uploadMutation.mutateAsync({
                file: {
                    uri: documentFile.uri,
                    type: fileType,
                    name: fileName,
                },
                facultyIds,
                subjectId,
                documentTypeId,
                description: description.trim(),
                title: title.trim(),
                thumbnailFile,
                images: imageFiles.length > 0 ? imageFiles : undefined,
            });

            // Clear Redux state after successful upload
            dispatch(clearUploadState());

            Alert.alert('Thành công', 'Tải tài liệu lên thành công', [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                },
            ]);
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể tải tài liệu lên');
        }
    };

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
                                value={title}
                                onChangeText={(text) => dispatch(setReduxTitle(text))}
                                multiline
                                textAlignVertical="top"
                                placeholderTextColor={'#9CA3AF'}
                                className="h-24 border-b border-gray-200 dark:border-gray-700 text-lg font-[Gilroy-Regular] text-black dark:text-white"
                            />
                        </View>
                    </View>

                    <View className='flex-row items-center gap-3 mt-6'>
                        <Image 
                            source={userProfile?.imageUrl ? { uri: userProfile.imageUrl } : { uri: 'https://i.pinimg.com/1200x/24/bd/d9/24bdd9ec59a9f8966722063fe7791183.jpg' }} 
                            className='w-16 h-16 rounded-full' 
                        />
                        <View>
                            <Text className='!font-semibold !text-black dark:!text-white'>
                                {userProfile?.name || 'User'}
                            </Text>
                            <Text className='!text-gray-500 dark:!text-gray-400'>
                                {userProfile?.documentCount || 0} tài liệu
                            </Text>
                        </View>
                    </View>

                    <TextInput
                        placeholder='Nhập mô tả cho tài liệu'
                        value={description}
                        onChangeText={(text) => dispatch(setReduxDescription(text))}
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

                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: '/(app)/select-faculty',
                                    params: { faculties: JSON.stringify(selectedFaculties) },
                                })
                            }
                            className="flex-row items-center justify-between py-5 border-b border-gray-200 dark:border-gray-700 gap-2 overflow-hidden"
                        >
                            <View className="flex-row items-center gap-3">
                                <Ionicons
                                    name="cube-outline"
                                    size={22}
                                    className="!text-gray-700 dark:!text-gray-300"
                                />
                                <Text className="!text-lg !text-black dark:!text-white">Chọn khoa</Text>
                            </View>

                            <View className="flex-row items-center max-w-[60%]">
                                {selectedFaculties.length > 0 && (
                                    <Text
                                        className="!text-gray-600 dark:!text-gray-400"
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {selectedFaculties[0]}
                                        {selectedFaculties.length > 1
                                            ? ` +${selectedFaculties.length - 1} khoa`
                                            : ''}
                                    </Text>
                                )}
                                <Ionicons
                                    name="chevron-forward"
                                    size={20}
                                    className="!text-gray-700 dark:!text-gray-300"
                                />
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
                        <Button 
                            onPress={handleUpload}
                            isDisabled={
                                uploadMutation.isPending ||
                                !documentFile ||
                                !title.trim() ||
                                selectedFaculties.length === 0 ||
                                selectedSubjects.length === 0 ||
                                selectedLists.length === 0
                            }
                            className='!rounded-2xl !py-4' 
                            bg="primary.500" 
                            _disabled={{ bg: 'gray.300' }}
                        >
                            {uploadMutation.isPending ? (
                                <Spinner color="white" />
                            ) : (
                                <Text className='!text-white !font-semibold !text-lg'>Tải tài liệu lên</Text>
                            )}
                        </Button>
                    </View>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}


