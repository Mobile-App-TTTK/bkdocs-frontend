import { api } from '@/api/apiClient';
import { API_SUGGEST_KEYWORDS, API_SUGGEST_SUBJECTS } from '@/api/apiRoutes';
import { getSuggestions, getSuggestionsKeyword } from '@/components/searchScreen/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    get: jest.fn(),
  },
}));

describe('searchScreen API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getSuggestions', () => {
    it('should fetch suggestions successfully', async () => {
      const mockData = [
        { id: '1', name: 'Math' },
        { id: '2', name: 'Physics' },
      ];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockData } });

      const result = await getSuggestions();

      expect(api.get).toHaveBeenCalledWith(API_SUGGEST_SUBJECTS);
      expect(result).toEqual(mockData);
    });

    it('should return empty array when data is null', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: null } });

      const result = await getSuggestions();

      expect(result).toEqual([]);
    });

    it('should return empty array when data is not array', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: 'invalid' } });

      const result = await getSuggestions();

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await getSuggestions();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching suggestions:',
        expect.any(Error)
      );
    });

    it('should handle empty response data', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: {} });

      const result = await getSuggestions();

      expect(result).toEqual([]);
    });
  });

  describe('getSuggestionsKeyword', () => {
    it('should fetch keyword suggestions successfully', async () => {
      const mockKeywords = ['react', 'reactjs', 'react native'];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockKeywords } });

      const result = await getSuggestionsKeyword('react');

      expect(api.get).toHaveBeenCalledWith(API_SUGGEST_KEYWORDS, {
        params: { keyword: 'react' },
      });
      expect(result).toEqual(mockKeywords);
    });

    it('should handle undefined keyword', async () => {
      const mockKeywords = ['popular', 'trending'];
      (api.get as jest.Mock).mockResolvedValue({ data: { data: mockKeywords } });

      const result = await getSuggestionsKeyword(undefined);

      expect(api.get).toHaveBeenCalledWith(API_SUGGEST_KEYWORDS, {
        params: { keyword: undefined },
      });
      expect(result).toEqual(mockKeywords);
    });

    it('should return empty array when data is not array', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: { invalid: 'object' } } });

      const result = await getSuggestionsKeyword('test');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await getSuggestionsKeyword('test');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error fetching suggestions keyword:',
        expect.any(Error)
      );
    });

    it('should handle empty string keyword', async () => {
      (api.get as jest.Mock).mockResolvedValue({ data: { data: [] } });

      const result = await getSuggestionsKeyword('');

      expect(api.get).toHaveBeenCalledWith(API_SUGGEST_KEYWORDS, {
        params: { keyword: '' },
      });
      expect(result).toEqual([]);
    });
  });
});

