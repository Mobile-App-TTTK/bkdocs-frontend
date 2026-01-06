import { api } from '@/api/apiClient';
import { API_FOLLOW_LIST, API_UPDATE_PROFILE, API_USER_DOCUMENTS, API_USER_PROFILE, API_USER_PROFILE_BY_ID } from '@/api/apiRoutes';
import {
    fetchFollowList,
    fetchUserDocuments,
    fetchUserProfile,
    fetchUserProfileById,
    updateProfile
} from '@/components/Profile/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Profile API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockProfile } });

      const result = await fetchUserProfile();

      expect(api.get).toHaveBeenCalledWith(API_USER_PROFILE);
      expect(result).toEqual(mockProfile);
    });

    it('should throw error on API failure', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      await expect(fetchUserProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('fetchUserProfileById', () => {
    it('should fetch user profile by ID successfully', async () => {
      const mockProfile = {
        id: 'user-123',
        name: 'Jane Doe',
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockProfile } });

      const result = await fetchUserProfileById('user-123');

      expect(api.get).toHaveBeenCalledWith(API_USER_PROFILE_BY_ID('user-123'));
      expect(result).toEqual(mockProfile);
    });

    it('should call correct API endpoint with user ID', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await fetchUserProfileById('abc-xyz');

      expect(api.get).toHaveBeenCalledWith('/users/abc-xyz/profile');
    });
  });

  describe('fetchUserDocuments', () => {
    it('should fetch user documents with pagination', async () => {
      const mockDocs = [
        { id: 'doc-1', title: 'Doc 1' },
        { id: 'doc-2', title: 'Doc 2' },
      ];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockDocs } });

      const result = await fetchUserDocuments({ 
        userId: 'user-1', 
        limit: 10, 
        page: 1 
      });

      expect(api.get).toHaveBeenCalledWith(`${API_USER_DOCUMENTS}/user-1/documents`, {
        params: { limit: 10, page: 1 },
      });
      expect(result).toEqual(mockDocs);
    });

    it('should fetch second page of documents', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });

      await fetchUserDocuments({ userId: 'user-1', limit: 5, page: 2 });

      expect(api.get).toHaveBeenCalledWith(`${API_USER_DOCUMENTS}/user-1/documents`, {
        params: { limit: 5, page: 2 },
      });
    });
  });

  describe('updateProfile', () => {
    it('should update profile with name only', async () => {
      (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });

      const result = await updateProfile({ name: 'New Name' });

      expect(api.patch).toHaveBeenCalledWith(
        API_UPDATE_PROFILE,
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual({ success: true });
    });

    it('should update profile with all fields', async () => {
      (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });

      await updateProfile({
        name: 'Test User',
        facultyId: 'faculty-1',
        intakeYear: 2022,
        avatar: {
          uri: 'file://avatar.jpg',
          type: 'image/jpeg',
          name: 'avatar.jpg',
        },
      });

      expect(api.patch).toHaveBeenCalled();
      const formData = (api.patch as jest.Mock).mock.calls[0][1];
      expect(formData).toBeInstanceOf(FormData);
    });

    it('should handle empty update data', async () => {
      (api.patch as jest.Mock).mockResolvedValue({ data: {} });

      const result = await updateProfile({});

      expect(api.patch).toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe('fetchFollowList', () => {
    it('should fetch follow list and return first item', async () => {
      const mockData = [{ 
        followedUsers: ['user1'], 
        subscribedFaculties: ['fac1'] 
      }];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

      const result = await fetchFollowList();

      expect(api.get).toHaveBeenCalledWith(API_FOLLOW_LIST);
      expect(result).toEqual(mockData[0]);
    });

    it('should return data directly if not array', async () => {
      const mockData = { 
        followedUsers: ['user1'], 
        subscribedFaculties: ['fac1'] 
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

      const result = await fetchFollowList();

      expect(result).toEqual(mockData);
    });

    it('should handle empty array', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });

      const result = await fetchFollowList();

      // Empty array is returned directly as it's falsy for length > 0 check
      expect(result).toEqual([]);
    });
  });
});

