import { Colors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "native-base";
import { useState } from "react";
import { ActivityIndicator, Pressable, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WebView } from "react-native-webview";

export default function PdfViewer() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    
    const params = useLocalSearchParams<{ uri?: string; title?: string }>();
    const uri = typeof params.uri === 'string' ? params.uri : params.uri?.[0];
    const title = typeof params.title === 'string' ? params.title : params.title?.[0] || 'PDF Viewer';
    
    const [loading, setLoading] = useState(true);

    // Google Docs Viewer cho PDF (hoạt động tốt hơn trên Android)
    // Hoặc dùng trực tiếp uri cho iOS
    const pdfSource = uri?.startsWith('file://') 
        ? { uri } // iOS có thể render PDF native
        : { uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri || '')}` };

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            {/* Header */}
            <View 
                className="items-center justify-center relative !pt-[64px] bg-white dark:bg-dark-700"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                    elevation: 10,
                }}
            >
                <Pressable
                    className="!absolute top-16 left-6 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back-outline" size={24} color={"#888888"} />
                </Pressable>
                <Text 
                    numberOfLines={1} 
                    className="!text-xl !font-bold !text-black dark:!text-white mb-4 w-7/12 text-center"
                >
                    {title}
                </Text>
            </View>

            {/* PDF WebView */}
            <View style={{ flex: 1 }}>
                {loading && (
                    <View style={{ 
                        position: 'absolute', 
                        top: 0, left: 0, right: 0, bottom: 0,
                        justifyContent: 'center', 
                        alignItems: 'center',
                        backgroundColor: isDarkMode ? Colors.dark.background : Colors.light.background,
                        zIndex: 1,
                    }}>
                        <ActivityIndicator size="large" color="#ff3300" />
                        <Text className="mt-4 !text-gray-500">Đang tải PDF...</Text>
                    </View>
                )}
                
                {uri && (
                    <WebView
                        source={{ uri }}
                        style={{ flex: 1 }}
                        onLoadEnd={() => setLoading(false)}
                        onError={(e) => {
                            console.error("WebView error:", e.nativeEvent);
                            setLoading(false);
                        }}
                        allowFileAccess={true}
                        allowFileAccessFromFileURLs={true}
                        allowUniversalAccessFromFileURLs={true}
                        originWhitelist={['*']}
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
}