import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

const defaultProps = {
  id: 'doc-123',
  title: 'Test Document',
  image: 'https://example.com/image.jpg',
  subject: 'Mathematics',
  downloadCount: 150,
  uploadDate: '2024-01-15',
  type: 'PDF',
};

describe('SuggestCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render document title', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Document')).toBeTruthy();
    });

    it('should render subject name', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Mathematics')).toBeTruthy();
    });

    it('should render download count', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('150')).toBeTruthy();
    });

    it('should render document type badge', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('PDF')).toBeTruthy();
    });

    it('should render formatted upload date', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('15-01-2024')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to document detail on press', () => {
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Test Document'));

      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.DOWNLOAD_DOC,
        params: { id: 'doc-123' },
      });
    });
  });

  describe('Image handling', () => {
    it('should handle string image URL', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} image="https://example.com/custom.jpg" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Document')).toBeTruthy();
    });

    it('should handle empty image string', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} image="" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Document')).toBeTruthy();
    });
  });

  describe('Date formatting', () => {
    it('should handle ISO date format', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} uploadDate="2024-06-20T10:00:00Z" />
        </TestWrapper>
      );

      expect(screen.getByText('20-06-2024')).toBeTruthy();
    });

    it('should handle empty upload date', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} uploadDate="" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Document')).toBeTruthy();
    });

    it('should handle DD/MM/YYYY format', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} uploadDate="15/01/2024" />
        </TestWrapper>
      );

      expect(screen.getByText('15-01-2024')).toBeTruthy();
    });
  });

  describe('Props variations', () => {
    it('should handle long title', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} title="This is a very long document title that should be truncated" />
        </TestWrapper>
      );

      expect(screen.getByText('This is a very long document title that should be truncated')).toBeTruthy();
    });

    it('should handle different document types', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} type="WORD" />
        </TestWrapper>
      );

      expect(screen.getByText('WORD')).toBeTruthy();
    });

    it('should handle large download count', () => {
      const SuggestCard = require('@/components/ui/home-suggest-card').default;

      render(
        <TestWrapper>
          <SuggestCard {...defaultProps} downloadCount={99999} />
        </TestWrapper>
      );

      expect(screen.getByText('99999')).toBeTruthy();
    });
  });
});

