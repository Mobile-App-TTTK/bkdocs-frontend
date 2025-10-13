import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF3300',
        tabBarInactiveTintColor: '#687076',
        tabBarLabelStyle: {
          fontFamily: 'Gilroy-Medium',
        },
        tabBarStyle: {
          backgroundColor: 'white',
          height: 70,
          position: 'absolute',
          paddingTop: 5,
          marginBottom: 10,
          borderTopWidth: 0.3,
          elevation: 0,
          shadowOpacity: 0
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
        name="search/index"
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
        name="profile/index"
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