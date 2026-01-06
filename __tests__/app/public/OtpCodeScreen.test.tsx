import { api } from '@/api/apiClient';
import { API_REGISTER_COMPLETE, API_VERIFY_OTP } from '@/api/apiRoutes';
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
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.spyOn(Alert, 'alert');

import OtpCodeScreen from '@/app/(public)/otp-code';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('OtpCodeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'signup_temp_data') {
        return Promise.resolve(JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123' }));
      }
      return Promise.resolve(null);
    });
  });

  it('should render OtpCodeForm', async () => {
    render(
      <TestWrapper>
        <OtpCodeScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mã xác nhận')).toBeTruthy();
    });
    expect(screen.getByText('Xác nhận')).toBeTruthy();
  });

  it('should load email from signup flow', async () => {
    render(
      <TestWrapper>
        <OtpCodeScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('forgot_password_temp_data');
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('signup_temp_data');
    });
  });

  it('should load email from forgot-password flow', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'forgot_password_temp_data') {
        return Promise.resolve(JSON.stringify({ email: 'forgot@example.com', flow: 'forgot-password' }));
      }
      return Promise.resolve(null);
    });

    render(
      <TestWrapper>
        <OtpCodeScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('forgot_password_temp_data');
    });
  });

  it('should complete registration on valid OTP', async () => {
    (api.post as jest.Mock)
      .mockResolvedValueOnce({ data: { data: { token: 'verify-token' } } })
      .mockResolvedValueOnce({ data: { success: true } });
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <OtpCodeScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mã xác nhận')).toBeTruthy();
    });

    const inputs = screen.root.findAllByType('TextInput');
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');

    fireEvent.press(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(API_VERIFY_OTP, { email: 'test@example.com', otp: '1234' });
    });

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(API_REGISTER_COMPLETE, {
        name: 'Test',
        email: 'test@example.com',
        password: 'password123',
        token: 'verify-token',
      });
    });

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Đăng ký tài khoản thành công!', expect.any(Array));
    });
  });

  it('should navigate to new password on forgot-password flow', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'forgot_password_temp_data') {
        return Promise.resolve(JSON.stringify({ email: 'forgot@example.com', flow: 'forgot-password' }));
      }
      return Promise.resolve(null);
    });

    (api.post as jest.Mock).mockResolvedValue({ data: { data: { token: 'reset-token' } } });
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    render(
      <TestWrapper>
        <OtpCodeScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mã xác nhận')).toBeTruthy();
    });

    const inputs = screen.root.findAllByType('TextInput');
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');

    fireEvent.press(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('reset_password_token', 'reset-token');
    });

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith(ROUTES.NEW_PASSWORD);
    });
  });

  it('should show alert on OTP verification failure', async () => {
    (api.post as jest.Mock).mockRejectedValue({
      response: { data: { message: 'Invalid OTP' } },
    });

    render(
      <TestWrapper>
        <OtpCodeScreen />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Mã xác nhận')).toBeTruthy();
    });

    const inputs = screen.root.findAllByType('TextInput');
    fireEvent.changeText(inputs[0], '1');
    fireEvent.changeText(inputs[1], '2');
    fireEvent.changeText(inputs[2], '3');
    fireEvent.changeText(inputs[3], '4');

    fireEvent.press(screen.getByText('Xác nhận'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Invalid OTP');
    });
  });
});

