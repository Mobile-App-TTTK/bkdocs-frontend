import { Stack } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="search-result/index" 
        options={{ 
          headerShown: false
        }} 
      />
    </Stack>
  );
}
