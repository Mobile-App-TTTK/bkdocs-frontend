import { useTheme } from '@/contexts/ThemeContext';
import { Features, logFeatureUsage, logUploadFunnelStep, UploadFunnel } from '@/services/analytics';
import { useAppDispatch } from '@/store/hooks';
import { setDocumentFile } from '@/store/uploadSlice';
import { Colors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { router, Tabs } from 'expo-router';
import { Alert } from 'react-native';

export default function TabsLayout() {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const dispatch = useAppDispatch();

  const handleUpload = async () => {
    try {
      // Log upload funnel start
      logUploadFunnelStep(UploadFunnel.SELECT_FILE, true);
      logFeatureUsage(Features.UPLOAD, 'view');

      const result = await DocumentPicker.getDocumentAsync({
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const picked = result.assets[0];
        console.log('Picked document from tab layout:', picked);

        let fileUri = picked.uri;

        if (fileUri.startsWith('ph://') || fileUri.startsWith('ph-upload://')) {
          try {
            const fileName = picked.name || 'document.pdf';
            const cacheFile = new FileSystem.File(FileSystem.Paths.cache, fileName);
            console.log('Copying file from photo library to cache:', fileUri, '->', cacheFile.uri);

            const sourceFile = new FileSystem.File(fileUri);
            await sourceFile.copy(cacheFile);

            fileUri = cacheFile.uri;
            console.log('File copied successfully to:', fileUri);
          } catch (error) {
            console.error('Error copying file:', error);
            Alert.alert('Lỗi', 'Không thể xử lý file này. Vui lòng chọn file khác.');
            return;
          }
        }

        dispatch(setDocumentFile({
          uri: fileUri,
          name: picked.name ?? '',
          mimeType: picked.mimeType ?? ''
        }));

        console.log('Document saved to Redux store, navigating to upload-detail...');
        router.push('/(app)/upload-detail');
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Lỗi', 'Không thể chọn tài liệu. Vui lòng thử lại.');
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF3300',
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          fontFamily: 'Inter-Medium',
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
        name="home"
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