import { api } from '@/api/apiClient';
import { API_GET_SUGGESTIONS } from '@/api/apiRoutes';
import SuggestCard from '@/components/ui/home-suggest-card';
import { useAuth } from '@/contexts/AuthContext';
import { Suggestion } from '@/models/suggest.type';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { Image, Text } from "native-base";
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { interpolate, useSharedValue } from "react-native-reanimated";
import Carousel, { ICarouselInstance, Pagination, TAnimationStyle } from "react-native-reanimated-carousel";

const fallbackSuggestDoc = [
    {
        title: "Giáo trình Giải tích 1 Đại học Bách khoa Tp.HCM",
        image: require("@/assets/images/sampleDoc1.png"),
        subject: "Giải tích 1",
        downloadCount: 1234,
        uploadDate: "dd/mm/yyyy",
        type: "pdf"
    },
    {
        title: "Giáo trình Giải tích 2 Đại học Bách khoa Tp.HCM",
        image: require("@/assets/images/sampleDoc2.png"),
        subject: "Giải tích 2",
        downloadCount: 1234,
        uploadDate: "dd/mm/yyyy",
        type: "pdf"
    },
    {
        title: "Giáo trình Hệ thống số Đại học Bách khoa Tp.HCM",
        image: require("@/assets/images/sampleDoc3.png"),
        subject: "Hệ thống số",
        downloadCount: 1234,
        uploadDate: "dd/mm/yyyy",
        type: "pdf"
    },
    {
        title: "Giáo trình Giải tích 1 Đại học Bách khoa Tp.HCM",
        image: require("@/assets/images/sampleDoc1.png"),
        subject: "Giải tích 1",
        downloadCount: 1234,
        uploadDate: "dd/mm/yyyy",
        type: "pdf"
    },
];

export function Card() {
    const thumbnail = require(`@/assets/images/sampleDoc7.png`);

    return (
        <View className="bg-white dark:!bg-dark-700 flex flex-row gap-2 h-fit w-72 shadow-md justify-center items-center mr-6" style={{borderRadius: 20}}>
            <Image source={thumbnail} width={100} height={100} borderLeftRadius={20} borderWidth={1} borderColor={"primary.100"} alt="User Avatar"/>
            <View className="flex-1 ml-1 mr-3">
                <Text className="!font-semibold" numberOfLines={1} style={{ flexShrink: 1 }}>Giáo trình Giải tích 1 Đại học Bách khoa Tp.HCM</Text>

                <Text>Tên môn học</Text>

                <View className="flex flex-row justify-between">
                    <Text>dd/mm/yyyy</Text>
                    <Text>1234 lượt</Text>
                </View>
            </View>
        </View>
    )
}

