import { api } from "@/api/apiClient";
import { API_ADMIN_DOCUMENT_STATUS, API_ADMIN_MEMBER_BAN_STATUS, API_ADMIN_MEMBERS, API_ADMIN_PENDING_DOCUMENTS, API_ADMIN_STATISTICS } from "@/api/apiRoutes";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type AdminStatistics = {
  totalUsers: number;
  pendingDocuments: number;
};

export const fetchAdminStatistics = async (): Promise<AdminStatistics> => {
  const res = await api.get(API_ADMIN_STATISTICS);
  const data = res.data?.data ?? {};
  return {
    totalUsers: data.totalUsers ?? 0,
    pendingDocuments: data.pendingDocuments ?? 0,
  };
};

export const useFetchAdminStatistics = (enabled: boolean) => {
  return useQuery<AdminStatistics>({
    queryKey: ["admin-statistics"],
    queryFn: fetchAdminStatistics,
    enabled,
  });
};

export type AdminUser = {
  id: string;
  name: string;
  isBanned: boolean;
  followerCount: number;
  uploadedDocumentsCount: number;
};

export const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const res = await api.get(API_ADMIN_MEMBERS);
  const data = res.data?.data ?? [];
  return Array.isArray(data) ? data : [];
};

export const useFetchAdminUsers = () => {
  return useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });
};

export const banUser = async (userId: string) => {
  const res = await api.patch(API_ADMIN_MEMBER_BAN_STATUS(userId), {
    banStatus: "BANNED",
  });
  return res.data;
};

export const unbanUser = async (userId: string) => {
  const res = await api.patch(API_ADMIN_MEMBER_BAN_STATUS(userId), {
    banStatus: "NONE",
  });
  return res.data;
};

export const useBanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: banUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unbanUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
    },
  });
};

export type PendingDocumentUploader = {
  id: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
};

export type PendingDocument = {
  id: string;
  title: string;
  description: string | null;
  faculties: string[];
  subject: string;
  uploader: PendingDocumentUploader;
  thumbnailUrl: string;
  downloadUrl: string;
  uploadDate: string;
};

export type PendingDocumentsResponse = {
  data: PendingDocument[];
  total: number;
  page: string;
  totalPages: number;
};

export const fetchPendingDocuments = async ({
  page = 1,
  limit = 10,
  fullTextSearch,
}: {
  page?: number;
  limit?: number;
  fullTextSearch?: string;
}): Promise<PendingDocumentsResponse> => {
  const res = await api.get(API_ADMIN_PENDING_DOCUMENTS, {
    params: {
      page,
      limit,
      ...(fullTextSearch && { fullTextSearch }),
    },
  });
  return res.data?.data ?? { data: [], total: 0, page: "1", totalPages: 0 };
};

export const useFetchPendingDocuments = (fullTextSearch?: string) => {
  return useInfiniteQuery<PendingDocumentsResponse>({
    queryKey: ["admin-pending-documents", fullTextSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchPendingDocuments({
        page: pageParam as number,
        limit: 10,
        fullTextSearch,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = parseInt(lastPage.page);
      const totalPages = lastPage.totalPages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
  });
};

export const approveDocument = async (docId: string) => {
  const res = await api.patch(API_ADMIN_DOCUMENT_STATUS(docId), {
    status: "ACTIVE"
  });
  return res.data;
};

export const rejectDocument = async (docId: string) => {
  const res = await api.patch(API_ADMIN_DOCUMENT_STATUS(docId), {
    status: "INACTIVE"
  });
  return res.data;
};

export const useApproveDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
    },
  });
};

export const useRejectDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: rejectDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] });
    },
  });
};


