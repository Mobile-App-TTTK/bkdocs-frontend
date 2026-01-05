// __tests__/app/app/DocDetailScreen.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert, Platform } from 'react-native';

import DocDetail from '@/app/(app)/doc-detail';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockBack = jest.fn();
const mockPush = jest.fn();
const mockRouter = {
  back: mockBack,
  push: mockPush,
  replace: jest.fn(),
  navigate: jest.fn(),
};
jest.mock('expo-router', () => ({
  router: mockRouter,
  useRouter: () => mockRouter,
  useLocalSearchParams: () => ({ id: '123' }),
  useFocusEffect: (cb: any) => cb(),
}));

const mockApiGet = jest.fn();
jest.mock('@/api/apiClient', () => ({
  api: { get: (...args: any[]) => mockApiGet(...args) },
}));

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfile: () => ({ data: { name: 'Thuận', imageUrl: null } }),
  useFetchUserProfileById: () => ({ data: { faculty: 'HCMUT', imageUrl: null } }),
}));

jest.mock('expo-file-system', () => {
  class FakeFile {
    uri: string;
    exists = false;
    constructor(_base: string, name: string) {
      this.uri = `file:///mock/${name}`;
    }
    delete() { }
    static async downloadFileAsync(_url: string, dest: any) {
      return { uri: dest.uri };
    }
  }
  return {
    Paths: { document: 'document' },
    File: FakeFile,
  };
});

const mockRequestDirectoryPermissionsAsync = jest.fn();
const mockCreateFileAsync = jest.fn();
const mockReadAsStringAsync = jest.fn();
const mockWriteAsStringAsync = jest.fn();

jest.mock('expo-file-system/legacy', () => ({
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: (...args: any[]) => mockRequestDirectoryPermissionsAsync(...args),
    createFileAsync: (...args: any[]) => mockCreateFileAsync(...args),
  },
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: (...args: any[]) => mockReadAsStringAsync(...args),
  writeAsStringAsync: (...args: any[]) => mockWriteAsStringAsync(...args),
}));

const mockShareAsync = jest.fn();
const mockIsAvailableAsync = jest.fn();
jest.mock('expo-sharing', () => ({
  isAvailableAsync: () => mockIsAvailableAsync(),
  shareAsync: (...args: any[]) => mockShareAsync(...args),
}));

jest.mock('@/utils/downloadDocStorage', () => ({
  downloadedDocsStorage: { addDownloadedDoc: jest.fn() },
}));

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => { });

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

const mockDocDetail = {
  id: '123',
  title: 'Tài liệu A',
  description: 'Mô tả tài liệu test',
  downloadCount: 10,
  uploader: { id: 'u1', name: 'Uploader', isVerified: true },
  subject: 'Toán học',
  faculty: 'Khoa học máy tính',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
};

const mockRatings = [
  { userName: 'User1', score: 5, comment: 'Tuyệt vời!', imageUrl: null, rateAt: '2025-01-01' },
  { userName: 'User2', score: 4, comment: 'Tốt', imageUrl: 'https://example.com/rating.jpg', rateAt: '2025-01-02' },
];

