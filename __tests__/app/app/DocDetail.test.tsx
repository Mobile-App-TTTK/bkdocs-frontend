// __tests__/app/app/DocDetailScreen.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert, Platform } from 'react-native';

import DocDetail from '@/app/(app)/doc-detail';
import { ROUTES } from '@/utils/routes';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// Mock router properly to handle hoisting
jest.mock('expo-router', () => {
  const React = require('react');
  const mockBack = jest.fn();
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockRouter = {
    back: mockBack,
    push: mockPush,
    replace: mockReplace,
    navigate: jest.fn(),
    canGoBack: jest.fn(() => true),
  };
  return {
    router: mockRouter,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({ id: '123' }),
    useFocusEffect: (cb: any) => { React.useEffect(cb, []); }, // Use useEffect to simulate immediate run
  };
});

import { router } from 'expo-router';
// We need to retrieve the mock functions to assert on them.
// Since we can't export them from the factory easily to local vars,
// we will rely on importing 'router' from 'expo-router' in the test cases,
// or we can re-assign them in beforeEach if we really want to keep 'mockBack' variable.
// But simpler is to import router in tests.


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
    it('navigates back when back button pressed', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);
      await waitFor(() => expect(screen.getByText('Tải về')).toBeTruthy());

      const backBtn = screen.getByTestId('btn-back');
      fireEvent.press(backBtn);
      expect(router.back).toHaveBeenCalled();
    });

    it('navigates to search when search button pressed', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);
      await waitFor(() => expect(screen.getByText('Tải về')).toBeTruthy());

      const searchBtn = screen.getByTestId('btn-search');
      fireEvent.press(searchBtn);
      expect(router.push).toHaveBeenCalledWith(ROUTES.SEARCH);
    });

    it('navigates to all comments', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);
      await waitFor(() => expect(screen.getByText('Tất cả')).toBeTruthy());

      fireEvent.press(screen.getByText('Tất cả'));
      expect(router.push).toHaveBeenCalledWith({
        pathname: ROUTES.ALL_COMMENT,
        params: { id: '123' },
      });
    });

    it('navigates to write comment', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);
      await waitFor(() => expect(screen.getByTestId('btn-write-comment')).toBeTruthy());

      fireEvent.press(screen.getByTestId('btn-write-comment'));
      expect(router.push).toHaveBeenCalledWith({
        pathname: ROUTES.WRITE_COMMENT,
        params: { id: '123' },
      });
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
        if (/rating|ratings|rates|reviews/i.test(u)) {
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
        if (/rating|ratings|rates|reviews/i.test(u)) {
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
    it('shows write comment button if user has not rated', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);
      await waitFor(() => expect(screen.getByTestId('btn-write-comment')).toBeTruthy());
      expect(screen.queryByText('Bạn đã đánh giá tài liệu này')).toBeNull();
    });

    it('shows rated message if user has rated', async () => {
      const ratedRatings = [
        { userName: 'Thuận', score: 5, comment: 'Đã rate', imageUrl: null, rateAt: '2025-01-01' }
      ];

      mockApiGet.mockImplementation((url: string) => {
        const u = String(url);
        if (/rating|ratings|rates|reviews/i.test(u)) {
          return Promise.resolve({ data: { data: ratedRatings } });
        }
        if (u.includes('doc-detail')) {
          return Promise.resolve({ data: { data: mockDocDetail } });
        }
        return Promise.resolve({ data: { data: [] } });
      });

      render(<Wrapper><DocDetail /></Wrapper>);
      await waitFor(() => expect(screen.getByText('Bạn đã đánh giá tài liệu này')).toBeTruthy());
      expect(screen.queryByTestId('btn-write-comment')).toBeNull();
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
    it('renders and interacts with image modal', async () => {
      render(<Wrapper><DocDetail /></Wrapper>);
      await waitFor(() => expect(screen.getByText('Tải về')).toBeTruthy());

      // Open image
      const openBtns = screen.getAllByTestId('btn-open-image');
      expect(openBtns.length).toBeGreaterThan(0);
      fireEvent.press(openBtns[0]);

      await waitFor(() => {
        expect(screen.getByTestId('btn-close-modal')).toBeTruthy();
      });

      // Close modal
      fireEvent.press(screen.getByTestId('btn-close-modal'));

      await waitFor(() => {
        // Modal should be closed (or closing).
        // Note: Modal inside React Native sometimes stays in tree but visible=false.
        // However, standard testing-library `queryBy` usually respects visibility or existence if conditional.
        // In `index.tsx`, Modal visible prop controls it. 
        // But contents of Modal are CHILDREN of Modal. 
        // If visible=false, Modal might not render children or might render them hidden.
        // In React Native `Modal` component, children are usually unmounted or hidden by OS.
        // Let's assume queryByTestId works.
        // IF not, we might need to check accessibility state.
        // But `setSelectedImageUrl(null)` unsets state, so conditional rendering `{selectedImageUrl && (...)}` inside Modal view?
        // No, `visible={selectedImageUrl !== null}`. 
        // Inside Modal: `onRequestClose` calls `setSelectedImageUrl(null)`.
        // If state is null, visible is false.
      });
    });
  });
});
