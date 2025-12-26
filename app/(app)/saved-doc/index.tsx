import { api } from "@/api/apiClient";
import { API_GET_DOCUMENT_DETAIL } from "@/api/apiRoutes";
import { useFetchUserProfile } from "@/components/Profile/api";
import SavedDocCard from "@/components/ui/saved-doc-card";
import { UserDocument } from "@/models/document.type";
import { downloadedDocsStorage } from "@/utils/downloadDocStorage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "native-base";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";

type ApiDownloadedDoc = {
    id: string;
    title: string;
    uploadDate: string;
    subject: string;
    thumbnailUrl: string;
    type: string;
}

export default function SavedDoc() {
    const router = useRouter();

    const [scroll, setScroll] = useState(false);
    const [downloadedDocs, setDownloadedDocs] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(false);

    const {data: userProfile, isLoading: isLoadingUserProfile, error: errorUserProfile} = useFetchUserProfile();

    useEffect(() => {
        let cancelled = false;

        const fetchDownloadedDocs = async () => {
            try {
                setLoading(true);
                
                const docIds = await downloadedDocsStorage.getDownloadedDocIds();
                
                const docsPromises = docIds.map(async (id) => {
                    try {
                        const res = await api.get(API_GET_DOCUMENT_DETAIL(id));
                        return res.data?.data;
                    } catch (error) {
                        console.error(`Error fetching doc ${id}:`, error);
                        return null;
                    }
                });

                const docs = await Promise.all(docsPromises);
                
                if (!cancelled) {
                    setDownloadedDocs(docs.filter(Boolean));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchDownloadedDocs();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <View className="flex-1 bg-white dark:!bg-gray-900">
            <View className="flex items-center justify-center relative !pt-[64px] bg-white dark:!bg-gray-700 "
                  style={{
                      shadowColor: "#000",
                      shadowOffset: {
                          width: 0,
                          height: 2,
                      },
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
                <Text className="!text-2xl !font-bold mb-4">Danh sách tài liệu</Text>
            </View>

            <ScrollView className="p-6">
                <View className="flex flex-col gap-6 mb-8">
                    {
                        downloadedDocs.map((doc) => (
                            <SavedDocCard key={doc.id} id={doc.id} title={doc.title} uploadDate={doc.uploadDate} subject={doc.subject} thumbnailUrl={doc.thumbnailUrl} type={doc.documentType} />
                        ))
                    }
                </View>
            </ScrollView>
        </View>
    )
}
