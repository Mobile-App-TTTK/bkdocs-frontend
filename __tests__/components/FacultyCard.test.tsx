import FacultyCard from '@/components/FacultyCard';
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
  id: 'faculty-123',
  name: 'Khoa Công nghệ Thông tin',
  count: 150,
  downloadUrl: null,
};

describe('FacultyCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render faculty name', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Khoa Công nghệ Thông tin')).toBeTruthy();
    });

    it('should render document count', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('150 tài liệu')).toBeTruthy();
    });

    it('should render with zero documents', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} count={0} />
        </TestWrapper>
      );

      expect(screen.getByText('0 tài liệu')).toBeTruthy();
    });

    it('should render long faculty name', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} name="Khoa Kỹ thuật Xây dựng và Công nghệ Môi trường" />
        </TestWrapper>
      );

      expect(screen.getByText('Khoa Kỹ thuật Xây dựng và Công nghệ Môi trường')).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to faculty page on press', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Khoa Công nghệ Thông tin'));

      expect(router.push).toHaveBeenCalledWith({
        pathname: ROUTES.FACULTY,
        params: { id: 'faculty-123' },
      });
    });
  });

  describe('Image', () => {
    it('should use custom image when downloadUrl provided', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} downloadUrl="https://example.com/faculty-image.jpg" />
        </TestWrapper>
      );

      expect(screen.getByText('Khoa Công nghệ Thông tin')).toBeTruthy();
    });

    it('should use fallback image when downloadUrl is null', () => {
      const { getBackgroundById } = require('@/utils/functions');
      
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} downloadUrl={null} />
        </TestWrapper>
      );

      expect(getBackgroundById).toHaveBeenCalledWith('faculty-123');
    });
  });

  describe('Props variations', () => {
    it('should handle large document count', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} count={999999} />
        </TestWrapper>
      );

      expect(screen.getByText('999999 tài liệu')).toBeTruthy();
    });

    it('should handle special characters in name', () => {
      render(
        <TestWrapper>
          <FacultyCard {...defaultProps} name="Khoa Điện - Điện tử" />
        </TestWrapper>
      );

      expect(screen.getByText('Khoa Điện - Điện tử')).toBeTruthy();
    });
  });
});

