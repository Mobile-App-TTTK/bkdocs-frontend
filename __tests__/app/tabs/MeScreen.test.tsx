import { ROUTES } from '@/utils/routes';
import { render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfile: jest.fn(() => ({
    data: {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      imageUrl: null,
      numberFollowers: 10,
      documentCount: 5,
      participationDays: 30,
    },
    isLoading: false,
  })),
  useFetchUserDocuments: jest.fn(() => ({
    data: { pages: [] },
    isLoading: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  })),
}));

jest.mock('@/components/DocumentCard', () => 'DocumentCard');

jest.spyOn(console, 'log').mockImplementation(() => {});

import MeScreen from '@/app/(app)/(tabs)/profile/me';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('MeScreen', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  describe('Smoke Tests', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Hồ sơ')).toBeTruthy();
    });

    it('should display user name', () => {
      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeTruthy();
    });

    it('should display user email', () => {
      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('test@example.com')).toBeTruthy();
    });
  });

  describe('User Stats', () => {
    it('should display followers count', () => {
      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Người theo dõi')).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
    });

    it('should display document count', () => {
      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Tài liệu tải lên')).toBeTruthy();
      expect(screen.getByText('5')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when loading profile', () => {
      const { useFetchUserProfile } = require('@/components/Profile/api');
      useFetchUserProfile.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Hồ sơ')).toBeTruthy();
    });
  });

  describe('Documents List', () => {
    it('should display documents when available', () => {
      const { useFetchUserDocuments } = require('@/components/Profile/api');
      useFetchUserDocuments.mockReturnValue({
        data: {
          pages: [
            [
              {
                id: '1',
                title: 'Test Document',
                fileType: 'pdf',
                uploadDate: '2024-01-01',
                downloadCount: 10,
                thumbnailUrl: '',
                subject: 'Math',
                overallRating: 4.5,
              },
            ],
          ],
        },
        isLoading: false,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      });

      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Hồ sơ')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no documents', () => {
      const { useFetchUserDocuments, useFetchUserProfile } = require('@/components/Profile/api');
      useFetchUserProfile.mockReturnValue({
        data: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
        },
        isLoading: false,
      });
      useFetchUserDocuments.mockReturnValue({
        data: { pages: [] },
        isLoading: false,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      });

      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Chưa có tài liệu nào')).toBeTruthy();
    });
  });

  describe('Error State', () => {
    it('should show error message when profile fails to load', () => {
      const { useFetchUserProfile } = require('@/components/Profile/api');
      useFetchUserProfile.mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(
        <TestWrapper>
          <MeScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Không thể tải thông tin người dùng')).toBeTruthy();
    });
  });
});

