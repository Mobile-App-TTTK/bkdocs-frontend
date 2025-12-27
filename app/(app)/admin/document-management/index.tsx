import DocumentManagement from '@/components/Admin/DocumentManagement';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text, View } from 'native-base';
import React, { useEffect } from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentManagementScreen() {
    const { userProfile } = useAuth();
    const router = useRouter();
    const isAdmin = userProfile?.role === 'admin';

    useEffect(() => {
        if (!isAdmin) {
            router.replace(ROUTES.HOME);
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return null;
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:!bg-dark-900" edges={['top']}>
            <View className="relative px-6 py-8 items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-6 top-6 w-12 h-12 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center"
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back-outline" size={24} color="#888" />
                </TouchableOpacity>
                <Text
                    className="!text-xl !font-bold !text-black dark:!text-white"
                    style={{ fontFamily: 'Gilroy-Bold' }}
                    numberOfLines={1}
                >
                    Kiểm duyệt tài liệu
                </Text>
            </View>

            <DocumentManagement />
        </SafeAreaView>

    );
}

