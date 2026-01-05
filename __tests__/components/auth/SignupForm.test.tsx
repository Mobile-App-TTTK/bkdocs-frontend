import { ROUTES } from '@/utils/routes';
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

import SignupForm from '@/components/auth/SignupForm';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('SignupForm', () => {
  const mockOnSubmit = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Rendering', () => {
    it('should render all form fields', () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Nhập tên của bạn')).toBeTruthy();
      expect(screen.getByPlaceholderText('Nhập email của bạn')).toBeTruthy();
      expect(screen.getByPlaceholderText('Nhập mật khẩu')).toBeTruthy();
      expect(screen.getByPlaceholderText('Nhập lại mật khẩu')).toBeTruthy();
    });

    it('should render title', () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const titles = screen.getAllByText('Đăng ký');
      expect(titles.length).toBeGreaterThan(0);
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const buttons = screen.getAllByText('Đăng ký');
      expect(buttons.length).toBe(2);
    });

    it('should render login link', () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Đã có tài khoản?')).toBeTruthy();
      expect(screen.getByText('Đăng nhập')).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    it('should show error when name is empty', async () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const submitButtons = screen.getAllByText('Đăng ký');
      fireEvent.press(submitButtons[1]);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when email is empty', async () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), 'Test User');

      const submitButtons = screen.getAllByText('Đăng ký');
      fireEvent.press(submitButtons[1]);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when email is invalid', async () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), 'Test User');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'invalid-email');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu'), 'password123');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu'), 'password123');

      const submitButtons = screen.getAllByText('Đăng ký');
      fireEvent.press(submitButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('Email không hợp lệ')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when password is too short', async () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), 'Test User');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'test@example.com');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu'), '12345');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu'), '12345');

      const submitButtons = screen.getAllByText('Đăng ký');
      fireEvent.press(submitButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('Mật khẩu phải có ít nhất 6 ký tự')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when passwords do not match', async () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), 'Test User');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), 'test@example.com');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu'), 'password123');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu'), 'differentpassword');

      const submitButtons = screen.getAllByText('Đăng ký');
      fireEvent.press(submitButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('Nhập lại mật khẩu không khớp')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with trimmed values on valid form', async () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.changeText(screen.getByPlaceholderText('Nhập tên của bạn'), '  Test User  ');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập email của bạn'), '  test@example.com  ');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập mật khẩu'), 'password123');
      fireEvent.changeText(screen.getByPlaceholderText('Nhập lại mật khẩu'), 'password123');

      const submitButtons = screen.getAllByText('Đăng ký');
      fireEvent.press(submitButtons[1]);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
      });
    });
  });

  describe('Loading State', () => {
    it('should disable inputs when loading', () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} isLoading={true} />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('Nhập tên của bạn').props.editable).toBe(false);
      expect(screen.getByPlaceholderText('Nhập email của bạn').props.editable).toBe(false);
      expect(screen.getByPlaceholderText('Nhập mật khẩu').props.editable).toBe(false);
      expect(screen.getByPlaceholderText('Nhập lại mật khẩu').props.editable).toBe(false);
    });
  });

  describe('Navigation', () => {
    it('should navigate to login when login link is pressed', () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Đăng nhập'));

      expect(mockPush).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  describe('Password Visibility', () => {
    it('should toggle password visibility', () => {
      render(
        <TestWrapper>
          <SignupForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const passwordInput = screen.getByPlaceholderText('Nhập mật khẩu');
      expect(passwordInput.props.secureTextEntry).toBe(true);
    });
  });
});

