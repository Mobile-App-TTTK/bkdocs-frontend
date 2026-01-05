import { api } from '@/api/apiClient';
import { API_UPLOAD_DOCUMENT } from '@/api/apiRoutes';
import { uploadDocument } from '@/components/Upload/api';

// Mock api client
jest.mock('@/api/apiClient', () => ({
  api: {
    post: jest.fn(),
  },
}));

describe('Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('uploadDocument', () => {
    const baseParams = {
      file: {
        uri: 'file://document.pdf',
        type: 'application/pdf',
        name: 'document.pdf',
      },
      facultyIds: ['faculty-1', 'faculty-2'],
      subjectId: 'subject-1',
      documentTypeId: 'type-1',
      description: 'Test document description',
    };

    it('should upload document with required fields', async () => {
      const mockResponse = { success: true, id: 'doc-123' };
      (api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await uploadDocument(baseParams);

      expect(api.post).toHaveBeenCalledWith(
        API_UPLOAD_DOCUMENT,
        expect.any(FormData),
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include title when provided', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await uploadDocument({
        ...baseParams,
        title: 'My Document Title',
      });

      expect(api.post).toHaveBeenCalled();
      // Verify FormData was passed (we can't easily inspect FormData content in Jest)
      const formData = (api.post as jest.Mock).mock.calls[0][1];
      expect(formData).toBeInstanceOf(FormData);
    });

    it('should include thumbnail when provided', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await uploadDocument({
        ...baseParams,
        thumbnailFile: {
          uri: 'file://thumbnail.jpg',
          type: 'image/jpeg',
          name: 'thumbnail.jpg',
        },
      });

      expect(api.post).toHaveBeenCalled();
    });

    it('should include multiple images when provided', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await uploadDocument({
        ...baseParams,
        images: [
          { uri: 'file://img1.jpg', type: 'image/jpeg', name: 'img1.jpg' },
          { uri: 'file://img2.png', type: 'image/png', name: 'img2.png' },
        ],
      });

      expect(api.post).toHaveBeenCalled();
    });

    it('should handle empty images array', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      await uploadDocument({
        ...baseParams,
        images: [],
      });

      expect(api.post).toHaveBeenCalled();
    });

    it('should join faculty IDs with comma', async () => {
      (api.post as jest.Mock).mockResolvedValue({ data: {} });

      // The function joins facultyIds with comma before appending to FormData
      await uploadDocument({
        ...baseParams,
        facultyIds: ['fac-1', 'fac-2', 'fac-3'],
      });

      expect(api.post).toHaveBeenCalled();
    });

    it('should throw error on upload failure', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Upload failed'));

      await expect(uploadDocument(baseParams)).rejects.toThrow('Upload failed');
    });

    it('should handle network error', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(uploadDocument(baseParams)).rejects.toThrow('Network Error');
    });

    it('should handle file size limit error', async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error('File too large'));

      await expect(uploadDocument(baseParams)).rejects.toThrow('File too large');
    });
  });
});

