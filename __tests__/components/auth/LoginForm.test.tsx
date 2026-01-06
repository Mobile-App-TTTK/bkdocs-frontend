import LoginForm from '@/components/auth/LoginForm';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// NativeBase test wrapper
const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all form elements', () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      // There are 2 "Đăng nhập" texts: title and button
      const loginTexts = screen.getAllByText('Đăng nhập');
      expect(loginTexts.length).toBe(2);
      expect(screen.getByText('Vui lòng đăng nhập để sử dụng!')).toBeTruthy();
      expect(screen.getByText('Email')).toBeTruthy();
      expect(screen.getByText('Mật khẩu')).toBeTruthy();
      expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeTruthy();
      expect(screen.getByPlaceholderText('Nhập mật khẩu')).toBeTruthy();
    });

    it('should render forgot password and signup links', () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Quên mật khẩu?')).toBeTruthy();
      expect(screen.getByText('Chưa có tài khoản?')).toBeTruthy();
      expect(screen.getByText('Đăng ký ngay')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error when email is empty', async () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
      fireEvent.changeText(passwordInput, 'password123');

      // Get the button (second element with 'Đăng nhập' text)
      const submitButtons = screen.getAllByText('Đăng nhập');
      const submitButton = submitButtons[1]; // Button is second
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email là bắt buộc')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error for invalid email format', async () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.changeText(passwordInput, 'password123');

      const submitButtons = screen.getAllByText('Đăng nhập');
      const submitButton = submitButtons[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email không hợp lệ')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is empty', async () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
      fireEvent.changeText(emailInput, 'test@example.com');

      const submitButtons = screen.getAllByText('Đăng nhập');
      const submitButton = submitButtons[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Mật khẩu là bắt buộc')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is less than 6 characters', async () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, '12345');

      const submitButtons = screen.getAllByText('Đăng nhập');
      const submitButton = submitButtons[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Mật khẩu phải có ít nhất 6 ký tự')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show both errors when both fields are invalid', async () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const submitButtons = screen.getAllByText('Đăng nhập');
      const submitButton = submitButtons[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email là bắt buộc')).toBeTruthy();
        expect(screen.getByText('Mật khẩu là bắt buộc')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with valid credentials', async () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

      fireEvent.changeText(emailInput, 'test@example.com');
      fireEvent.changeText(passwordInput, 'password123');

      const submitButtons = screen.getAllByText('Đăng nhập');
      const submitButton = submitButtons[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('should trim email before submission', async () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

      fireEvent.changeText(emailInput, '  test@example.com  ');
      fireEvent.changeText(passwordInput, 'password123');

      const submitButtons = screen.getAllByText('Đăng nhập');
      const submitButton = submitButtons[1];
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when loading', () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} isLoading={true} />
        </TestWrapper>
      );

      const emailInput = screen.getByPlaceholderText('Nhập email của bạn');
      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

      expect(emailInput.props.editable).toBe(false);
      expect(passwordInput.props.editable).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to forgot password page', () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByText('Quên mật khẩu?');
      fireEvent.press(forgotPasswordLink);

      expect(router.push).toHaveBeenCalledWith(ROUTES.FORGOT_PASSWORD);
    });

    it('should navigate to signup page', () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const signupLink = screen.getByText('Đăng ký ngay');
      fireEvent.press(signupLink);

      expect(router.push).toHaveBeenCalledWith(ROUTES.SIGNUP);
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should have password hidden by default', () => {
      render(
        <TestWrapper>
          <LoginForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');

      // Initially password should be hidden (secureTextEntry = true)
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });
});

