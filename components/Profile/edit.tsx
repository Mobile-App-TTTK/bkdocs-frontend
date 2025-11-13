import FormField from '@/components/FormField';
import { useFetchFacultiesAndSubjects } from '@/components/searchResultScreen/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image, Spinner, Text, View } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFetchUserProfile, useUpdateProfile } from './api';

export default function EditProfileScreen() {
    const router = useRouter();
    const { data: userProfile, isLoading: isLoadingProfile } = useFetchUserProfile();
    const { data: facultiesData } = useFetchFacultiesAndSubjects();
    const updateProfileMutation = useUpdateProfile();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [facultyName, setFacultyName] = useState('');
    const [enrollmentYear, setEnrollmentYear] = useState('');
    const [avatar, setAvatar] = useState<any>(require('@/assets/images/userAvatar1.png'));
    const [newAvatarFile, setNewAvatarFile] = useState<any>(null);
    const [showFacultyModal, setShowFacultyModal] = useState(false);

    useEffect(() => {
        if (userProfile) {
            setFullName(userProfile.name || '');
            setEmail(userProfile.email || '');
            setFacultyName(userProfile.faculty || '');
            setEnrollmentYear(userProfile.intakeYear?.toString() || '');
            
            if (userProfile.imageUrl) {
                setAvatar({ uri: userProfile.imageUrl });
            }

            // Find facultyId from faculty name
            if (facultiesData?.faculties && userProfile.faculty) {
                const matchedFaculty = facultiesData.faculties.find(
                    (f: any) => f.name === userProfile.faculty
                );
                if (matchedFaculty) {
                    setSelectedFacultyId(matchedFaculty.id);
                }
            }
        }
    }, [userProfile, facultiesData]);

    const handleSelectFaculty = (faculty: any) => {
        setSelectedFacultyId(faculty.id);
        setFacultyName(faculty.name);
        setShowFacultyModal(false);
    };

    const handleSave = async () => {
        if (!fullName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
            return;
        }

        if (!enrollmentYear.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập niên khoá');
            return;
        }

        try {
            await updateProfileMutation.mutateAsync({
                name: fullName,
                facultyId: selectedFacultyId || undefined,
                intakeYear: parseInt(enrollmentYear) || undefined,
                avatar: newAvatarFile,
            });

            Alert.alert('Thành công', 'Đã cập nhật thông tin hồ sơ');
            router.back();
        } catch (error: any) {
            Alert.alert('Lỗi', error?.response?.data?.message || 'Không thể cập nhật hồ sơ');
        }
    };

    const handleEditAvatar = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setAvatar({ uri: asset.uri });
                
                // Prepare file for upload
                const fileName = asset.uri.split('/').pop() || 'avatar.jpg';
                const fileType = asset.type === 'image' 
                    ? `image/${fileName.split('.').pop()}` 
                    : 'image/jpeg';
                
                setNewAvatarFile({
                    uri: asset.uri,
                    type: fileType,
                    name: fileName,
                });
            }
        } catch {
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

    if (isLoadingProfile) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:!bg-dark-900" edges={['top']}>
                <View className="flex-1 items-center justify-center">
                    <Spinner color="primary.500" size="lg" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:!bg-dark-900" edges={['top']}>
            <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back-outline" size={24} color="#888" />
                </TouchableOpacity>

                <Text
                    className="!text-xl !font-bold text-black dark:text-white"
                    style={{ fontFamily: 'Gilroy-Bold' }}
                >
                    Chỉnh sửa hồ sơ
                </Text>

                <TouchableOpacity
                    onPress={handleSave}
                    activeOpacity={0.7}
                    disabled={updateProfileMutation.isPending}
                >
                    {updateProfileMutation.isPending ? (
                        <Spinner color="primary.500" size="sm" />
                    ) : (
                        <Text
                            className="!text-base !font-semibold !text-primary-500"
                        >
                            Lưu
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="items-center px-6 pt-6 pb-8">
                    <View
                        className="w-32 h-32 rounded-full overflow-hidden mb-4"
                        style={{ backgroundColor: '#FFE5E5' }}
                    >
                        <Image
                            source={avatar}
                            width="100%"
                            height="100%"
                            alt="User Avatar"
                            resizeMode="cover"
                        />
                    </View>

                    <Text
                        className="text-xl font-bold text-black dark:text-white mb-2"
                        style={{ fontFamily: 'Gilroy-Bold' }}
                    >
                        {fullName}
                    </Text>

                    <TouchableOpacity onPress={handleEditAvatar} activeOpacity={0.7}>
                        <Text
                            className="text-sm"
                            style={{ fontFamily: 'Gilroy-Medium', color: '#FF9500' }}
                        >
                            Chỉnh sửa hình ảnh hồ sơ
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="px-6 pb-8">
                    <FormField
                        label="Họ và tên"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Nhập họ và tên"
                    />

                    <FormField
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Nhập email"
                        keyboardType="email-address"
                        disabled={true}
                    />

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Khoa
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowFacultyModal(true)}
                            className="flex-row items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700"
                            activeOpacity={0.7}
                        >
                            <Text className={`text-base ${facultyName ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                                {facultyName || 'Chọn khoa'}
                            </Text>
                            <Ionicons name="chevron-down-outline" size={20} color="#888" />
                        </TouchableOpacity>
                    </View>

                    <FormField
                        label="Niên khoá"
                        value={enrollmentYear}
                        onChangeText={setEnrollmentYear}
                        placeholder="Nhập niên khoá"
                        keyboardType="numeric"
                    />
                </View>
            </ScrollView>

            <Modal
                visible={showFacultyModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowFacultyModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white dark:bg-dark-900 rounded-t-3xl max-h-[70%]">
                        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <Text className="text-lg !font-bold text-black dark:text-white">
                                Chọn khoa
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowFacultyModal(false)}
                                className="w-8 h-8 items-center justify-center"
                            >
                                <Ionicons name="close" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView>
                            {facultiesData?.faculties?.map((faculty: any) => (
                                <TouchableOpacity
                                    key={faculty.id}
                                    onPress={() => handleSelectFaculty(faculty)}
                                    className={`py-4 px-4 border-b border-gray-100 dark:border-gray-800 ${
                                        selectedFacultyId === faculty.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-base text-black dark:text-white flex-1">
                                            {faculty.name}
                                        </Text>
                                        {selectedFacultyId === faculty.id && (
                                            <Ionicons name="checkmark" size={24} color="#FF9500" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                            <View className="h-8" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

