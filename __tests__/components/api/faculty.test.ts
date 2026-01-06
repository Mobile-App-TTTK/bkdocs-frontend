import { api } from '@/api/apiClient';
import { API_GET_INFORMATION_FACULTY, API_SUBSCRIBE_FACULTY, API_SUBSCRIBE_SUBJECT, API_UNSUBSCRIBE_FACULTY, API_UNSUBSCRIBE_SUBJECT } from '@/api/apiRoutes';
import {
    fetchFacultyInfo,
    subscribeFaculty,
    subscribeSubject,
    unsubscribeFaculty,
    unsubscribeSubject
} from '@/components/FacultyScreen/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('FacultyScreen API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFacultyInfo', () => {
    it('should fetch faculty info successfully', async () => {
      const mockFaculty = {
        id: 'faculty-1',
        name: 'Computer Science',
        description: 'CS Faculty',
        subjectsCount: 50,
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockFaculty } });

      const result = await fetchFacultyInfo('faculty-1');

      expect(api.get).toHaveBeenCalledWith(`${API_GET_INFORMATION_FACULTY}/faculty-1`);
      expect(result).toEqual(mockFaculty);
    });

    it('should throw error on failure', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Not found'));

      await expect(fetchFacultyInfo('invalid-id')).rejects.toThrow('Not found');
    });
  });

  describe('subscribeFaculty', () => {
    it('should subscribe to faculty successfully', async () => {
      const mockResponse = { success: true, message: 'Subscribed' };
      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await subscribeFaculty('faculty-123');

      expect(api.post).toHaveBeenCalledWith(`${API_SUBSCRIBE_FACULTY}/faculty-123/subscription`);
      expect(result).toEqual(mockResponse);
    });

    it('should handle subscription error', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Already subscribed'));

      await expect(subscribeFaculty('faculty-1')).rejects.toThrow('Already subscribed');
    });
  });

  describe('unsubscribeFaculty', () => {
    it('should unsubscribe from faculty successfully', async () => {
      const mockResponse = { success: true };
      (api.delete as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await unsubscribeFaculty('faculty-123');

      expect(api.delete).toHaveBeenCalledWith(`${API_UNSUBSCRIBE_FACULTY}/faculty-123/subscription`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('subscribeSubject', () => {
    it('should subscribe to subject successfully', async () => {
      const mockResponse = { success: true };
      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await subscribeSubject('subject-456');

      expect(api.post).toHaveBeenCalledWith(`${API_SUBSCRIBE_SUBJECT}/subject-456/subscription`);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('unsubscribeSubject', () => {
    it('should unsubscribe from subject successfully', async () => {
      const mockResponse = { success: true };
      (api.delete as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await unsubscribeSubject('subject-456');

      expect(api.delete).toHaveBeenCalledWith(`${API_UNSUBSCRIBE_SUBJECT}/subject-456/subscription`);
      expect(result).toEqual(mockResponse);
    });
  });
});

