import { render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

import HomeScreen from '@/app/(app)/(tabs)/home';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn() }),
    useFocusEffect: (cb: any) => {
      React.useEffect(() => {
        const cleanup = cb?.();
        return cleanup;
      }, []);
    },
  };
});


const mockApiGet = jest.fn();
jest.mock('@/api/apiClient', () => ({
  api: { get: (...args: any[]) => mockApiGet(...args) },
}));

jest.mock('@/api/apiRoutes', () => ({
  API_GET_SUGGESTIONS: '/suggestions',
  API_GET_INFORMATION_FACULTY: '/faculty-info',
}));

jest.mock('@/components/DocumentCard', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function DocumentCard(props: any) {
    return <Text>{props.title}</Text>;
  };
});

jest.mock('@/components/ui/home-suggest-card', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function SuggestCard(props: any) {
    return <Text>{props.title}</Text>;
  };
});

jest.mock('react-native-reanimated-carousel', () => {
  const React = require('react');
  const { View } = require('react-native');
  const Carousel = ({ data = [], renderItem }: any) => (
    <View>
      {data.map((item: any, index: number) => (
        <View key={item?.id ?? index}>{renderItem({ item, index })}</View>
      ))}
    </View>
  );

  const Pagination = {
    Basic: () => <View />,
  };

  return { __esModule: true, default: Carousel, Pagination };
});

jest.mock('@/components/searchResultScreen/api', () => ({
  useFetchFacultiesAndSubjects: () => ({
    data: { faculties: [{ id: 'f1', name: 'Khoa 1' }] },
    isLoading: false,
  }),
}));

jest.mock('@/components/FacultyScreen/api', () => ({
  useFetchFacultyInfo: () => ({
    data: {
      name: 'Khoa 1',
      isFollowingFaculty: false,
      subjects: [
        { name: 'Môn A', documents: [{ id: 'd1', title: 'Doc 1', downloadCount: 1, uploadDate: '2025-01-01', type: 'pdf', thumbnailUrl: '' }] },
      ],
    },
    isLoading: false,
  }),
  useSubscribeFaculty: () => ({ isPending: false, mutate: jest.fn() }),
  useUnsubscribeFaculty: () => ({ isPending: false, mutate: jest.fn() }),
}));

jest.mock('@/components/Admin/api', () => ({
  useFetchAdminStatistics: () => ({ data: { totalUsers: 10, pendingDocuments: 2 } }),
}));

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ logout: jest.fn(), userProfile: { role: 'user' } }),
}));

jest.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ userProfile: { name: 'Thuan', imageUrl: null }, isLoading: false }),
}));

jest.mock('@/utils/routes', () => ({
  ROUTES: {
    SEARCH: '/search',
    FOLLOWING: '/following',
    SAVED_DOC: '/saved-doc',
    CHATBOT: '/chatbot',
    ADMIN_MEMBER_MANAGEMENT: '/admin/member',
    ADMIN_DOCUMENT_MANAGEMENT: '/admin/doc',
  },
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiGet.mockImplementation((url: string) => {
      const u = String(url);
      if (u.includes('/suggestions')) {
        return Promise.resolve({
          data: {
            data: [
              { id: 's1', title: 'Suggest 1', thumbnailUrl: 'x', subject: 'A', downloadCount: 1, uploadDate: '2025-01-01', fileType: 'pdf' },
            ],
          },
        });
      }
      if (u.includes('/faculty-info')) {
        return Promise.resolve({
          data: {
            data: {
              subjects: [{ documents: [{ id: 'd1', title: 'Doc 1' }] }],
            },
          },
        });
      }
      return Promise.resolve({ data: { data: [] } });
    });
  });

  it('renders quick actions and suggestions section', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    expect(screen.getByText('Tìm kiếm')).toBeTruthy();
    expect(screen.getByText('Đã theo dõi')).toBeTruthy();
    expect(screen.getByText('Tài liệu đã lưu')).toBeTruthy();
    expect(screen.getByText('Chatbot AI')).toBeTruthy();
    expect(screen.getByText('Gợi ý dành cho bạn')).toBeTruthy();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
      expect(screen.getByText('Suggest 1')).toBeTruthy();
    });
  });

  it('renders quick actions and suggestions section', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );
  
    expect(screen.getByText('Tìm kiếm')).toBeTruthy();
  
    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalled();
    });
  
    await waitFor(() => {
      expect(screen.getByText('Suggest 1')).toBeTruthy();
    });
  });
});
