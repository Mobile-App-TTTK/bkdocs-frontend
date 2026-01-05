import { api } from '@/api/apiClient';
import {
    useApproveDocument,
    useBanUser,
    useFetchAdminStatistics,
    useFetchAdminUsers,
    useFetchPendingDocuments,
    useRejectDocument,
    useUnbanUser
} from '@/components/Admin/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock api client
jest.mock('@/api/apiClient', () => ({
    api: {
        get: jest.fn(),
        patch: jest.fn(),
    },
}));

// Mock API routes to return strings/functions as expected by the hooks 
// (Ensure these match what's used in the actual file if they are imported directly)
// Actually we import them from '@/api/apiRoutes' in the source, so we should rely on their real values or mock them if needed. 
// But the hooks import them from existing file. We don't need to mock routes if they are constants.

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false, // Disable retries for testing
            },
        },
    });
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
};

describe('Admin Hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useFetchAdminStatistics', () => {
        it('should fetch admin statistics', async () => {
            const mockData = { totalUsers: 10, pendingDocuments: 5 };
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const { result } = renderHook(() => useFetchAdminStatistics(true), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual(mockData);
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining('statistics')); // Use simpler match or import constant if possible
        });
    });

    describe('useFetchAdminUsers', () => {
        it('should fetch admin users', async () => {
            const mockData = [{ id: '1', name: 'User' }];
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const { result } = renderHook(() => useFetchAdminUsers(), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual(mockData);
        });
    });

    describe('useBanUser', () => {
        it('should ban user and invalidate queries', async () => {
            (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
            const queryClient = new QueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            const { result } = renderHook(() => useBanUser(), { wrapper });

            await result.current.mutateAsync('user-1');

            expect(api.patch).toHaveBeenCalledWith(expect.stringContaining('user-1'), expect.objectContaining({ banStatus: 'BANNED' }));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-users'] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-statistics'] });
        });
    });

    describe('useUnbanUser', () => {
        it('should unban user and invalidate queries', async () => {
            (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
            const queryClient = new QueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            const { result } = renderHook(() => useUnbanUser(), { wrapper });

            await result.current.mutateAsync('user-1');

            expect(api.patch).toHaveBeenCalledWith(expect.stringContaining('user-1'), expect.objectContaining({ banStatus: 'NONE' }));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-users'] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-statistics'] });
        });
    });

    describe('useFetchPendingDocuments', () => {
        it('should fetch pending documents and handle next page', async () => {
            // Mock page 1 response
            (api.get as jest.Mock).mockResolvedValue({
                data: {
                    data: {
                        data: [{ id: '1' }],
                        total: 20,
                        page: '1',
                        totalPages: 2,
                    }
                }
            });

            const { result } = renderHook(() => useFetchPendingDocuments('search'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data?.pages[0].data).toHaveLength(1);
            expect(result.current.hasNextPage).toBe(true);

            // Test getNextPageParam logic by checking what fetchNextPage does
            // But simpler: getNextPageParam is internal. 
            // If we call fetchNextPage, it should call api with page 2

            // Mock page 2 response
            (api.get as jest.Mock).mockResolvedValue({
                data: {
                    data: {
                        data: [{ id: '2' }],
                        total: 20,
                        page: '2',
                        totalPages: 2,
                    }
                }
            });

            await result.current.fetchNextPage();

            await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));
            expect(api.get).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ params: expect.objectContaining({ page: 2 }) }));

            // Now hasNextPage should be false (page 2 >= totalPages 2 - assuming comparison logic)
            // code: currentPage < totalPages ? currentPage + 1 : undefined
            // page 2 < 2 is false. So undefined.
            expect(result.current.hasNextPage).toBe(false);
        });
    });

    describe('useApproveDocument', () => {
        it('should approve document and invalidate queries', async () => {
            (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
            const queryClient = new QueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            const { result } = renderHook(() => useApproveDocument(), { wrapper });

            await result.current.mutateAsync('doc-1');

            expect(api.patch).toHaveBeenCalledWith(expect.stringContaining('doc-1'), expect.objectContaining({ status: 'active' }));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-pending-documents'] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-statistics'] });
        });
    });

    describe('useRejectDocument', () => {
        it('should reject document and invalidate queries', async () => {
            (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
            const queryClient = new QueryClient();
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const wrapper = ({ children }: { children: React.ReactNode }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            );

            const { result } = renderHook(() => useRejectDocument(), { wrapper });

            await result.current.mutateAsync('doc-1');

            expect(api.patch).toHaveBeenCalledWith(expect.stringContaining('doc-1'), expect.objectContaining({ status: 'inactive' }));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-pending-documents'] });
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['admin-statistics'] });
        });
    });

});
