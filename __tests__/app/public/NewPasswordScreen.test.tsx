import { api } from '@/api/apiClient';
import { API_PASSWORD_RESET } from '@/api/apiRoutes';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@/api/apiClient', () => ({
  api: {
    patch: jest.fn(),
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
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
jest.spyOn(console, 'error').mockImplementation(() => {});

import NewPasswordScreen from '@/app/(public)/new-password';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('NewPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('valid-reset-token');
  });

  it('should render NewPasswordForm', async () => {
    render(
      <TestWrapper>
        <NewPasswordScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Đặt mật khẩu mới')).toBeTruthy();
    });
    expect(screen.getByPlaceholderText('Nhập mật khẩu mới')).toBeTruthy();
    expect(screen.getByPlaceholderText('Nhập lại mật khẩu mới')).toBeTruthy();
    expect(screen.getByText('Xác nhận')).toBeTruthy();
  });

  it('should load token from AsyncStorage', async () => {
    render(
      <TestWrapper>
        <NewPasswordScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('reset_password_token');
    });
  });

  it('should show alert and redirect when no token', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    render(
      <TestWrapper>
        <NewPasswordScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Lỗi',
        'Phiên đặt lại mật khẩu đã hết hạn',
        expect.any(Array)
      );
    });
  });

  it('should reset password successfully', async () => {
    (api.patch as jest.Mock).mockResolvedValue({ data: { success: true } });
    (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <NewPasswordScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Đặt mật khẩu mới')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu mới'), 'newpassword123');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu mới'), 'newpassword123');
    fireEvent.press(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(API_PASSWORD_RESET, {
        token: 'valid-reset-token',
        newPassword: 'newpassword123',
      });
    });

    await waitFor(() => {
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'reset_password_token',
        'forgot_password_temp_data',
      ]);
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Thành công',
        'Đặt lại mật khẩu thành công!',
        expect.any(Array)
      );
    });
  });

  it('should show alert on password reset failure', async () => {
    (api.patch as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Token expired' } },
    });

    render(
      <TestWrapper>
        <NewPasswordScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Đặt mật khẩu mới')).toBeTruthy();
    });

    fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu mới'), 'newpassword123');
    fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu mới'), 'newpassword123');
    fireEvent.press(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Token expired');
    });
  });
});

