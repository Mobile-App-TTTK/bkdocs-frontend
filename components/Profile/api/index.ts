import { api } from "@/api/apiClient";
import { API_UPDATE_PROFILE, API_USER_DOCUMENTS, API_USER_PROFILE } from "@/api/apiRoutes";
import { UserDocument } from "@/models/document.type";
import { UserProfile } from "@/models/user.type";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const fetchUserProfile = async () => {
  const res = await api.get(API_USER_PROFILE);
  return res.data.data;
};

export const useFetchUserProfile = () => {
  return useQuery<UserProfile>({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
  });
};

interface FetchUserDocumentsParams {
  userId: string;
  limit: number;
  page: number;
}

export const fetchUserDocuments = async ({ userId, limit, page }: FetchUserDocumentsParams) => {
  const res = await api.get(`${API_USER_DOCUMENTS}/${userId}/documents`, {
    params: { limit, page }
  });
  return res.data.data;
};

export const useFetchUserDocuments = (userId: string, limit: number = 10) => {
  return useInfiniteQuery<UserDocument[], Error>({
    queryKey: ["user-documents", userId],
    queryFn: ({ pageParam = 1 }) => 
      fetchUserDocuments({ userId, limit, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length + 1 : undefined;
    },
    enabled: !!userId, // Only fetch when userId is available
  });
};

interface UpdateProfileParams {
  name?: string;
  facultyId?: string;
  intakeYear?: number;
  avatar?: {
    uri: string;
    type: string;
    name: string;
  };
}

export const updateProfile = async (data: UpdateProfileParams) => {
  const formData = new FormData();
  
  if (data.name) {
    formData.append('name', data.name);
  }
  
  if (data.facultyId) {
    formData.append('facultyId', data.facultyId);
  }
  
  if (data.intakeYear) {
    formData.append('intakeYear', data.intakeYear.toString());
  }
  
  if (data.avatar) {
    formData.append('avatar', {
      uri: data.avatar.uri,
      type: data.avatar.type,
      name: data.avatar.name,
    } as any);
  }
  
  const res = await api.patch(API_UPDATE_PROFILE, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
};
