// __tests__/app/app/ChatbotScreen.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

import ChatbotScreen from '@/app/(app)/chatbot';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: jest.fn() }),
}));

const mockMutate = jest.fn();
jest.mock('@/components/Chatbot/api', () => ({
  useSendChatMessage: () => ({ isPending: false, mutate: mockMutate }),
}));

jest.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ userProfile: { name: 'Thuận' } }),
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('ChatbotScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header', () => {
    render(
      <Wrapper>
        <ChatbotScreen />
      </Wrapper>
    );
    expect(screen.getByText('Chatbot AI')).toBeTruthy();
  });

  it('shows welcome message with user name', async () => {
    render(
      <Wrapper>
        <ChatbotScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
    });
  });

  it('submits message and excludes welcome message from history payload', async () => {
    render(
      <Wrapper>
        <ChatbotScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
    });

    const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
    fireEvent.changeText(input, 'Hello bot');

    fireEvent(input, 'submitEditing');

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
      const payload = mockMutate.mock.calls[0][0];
      expect(payload.message).toBe('Hello bot');
      expect(payload.history).toEqual([]); 
    });
  });
});
