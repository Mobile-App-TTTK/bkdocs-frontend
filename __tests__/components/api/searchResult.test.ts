import { api } from '@/api/apiClient';
import { API_GET_FACULTIES_AND_SUBJECTS, API_GET_SEARCH_RESULT } from '@/api/apiRoutes';
import {
    fetchFacultiesAndSubjects,
    fetchSearchResult
} from '@/components/searchResultScreen/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('searchResultScreen API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('fetchSearchResult', () => {
    it('should fetch search results successfully', async () => {
      const mockResults = {
        documents: [{ id: '1', title: 'Doc 1' }],
        users: [],
        total: 1,
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockResults } });

      const result = await fetchSearchResult('calculus');

      expect(api.get).toHaveBeenCalledWith(API_GET_SEARCH_RESULT, {
        params: { keyword: 'calculus', searchFor: 'all' },
      });
      expect(result).toEqual(mockResults);
    });

    it('should include filters in request', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await fetchSearchResult('test', { 
        facultyId: 'fac-1',
        fileType: 'pdf',
        sortBy: 'newest'
      });

      expect(api.get).toHaveBeenCalledWith(API_GET_SEARCH_RESULT, {
        params: {
          keyword: 'test',
          searchFor: 'all',
          facultyId: 'fac-1',
          fileType: 'pdf',
          sortBy: 'newest',
        },
      });
    });

    it('should filter out null and empty filter values', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await fetchSearchResult('test', { 
        facultyId: 'fac-1',
        subjectId: null as any,
        fileType: '',
      });

      expect(api.get).toHaveBeenCalledWith(API_GET_SEARCH_RESULT, {
        params: {
          keyword: 'test',
          searchFor: 'all',
          facultyId: 'fac-1',
        },
      });
    });

    it('should use custom searchFor parameter', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await fetchSearchResult('query', {}, 'documents');

      expect(api.get).toHaveBeenCalledWith(API_GET_SEARCH_RESULT, {
        params: {
          keyword: 'query',
          searchFor: 'documents',
        },
      });
    });

    it('should search for users only', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: { users: [] } } });

      await fetchSearchResult('john', {}, 'users');

      expect(api.get).toHaveBeenCalledWith(API_GET_SEARCH_RESULT, {
        params: {
          keyword: 'john',
          searchFor: 'users',
        },
      });
    });

    it('should handle search with empty keyword', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await fetchSearchResult('');

      expect(api.get).toHaveBeenCalledWith(API_GET_SEARCH_RESULT, {
        params: { keyword: '', searchFor: 'all' },
      });
    });

    it('should handle Vietnamese search terms', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: {} } });

      await fetchSearchResult('Giải tích 1');

      expect(api.get).toHaveBeenCalledWith(API_GET_SEARCH_RESULT, {
        params: { keyword: 'Giải tích 1', searchFor: 'all' },
      });
    });
  });

  describe('fetchFacultiesAndSubjects', () => {
    it('should fetch faculties and subjects successfully', async () => {
      const mockData = {
        faculties: [
          { id: '1', name: 'CSE' },
          { id: '2', name: 'Math' },
        ],
        subjects: [
          { id: '1', name: 'Calculus', facultyId: '2' },
        ],
      };
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

      const result = await fetchFacultiesAndSubjects();

      expect(api.get).toHaveBeenCalledWith(API_GET_FACULTIES_AND_SUBJECTS);
      expect(result).toEqual(mockData);
    });

    it('should throw error on failure', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(fetchFacultiesAndSubjects()).rejects.toThrow('Network error');
    });
  });
});

