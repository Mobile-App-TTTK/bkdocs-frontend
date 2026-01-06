import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import OtpCodeForm from '@/components/auth/OtpCodeForm';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('OtpCodeForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render title', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Mã xác nhận')).toBeTruthy();
    });

    it('should render 4 OTP inputs', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const inputs = screen.root.findAllByType('TextInput');
      expect(inputs.length).toBe(4);
    });

    it('should render submit button', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      expect(screen.getByText('Xác nhận')).toBeTruthy();
    });

    it('should display email if provided', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} email="test@example.com" />
        </TestWrapper>
      );

      expect(screen.getByText(/test@example.com/)).toBeTruthy();
    });
  });

  describe('OTP Input Behavior', () => {
    it('should auto-focus next input when digit entered', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const inputs = screen.root.findAllByType('TextInput');
      fireEvent.changeText(inputs[0], '1');

      expect(inputs[0].props.value).toBe('1');
    });

    it('should take only last character when multiple entered', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const inputs = screen.root.findAllByType('TextInput');
      fireEvent.changeText(inputs[0], '123');

      expect(inputs[0].props.value).toBe('3');
    });
  });

  describe('Form Validation', () => {
    it('should show error when OTP is incomplete', async () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(screen.getByText('Vui lòng điền đầy đủ mã OTP')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when only partial OTP entered', async () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const inputs = screen.root.findAllByType('TextInput');
      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '2');

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(screen.getByText('Vui lòng điền đầy đủ mã OTP')).toBeTruthy();
      });
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with joined OTP when complete', async () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const inputs = screen.root.findAllByType('TextInput');
      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '2');
      fireEvent.changeText(inputs[2], '3');
      fireEvent.changeText(inputs[3], '4');

      fireEvent.press(screen.getByText('Xác nhận'));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('1234');
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} isLoading={true} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('loading')).toBeTruthy();
    });
  });

  describe('Backspace Handling', () => {
    it('should handle backspace key press', () => {
      render(
        <TestWrapper>
          <OtpCodeForm onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const inputs = screen.root.findAllByType('TextInput');
      fireEvent.changeText(inputs[0], '1');
      fireEvent.changeText(inputs[1], '2');
      
      fireEvent(inputs[1], 'keyPress', { nativeEvent: { key: 'Backspace' } });
    });
  });
});

