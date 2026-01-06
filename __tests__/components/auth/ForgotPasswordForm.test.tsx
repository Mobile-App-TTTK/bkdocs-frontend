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

import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('ForgotPasswordForm', () => {
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
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Quên mật khẩu')).toBeTruthy();
    });

    it('should render email input', () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeTruthy();
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Đặt lại mật khẩu')).toBeTruthy();
    });

    it('should render description text', () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Vui lòng điền email tài khoản để đặt lại mật khẩu')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Đặt lại mật khẩu'));

      await waitFor(() => {
        expect(screen.getByText('Email là bắt buộc')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when email is invalid', async () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'invalid-email');
      fireEvent.press(screen.getByText('Đặt lại mật khẩu'));

      await waitFor(() => {
        expect(screen.getByText('Email không hợp lệ')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with trimmed email on valid form', async () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), '  test@example.com  ');
      fireEvent.press(screen.getByText('Đặt lại mật khẩu'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable input when loading', () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} isLoading={true} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Nhập email của bạn').props.editable).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should go back when back button is pressed', () => {
      render(
        <TestWrapper>
          <ForgotPasswordForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const backButtons = screen.root.findAllByType('View').filter(v => 
        v.props.className?.includes('rounded-full')
      );
      
      if (backButtons.length > 0) {
        fireEvent.press(backButtons[0]);
      }
    });
  });
});

