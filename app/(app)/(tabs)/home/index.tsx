import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16 }}>Trang chủ</Text>
        <Text style={{ fontSize: 16, color: '#444', marginBottom: 24 }}>
          Bạn đã đăng nhập thành công.
        </Text>
        <TouchableOpacity
          onPress={async () => {
            await logout();
            router.replace(ROUTES.LOGIN);
          }}
          style={{ backgroundColor: '#ff3b30', paddingVertical: 14, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


