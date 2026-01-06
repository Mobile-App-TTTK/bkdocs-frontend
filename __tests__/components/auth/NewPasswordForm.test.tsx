import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import NewPasswordForm from '@/components/auth/NewPasswordForm';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('NewPasswordForm', () => {
  const mockOnSubmit = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
    });
  });

  describe('Rendering', () => {
    it('should render title', () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Đặt mật khẩu mới')).toBeTruthy();
    });

    it('should render password inputs', () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Nhập mật khẩu mới')).toBeTruthy();
      expect(screen.getByPlaceholderText('Nhập lại mật khẩu mới')).toBeTruthy();
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Xác nhận')).toBeTruthy();
    });

    it('should render description text', () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Vui lòng nhập mật khẩu mới của bạn')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error when password is empty', async () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(screen.getByText('Mật khẩu là bắt buộc')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu mới'), '12345');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu mới'), '12345');

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(screen.getByText('Mật khẩu phải có ít nhất 6 ký tự')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when confirm password is empty', async () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu mới'), 'password123');

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(screen.getByText('Xin hãy xác nhận mật khẩu')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when passwords do not match', async () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu mới'), 'password123');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu mới'), 'differentpassword');

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(screen.getByText('Nhập lại mật khẩu không khớp')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with password on valid form', async () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu mới'), 'newpassword123');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu mới'), 'newpassword123');

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('newpassword123');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when loading', () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} isLoading={true} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Nhập mật khẩu mới').props.editable).toBe(false);
      expect(screen.getByPlaceholderText('Nhập lại mật khẩu mới').props.editable).toBe(false);
    });
  });

  describe('Password Visibility', () => {
    it('should have secure text entry by default', () => {
      render(
        <TestWrapper>
          <NewPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Nhập mật khẩu mới').props.secureTextEntry).toBe(true);
      expect(screen.getByPlaceholderText('Nhập lại mật khẩu mới').props.secureTextEntry).toBe(true);
    });
  });
});

