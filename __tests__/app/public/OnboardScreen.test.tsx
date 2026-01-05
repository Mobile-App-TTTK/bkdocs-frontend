import { slides } from '@/components/onboard/constants';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

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
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });
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

  it('should navigate to login when skip is pressed', () => {
    render(
      <TestWrapper>
        <OnboardScreen />
      </TestWrapper>
    );

    fireEvent.press(screen.getByText('Bỏ qua'));

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.LOGIN);
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

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.LOGIN);
  });
});

