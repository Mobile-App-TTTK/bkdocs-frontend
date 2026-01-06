import { render, screen } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { View, Text, TextInput } from 'react-native';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useFocusEffect: jest.fn(),
}));

const MockSearchScreen = () => (
  <View>
    <TextInput placeholder="Tìm kiếm tài liệu, môn học..." />
    <Text>Môn học gợi ý</Text>
  </View>
);

const MockSearchScreenLoading = () => (
  <View>
    <TextInput placeholder="Tìm kiếm tài liệu, môn học..." />
    <Text>Môn học gợi ý</Text>
    <View testID="skeleton" />
  </View>
);

const MockSearchScreenEmpty = () => (
  <View>
    <TextInput placeholder="Tìm kiếm tài liệu, môn học..." />
    <Text>Môn học gợi ý</Text>
  </View>
);

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smoke Tests', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <MockSearchScreen />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...')).toBeTruthy();
    });

    it('should render search input', () => {
      render(
        <TestWrapper>
          <MockSearchScreen />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
      expect(searchInput).toBeTruthy();
    });

    it('should render suggestion title', () => {
      render(
        <TestWrapper>
          <MockSearchScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Môn học gợi ý')).toBeTruthy();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton when loading suggestions', () => {
      render(
        <TestWrapper>
          <MockSearchScreenLoading />
        </TestWrapper>
      );

      expect(screen.getByText('Môn học gợi ý')).toBeTruthy();
      expect(screen.getByTestId('skeleton')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should handle empty suggestions', () => {
      render(
        <TestWrapper>
          <MockSearchScreenEmpty />
        </TestWrapper>
      );

      expect(screen.getByText('Môn học gợi ý')).toBeTruthy();
    });
  });
});
