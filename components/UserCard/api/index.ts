import { api } from "@/api/apiClient";
import { API_TOGGLE_FOLLOW_USER } from "@/api/apiRoutes";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const toggleFollowUser = async (userId: string) => {
  const res = await api.patch(`${API_TOGGLE_FOLLOW_USER}/${userId}/followers`);
  return res.data;
};

export const useToggleFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => toggleFollowUser(userId),
    onSuccess: () => {
      // Invalidate search results, user profile, and follow list queries
      queryClient.invalidateQueries({ queryKey: ["search-result"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["follow-list"] });
    },
  });
};
