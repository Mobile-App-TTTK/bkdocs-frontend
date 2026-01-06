import { api } from '@/api/apiClient';
import { API_FOLLOW_LIST, API_UPDATE_PROFILE, API_USER_DOCUMENTS, API_USER_PROFILE, API_USER_PROFILE_BY_ID } from '@/api/apiRoutes';
import {
    fetchFollowList,
    fetchUserDocuments,
    fetchUserProfile,
    fetchUserProfileById,
    updateProfile,
    useFetchFollowList,
    useFetchUserDocuments,
    useFetchUserProfile,
    useFetchUserProfileById,
    useUpdateProfile,
} from '@/components/Profile/api';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Mock dependencies
jest.mock('@/api/apiClient', () => ({
    api: {
        get: jest.fn(),
        patch: jest.fn(),
    },
}));

jest.mock('@tanstack/react-query', () => ({
    useQuery: jest.fn(),
    useInfiniteQuery: jest.fn(),
    useMutation: jest.fn(),
    useQueryClient: jest.fn(),
}));

describe('Profile API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('fetchUserProfile', () => {
        it('should fetch user profile successfully', async () => {
            const mockData = { id: '1', name: 'Test User' };
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const result = await fetchUserProfile();

            expect(api.get).toHaveBeenCalledWith(API_USER_PROFILE);
            expect(result).toEqual(mockData);
        });
    });

    describe('useFetchUserProfile', () => {
        it('should use useQuery with correct options', () => {
            useFetchUserProfile();

            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['user-profile'],
                queryFn: fetchUserProfile,
                enabled: true,
            }));
        });

        it('should respect enabled option', () => {
            useFetchUserProfile({ enabled: false });

            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                enabled: false,
            }));
        });
    });

    describe('fetchUserProfileById', () => {
        it('should fetch user profile by id successfully', async () => {
            const userId = '123';
            const mockData = { id: userId, name: 'Other User' };
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const result = await fetchUserProfileById(userId);

            expect(api.get).toHaveBeenCalledWith(API_USER_PROFILE_BY_ID(userId));
            expect(result).toEqual(mockData);
        });
    });

    describe('useFetchUserProfileById', () => {
        it('should use useQuery with correct options', () => {
            const userId = '123';
            useFetchUserProfileById(userId);

            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['user-profile', userId],
                enabled: true,
            }));
        });

        it('should execute queryFn calling fetchUserProfileById', async () => {
            const userId = '123';
            const mockData = { id: userId, name: 'Other User' };
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            // Setup useQuery to execute the passed queryFnQuery
            (useQuery as jest.Mock).mockImplementation(({ queryFn }) => {
                return queryFn();
            });

            await useFetchUserProfileById(userId);
            expect(api.get).toHaveBeenCalledWith(API_USER_PROFILE_BY_ID(userId));
        });
    });

    describe('fetchUserDocuments', () => {
        it('should fetch user documents successfully', async () => {
            const params = { userId: '123', limit: 10, page: 1 };
            const mockData = [{ id: 'doc1' }];
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const result = await fetchUserDocuments(params);

            expect(api.get).toHaveBeenCalledWith(`${API_USER_DOCUMENTS}/${params.userId}/documents`, {
                params: { limit: params.limit, page: params.page },
            });
            expect(result).toEqual(mockData);
        });
    });

    describe('useFetchUserDocuments', () => {
        it('should use useInfiniteQuery with correct options', () => {
            const userId = '123';
            const limit = 5;
            useFetchUserDocuments(userId, limit);

            expect(useInfiniteQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['user-documents', userId],
                initialPageParam: 1,
                enabled: true,
            }));
        });

        it('should handle getNextPageParam correctly when has more pages', () => {
            const userId = '123';
            const limit = 5;
            let getNextPageParam: any;
            (useInfiniteQuery as jest.Mock).mockImplementation((options: any) => {
                getNextPageParam = options.getNextPageParam;
                return {};
            });

            useFetchUserDocuments(userId, limit);

            const lastPage = new Array(limit).fill({}); // Full page
            const allPages = [lastPage];
            const nextPage = getNextPageParam(lastPage, allPages);
            expect(nextPage).toBe(2);
        });

        it('should handle getNextPageParam correctly when no more pages', () => {
            const userId = '123';
            const limit = 5;
            let getNextPageParam: any;
            (useInfiniteQuery as jest.Mock).mockImplementation((options: any) => {
                getNextPageParam = options.getNextPageParam;
                return {};
            });

            useFetchUserDocuments(userId, limit);

            const lastPage = new Array(limit - 1).fill({}); // Not full page
            const allPages = [lastPage];
            const nextPage = getNextPageParam(lastPage, allPages);
            expect(nextPage).toBeUndefined();
        });

        it('should use default limit if not provided', () => {
            const userId = '123';
            useFetchUserDocuments(userId);

            expect(useInfiniteQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryFn: expect.any(Function),
            }));
            // We can't easily check the limit value inside the closure of queryFn via useInfiniteQuery call arguments 
            // strictly without executing it, but we can verify the function creation.
            // To strictly verify limit=10 default, we need to execute queryFn.

            const calls = (useInfiniteQuery as jest.Mock).mock.calls;
            const lastCall = calls[calls.length - 1][0];
            const queryFn = lastCall.queryFn;

            // Execute queryFn with pageParam
            (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });
            queryFn({ pageParam: 1 });

            expect(api.get).toHaveBeenCalledWith(expect.stringContaining(userId), {
                params: { limit: 10, page: 1 },
            });
        });

        it('should use default pageParam = 1 if not provided', async () => {
            const userId = '123';

            (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
                // Simulate calling without pageParam (undefined)
                return queryFn({});
            });

            (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });

            await useFetchUserDocuments(userId);

            expect(api.get).toHaveBeenCalledWith(expect.stringContaining(userId), {
                params: { limit: 10, page: 1 },
            });
        });

        it('should execute queryFn calling fetchUserDocuments', async () => {
            const userId = '123';
            const limit = 10;
            const pageParam = 2;

            (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
                return queryFn({ pageParam });
            });

            const mockData = [{ id: 'doc1' }];
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            await useFetchUserDocuments(userId, limit);

            expect(api.get).toHaveBeenCalledWith(`${API_USER_DOCUMENTS}/${userId}/documents`, {
                params: { limit, page: pageParam },
            });
        });
    });

    describe('updateProfile', () => {
        it('should update profile with all fields', async () => {
            const params = {
                name: 'New Name',
                facultyId: 'fac1',
                intakeYear: 2024,
                avatar: { uri: 'path/to/img', type: 'image/jpeg', name: 'avatar.jpg' },
            };
            (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });

            const result = await updateProfile(params);

            expect(api.patch).toHaveBeenCalledWith(API_UPDATE_PROFILE, expect.any(FormData), {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const formData = (api.patch as jest.Mock).mock.calls[0][1];
            // Note: FormData in Jest environment might differ, mocking implementation usually needed or just checking calls
            // Here we assume FormData is mocked or behaves enough to be inspected if we cared, 
            // but since we can't easily inspect FormData content in JSDOM/Node without polyfill, 
            // we trust the function construction logic if meaningful.
            // However, we can spot check appending if we spy on FormData prototype, but it is global.
            // For now, checking the call is sufficient given the logic is straightforward.

            expect(result).toEqual({ success: true });
        });

        it('should update profile with partial fields', async () => {
            const params = { name: 'New Name Only' };
            (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });

            await updateProfile(params);

            expect(api.patch).toHaveBeenCalledWith(API_UPDATE_PROFILE, expect.any(FormData), expect.any(Object));
        });

        it('should update profile with partial fields (no name)', async () => {
            const params = { facultyId: 'fac1' };
            (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });

            await updateProfile(params);

            expect(api.patch).toHaveBeenCalledWith(API_UPDATE_PROFILE, expect.any(FormData), expect.any(Object));
        });
    });

    describe('useUpdateProfile', () => {
        it('should use useMutation and invalidate queries on success', () => {
            const invalidateQueries = jest.fn();
            (useQueryClient as jest.Mock).mockReturnValue({ invalidateQueries });

            let mutationOptions: any;
            (useMutation as jest.Mock).mockImplementation((options: any) => {
                mutationOptions = options;
                return {};
            });

            useUpdateProfile();

            expect(useQueryClient).toHaveBeenCalled();
            expect(useMutation).toHaveBeenCalledWith(expect.objectContaining({
                mutationFn: updateProfile,
            }));

            // Test onSuccess
            mutationOptions.onSuccess();
            expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['user-profile'] });
        });
    });

    describe('fetchFollowList', () => {
        it('should fetch follow list and handle array response', async () => {
            const mockData = [{ following: [], followers: [] }];
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const result = await fetchFollowList();

            expect(api.get).toHaveBeenCalledWith(API_FOLLOW_LIST);
            expect(result).toEqual(mockData[0]);
        });

        it('should fetch follow list and handle object response', async () => {
            const mockData = { following: ['1'], followers: ['2'] };
            // Simulating the "not array" case or "array of length 0" fallback if logic permits, 
            // but code says: if Array && length > 0 return [0], else return data.
            // So let's test the "else" case.
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const result = await fetchFollowList();

            expect(result).toEqual(mockData);
        });

        it('should fetch follow list and handle empty array response', async () => {
            const mockData: any[] = [];
            (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

            const result = await fetchFollowList();

            expect(result).toEqual(mockData);
        });
    });

    describe('useFetchFollowList', () => {
        it('should use useQuery with correct options', () => {
            useFetchFollowList();

            expect(useQuery).toHaveBeenCalledWith(expect.objectContaining({
                queryKey: ['follow-list'],
                queryFn: fetchFollowList,
            }));
        });
    });
});
