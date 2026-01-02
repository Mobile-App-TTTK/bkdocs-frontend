import { ChatMessage, ChatResponse, useSendChatMessage } from '@/components/Chatbot/api';
import { useUser } from '@/contexts/UserContext';
import { ROUTES } from '@/utils/routes';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Spinner, Text, View } from 'native-base';
import React, { useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ChatMessageWithActions extends ChatMessage {
  suggestedActions?: string[];
}

export default function ChatbotScreen() {
  const router = useRouter();
  const { userProfile } = useUser();
  const colorScheme = useColorScheme();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessageWithActions[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const sendChatMutation = useSendChatMessage();

  console.log(chatHistory);

  useEffect(() => {
    if (userProfile && chatHistory.length === 0) {
      const welcomeMessage: ChatMessageWithActions = {
        role: 'admin',
        content: `Xin chào ${userProfile.name}, tôi có thể giúp gì cho bạn hôm nay?`,
      };
      setChatHistory([welcomeMessage]);
    }
  }, [userProfile]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (!message.trim() || sendChatMutation.isPending) return;

    const userMessage: ChatMessage = {
      role: 'student',
      content: message.trim(),
    };

    // Thêm tin nhắn của user vào history
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    const currentMessage = message.trim();
    setMessage('');

    // Lọc history để chỉ gửi các tin nhắn từ conversation thực tế
    // Bỏ qua welcome message (tin nhắn đầu tiên từ admin)
    const isFirstMessage = chatHistory.length === 1 && chatHistory[0].role === 'admin';
    const historyToSend: ChatMessage[] = isFirstMessage 
      ? [] 
      : chatHistory
          .filter((msg) => {
            // Bỏ qua welcome message
            if (msg.role === 'admin' && msg.content.includes('Xin chào') && msg.content.includes('tôi có thể giúp gì cho bạn hôm nay')) {
              return false;
            }
            return true;
          })
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));

    // Gửi tin nhắn
    sendChatMutation.mutate(
      {
        message: currentMessage,
        history: historyToSend,
      },
      {
        onSuccess: (response: ChatResponse) => {
          // Thêm phản hồi từ AI vào history
          const aiMessage: ChatMessageWithActions = {
            role: 'admin',
            content: response.reply || '',
            suggestedActions: response.suggestedActions || [],
          };
          setChatHistory([...newHistory, aiMessage]);
        },
        onError: (error: any) => {
          // Thêm tin nhắn lỗi
          const errorMessage: ChatMessageWithActions = {
            role: 'admin',
            content: error?.response?.data?.message || error?.response?.data?.error || 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
          };
          setChatHistory([...newHistory, errorMessage]);
        },
      }
    );
  };

  const handleSuggestedAction = (action: string) => {
    setMessage(action);
  };

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const isUUID = (text: string): boolean => {
    return UUID_REGEX.test(text.trim());
  };

  const handleDocumentClick = (id: string) => {
    router.push({
      pathname: ROUTES.DOWNLOAD_DOC as any,
      params: { id },
    } as any);
  };

  const parseTextWithUUIDs = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const uuidRegex = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = uuidRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const uuid = match[0];
      parts.push(
        <Text
          key={`uuid-${key++}`}
          onPress={() => handleDocumentClick(uuid)}
          style={{
            color: colorScheme === 'dark' ? '#60a5fa' : '#2563eb',
            textDecorationLine: 'underline',
          }}
        >
          {uuid}
        </Text>
      );
      
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const renderMessage = (msg: ChatMessageWithActions, index: number) => {
    const isUser = msg.role === 'student';
    
    return (
      <View key={index}>
        <View
          className={`flex-row mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
          <View
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              isUser
                ? '!bg-primary-500 !rounded-tr-sm'
                : '!bg-gray-200 dark:!bg-gray-700 !rounded-tl-sm'
            }`}
          >
            {isUser ? (
              <Text
                className="!text-base !text-white"
                style={{ fontFamily: 'Inter-Regular' }}
              >
                {msg.content}
              </Text>
            ) : (
              <Markdown
                style={{
                  body: {
                    color: colorScheme === 'dark' ? '#f3f4f6' : '#111827',
                    fontFamily: 'Inter-Regular',
                    fontSize: 16,
                  },
                  heading1: {
                    fontSize: 24,
                    fontWeight: 'bold',
                    marginTop: 8,
                    marginBottom: 4,
                    color: colorScheme === 'dark' ? '#f3f4f6' : '#111827',
                  },
                  heading2: {
                    fontSize: 20,
                    fontWeight: 'bold',
                    marginTop: 6,
                    marginBottom: 3,
                    color: colorScheme === 'dark' ? '#f3f4f6' : '#111827',
                  },
                  heading3: {
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginTop: 4,
                    marginBottom: 2,
                    color: colorScheme === 'dark' ? '#f3f4f6' : '#111827',
                  },
                  strong: {
                    fontWeight: 'bold',
                    color: colorScheme === 'dark' ? '#f3f4f6' : '#111827',
                  },
                  em: {
                    fontStyle: 'italic',
                    color: colorScheme === 'dark' ? '#f3f4f6' : '#111827',
                  },
                  code_inline: {
                    fontFamily: 'monospace',
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                    color: colorScheme === 'dark' ? '#f3f4f6' : '#111827',
                  },
                  bullet_list: {
                    marginVertical: 4,
                  },
                  bullet_list_item: {
                    flexDirection: 'row',
                    marginVertical: 2,
                  },
                  hr: {
                    backgroundColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                    height: 1,
                    marginVertical: 8,
                  },
                }}
                rules={{
                  code_inline: (node, children, parent, styles) => {
                    const content = node.content;
                    if (isUUID(content)) {
                      return (
                        <Text
                          key={node.key}
                          onPress={() => handleDocumentClick(content)}
                          style={[
                            styles.code_inline,
                            {
                              color: colorScheme === 'dark' ? '#60a5fa' : '#2563eb',
                              textDecorationLine: 'underline',
                            },
                          ]}
                        >
                          {content}
                        </Text>
                      );
                    }
                    return <Text key={node.key} style={styles.code_inline}>{content}</Text>;
                  },
                  text: (node, children, parent, styles) => {
                    const content = node.content;
                    if (UUID_REGEX.test(content)) {
                      return (
                        <Text key={node.key} style={styles.text}>
                          {parseTextWithUUIDs(content)}
                        </Text>
                      );
                    }
                    return <Text key={node.key} style={styles.text}>{content}</Text>;
                  },
                }}
              >
                {msg.content}
              </Markdown>
            )}
          </View>
        </View>
        
        {/* Suggested Actions cho tin nhắn AI */}
        {!isUser && msg.suggestedActions && msg.suggestedActions.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mb-4">
            {msg.suggestedActions.map((action, actionIndex) => (
              <TouchableOpacity
                key={actionIndex}
                onPress={() => handleSuggestedAction(action)}
                className="bg-primary-50 dark:bg-primary-900/30 px-4 py-2 rounded-full border border-primary-200 dark:border-primary-800"
                activeOpacity={0.7}
              >
                <Text className="!text-primary-600 dark:!text-primary-400 !text-base">
                  {action}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-dark-900" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-dark-800 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#888" />
          </TouchableOpacity>

          <Text
            className="!text-xl !font-bold !text-black dark:!text-white"
            style={{ fontFamily: 'Inter-Bold' }}
          >
            Chatbot AI
          </Text>

          <View className="w-10" />
        </View>

        {/* Chat Messages */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4 pt-4"
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {chatHistory.map((msg, index) => renderMessage(msg, index))}
            
            {sendChatMutation.isPending && (
              <View className="flex-row mb-4 justify-start">
                <View className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                  <View className="flex-row items-center gap-2">
                    <Spinner size="sm" color="primary.500" />
                    <Text className="!text-gray-500 dark:!text-gray-400">
                      Đang suy nghĩ...
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>

        {/* Input Area */}
        <View className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-white dark:bg-dark-900 pb-10">
          <View className="flex-row items-center gap-3">
            <View className="flex-1 bg-gray-100 dark:bg-dark-800 rounded-full px-4" style={{ minHeight: 48, justifyContent: 'center' }}>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Nhập nội dung tin nhắn..."
                placeholderTextColor="#9ca3af"
                className="flex-1 !text-black dark:!text-white !text-base"
                style={{ 
                  fontFamily: 'Inter-Regular',
                  textAlignVertical: 'center',
                  paddingVertical: 12,
                }}
                multiline
                maxLength={1000}
                onSubmitEditing={handleSendMessage}
              />
            </View>
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!message.trim() || sendChatMutation.isPending}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                message.trim() && !sendChatMutation.isPending
                  ? 'bg-primary-500'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
              activeOpacity={0.7}
            >
              {sendChatMutation.isPending ? (
                <Spinner size="sm" color="white" />
              ) : (
                <Ionicons
                  name="paper-plane"
                  size={20}
                  color={message.trim() ? '#fff' : '#9ca3af'}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

