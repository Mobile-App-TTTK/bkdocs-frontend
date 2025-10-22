import { api } from "@/api/apiClient";
import { API_GET_SUGGESTIONS } from "@/api/apiRoutes";
import { Suggestion } from "@/models/search.type";
import { useQuery } from "@tanstack/react-query";

export const getSuggestions = async () => {
  const res = await api.get(API_GET_SUGGESTIONS);
  return res.data.data.documents;
};

export const useGetSuggestions = () => {
  return useQuery<Suggestion[]>({
    queryKey: ["suggestions"],
    queryFn: getSuggestions,
  });
};
