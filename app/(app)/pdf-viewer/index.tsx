import { Features, logFeatureUsage } from "@/services/analytics";
import { Colors } from "@/utils/theme";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { Text } from "native-base";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, useColorScheme, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WebView } from "react-native-webview";

export default function PdfViewer() {
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === 'dark';
    
    const params = useLocalSearchParams<{ uri?: string; title?: string }>();
    const uri = typeof params.uri === 'string' ? params.uri : params.uri?.[0];
    const title = typeof params.title === 'string' ? params.title : params.title?.[0] || 'PDF Viewer';
    
    const [loading, setLoading] = useState(true);
    const [pdfSource, setPdfSource] = useState<{ uri: string } | { html: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const setupPdfSource = async () => {
            if (!uri) {
                setError("Không có URI");
                setLoading(false);
                return;
            }

            const isLocalFile = uri.startsWith('file://');

            try {
                if (isLocalFile) {
                    if (Platform.OS === 'ios') {
                        setPdfSource({ uri });
                        setLoading(false);
                    } else {
                        const file = new FileSystem.File(uri);
                        
                        if (!file.exists) {
                            setError("File không tồn tại");
                            setLoading(false);
                            return;
                        }

                        const base64 = await file.base64();
                        
                        const pdfJsHtml = createPdfJsHtml(base64, isDarkMode);
                        setPdfSource({ html: pdfJsHtml });
                        setLoading(false);
                    }
                } else {
                    setPdfSource({ 
                        uri: `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}` 
                    });
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error setting up PDF source:', err);
                setError("Không thể tải PDF");
                setLoading(false);
            }
        };

        setupPdfSource();
    }, [uri, isDarkMode]);

    if (error) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#1a1a1a' : '#fff' }}>
                    <Ionicons name="alert-circle-outline" size={64} color="#ff3300" />
                    <Text className="mt-4 !text-gray-500 text-center px-8">{error}</Text>
                    <Pressable 
                        onPress={() => router.back()}
                        className="mt-6 bg-primary-500 px-6 py-3 rounded-lg"
                    >
                        <Text className="!text-white !font-bold">Quay lại</Text>
                    </Pressable>
                </View>
            </GestureHandlerRootView>
        );
    }

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
                
                {pdfSource && (
                    <WebView
                        source={pdfSource}
                        style={{ flex: 1 }}
                        onLoadEnd={() => setLoading(false)}
                        onError={(e) => {
                            console.error("WebView error:", e.nativeEvent);
                            setError("Lỗi khi tải PDF");
                            setLoading(false);
                        }}
                        allowFileAccess={true}
                        allowFileAccessFromFileURLs={true}
                        allowUniversalAccessFromFileURLs={true}
                        originWhitelist={['*']}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        scalesPageToFit={true}
                        mixedContentMode="always"
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
}

function createPdfJsHtml(base64Data: string, isDarkMode: boolean): string {
    const bgColor = isDarkMode ? '#1a1a1a' : '#f5f5f5';
    const canvasBg = isDarkMode ? '#2d2d2d' : '#ffffff';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: ${bgColor};
            overflow-x: hidden;
        }
        #pdf-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px;
            gap: 10px;
        }
        .page-canvas {
            background-color: ${canvasBg};
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 100%;
            height: auto;
        }
        #loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #888;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #error {
            display: none;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #ff3300;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div id="loading">Đang tải PDF...</div>
    <div id="error"></div>
    <div id="pdf-container"></div>
    
    <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        
        const base64Data = '${base64Data}';
        const pdfData = atob(base64Data);
        
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        
        loadingTask.promise.then(function(pdf) {
            document.getElementById('loading').style.display = 'none';
            const container = document.getElementById('pdf-container');
            const totalPages = pdf.numPages;
            
            // Render tất cả các trang
            const renderPage = async (pageNum) => {
                const page = await pdf.getPage(pageNum);
                const canvas = document.createElement('canvas');
                canvas.className = 'page-canvas';
                const context = canvas.getContext('2d');
                
                // Scale để fit width với màn hình
                const viewport = page.getViewport({ scale: 1 });
                const screenWidth = window.innerWidth - 20;
                const scale = screenWidth / viewport.width;
                const scaledViewport = page.getViewport({ scale: scale * 2 }); // 2x for retina
                
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;
                canvas.style.width = (scaledViewport.width / 2) + 'px';
                canvas.style.height = (scaledViewport.height / 2) + 'px';
                
                container.appendChild(canvas);
                
                await page.render({
                    canvasContext: context,
                    viewport: scaledViewport
                }).promise;
            };
            
            // Render tuần tự các trang
            (async () => {
                for (let i = 1; i <= totalPages; i++) {
                    await renderPage(i);
                }
            })();
            
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'flex';
            document.getElementById('error').textContent = 'Không thể tải PDF: ' + error.message;
        });
    </script>
</body>
</html>
`;
}