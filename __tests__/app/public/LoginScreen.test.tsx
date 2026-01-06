import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.spyOn(Alert, 'alert');

import LoginScreen from '@/app/(public)/login';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('LoginScreen', () => {
  const mockLoginWithCredentials = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      loginWithCredentials: mockLoginWithCredentials,
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
  });

  it('should render LoginForm', () => {
    render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nhập mật khẩu')).toBeTruthy();
  });

  it('should call loginWithCredentials and navigate on success', async () => {
    mockLoginWithCredentials.mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const submitButtons = screen.getAllByText('Đăng nhập');
    fireEvent.press(submitButtons[1]);

    await waitFor(() => {
      expect(mockLoginWithCredentials).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.HOME);
    });
  });

  it('should show alert on login failure', async () => {
    mockLoginWithCredentials.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'wrongpassword');

    const submitButtons = screen.getAllByText('Đăng nhập');
    fireEvent.press(submitButtons[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Đăng nhập thất bại', 'Invalid credentials');
    });
  });

  it('should show generic error message for non-Error exceptions', async () => {
    mockLoginWithCredentials.mockRejectedValue('Unknown error');

    render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
    const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
    
    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');

    const submitButtons = screen.getAllByText('Đăng nhập');
    fireEvent.press(submitButtons[1]);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Đăng nhập thất bại', 'Vui lòng thử lại');
    });
  });
});

