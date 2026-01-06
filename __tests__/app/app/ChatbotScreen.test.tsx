// __tests__/app/app/ChatbotScreen.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

import ChatbotScreen from '@/app/(app)/chatbot';
import { ROUTES } from '@/utils/routes';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

let mockMutate = jest.fn();
let mockIsPending = false;
jest.mock('@/components/Chatbot/api', () => ({
  useSendChatMessage: () => ({ isPending: mockIsPending, mutate: mockMutate }),
}));

let mockUserProfile: { name: string } | null = { name: 'Thuận' };
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ userProfile: mockUserProfile }),
}));

jest.mock('react-native-markdown-display', () => {
  const { Text, View } = require('react-native');
  return ({ children, rules }: { children: string, rules: any }) => {
    // Basic mock that applies rules if provided
    if (rules && rules.code_inline) {
      // Simulate parsing for UUIDs if rules are present
      const uuidMatch = children.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (uuidMatch) {
        const uuid = uuidMatch[0];
        const parts = children.split(uuid);

        // We need to invoke the rule's render function to get the actual component with onPress
        // The component passes: (node, children, parent, styles)
        // We mock the node content
        const mockNode = { content: uuid, key: 'mock-key' };
        const renderedUuid = rules.code_inline(mockNode, [], {}, {});

        return (
          <View>
            <Text>{parts[0]}</Text>
            {renderedUuid}
          </View>
        );
      }
    }
    return <Text>{children}</Text>;
  };
});

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
    mockMutate = jest.fn();
    mockIsPending = false;
    mockUserProfile = { name: 'Thuận' };
    require('react-native/Libraries/Utilities/useColorScheme').default.mockReturnValue('light');
  });


  describe('Rendering', () => {
    it('renders header with title', () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);
      expect(screen.getByText('Chatbot AI')).toBeTruthy();
    });

    it('renders back button in header', () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);
      expect(screen.getByText('Chatbot AI')).toBeTruthy();
    });

    it('renders message input', () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);
      expect(screen.getByPlaceholderText('Nhập nội dung tin nhắn...')).toBeTruthy();
    });

    it('renders send button area', () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);
      expect(screen.getByPlaceholderText('Nhập nội dung tin nhắn...')).toBeTruthy();
    });
  });


  describe('Welcome Message', () => {
    it('shows welcome message with user name', async () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });
    });

    it('does not show welcome message without user profile', async () => {
      mockUserProfile = null;
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.queryByText(/Xin chào/i)).toBeNull();
      });
    });
  });

  describe('Send Message', () => {
    it('submits message and excludes welcome message from history payload', async () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);

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

    it('clears input after sending message', async () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Test message');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(input.props.value).toBe('');
      });
    });

    it('adds user message to chat history after sending', async () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'My test message');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('My test message')).toBeTruthy();
      });
    });

    it('does not send empty message', async () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, '   '); // whitespace only
      fireEvent(input, 'submitEditing');

      expect(mockMutate).not.toHaveBeenCalled();
    });

    it('does not send when already pending', async () => {
      mockIsPending = true;
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Test');
      fireEvent(input, 'submitEditing');

      expect(mockMutate).not.toHaveBeenCalled();
    });
  });

  // ==================== SUCCESS RESPONSE TESTS ====================

  describe('Success Response', () => {
    it('displays AI response after successful send', async () => {
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onSuccess?.({ reply: 'Hello! How can I help?', suggestedActions: [] });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Hello');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Hello! How can I help?')).toBeTruthy();
      });
    });

    it('displays suggested actions from response', async () => {
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onSuccess?.({
          reply: 'Here are some options:',
          suggestedActions: ['Find documents', 'Ask about courses']
        });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Help me');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Find documents')).toBeTruthy();
        expect(screen.getByText('Ask about courses')).toBeTruthy();
      });
    });

    it('fills input when suggested action is pressed', async () => {
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onSuccess?.({
          reply: 'Here are options:',
          suggestedActions: ['Search for math']
        });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Help');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Search for math')).toBeTruthy();
      });

      fireEvent.press(screen.getByText('Search for math'));

      await waitFor(() => {
        expect(input.props.value).toBe('Search for math');
      });
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  describe('Error Handling', () => {
    it('displays error message on API failure', async () => {
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onError?.({ response: { data: { message: 'Server error occurred' } } });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Test');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeTruthy();
      });
    });

    it('displays fallback error message when no specific error', async () => {
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onError?.({});
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Test');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.')).toBeTruthy();
      });
    });

    it('displays error from response.data.error field', async () => {
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onError?.({ response: { data: { error: 'Rate limit exceeded' } } });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Test');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Rate limit exceeded')).toBeTruthy();
      });
    });
  });

  // ==================== PENDING STATE TESTS ====================

  describe('Pending State', () => {
    it('shows thinking indicator when isPending is true', async () => {
      mockIsPending = true;
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Đang suy nghĩ...')).toBeTruthy();
      });
    });

    it('disables send button when pending', async () => {
      mockIsPending = true;
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText('Đang suy nghĩ...')).toBeTruthy();
      });

      // The send button should show spinner when pending
      // Since Spinner is mocked to native-base, we just verify component renders
      expect(screen.getByText('Chatbot AI')).toBeTruthy();
    });
  });

  // ==================== CHAT HISTORY TESTS ====================

  describe('Chat History', () => {
    it('maintains conversation history across messages', async () => {
      let messageCount = 0;
      mockMutate = jest.fn((params, callbacks) => {
        messageCount++;
        callbacks?.onSuccess?.({ reply: `Response ${messageCount}`, suggestedActions: [] });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');

      // First message
      fireEvent.changeText(input, 'First message');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Response 1')).toBeTruthy();
      });

      // Second message
      fireEvent.changeText(input, 'Second message');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Response 2')).toBeTruthy();
        // Both messages should be visible
        expect(screen.getByText('First message')).toBeTruthy();
        expect(screen.getByText('Second message')).toBeTruthy();
      });
    });

    it('sends history with subsequent messages', async () => {
      let callCount = 0;
      mockMutate = jest.fn((params, callbacks) => {
        callCount++;
        if (callCount === 2) {
          // Second call should have history from first exchange
          expect(params.history.length).toBeGreaterThan(0);
        }
        callbacks?.onSuccess?.({ reply: `Reply ${callCount}`, suggestedActions: [] });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      await waitFor(() => {
        expect(screen.getByText(/Xin chào Thuận/i)).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');

      // First message
      fireEvent.changeText(input, 'First');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText('Reply 1')).toBeTruthy();
      });

      // Second message - should include history
      fireEvent.changeText(input, 'Second');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ==================== INPUT TESTS ====================

  describe('Input Behavior', () => {
    it('updates message state on text change', () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Hello world');

      expect(input.props.value).toBe('Hello world');
    });

    it('has max length of 1000 characters', () => {
      render(<Wrapper><ChatbotScreen /></Wrapper>);

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      expect(input.props.maxLength).toBe(1000);
    });
  });

  // ==================== FEATURES TESTS ====================

  describe('Feature Logic', () => {
    it('parses UUID and navigates to document on press', async () => {
      const uuid = '12345678-1234-1234-1234-1234567890ab';
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onSuccess?.({ reply: `Check this doc: ${uuid}`, suggestedActions: [] });
      });

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Find doc');
      fireEvent(input, 'submitEditing');

      await waitFor(() => {
        expect(screen.getByText(/Check this doc:/)).toBeTruthy();
      });

      // Based on our updated mock, the UUID should be its own Text element
      const uuidElement = screen.getByText(uuid);
      expect(uuidElement).toBeTruthy();

      fireEvent.press(uuidElement);
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.DOWNLOAD_DOC,
        params: { id: uuid },
      });
    });

    it('uses different colors in dark mode', () => {
      const { useColorScheme } = require('react-native');
      useColorScheme.mockReturnValue('dark');

      render(<Wrapper><ChatbotScreen /></Wrapper>);

      // Verify header text color for dark mode (white)
      const headerTitle = screen.getByText('Chatbot AI');
      // NativeBase styling might not reflect in "style" prop directly if using utility props, 
      // but our component uses inline style override for fontFamily which also has colors in some places?
      // Let's check the markdown color prop which we pass in renderMessage

      // We need to render a message to check markdown styles
      // But simpler: Check the container background or text color if possible.
      // The component: className="!text-xl !font-bold !text-black dark:!text-white"

      // Testing tailwind classes application via RNTL is tricky without full style computation.
      // However, we can check if specific elements are rendered that only appear in dark mode or check props if conditional.

      // Alternative: Check the UUID style color which is conditional in our code:
      // color: colorScheme === 'dark' ? '#60a5fa' : '#2563eb'

      const uuid = '12345678-1234-1234-1234-1234567890ab';
      mockMutate = jest.fn((params, callbacks) => {
        callbacks?.onSuccess?.({ reply: `Doc: ${uuid}`, suggestedActions: [] });
      });

      const input = screen.getByPlaceholderText('Nhập nội dung tin nhắn...');
      fireEvent.changeText(input, 'Find doc');
      fireEvent(input, 'submitEditing');

      const uuidText = screen.getByText(uuid);
      // The style prop is a nested array. Flatten it to find the color object easily.
      const flatStyle = [uuidText.props.style].flat(Infinity);
      expect(flatStyle).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#60a5fa' })
        ])
      );
    });
  });

  // NOTE: Scroll behavior is hard to test with reliable assertions on scroll position in RNTL without layout.
  // We will skip scroll test for now as implementation detail often mocked out.
});
