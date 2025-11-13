import { api } from "@/api/apiClient";
import { API_SUGGEST_KEYWORDS, API_SUGGEST_SUBJECTS } from "@/api/apiRoutes";
import { SuggestioSubject } from "@/models/search.type";
import { useQuery } from "@tanstack/react-query";

export const getSuggestions = async (): Promise<SuggestioSubject[]> => {
  try {
    const res = await api.get(API_SUGGEST_SUBJECTS);
    const raw = res?.data?.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }
};

export const useGetSuggestions = () => {
  return useQuery<SuggestioSubject[]>({
    queryKey: ["suggestions-subjects"],
    queryFn: getSuggestions,
  });
};

export const getSuggestionsKeyword = async (keyword?: string): Promise<string[]> => {
  try {
    const res = await api.get(API_SUGGEST_KEYWORDS, {
      params: {
        keyword,
      },
    });
    const raw = res?.data?.data;
    return Array.isArray(raw) ? raw : [];
  } catch (error) {
    console.error('Error fetching suggestions keyword:', error);
    return [];
  }
};

export const useGetSuggestionsKeyword = (keyword?: string) => {
  return useQuery<string[]>({
    queryKey: ["suggestions-keyword", keyword],
    queryFn: () => getSuggestionsKeyword(keyword),
    enabled: !!keyword && keyword.trim().length > 0
  });
};
