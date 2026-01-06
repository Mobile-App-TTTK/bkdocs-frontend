import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

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

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
}));

const mockUserProfile = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  imageUrl: null,
  faculty: 'CNTT',
  intakeYear: 2020,
};

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfile: jest.fn(() => ({
    data: mockUserProfile,
    isLoading: false,
  })),
  useUpdateProfile: jest.fn(() => ({
    mutateAsync: jest.fn().mockResolvedValue({}),
    isPending: false,
  })),
}));

jest.mock('@/components/searchResultScreen/api', () => ({
  useFetchFacultiesAndSubjects: jest.fn(() => ({
    data: {
      faculties: [
        { id: '1', name: 'CNTT' },
        { id: '2', name: 'Điện - Điện tử' },
      ],
    },
  })),
}));

jest.mock('@/components/FormField', () => {
  const React = require('react');
  const { View, Text, TextInput } = require('react-native');
  return ({ label, value, onChangeText, placeholder, disabled }: any) => (
    <View>
      <Text>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={!disabled}
        testID={`input-${label}`}
      />
    </View>
  );
});

jest.spyOn(Alert, 'alert');

import EditProfilePage from '@/app/(app)/(tabs)/profile/edit';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('EditProfileScreen', () => {
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });

    const { useFetchUserProfile } = require('@/components/Profile/api');
    useFetchUserProfile.mockReturnValue({
      data: mockUserProfile,
      isLoading: false,
    });
  });

  describe('Smoke Tests', () => {
    it('should render without crashing', async () => {
      render(
        <TestWrapper>
          <EditProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Chỉnh sửa hồ sơ')).toBeTruthy();
      });
    });

    it('should display form fields', async () => {
      render(
        <TestWrapper>
          <EditProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Họ và tên')).toBeTruthy();
      });
      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByText('Khoa')).toBeTruthy();
      expect(screen.getByText('Niên khoá')).toBeTruthy();
    });

    it('should display save button', async () => {
      render(
        <TestWrapper>
          <EditProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Lưu')).toBeTruthy();
      });
    });
  });

  describe('Loading State', () => {
    it('should show spinner when loading profile', () => {
      const { useFetchUserProfile } = require('@/components/Profile/api');
      useFetchUserProfile.mockReturnValue({
        data: null,
        isLoading: true,
      });

      render(
        <TestWrapper>
          <EditProfilePage />
        </TestWrapper>
      );

      expect(screen.getByLabelText('loading')).toBeTruthy();
    });
  });

  describe('Edit Avatar', () => {
    it('should render edit avatar button', async () => {
      render(
        <TestWrapper>
          <EditProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Chỉnh sửa hình ảnh hồ sơ')).toBeTruthy();
      });
    });
  });

  describe('Faculty Selection', () => {
    it('should render faculty selector', async () => {
      render(
        <TestWrapper>
          <EditProfilePage />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Khoa')).toBeTruthy();
      });
    });
  });
});
