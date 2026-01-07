import { api } from '@/api/apiClient';
import { API_REQUEST_OTP } from '@/api/apiRoutes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@/api/apiClient', () => ({
  api: {
    post: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.spyOn(Alert, 'alert');
jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

import SignupScreen from '@/app/(public)/signup';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('SignupScreen', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render SignupForm', () => {
    render(
      <TestWrapper>
        <SignupScreen />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Nhập tên của bạn')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nhập mật khẩu')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nhập lại mật khẩu')).toBeTruthy();
  });

  it('should call API and navigate to OTP on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <SignupScreen />
      </TestWrapper>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), 'Test User');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu'), 'password123');

    const submitButtons = screen.getAllByText('Đăng ký');
    fireEvent.press(submitButtons[1]);

    // Wait for API call
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(API_REQUEST_OTP, { email: 'test@example.com' });
    }, { timeout: 5000 });

    // Wait for AsyncStorage operations
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalled();
    }, { timeout: 5000 });
  }, 15000);

  it('should show alert on API failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Email already exists' } },
    });

    render(
      <TestWrapper>
        <SignupScreen />
      </TestWrapper>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), 'Test User');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu'), 'password123');

    const submitButtons = screen.getAllByText('Đăng ký');
    fireEvent.press(submitButtons[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Email already exists');
    });
  });

  it('should show default error message on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <SignupScreen />
      </TestWrapper>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), 'Test User');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'test@example.com');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu'), 'password123');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu'), 'password123');

    const submitButtons = screen.getAllByText('Đăng ký');
    fireEvent.press(submitButtons[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Gửi mã OTP thất bại');
    });
  });
});

