import { api } from '@/api/apiClient';
import { API_GET_INFORMATION_FACULTY, API_GET_SUGGESTIONS } from '@/api/apiRoutes';
import { useFetchAdminStatistics } from '@/components/Admin/api';
import DocumentCard from '@/components/DocumentCard';
import { useFetchFacultyInfo, useSubscribeFaculty, useUnsubscribeFaculty } from '@/components/FacultyScreen/api';
import { useFetchFacultiesAndSubjects } from "@/components/searchResultScreen/api";
import SuggestCard from '@/components/ui/home-suggest-card';
import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { Suggestion } from '@/models/suggest.type';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { Image, Spinner, Text } from "native-base";
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, View } from 'react-native';
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

function FacultySection({ facultyId, fallbackName }: { facultyId: string; fallbackName: string }) {
    const { data: facultyInfo, isLoading } = useFetchFacultyInfo(facultyId);
  
    const subscribeFacultyMutation = useSubscribeFaculty(facultyId);
    const unsubscribeFacultyMutation = useUnsubscribeFaculty(facultyId);
  
    const isFollowing = !!facultyInfo?.isFollowingFaculty;
    const isFollowLoading = subscribeFacultyMutation.isPending || unsubscribeFacultyMutation.isPending;
  
    const handleToggleFollowFaculty = () => {
      if (isFollowing) {
        unsubscribeFacultyMutation.mutate(facultyId, {
          onError: () => {
            Alert.alert("Lỗi", "Không thể hủy theo dõi khoa", [{ text: "OK" }]);
          },
        });
      } else {
        subscribeFacultyMutation.mutate(facultyId, {
          onError: () => {
            Alert.alert("Lỗi", "Không thể theo dõi khoa", [{ text: "OK" }]);
          },
        });
      }
    };
  
    // pull up to 6 docs like your old logic, but keep subject name
    const docs =
      (facultyInfo?.subjects ?? [])
        .flatMap((s: any) => (s?.documents ?? []).map((d: any) => ({ ...d, __subjectName: s?.name })))
        .slice(0, 6);
  
    // Ẩn khoa nếu không có tài liệu
    if (docs.length === 0) {
      return null;
    }
  
    return (
      <View>
        <View className="mx-6 mt-6 !text-xl !font-bold flex flex-row items-center gap-1.5">
          <Text 
            className="!text-xl !font-bold flex-1" 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            {facultyInfo?.name ?? fallbackName}
          </Text>
  
          <Pressable onPress={handleToggleFollowFaculty} disabled={isLoading || isFollowLoading}>
            {isFollowLoading ? (
              <Spinner size="sm" color="primary.500" />
            ) : (
              <Text className={`!text-xl !font-bold ${isFollowing ? "!text-gray-500" : "!text-primary-500"}`}>
                {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
              </Text>
            )}
          </Pressable>
        </View>
  
        <View className="flex-row flex-wrap justify-between px-6 mt-3">
          {docs.map((doc: any) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              title={doc.title}
              downloadCount={doc.downloadCount}
              uploadDate={doc.uploadDate}
              subject={doc.__subjectName}
              thumbnail={doc.thumbnail || doc.thumbnailUrl || ""}
              score={doc.score || 0}
              type={doc.type || doc.fileType || ""}
            />
          ))}
        </View>
      </View>
    );
  }  