export default function HomeScreen() {
  const { logout } = useAuth();
  const router = useRouter();

    const [following, setFollowing] = useState(false);
    const [suggestDoc, setSuggestDoc] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    

    useEffect(() => {
        const fetchSuggestion = async () => {
            try {
                setIsLoading(true);
                console.log('🚀 Fetching suggestions...');
                console.log('📍 Full URL:', `${process.env.EXPO_PUBLIC_API_URL}${API_GET_SUGGESTIONS}`);
                
                const response = await api.get(API_GET_SUGGESTIONS);
                
                // Log toàn bộ response
                console.log('📦 Full API Response:', JSON.stringify(response.data, null, 2));
                console.log('📦 Response status:', response.status);
                console.log('📦 Response headers:', response.headers);
                
                const documents: Suggestion[] = response.data?.data?.documents || [];
                console.log('📄 Documents:', documents);
                console.log('📄 Documents count:', documents.length);
    
                // Nếu data là array trực tiếp thay vì nested
                if (Array.isArray(response.data?.data)) {
                    console.log('⚠️ Data is direct array, not nested in documents');
                    console.log('⚠️ Array content:', response.data.data);
                }

                if (documents.length === 0) {
                    console.log('⚠️ No documents from API, using fallback');
                    setSuggestDoc(fallbackSuggestDoc);
                    setIsLoading(false);
                    return; // ❗ QUAN TRỌNG: return để không chạy code phía dưới
                }
                
                const mappedDoc = documents.map((doc) => ({
                    id: doc.id,
                    title: doc.title,
                    image: doc.thumbnailUrl,
                    subject: doc.subject,
                    downloadCount: doc.downloadCount,
                    uploadDate: doc.uploadDate,
                    type: doc.fileType,
                }));

                setSuggestDoc(mappedDoc);
            } 
            catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestDoc(fallbackSuggestDoc);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSuggestion();
    }, []);
    
    const avatar = require(`@/assets/images/userAvatar1.png`);
    const progress = useSharedValue<number>(0);
    const { width,height } = Dimensions.get("window");
    const ref = React.useRef<ICarouselInstance>(null);

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            /**
             * Calculate the difference between the current index and the target index
             * to ensure that the carousel scrolls to the nearest index
             */
            count: index - progress.value,
            animated: true,
        });
    };

    const animationStyle: TAnimationStyle = React.useCallback((value: number) => {
        "worklet";

        const zIndex = Math.round(interpolate(value, [-1, 0, 1], [0, 1, 0]));
        const rotateZ = `${interpolate(value, [-1, 0, 1], [-8, 0, 8])}deg`;
        const marginTop = interpolate(value, [-1, 0, 1], [10, 10, 10]);
        const translateX = interpolate(
            value,
            [-1, 0, 1],
            [-width*0.6, 0, width*0.6],
        );
        const scale = interpolate(value, [-1, 0, 1], [0.7, 1, 0.7]);

        return {
            transform: [{ rotateZ }, { translateX }, { scale }],
            zIndex,
            marginTop
        };
    }, []);

    return (
    <ScrollView className="flex-1 !bg-white dark:!bg-dark-900 pt-14">
      <View>

          {/*Profile người dùng*/}
          <View className="flex flex-row justify-center items-center mx-6 mt-6">
              <View className="flex flex-row gap-3 items-center">
                <Image source={avatar} width={50} height={50} borderRadius={100} className="shadow-md" resizeMode={'cover'} alt="User Avatar"/>
                  <View>
                      <Text className="font-medium">
                          Xin chào,
                      </Text>
                      <Text style={{
                          fontSize: 24,
                          lineHeight: 30,
                          fontFamily: "Gilroy-Bold"
                      }}>
                          TÊN NGƯỜI DÙNG
                      </Text>
                  </View>
              </View>

              <View className="flex-1"></View>
              <Pressable className="flex justify-center items-center w-10 h-10 rounded-full bg-primary-50" onPress={() => {router.push(ROUTES.NOTIFICATION as any)}}>
                <Ionicons name={"notifications-outline"} size={22} color={"#FF3300"}/>
              </Pressable>
          </View>
          {/*Thao tác nhanh*/}
          <View className="flex flex-row mx-6 justify-between mt-6">
              <View className="flex flex-col justify-center items-center">
                  <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                    <Ionicons name={"search-outline"} size={32} color={"#FF3300"}/>
                  </View>

                  <Text className="!text-lg !font-medium mt-1">Tìm kiếm</Text>
              </View>

              <View className="flex flex-col justify-center items-center">
                  <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                    <Ionicons name={"document-outline"} size={32} color={"#FF3300"}/>
                  </View>

                  <Text className="!text-lg !font-medium mt-1">Đóng góp</Text>
              </View>

              <Pressable className="flex flex-col justify-center items-center" onPress={() => {router.push(ROUTES.SAVED_DOC as any)}}>
                  <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                    <Ionicons name={"briefcase-outline"} size={32} color={"#FF3300"}/>
                  </View>

                  <Text className="!text-lg !font-medium mt-1">Quản lý</Text>
              </Pressable>

              <View className="flex flex-col justify-center items-center">
                  <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                    <Ionicons name={"settings-outline"} size={32} color={"#FF3300"}/>
                  </View>

                  <Text className="!text-lg !font-medium mt-1">Cài đặt</Text>
              </View>
          </View>
          {/*Carousel gợi ý*/}

          <Text style={{}} className="mx-6 mt-6 !text-xl !font-bold">Gợi ý dành cho bạn</Text>
          <View>
              <Carousel
                  autoPlayInterval={2000}
                  data={suggestDoc}
                  height={height*0.46}
                  loop={true}
                  pagingEnabled={true}
                  snapEnabled={true}
                  width={width}
                  style={{
                      marginHorizontal: 'auto',
                      width: width,
                  }}
                  mode="parallax"
                  modeConfig={{
                      parallaxScrollingScale: 0.8,
                      parallaxScrollingOffset: 400,
                  }}
                  onProgressChange={progress}
                  renderItem={({ item }) => (
                      <View style={{ alignItems: "center", justifyContent: "center", width: width }}>
                        <SuggestCard title={item.title} image={item.image} subject={item.subject} downloadCount={item.downloadCount} uploadDate={item.uploadDate} type={item.type} />
                      </View>
                  )}
                  customAnimation={animationStyle}
              />
          </View>

          <Pagination.Basic
              progress={progress}
              data={suggestDoc}
              dotStyle={{
                  borderRadius: 100,
                  height: 8,
                  width: 8,
                  backgroundColor: "#E5E7EA"
                }}
              activeDotStyle={{ backgroundColor: "#FF3300" }}
              containerStyle={{ gap: 5, marginBottom: 10 }}
              onPress={onPressPagination}
          />

          <View>
              <View className="mx-6 mt-6 !text-xl !font-bold flex flex-row items-center gap-1.5">
                  <Text className="!text-xl !font-bold">Tài liệu khoa Máy tính</Text>
                  <Text className="!text-xl !font-bold">•</Text>
                  <Pressable onPress={() => {setFollowing(!following)}}>
                      <Text className={`!text-xl !font-bold ${following ? "!text-gray-500" : "!text-primary-500"}`} >
                          {
                              following ? "Bỏ theo dõi" : "Theo dõi"
                          }
                      </Text>
                  </Pressable>
              </View>

              <ScrollView horizontal={true} style={{paddingVertical:15, paddingHorizontal:22}} showsVerticalScrollIndicator={false}>
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
                <Card />
              </ScrollView>
          </View>
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
    </ScrollView>
  );
}


