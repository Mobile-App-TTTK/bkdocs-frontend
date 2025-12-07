import { api } from "@/api/apiClient";
import { API_GET_INFORMATION_FACULTY, API_SUBSCRIBE_FACULTY, API_SUBSCRIBE_SUBJECT, API_UNSUBSCRIBE_FACULTY, API_UNSUBSCRIBE_SUBJECT } from "@/api/apiRoutes";
import { FacultyInfo } from "@/models/faculty.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const fetchFacultyInfo = async (facultyId: string) => {
  const res = await api.get(`${API_GET_INFORMATION_FACULTY}/${facultyId}`);
  return res.data.data;
};

export const useFetchFacultyInfo = (facultyId: string | undefined) => {
  return useQuery<FacultyInfo>({
    queryKey: ["faculty-info", facultyId],
    queryFn: () => fetchFacultyInfo(facultyId!),
    enabled: !!facultyId,
  });
};

export const subscribeFaculty = async (facultyId: string) => {
  const res = await api.post(`${API_SUBSCRIBE_FACULTY}/${facultyId}/subscription`);
  return res.data;
};

export const unsubscribeFaculty = async (facultyId: string) => {
  const res = await api.delete(`${API_UNSUBSCRIBE_FACULTY}/${facultyId}/subscription`);
  return res.data;
};

export const useSubscribeFaculty = (facultyId: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscribeFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-info", facultyId] });
    },
  });
};

export const useUnsubscribeFaculty = (facultyId: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => unsubscribeFaculty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-info", facultyId] });
    },
  });
};

export const subscribeSubject = async (subjectId: string) => {
  const res = await api.post(`${API_SUBSCRIBE_SUBJECT}/${subjectId}/subscription`);
  return res.data;
}

export const useSubscribeSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscribeSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-info"] });
    },
  });
}

export const unsubscribeSubject = async (subjectId: string) => {
  const res = await api.delete(`${API_UNSUBSCRIBE_SUBJECT}/${subjectId}/subscription`);
  return res.data;
}

export const useUnsubscribeSubject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => unsubscribeSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty-info"] });
    },
  });
}