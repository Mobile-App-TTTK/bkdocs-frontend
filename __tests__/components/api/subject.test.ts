import { api } from '@/api/apiClient';
import { API_GET_INFORMATION_SUBJECT, API_SUBSCRIBE_SUBJECT, API_UNSUBSCRIBE_SUBJECT } from '@/api/apiRoutes';
import {
    fetchSubjectInfo,
    subscribeSubject,
    unsubscribeSubject
} from '@/components/subjectScreen/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('subjectScreen API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSubjectInfo', () => {
    it('should fetch subject info successfully', async () => {
      const mockSubject = {
        id: 'subject-1',
        name: 'Calculus',
        documentsCount: 120,
        faculty: 'Mathematics',
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockSubject } });

      const result = await fetchSubjectInfo('subject-1');

      expect(api.get).toHaveBeenCalledWith(`${API_GET_INFORMATION_SUBJECT}/subject-1`);
      expect(result).toEqual(mockSubject);
    });

    it('should handle different subject IDs', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await fetchSubjectInfo('abc-123-xyz');

      expect(api.get).toHaveBeenCalledWith('/documents/subject/abc-123-xyz');
    });

    it('should throw error when subject not found', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Subject not found'));

      await expect(fetchSubjectInfo('invalid')).rejects.toThrow('Subject not found');
    });
  });

  describe('subscribeSubject', () => {
    it('should subscribe to subject successfully', async () => {
      const mockResponse = { success: true, message: 'Subscribed to subject' };
      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await subscribeSubject('subject-123');

      expect(api.post).toHaveBeenCalledWith(`${API_SUBSCRIBE_SUBJECT}/subject-123/subscription`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle already subscribed error', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Already subscribed'));

      await expect(subscribeSubject('subject-1')).rejects.toThrow('Already subscribed');
    });
  });

  describe('unsubscribeSubject', () => {
    it('should unsubscribe from subject successfully', async () => {
      const mockResponse = { success: true };
      (api.delete as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await unsubscribeSubject('subject-123');

      expect(api.delete).toHaveBeenCalledWith(`${API_UNSUBSCRIBE_SUBJECT}/subject-123/subscription`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle not subscribed error', async () => {
      (api.delete as jest.Mock).mockRejectedValue(new Error('Not subscribed'));

      await expect(unsubscribeSubject('subject-1')).rejects.toThrow('Not subscribed');
    });
  });
});

