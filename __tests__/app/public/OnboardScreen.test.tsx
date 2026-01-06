import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('@/components/onboard/constants', () => ({
  slides: [
    { id: '1', title: 'Slide 1', description: 'Desc 1', image: 1, primaryCta: 'Tiếp theo' },
    { id: '2', title: 'Slide 2', description: 'Desc 2', image: 2, primaryCta: 'Tiếp theo' },
    { id: '3', title: 'Slide 3', description: 'Desc 3', image: 3, primaryCta: 'Bắt đầu' },
  ],
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock analytics
jest.mock('@/services/analytics', () => ({
  logOnboardingComplete: jest.fn(() => Promise.resolve()),
}));

import OnboardScreen from '@/app/(public)/onboard';

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>
    {children}
  </NativeBaseProvider>
);

describe('OnboardScreen', () => {
  let mockReplace: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Get the mocked expo-router module
    const expoRouter = require('expo-router');

    // Create a new mock function for replace
    mockReplace = jest.fn();

    // Update the router.replace mock
    expoRouter.router.replace = mockReplace;
  });

  it('should render first slide', () => {
    render(
      <TestWrapper>
        <OnboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Slide 1')).toBeTruthy();
    expect(screen.getByText('Desc 1')).toBeTruthy();
    expect(screen.getByText('Tiếp theo')).toBeTruthy();
  });

  it('should render skip button', () => {
    render(
      <TestWrapper>
        <OnboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Bỏ qua')).toBeTruthy();
  });

  it('should navigate to login when skip is pressed', async () => {
    render(
      <TestWrapper>
        <OnboardScreen />
      </TestWrapper>
    );

    fireEvent.press(screen.getByText('Bỏ qua'));

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });

  it('should render slide description', () => {
    render(
      <TestWrapper>
        <OnboardScreen />
      </TestWrapper>
    );

    expect(screen.getByText('Desc 1')).toBeTruthy();
  });

  it('should navigate to login on last slide primary button', async () => {
    render(
      <TestWrapper>
        <OnboardScreen />
      </TestWrapper>
    );

    fireEvent.press(screen.getByText('Tiếp theo'));

    await waitFor(() => {
      expect(screen.getByText('Slide 2')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Tiếp theo'));

    await waitFor(() => {
      expect(screen.getByText('Slide 3')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Bắt đầu'));

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(ROUTES.LOGIN);
    });
  });
});