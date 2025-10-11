import { Stack } from 'expo-router';
import React from 'react';

export default function PublicLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }} />
  );
}