export default function HomeScreen() {

    const { logout, userProfile: authUserProfile } = useAuth();
    const router = useRouter();
    const { userProfile, isLoading: isLoadingUser } = useUser();

    const [suggestDoc, setSuggestDoc] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [docsByFaculty, setDocsByFaculty] = useState<Record<string, any[]>>({});
    const [loadingFacultyDocs, setLoadingFacultyDocs] = useState(false);
    
    const { data: facultiesData, isLoading: isLoadingFaculties } = useFetchFacultiesAndSubjects();
    const faculties = facultiesData?.faculties ?? [];

    const isAdmin = authUserProfile?.role === 'admin';
    const { data: adminStats } = useFetchAdminStatistics(!!isAdmin);

    const subscribeFacultyMutation = useSubscribeFaculty(facultiesData?.faculties[0].id);
    const unsubscribeFacultyMutation = useUnsubscribeFaculty(facultiesData?.faculties[0].id);
    
    useEffect(() => {
        const fetchSuggestion = async () => {
            try {
                setIsLoading(true);
                console.log('🚀 Fetching suggestions...');
                console.log('📍 Full URL:', `${process.env.EXPO_PUBLIC_API_URL}${API_GET_SUGGESTIONS}`);
                
                const response = await api.get(API_GET_SUGGESTIONS);
                
                console.log('📦 Full API Response:', JSON.stringify(response.data, null, 2));
                console.log('📦 Response status:', response.status);
                console.log('📦 Response headers:', response.headers);
                    
                const rawData = response.data?.data;
                const documents: Suggestion[] = Array.isArray(rawData)
                  ? rawData
                  : (rawData?.documents ?? []);
                
                console.log('📄 Documents:', documents);
                console.log('📄 Documents count:', documents.length);
                
                if (documents.length === 0) {
                  console.log('⚠️ No documents from API, using fallback');
                  setSuggestDoc(fallbackSuggestDoc);
                  return;
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
                console.log("faculties", faculties);
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

    useEffect(() => {
        if (faculties.length === 0) return;
      
        let cancelled = false;
      
        (async () => {
          setLoadingFacultyDocs(true);
          try {
            const pairs = await Promise.all(
              faculties.map(async (f: any) => {
                const res = await api.get(`${API_GET_INFORMATION_FACULTY}/${f.id}`);
                const info = res.data?.data;
      
                // API faculty trả về subjects[], mỗi subject có documents[]
                const docs = (info?.subjects ?? [])
                  .flatMap((s: any) => s?.documents ?? [])
                  .slice(0, 6);
      
                return [f.id, docs] as const;
              })
            );
      
            if (!cancelled) {
              setDocsByFaculty(Object.fromEntries(pairs));
            }
          } finally {
            if (!cancelled) setLoadingFacultyDocs(false);
          }
        })();
      
        return () => {
          cancelled = true;
        };
      }, [faculties]);
  

    return (
    <ScrollView className="flex-1 !bg-white dark:!bg-dark-900 pt-14">
      <View>

          {/*Profile người dùng*/}
          <View className="flex flex-row items-center mx-6 mt-6">
              <View className="flex flex-row gap-3 items-center">
                <Image 
                source={userProfile?.imageUrl ? { uri: userProfile.imageUrl } : avatar}
                width={50} 
                height={50} 
                borderRadius={100} 
                className="shadow-md" 
                resizeMode={'cover'} 
                alt="User Avatar"
                />
                  <View>
                      <Text className="font-medium">
                          Xin chào,
                      </Text>
                      {isLoadingUser ? (
                          <View style={{ height: 30 }} />
                      ) : userProfile?.name ? (
                          <Text style={{
                              fontSize: 24,
                              lineHeight: 30,
                              fontFamily: "Gilroy-Bold"
                          }}>
                              {userProfile.name.toUpperCase()}
                          </Text>
                      ) : null}
                  </View>
              </View>
          </View>
          {/*Thao tác nhanh*/}
          <View className="flex flex-row mx-2 mt-6">
            <Pressable
              className="flex-1 flex flex-col items-center"
              onPress={() => router.push(ROUTES.SEARCH)}
            >
              <View className="flex-1 flex flex-col items-center">
                <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                  <Ionicons name="search-outline" size={32} color="#FF3300" />
                </View>
                <Text className="!text-lg !font-medium mt-1 text-center max-w-24">Tìm kiếm</Text>
              </View>
            </Pressable>

            <Pressable
              className="flex-1 flex flex-col items-center"
              onPress={() => router.push(ROUTES.FOLLOWING)}
            >
              <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                <Ionicons name="heart-outline" size={32} color="#FF3300" />
              </View>
              <Text className="!text-lg !font-medium mt-1 text-center max-w-24">Đã theo dõi</Text>
            </Pressable>

            <Pressable
              className="flex-1 flex flex-col items-center"
              onPress={() => router.push(ROUTES.SAVED_DOC as any)}
            >
              <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                <Ionicons name="briefcase-outline" size={32} color="#FF3300" />
              </View>
              <Text className="!text-lg !font-medium mt-1 text-center max-w-24">Tài liệu đã lưu</Text>
            </Pressable>

            <Pressable
              className="flex-1 flex flex-col items-center"
              onPress={() => router.push(ROUTES.CHATBOT)}
            >
              <View className="w-[64px] aspect-square bg-primary-50 rounded-2xl flex justify-center items-center">
                <Ionicons name="chatbox-outline" size={32} color="#FF3300" />
              </View>
              <Text className="!text-lg !font-medium mt-1 text-center max-w-24">Chatbot AI</Text>
            </Pressable>
          </View>

          {isAdmin && (
            <View
              className="bg-white dark:!bg-dark-800 rounded-2xl p-4 mx-6 mt-6 flex flex-row shadow-md items-center"
            >
              <Pressable 
                className="flex-1 flex flex-col items-center justify-center gap-1"
                onPress={() => router.push(ROUTES.ADMIN_MEMBER_MANAGEMENT)}
              >
                <View className="flex flex-row items-center gap-2">
                  <Ionicons name="people-outline" size={24} color="#FF3300" />
                  <Text className="!text-lg !font-medium">Thành viên</Text>
                </View>
                <Text className="!text-2xl !font-semibold !text-gray-700">
                  {adminStats?.totalUsers ?? 0}
                </Text>
              </Pressable>
              <View className="w-px h-12 bg-gray-200 dark:bg-dark-600" />
              <Pressable 
                className="flex-1 flex flex-col items-center justify-center gap-1"
                onPress={() => router.push(ROUTES.ADMIN_DOCUMENT_MANAGEMENT)}
              >
                <View className="flex flex-row items-center gap-2">
                  <Ionicons name="checkmark-circle-outline" size={24} color="#FF3300" />
                  <Text className="!text-lg !font-medium">Tài liệu duyệt</Text>
                </View>
                <Text className="!text-2xl !font-semibold !text-gray-700">
                  +{adminStats?.pendingDocuments ?? 0}
                </Text>
              </Pressable>
            </View>
          )}

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
                        <SuggestCard id={item.id.toString()} title={item.title} image={item.image} subject={item.subject} downloadCount={item.downloadCount} uploadDate={item.uploadDate} type={item.type} />
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
            {faculties.map((faculty: any) => (
                <FacultySection key={faculty.id} facultyId={faculty.id} fallbackName={faculty.name} />
            ))}
              <ScrollView horizontal={false} style={{paddingVertical:15, paddingHorizontal:22}} showsVerticalScrollIndicator={false}>

              </ScrollView>
          </View>
          <View className='h-32'></View>
      </View>
    </ScrollView>
  );
}


