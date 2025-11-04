import * as DocumentPicker from 'expo-document-picker';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';

export default function UploadPage() {
  useFocusEffect(
    useCallback(() => {
      const openPicker = async () => {
        try {
          const result = await DocumentPicker.getDocumentAsync({ multiple: false, copyToCacheDirectory: true });
          if (!result.canceled && result.assets && result.assets.length > 0) {
            const picked = result.assets[0];
            router.replace({ pathname: '/(app)/upload-detail', params: { name: picked.name ?? '', uri: picked.uri ?? '', mimeType: picked.mimeType ?? '' } });
          } else {
            // If user cancels, just go back to previous tab
            router.back();
          }
        } catch (e) {
          console.warn('Document picker error', e);
          router.back();
        }
      };
      openPicker();
      return () => {};
    }, [])
  );

  return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
}

