import { api } from "@/api/apiClient";
import { API_GET_INFORMATION_SUBJECT, API_SUBSCRIBE_SUBJECT, API_UNSUBSCRIBE_SUBJECT } from "@/api/apiRoutes";
import { SubjectInfo } from "@/models/subject.type";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const fetchSubjectInfo = async (subjectId: string) => {
  const res = await api.get(`${API_GET_INFORMATION_SUBJECT}/${subjectId}`);
  return res.data.data;
};

export const useFetchSubjectInfo = (subjectId: string | undefined) => {
  return useQuery<SubjectInfo>({
    queryKey: ["subject-info", subjectId],
    queryFn: () => fetchSubjectInfo(subjectId!),
    enabled: !!subjectId,
  });
};

export const subscribeSubject = async (subjectId: string) => {
  const res = await api.post(`${API_SUBSCRIBE_SUBJECT}/${subjectId}/subscription`);
  return res.data;
};

export const unsubscribeSubject = async (subjectId: string) => {
  const res = await api.delete(`${API_UNSUBSCRIBE_SUBJECT}/${subjectId}/subscription`);
  return res.data;
};

export const useSubscribeSubject = (subjectId: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => subscribeSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-info", subjectId] });
    },
  });
};

export const useUnsubscribeSubject = (subjectId: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => unsubscribeSubject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject-info", subjectId] });
    },
  });
};
