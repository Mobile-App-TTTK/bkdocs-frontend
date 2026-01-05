import { api } from '@/api/apiClient';
import { API_TOGGLE_FOLLOW_USER } from '@/api/apiRoutes';
import { toggleFollowUser } from '@/components/UserCard/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    patch: jest.fn(),
  },
}));

describe('UserCard API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toggleFollowUser', () => {
    it('should toggle follow user successfully', async () => {
      const mockResponse = {
        data: {
          isFollowed: true,
          numberFollowers: 10,
        },
      };
      (api.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await toggleFollowUser('user-123');

      expect(api.patch).toHaveBeenCalledWith(`${API_TOGGLE_FOLLOW_USER}/user-123/followers`);
      expect(result).toEqual(mockResponse);
    });

    it('should call correct endpoint', async () => {
      (api.patch as jest.Mock).mockResolvedValue({ data: {} });

      await toggleFollowUser('abc-xyz-123');

      expect(api.patch).toHaveBeenCalledWith('/users/abc-xyz-123/followers');
    });

    it('should handle unfollow response', async () => {
      const mockResponse = {
        data: {
          isFollowed: false,
          numberFollowers: 9,
        },
      };
      (api.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await toggleFollowUser('user-456');

      expect(result.data.isFollowed).toBe(false);
    });

    it('should throw error on failure', async () => {
      (api.patch as jest.Mock).mockRejectedValue(new Error('Cannot follow yourself'));

      await expect(toggleFollowUser('self-id')).rejects.toThrow('Cannot follow yourself');
    });

    it('should handle network error', async () => {
      (api.patch as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(toggleFollowUser('user-1')).rejects.toThrow('Network Error');
    });
  });
});

