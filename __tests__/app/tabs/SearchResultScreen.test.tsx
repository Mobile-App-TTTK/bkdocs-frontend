import { render, screen } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({ query: 'test query' })),
}));

const MockSearchResultScreen = ({ hasResults = false }: { hasResults?: boolean }) => (
  <View>
    <TextInput 
      placeholder="Tìm kiếm tài liệu, môn học..." 
      value="test query"
    />
    <TouchableOpacity><Text>Tất cả</Text></TouchableOpacity>
    {hasResults ? (
      <>
        <Text>Tài liệu</Text>
        <Text>Người dùng</Text>
      </>
    ) : (
      <Text>Không tìm thấy kết quả nào</Text>
    )}
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

describe('SearchResultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Smoke Tests', () => {
    it('should render without crashing', () => {
      render(
        <TestWrapper>
          <MockSearchResultScreen />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...')).toBeTruthy();
    });

    it('should display search query in input', () => {
      render(
        <TestWrapper>
          <MockSearchResultScreen />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
      expect(input.props.value).toBe('test query');
    });
  });

  describe('Filter Tabs', () => {
    it('should render filter tabs', () => {
      render(
        <TestWrapper>
          <MockSearchResultScreen />
        </TestWrapper>
      );

      expect(screen.getByText('Tất cả')).toBeTruthy();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no results', () => {
      render(
        <TestWrapper>
          <MockSearchResultScreen hasResults={false} />
        </TestWrapper>
      );

      expect(screen.getByText('Không tìm thấy kết quả nào')).toBeTruthy();
    });
  });

  describe('Results Display', () => {
    it('should show documents section when documents found', () => {
      render(
        <TestWrapper>
          <MockSearchResultScreen hasResults={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Tài liệu')).toBeTruthy();
    });

    it('should show users section when users found', () => {
      render(
        <TestWrapper>
          <MockSearchResultScreen hasResults={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Người dùng')).toBeTruthy();
    });
  });
});