describe('DocDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAvailableAsync.mockResolvedValue(true);

    mockApiGet.mockImplementation((url: string) => {
      const u = String(url);

      if (u.includes('download')) {
        return Promise.resolve({ data: { data: 'https://example.com/file.pdf' } });
      }

      if (/rating|ratings/i.test(u)) {
        return Promise.resolve({ data: { data: mockRatings } });
      }

      if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
        return Promise.resolve({ data: { data: mockDocDetail } });
      }

      return Promise.resolve({ data: { data: [] } });
    });
  });

  // ==================== RENDERING TESTS ====================

  describe('Rendering', () => {
    it('renders download button', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });
    });

    it('renders document sections', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        // Check for static sections that don't depend on API data
        expect(screen.getByText(/Đánh giá/)).toBeTruthy();
        expect(screen.getByText('Danh mục tài liệu')).toBeTruthy();
      });
    });

    it('renders follow button', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Theo dõi')).toBeTruthy();
      });
    });

    it('renders category section', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Danh mục tài liệu')).toBeTruthy();
      });
    });
  });

  // ==================== NAVIGATION TESTS ====================

  describe('Navigation', () => {
    it('renders Tất cả navigation button', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tất cả')).toBeTruthy();
      });
    });

    it('renders back and search navigation buttons', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      // Buttons are rendered (Ionicons mocked, so we verify component doesn't crash)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  // ==================== DOWNLOAD FLOW TESTS ====================

  describe('Download Flow', () => {
    it('pressing download triggers share flow (iOS-like)', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      await waitFor(() => {
        expect(mockShareAsync).toHaveBeenCalled();
      });
    });

    it('shows loading state during download', async () => {
      // Make the download take some time
      mockShareAsync.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      // Should show loading text
      await waitFor(() => {
        expect(screen.getByText('Đang tải...')).toBeTruthy();
      });
    });

    it('handles download error gracefully', async () => {
      mockApiGet.mockImplementation((url: string) => {
        const u = String(url);
        if (u.includes('download')) {
          return Promise.reject(new Error('Network error'));
        }
        if (/rating|ratings/i.test(u)) {
          return Promise.resolve({ data: { data: mockRatings } });
        }
        if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
          return Promise.resolve({ data: { data: mockDocDetail } });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Lỗi', 'Tải về thất bại. Vui lòng thử lại.');
      });
    });

    it('handles missing download URL', async () => {
      mockApiGet.mockImplementation((url: string) => {
        const u = String(url);
        if (u.includes('download')) {
          return Promise.resolve({ data: { data: null } });
        }
        if (/rating|ratings/i.test(u)) {
          return Promise.resolve({ data: { data: mockRatings } });
        }
        if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
          return Promise.resolve({ data: { data: mockDocDetail } });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Lỗi', 'Không lấy được link tải về từ server.');
      });
    });

    it('falls back to Linking when sharing not available', async () => {
      mockIsAvailableAsync.mockResolvedValue(false);

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      await waitFor(() => {
        // Should not call shareAsync when not available
        expect(mockShareAsync).not.toHaveBeenCalled();
      });
    });
  });

  // ==================== ANDROID DOWNLOAD FLOW ====================

  describe('Android Download Flow', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
      Object.defineProperty(Platform, 'OS', { value: 'android', writable: true });
    });

    afterEach(() => {
      Object.defineProperty(Platform, 'OS', { value: originalPlatform, writable: true });
    });

    it('shows success popup on successful Android download', async () => {
      mockRequestDirectoryPermissionsAsync.mockResolvedValue({ granted: true, directoryUri: 'content://mock' });
      mockCreateFileAsync.mockResolvedValue('content://mock/file.pdf');
      mockReadAsStringAsync.mockResolvedValue('base64content');
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      await waitFor(() => {
        expect(screen.getByText('Tải về thành công')).toBeTruthy();
      });
    });

    it('shows cancelled popup when user cancels SAF', async () => {
      mockRequestDirectoryPermissionsAsync.mockResolvedValue({ granted: false });

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      await waitFor(() => {
        expect(screen.getByText('Đã hủy')).toBeTruthy();
      });
    });

    it('shows error popup on Android download failure', async () => {
      mockRequestDirectoryPermissionsAsync.mockResolvedValue({ granted: true, directoryUri: 'content://mock' });
      mockCreateFileAsync.mockRejectedValue(new Error('SAF error'));

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Tải về'));

      await waitFor(() => {
        expect(screen.getByText('Lỗi')).toBeTruthy();
      });
    });
  });

  // ==================== USER INTERACTION TESTS ====================

  describe('User Interactions', () => {
    it('toggles following state on press', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Theo dõi')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Theo dõi'));

      await waitFor(() => {
        expect(screen.getByText('Bỏ theo dõi')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Bỏ theo dõi'));

      await waitFor(() => {
        expect(screen.getByText('Theo dõi')).toBeTruthy();
      });
    });
  });

  // ==================== USER RATING STATUS ====================

  describe('User Rating Status', () => {
    it('shows rating section header', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Gửi đánh giá và nhận xét')).toBeTruthy();
      });
    });
  });

  // ==================== EDGE CASES ====================

  describe('Edge Cases', () => {
    it('renders with empty ratings array', async () => {
      mockApiGet.mockImplementation((url: string) => {
        const u = String(url);
        if (u.includes('download')) {
          return Promise.resolve({ data: { data: 'https://example.com/file.pdf' } });
        }
        if (/rating|ratings/i.test(u)) {
          return Promise.resolve({ data: { data: [] } });
        }
        if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
          return Promise.resolve({ data: { data: mockDocDetail } });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });
    });

    it('renders with missing uploader info', async () => {
      mockApiGet.mockImplementation((url: string) => {
        const u = String(url);
        if (u.includes('download')) {
          return Promise.resolve({ data: { data: 'https://example.com/file.pdf' } });
        }
        if (/rating|ratings/i.test(u)) {
          return Promise.resolve({ data: { data: mockRatings } });
        }
        if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
          return Promise.resolve({
            data: {
              data: {
                ...mockDocDetail,
                uploader: undefined,
              },
            },
          });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });
    });

    it('renders with no images (fallback to default)', async () => {
      mockApiGet.mockImplementation((url: string) => {
        const u = String(url);
        if (u.includes('download')) {
          return Promise.resolve({ data: { data: 'https://example.com/file.pdf' } });
        }
        if (/rating|ratings/i.test(u)) {
          return Promise.resolve({ data: { data: mockRatings } });
        }
        if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
          return Promise.resolve({
            data: {
              data: {
                ...mockDocDetail,
                thumbnailUrl: undefined,
                images: [],
              },
            },
          });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });
    });

    it('handles null document response gracefully', async () => {
      mockApiGet.mockImplementation((url: string) => {
        const u = String(url);
        if (/rating|ratings/i.test(u)) {
          return Promise.resolve({ data: { data: [] } });
        }
        if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
          return Promise.resolve({ data: { data: null } });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<Wrapper><DocDetail /></Wrapper>);

      // Should still render without crashing
      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });
    });
  });

  // ==================== IMAGE & MODAL TESTS ====================

  describe('Image and Modal', () => {
    it('renders image component', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Tải về')).toBeTruthy();
      });

      // Verify image is rendered via alt text
      const images = screen.getAllByLabelText('Document Image');
      expect(images.length).toBeGreaterThan(0);
    });
  });
});
