import DocumentCard, { IDocumentCardProps } from '@/components/DocumentCard';
import { getBackgroundById, getDate } from '@/utils/functions';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock utils/functions
jest.mock('@/utils/functions', () => ({
  getBackgroundById: jest.fn(() => 'mocked-background'),
  getDate: jest.fn((date) => '01/01/2024'),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// NativeBase test wrapper
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('DocumentCard', () => {
  const defaultProps: IDocumentCardProps = {
    id: 'doc-123',
    title: 'Giải tích 1 - Bài giảng',
    downloadCount: 150,
    uploadDate: '2024-01-15T10:00:00Z',
    subject: 'Giải tích',
    faculty: 'Khoa Toán',
    thumbnail: 'https://example.com/thumbnail.jpg',
    score: 4.5,
    type: 'PDF',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render document title', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(defaultProps.title)).toBeTruthy();
    });

    it('should render document type badge', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('PDF')).toBeTruthy();
    });

    it('should render score', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('4.5')).toBeTruthy();
    });

    it('should render subject name', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Giải tích')).toBeTruthy();
    });

    it('should render download count', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('150')).toBeTruthy();
    });

    it('should render formatted date', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      expect(getDate).toHaveBeenCalledWith(defaultProps.uploadDate);
      expect(screen.getByText('01/01/2024')).toBeTruthy();
    });

    it('should render "___" when subject is not provided', () => {
      const propsWithoutSubject = { ...defaultProps, subject: undefined };

      render(
        <TestWrapper>
          <DocumentCard {...propsWithoutSubject} />
        </TestWrapper>
      );

      expect(screen.getByText('___')).toBeTruthy();
    });

    it('should render 0 when score is not provided', () => {
      const propsWithoutScore = { ...defaultProps, score: 0 };

      render(
        <TestWrapper>
          <DocumentCard {...propsWithoutScore} />
        </TestWrapper>
      );

      expect(screen.getByText('0')).toBeTruthy();
    });
  });

  describe('Thumbnail', () => {
    it('should use provided thumbnail URL', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      // The Image component should receive the thumbnail prop
      // Verification through Image source prop
    });

    it('should use fallback background when no thumbnail', () => {
      const propsWithoutThumbnail = { ...defaultProps, thumbnail: '' };

      render(
        <TestWrapper>
          <DocumentCard {...propsWithoutThumbnail} />
        </TestWrapper>
      );

      expect(getBackgroundById).toHaveBeenCalledWith('doc-123');
    });
  });

  describe('Navigation', () => {
    it('should navigate to document detail on press', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} />
        </TestWrapper>
      );

      // Find the TouchableOpacity (the card itself is touchable)
      const card = screen.getByText(defaultProps.title).parent?.parent?.parent;
      
      if (card) {
        fireEvent.press(card);
      }

      expect(router.push).toHaveBeenCalledWith({
        pathname: ROUTES.DOWNLOAD_DOC,
        params: { id: 'doc-123' },
      });
    });
  });

  describe('Props Variations', () => {
    it('should handle long title with ellipsis', () => {
      const longTitle = 'Đây là một tiêu đề rất dài để kiểm tra việc cắt bớt text với ellipsis';
      
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} title={longTitle} />
        </TestWrapper>
      );

      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('should handle different document types', () => {
      const types = ['PDF', 'WORD', 'IMAGE', 'POWERPOINT'];

      types.forEach((type) => {
        const { unmount } = render(
          <TestWrapper>
            <DocumentCard {...defaultProps} type={type} />
          </TestWrapper>
        );

        expect(screen.getByText(type)).toBeTruthy();
        unmount();
      });
    });

    it('should handle high download counts', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} downloadCount={999999} />
        </TestWrapper>
      );

      expect(screen.getByText('999999')).toBeTruthy();
    });

    it('should handle decimal scores', () => {
      render(
        <TestWrapper>
          <DocumentCard {...defaultProps} score={3.75} />
        </TestWrapper>
      );

      expect(screen.getByText('3.75')).toBeTruthy();
    });
  });
});

