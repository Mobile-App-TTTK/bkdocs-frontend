import FormField from '@/components/FormField';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Image, Text, View } from 'native-base';
import React, { useState } from 'react';
import { Alert, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
    const router = useRouter();
    const [fullName, setFullName] = useState('Trần Thành Tài');
    const [email, setEmail] = useState('tai.tranthanh@hcmut.edu.vn');
    const [faculty, setFaculty] = useState('Khoa Máy tính');
    const [enrollmentYear, setEnrollmentYear] = useState('2022');
    const [avatar, setAvatar] = useState(require('@/assets/images/userAvatar1.png'));

    const handleSave = () => {
        Alert.alert('Thành công', 'Đã lưu thông tin hồ sơ');
        router.back();
    };

    const handleEditAvatar = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (permissionResult.granted === false) {
                Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets[0]) {
                setAvatar({ uri: result.assets[0].uri });
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể chọn ảnh');
        }
    };

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
                >
                    <Text
                        className="!text-base !font-semibold !text-primary-500"
                    >
                        Lưu
                    </Text>
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

                    <FormField
                        label="Khoa"
                        value={faculty}
                        onChangeText={setFaculty}
                        placeholder="Nhập tên khoa"
                    />

                    <FormField
                        label="Niên khoá"
                        value={enrollmentYear}
                        onChangeText={setEnrollmentYear}
                        placeholder="Nhập niên khoá"
                        keyboardType="numeric"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

