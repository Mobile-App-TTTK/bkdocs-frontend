import { api } from "@/api/apiClient";
import { API_TOGGLE_FOLLOW_USER } from "@/api/apiRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const toggleFollowUser = async (userId: string) => {
  const res = await api.post(`${API_TOGGLE_FOLLOW_USER}/${userId}/toggle-follow`);
  return res.data;
};

export const useToggleFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => toggleFollowUser(userId),
    onSuccess: () => {
      // Invalidate search results and user profile queries
      queryClient.invalidateQueries({ queryKey: ["search-result"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
};
