
import { renderHook, waitFor } from '@testing-library/react-native';
import { api } from '@/api/apiClient';
import { fetchFacultyInfo, subscribeFaculty, unsubscribeFaculty, subscribeSubject, unsubscribeSubject, useFetchFacultyInfo, useSubscribeFaculty, useUnsubscribeFaculty, useSubscribeSubject, useUnsubscribeSubject } from '@/components/FacultyScreen/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock API client
jest.mock('@/api/apiClient', () => ({
    api: {
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
    },
}));

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client= { queryClient } > { children } </QueryClientProvider>
);

describe('FacultyScreen API Hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        queryClient.clear();
    });

    describe('fetchFacultyInfo', () => {
        it('calls api.get with correct url', async () => {
            (api.get as jest.Mock).mockResolvedValue({ data: { data: { id: 'f1' } } });
            const res = await fetchFacultyInfo('f1');
            expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/f1'));
            expect(res).toEqual({ id: 'f1' });
        });
    });

    describe('useFetchFacultyInfo', () => {
        it('fetches faculty info successfully', async () => {
            (api.get as jest.Mock).mockResolvedValue({ data: { data: { id: 'f1', name: 'Faculty' } } });

            const { result } = renderHook(() => useFetchFacultyInfo('f1'), { wrapper });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(result.current.data).toEqual({ id: 'f1', name: 'Faculty' });
        });

        it('does not fetch if id is undefined', async () => {
            const { result } = renderHook(() => useFetchFacultyInfo(undefined), { wrapper });
            expect(result.current.isLoading).toBe(false); // Should stay like this or be pending but disabled
            expect(result.current.isFetching).toBe(false);
            expect(api.get).not.toHaveBeenCalled();
        });
    });

    describe('useSubscribeFaculty', () => {
        it('calls api.post and invalidates queries on success', async () => {
            (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useSubscribeFaculty('f1'), { wrapper });

            await result.current.mutateAsync('f1');

            expect(api.post).toHaveBeenCalledWith(expect.stringMatching(/\/f1\/subscription/));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['faculty-info', 'f1'] });
        });
    });

    describe('useUnsubscribeFaculty', () => {
        it('calls api.delete and invalidates queries on success', async () => {
            (api.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useUnsubscribeFaculty('f1'), { wrapper });

            await result.current.mutateAsync('f1');

            expect(api.delete).toHaveBeenCalledWith(expect.stringMatching(/\/f1\/subscription/));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['faculty-info', 'f1'] });
        });
    });

    describe('useSubscribeSubject', () => {
        it('calls api.post and invalidates queries on success', async () => {
            (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useSubscribeSubject(), { wrapper });

            await result.current.mutateAsync('s1');

            expect(api.post).toHaveBeenCalledWith(expect.stringMatching(/\/s1\/subscription/));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['faculty-info'] });
        });
    });

    describe('useUnsubscribeSubject', () => {
        it('calls api.delete and invalidates queries on success', async () => {
            (api.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
            const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useUnsubscribeSubject(), { wrapper });

            await result.current.mutateAsync('s1');

            expect(api.delete).toHaveBeenCalledWith(expect.stringMatching(/\/s1\/subscription/));
            expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['faculty-info'] });
        });
    });
});
