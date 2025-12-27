import { api } from "@/api/apiClient";
import { API_TOGGLE_FOLLOW_USER } from "@/api/apiRoutes";
import { UserProfile } from "@/models/user.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const toggleFollowUser = async (userId: string) => {
  const res = await api.patch(`${API_TOGGLE_FOLLOW_USER}/${userId}/followers`);
  return res.data;
};

export const useToggleFollowUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: string) => toggleFollowUser(userId),
    onMutate: async (userId: string) => {
      await queryClient.cancelQueries({ queryKey: ["user-profile", userId] });
      
      const previousProfile = queryClient.getQueryData<UserProfile>(["user-profile", userId]);
      
      queryClient.setQueryData<UserProfile>(["user-profile", userId], (old) => {
        if (!old) return old;
        return {
          ...old,
          isFollowed: !old.isFollowed,
          numberFollowers: old.isFollowed 
            ? Math.max(0, old.numberFollowers - 1)
            : old.numberFollowers + 1,
        };
      });
      
      return { previousProfile };
    },
    onError: (err, userId, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(["user-profile", userId], context.previousProfile);
      }
    },
    onSuccess: (data, userId) => {
      if (data?.data) {
        queryClient.setQueryData<UserProfile>(["user-profile", userId], (old) => {
          if (!old) return data.data as UserProfile;
          return {
            ...old,
            ...data.data,
          };
        });
      }
      queryClient.invalidateQueries({ queryKey: ["search-result"] });
      queryClient.invalidateQueries({ queryKey: ["follow-list"] });
    },
  });
};
