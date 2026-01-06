import { api } from '@/api/apiClient';
import {
  API_ADMIN_DOCUMENT_STATUS,
  API_ADMIN_MEMBERS,
  API_ADMIN_MEMBER_BAN_STATUS,
  API_ADMIN_PENDING_DOCUMENTS,
  API_ADMIN_STATISTICS
} from '@/api/apiRoutes';
import {
  approveDocument,
  banUser,
  fetchAdminStatistics,
  fetchAdminUsers,
  fetchPendingDocuments,
  rejectDocument,
  unbanUser
} from '@/components/Admin/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('Admin API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAdminStatistics', () => {
    it('should fetch admin statistics successfully', async () => {
      const mockStats = {
        totalUsers: 100,
        pendingDocuments: 25,
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockStats } });

      const result = await fetchAdminStatistics();

      expect(api.get).toHaveBeenCalledWith(API_ADMIN_STATISTICS);
      expect(result).toEqual(mockStats);
    });

    it('should return default values when data is empty', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      const result = await fetchAdminStatistics();

      expect(result).toEqual({
        totalUsers: 0,
        pendingDocuments: 0,
      });
    });

    it('should return default values when data is null', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: null } });

      const result = await fetchAdminStatistics();

      expect(result).toEqual({
        totalUsers: 0,
        pendingDocuments: 0,
      });
    });

    it('should handle partial data', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: { totalUsers: 50 } }
      });

      const result = await fetchAdminStatistics();

      expect(result).toEqual({
        totalUsers: 50,
        pendingDocuments: 0,
      });
    });
  });

  describe('fetchAdminUsers', () => {
    it('should fetch admin users successfully', async () => {
      const mockUsers = [
        { id: '1', name: 'User 1', isBanned: false },
        { id: '2', name: 'User 2', isBanned: true },
      ];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockUsers } });

      const result = await fetchAdminUsers();

      expect(api.get).toHaveBeenCalledWith(API_ADMIN_MEMBERS);
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when data is not array', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: 'invalid' } });

      const result = await fetchAdminUsers();

      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: null } });

      const result = await fetchAdminUsers();

      expect(result).toEqual([]);
    });
  });

  describe('banUser', () => {
    it('should ban user successfully', async () => {
      const mockResponse = { success: true };
      (api.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await banUser('user-123');

      expect(api.patch).toHaveBeenCalledWith(
        API_ADMIN_MEMBER_BAN_STATUS('user-123'),
        { banStatus: 'BANNED' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call correct endpoint with user ID', async () => {
      (api.patch as jest.Mock).mockResolvedValue({ data: {} });

      await banUser('abc-xyz');

      expect(api.patch).toHaveBeenCalledWith(
        '/admin/members/abc-xyz/ban-status',
        { banStatus: 'BANNED' }
      );
    });
  });

  describe('unbanUser', () => {
    it('should unban user successfully', async () => {
      const mockResponse = { success: true };
      (api.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await unbanUser('user-123');

      expect(api.patch).toHaveBeenCalledWith(
        API_ADMIN_MEMBER_BAN_STATUS('user-123'),
        { banStatus: 'NONE' }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('fetchPendingDocuments', () => {
    it('should fetch pending documents with default pagination', async () => {
      const mockResponse = {
        data: [{ id: '1', title: 'Doc 1' }],
        total: 1,
        page: '1',
        totalPages: 1,
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockResponse } });

      const result = await fetchPendingDocuments({});

      expect(api.get).toHaveBeenCalledWith(API_ADMIN_PENDING_DOCUMENTS, {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include fullTextSearch when provided', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: { data: [], total: 0, page: '1', totalPages: 0 } }
      });

      await fetchPendingDocuments({
        page: 1,
        limit: 10,
        fullTextSearch: 'test query'
      });

      expect(api.get).toHaveBeenCalledWith(API_ADMIN_PENDING_DOCUMENTS, {
        params: { page: 1, limit: 10, fullTextSearch: 'test query' },
      });
    });

    it('should handle custom pagination', async () => {
      (api.get as jest.Mock).mockResolvedValue({
        data: { data: { data: [], total: 0, page: '2', totalPages: 5 } }
      });

      await fetchPendingDocuments({ page: 2, limit: 20 });

      expect(api.get).toHaveBeenCalledWith(API_ADMIN_PENDING_DOCUMENTS, {
        params: { page: 2, limit: 20 },
      });
    });

    it('should return default response when data is null', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: null } });

      const result = await fetchPendingDocuments({});

      expect(result).toEqual({
        data: [],
        total: 0,
        page: '1',
        totalPages: 0
      });
    });
  });

  describe('approveDocument', () => {
    it('should approve document successfully', async () => {
      const mockResponse = { success: true };
      (api.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await approveDocument('doc-123');

      expect(api.patch).toHaveBeenCalledWith(
        API_ADMIN_DOCUMENT_STATUS('doc-123'),
        { status: 'ACTIVE' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call correct endpoint', async () => {
      (api.patch as jest.Mock).mockResolvedValue({ data: {} });

      await approveDocument('abc-xyz');

      expect(api.patch).toHaveBeenCalledWith(
        '/admin/document/abc-xyz/status',
        { status: 'ACTIVE' }
      );
    });
  });

  describe('rejectDocument', () => {
    it('should reject document successfully', async () => {
      const mockResponse = { success: true };
      (api.patch as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await rejectDocument('doc-123');

      expect(api.patch).toHaveBeenCalledWith(
        API_ADMIN_DOCUMENT_STATUS('doc-123'),
        { status: 'INACTIVE' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle rejection error', async () => {
      (api.patch as jest.Mock).mockRejectedValue(new Error('Document not found'));

      await expect(rejectDocument('invalid-id')).rejects.toThrow('Document not found');
    });
  });
});

