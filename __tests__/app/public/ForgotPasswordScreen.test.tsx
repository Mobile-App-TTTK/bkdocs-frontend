import { api } from '@/api/apiClient';
import { API_PASSWORD_RESET_REQUEST } from '@/api/apiRoutes';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
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
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    back: jest.fn(),
  })),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.spyOn(Alert, 'alert');

import ForgotPasswordScreen from '@/app/(public)/forgot-password';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render ForgotPasswordForm', () => {
    render(
      <TestWrapper>
        <ForgotPasswordScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Quên mật khẩu')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeTruthy();
    expect(screen.getByText('Đặt lại mật khẩu')).toBeTruthy();
  });

  it('should call API and navigate to OTP on success', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: { success: true } });
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <ForgotPasswordScreen />
      </TestWrapper>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'test@example.com');
    fireEvent.press(screen.getByText('Đặt lại mật khẩu'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(API_PASSWORD_RESET_REQUEST, { email: 'test@example.com' });
    });

    await waitFor(() => {
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('signup_temp_data');
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'forgot_password_temp_data',
        JSON.stringify({ email: 'test@example.com', flow: 'forgot-password' })
      );
    });

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(ROUTES.OTP_CODE);
    });
  });

  it('should show alert on API failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Email not found' } },
    });

    render(
      <TestWrapper>
        <ForgotPasswordScreen />
      </TestWrapper>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'notfound@example.com');
    fireEvent.press(screen.getByText('Đặt lại mật khẩu'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Email not found');
    });
  });

  it('should show default error message on failure', async () => {
    (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <ForgotPasswordScreen />
      </TestWrapper>
    );

    fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'test@example.com');
    fireEvent.press(screen.getByText('Đặt lại mật khẩu'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Gửi mã OTP thất bại');
    });
  });
});

