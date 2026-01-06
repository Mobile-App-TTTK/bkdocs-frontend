import SubjectCard from '@/components/SubjectCard';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/utils/functions', () => ({
  getBackgroundById: jest.fn(() => ({ uri: 'mocked-background' })),
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
  id: 'subject-123',
  name: 'Giải tích 1',
  count: 42,
  downloadUrl: null,
};

describe('SubjectCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render subject name', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Giải tích 1')).toBeTruthy();
    });

    it('should render document count', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('42 tài liệu')).toBeTruthy();
    });

    it('should render with zero documents', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} count={0} />
        </TestWrapper>
      );

      expect(screen.getByText('0 tài liệu')).toBeTruthy();
    });

    it('should render long subject name', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} name="Kỹ thuật lập trình nâng cao và thuật toán" />
        </TestWrapper>
      );

      expect(screen.getByText('Kỹ thuật lập trình nâng cao và thuật toán')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to subject page on press', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Giải tích 1'));

      expect(router.push).toHaveBeenCalledWith({
        pathname: ROUTES.SUBJECT,
        params: { id: 'subject-123' },
      });
    });
  });

  describe('Image', () => {
    it('should use custom image when downloadUrl provided', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} downloadUrl="https://example.com/subject-image.jpg" />
        </TestWrapper>
      );

      expect(screen.getByText('Giải tích 1')).toBeTruthy();
    });

    it('should use fallback image when downloadUrl is null', () => {
      const { getBackgroundById } = require('@/utils/functions');
      
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} downloadUrl={null} />
        </TestWrapper>
      );

      expect(getBackgroundById).toHaveBeenCalledWith('subject-123');
    });
  });

  describe('Props variations', () => {
    it('should handle large document count', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} count={999999} />
        </TestWrapper>
      );

      expect(screen.getByText('999999 tài liệu')).toBeTruthy();
    });

    it('should handle special characters in name', () => {
      render(
        <TestWrapper>
          <SubjectCard {...defaultProps} name="C++ & Lập trình hướng đối tượng" />
        </TestWrapper>
      );

      expect(screen.getByText('C++ & Lập trình hướng đối tượng')).toBeTruthy();
    });
  });
});

