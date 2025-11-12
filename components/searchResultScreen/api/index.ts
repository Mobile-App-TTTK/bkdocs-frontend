import { api } from "@/api/apiClient";
import { API_GET_FACULTIES_AND_SUBJECTS, API_GET_SEARCH_RESULT } from "@/api/apiRoutes";
import { FacultyAndSubject, FilterOptions, SearchResult } from "@/models/search.type";
import { useQuery } from "@tanstack/react-query";

export const fetchSearchResult = async (
  keyword: string,
  filters: FilterOptions = {},
  searchFor: string = 'all'
) => {
  const params = {
    keyword,
    searchFor,
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v != null && v !== '')
    ),
  };

  console.log("params", params);

  const { data } = await api.get(API_GET_SEARCH_RESULT, { params });
  return data.data;
};


export const useFetchSearchResult = (query: string, filters?: FilterOptions, searchFor?: string) => {
  return useQuery<SearchResult>({
    queryKey: ["search-result", query, filters, searchFor],
    queryFn: () => fetchSearchResult(query, filters, searchFor),
    enabled: !!query && query.trim().length > 0
  });
};

export const fetchFacultiesAndSubjects = async () => {
  const res = await api.get(API_GET_FACULTIES_AND_SUBJECTS);
  return res.data.data;
};

export const useFetchFacultiesAndSubjects = () => {
  return useQuery<FacultyAndSubject>({
    queryKey: ["faculties-and-subjects"],
    queryFn: fetchFacultiesAndSubjects,
  });
};