import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { router, Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const handleUpload = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const picked = result.assets[0];
      router.push({ pathname: '/(app)/upload-detail', params: { name: picked.name ?? '' } });
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF3300',
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          fontFamily: 'Gilroy-Medium',
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          height: 70,
          position: 'absolute',
          paddingTop: 5,
          margin: 10,
          marginBottom: 20,
          elevation: 0,
          shadowOpacity: 0,
          borderRadius: 30,
          borderTopWidth: 0,
          boxShadow: isDark 
            ? '0 0 10px 0 rgba(255, 255, 255, 0.1)' 
            : '0 0 10px 0 rgba(0, 0, 0, 0.1)',
          ...(isDark && {
            borderWidth: 0.5,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }),
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Tìm kiếm',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="upload/index"
        options={{
          title: 'Tải lên',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "cloud-upload" : "cloud-upload-outline"} color={color} size={size} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            handleUpload();
          },
        }}
      />
      <Tabs.Screen
        name="notification/index"
        options={{
          title: 'Thông báo',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "notifications" : "notifications-outline"} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}