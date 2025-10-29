import { api } from "@/api/apiClient";
import { API_GET_SUGGESTIONS, API_SUGGEST_KEYWORDS } from "@/api/apiRoutes";
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

export const getSuggestionsKeyword = async (keyword?: string) => {
  const res = await api.get(API_SUGGEST_KEYWORDS, {
    params: {
      keyword,
    },
  });
  return res.data.data;
};

export const useGetSuggestionsKeyword = (keyword?: string) => {
  return useQuery<string[]>({
    queryKey: ["suggestions-keyword", keyword],
    queryFn: () => getSuggestionsKeyword(keyword),
    enabled: !!keyword && keyword.trim().length > 0
  });
};
