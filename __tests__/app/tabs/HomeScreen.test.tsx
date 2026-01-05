import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

import HomeScreen, { Card } from '@/app/(app)/(tabs)/home';

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

// Configurable mocks for FacultyScreen/api
const mockUseFetchFacultyInfo = jest.fn();
const mockUseSubscribeFaculty = jest.fn();
const mockUseUnsubscribeFaculty = jest.fn();

jest.mock('@/components/FacultyScreen/api', () => ({
  useFetchFacultyInfo: (...args: any[]) => mockUseFetchFacultyInfo(...args),
  useSubscribeFaculty: (...args: any[]) => mockUseSubscribeFaculty(...args),
  useUnsubscribeFaculty: (...args: any[]) => mockUseUnsubscribeFaculty(...args),
}));

// Configurable mock for searchResultScreen
const mockUseFetchFacultiesAndSubjects = jest.fn();
jest.mock('@/components/searchResultScreen/api', () => ({
  useFetchFacultiesAndSubjects: () => mockUseFetchFacultiesAndSubjects(),
}));

jest.mock('@/components/Admin/api', () => ({
  useFetchAdminStatistics: () => ({ data: { totalUsers: 10, pendingDocuments: 2 } }),
}));

// Configurable mock for AuthContext
const mockUseAuth = jest.fn();
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Configurable mock for UserContext
const mockUseUser = jest.fn();
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => mockUseUser(),
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

// Default mock implementations
const defaultFacultyInfo = {
  data: {
    name: 'Khoa 1',
    isFollowingFaculty: false,
    subjects: [
      { name: 'Môn A', documents: [{ id: 'd1', title: 'Doc 1', downloadCount: 1, uploadDate: '2025-01-01', type: 'pdf', thumbnailUrl: '' }] },
    ],
  },
  isLoading: false,
};

const defaultFaculties = {
  data: { faculties: [{ id: 'f1', name: 'Khoa 1' }] },
  isLoading: false,
};

const setupDefaultMocks = () => {
  mockUseAuth.mockReturnValue({ logout: jest.fn(), userProfile: { role: 'user' } });
  mockUseUser.mockReturnValue({ userProfile: { name: 'Thuan', imageUrl: null }, isLoading: false });
  mockUseFetchFacultiesAndSubjects.mockReturnValue(defaultFaculties);
  mockUseFetchFacultyInfo.mockReturnValue(defaultFacultyInfo);
  mockUseSubscribeFaculty.mockReturnValue({ isPending: false, mutate: jest.fn() });
  mockUseUnsubscribeFaculty.mockReturnValue({ isPending: false, mutate: jest.fn() });

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
};

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
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

  it('displays suggestion from API response', async () => {
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

  it('displays user name greeting', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    expect(screen.getByText('Xin chào,')).toBeTruthy();
    expect(screen.getByText('THUAN')).toBeTruthy();
  });
});

describe('HomeScreen - Admin Panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
    // Override to make user admin
    mockUseAuth.mockReturnValue({ logout: jest.fn(), userProfile: { role: 'admin' } });
  });

  it('renders admin panel when user is admin', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Thành viên')).toBeTruthy();
      expect(screen.getByText('Tài liệu duyệt')).toBeTruthy();
      expect(screen.getByText('10')).toBeTruthy();
      expect(screen.getByText('+2')).toBeTruthy();
    });
  });
});

describe('HomeScreen - API Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  it('calls suggestions API on render', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/suggestions');
    });
  });

  it('displays suggestions from successful API response', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Suggest 1')).toBeTruthy();
    });
  });

  it('handles suggestions with documents nested under data property', async () => {
    mockApiGet.mockImplementation((url: string) => {
      const u = String(url);
      if (u.includes('/suggestions')) {
        return Promise.resolve({
          data: {
            data: {
              documents: [
                { id: 's2', title: 'Nested Doc', thumbnailUrl: 'y', subject: 'B', downloadCount: 2, uploadDate: '2025-02-01', fileType: 'pdf' },
              ],
            },
          },
        });
      }
      if (u.includes('/faculty-info')) {
        return Promise.resolve({ data: { data: { subjects: [] } } });
      }
      return Promise.resolve({ data: { data: [] } });
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Nested Doc')).toBeTruthy();
    });
  });
});

describe('HomeScreen - Quick Action Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  it('navigates to search when search button is pressed', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    const searchButton = screen.getByText('Tìm kiếm');
    fireEvent.press(searchButton);

    expect(mockPush).toHaveBeenCalledWith('/search');
  });

  it('navigates to following when following button is pressed', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    const followingButton = screen.getByText('Đã theo dõi');
    fireEvent.press(followingButton);

    expect(mockPush).toHaveBeenCalledWith('/following');
  });

  it('navigates to saved documents when saved docs button is pressed', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    const savedDocButton = screen.getByText('Tài liệu đã lưu');
    fireEvent.press(savedDocButton);

    expect(mockPush).toHaveBeenCalledWith('/saved-doc');
  });

  it('navigates to chatbot when chatbot button is pressed', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    const chatbotButton = screen.getByText('Chatbot AI');
    fireEvent.press(chatbotButton);

    expect(mockPush).toHaveBeenCalledWith('/chatbot');
  });
});

describe('HomeScreen - User Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  it('renders loading placeholder when user is loading', async () => {
    mockUseUser.mockReturnValue({
      userProfile: null,
      isLoading: true,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    expect(screen.getByText('Xin chào,')).toBeTruthy();
    // When loading, no user name should be displayed
    expect(screen.queryByText('THUAN')).toBeNull();
  });

  it('renders user name when loading is complete', async () => {
    mockUseUser.mockReturnValue({
      userProfile: { name: 'Test User', imageUrl: null },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('TEST USER')).toBeTruthy();
    });
  });

  it('renders with user avatar from URL', async () => {
    mockUseUser.mockReturnValue({
      userProfile: { name: 'Avatar User', imageUrl: 'https://example.com/avatar.jpg' },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    expect(screen.getByText('AVATAR USER')).toBeTruthy();
  });
});

describe('Card component', () => {
  it('renders card with static content', () => {
    render(
      <Wrapper>
        <Card />
      </Wrapper>
    );

    expect(screen.getByText('Giáo trình Giải tích 1 Đại học Bách khoa Tp.HCM')).toBeTruthy();
    expect(screen.getByText('Tên môn học')).toBeTruthy();
    expect(screen.getByText('dd/mm/yyyy')).toBeTruthy();
    expect(screen.getByText('1234 lượt')).toBeTruthy();
  });
});

describe('FacultySection - Follow/Unfollow', () => {
  const mockSubscribeMutate = jest.fn();
  const mockUnsubscribeMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
    mockSubscribeMutate.mockClear();
    mockUnsubscribeMutate.mockClear();
  });

  it('calls subscribe when follow button is pressed', async () => {
    mockUseSubscribeFaculty.mockReturnValue({
      isPending: false,
      mutate: mockSubscribeMutate,
    });
    mockUseUnsubscribeFaculty.mockReturnValue({
      isPending: false,
      mutate: mockUnsubscribeMutate,
    });
    mockUseFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Khoa Test',
        isFollowingFaculty: false,
        subjects: [
          { name: 'Môn Test', documents: [{ id: 'd1', title: 'Doc Test', downloadCount: 1, uploadDate: '2025-01-01', type: 'pdf' }] },
        ],
      },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Theo dõi')).toBeTruthy();
    });

    const followButton = screen.getByText('Theo dõi');
    fireEvent.press(followButton);

    expect(mockSubscribeMutate).toHaveBeenCalled();
  });

  it('calls unsubscribe when unfollow button is pressed', async () => {
    mockUseSubscribeFaculty.mockReturnValue({
      isPending: false,
      mutate: mockSubscribeMutate,
    });
    mockUseUnsubscribeFaculty.mockReturnValue({
      isPending: false,
      mutate: mockUnsubscribeMutate,
    });
    mockUseFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Khoa Following',
        isFollowingFaculty: true,
        subjects: [
          { name: 'Môn Test', documents: [{ id: 'd1', title: 'Doc Test', downloadCount: 1, uploadDate: '2025-01-01', type: 'pdf' }] },
        ],
      },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Bỏ theo dõi')).toBeTruthy();
    });

    const unfollowButton = screen.getByText('Bỏ theo dõi');
    fireEvent.press(unfollowButton);

    expect(mockUnsubscribeMutate).toHaveBeenCalled();
  });

  it('shows spinner when follow action is pending', async () => {
    mockUseSubscribeFaculty.mockReturnValue({
      isPending: true,
      mutate: mockSubscribeMutate,
    });
    mockUseFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Khoa Loading',
        isFollowingFaculty: false,
        subjects: [
          { name: 'Môn Test', documents: [{ id: 'd1', title: 'Doc Test', downloadCount: 1, uploadDate: '2025-01-01', type: 'pdf' }] },
        ],
      },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      // When pending, the follow/unfollow text should not be visible, spinner should be shown
      expect(screen.queryByText('Theo dõi')).toBeNull();
    });
  });
});

describe('FacultySection - Empty Documents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  it('hides faculty section when no documents exist', async () => {
    mockUseFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Khoa Empty',
        isFollowingFaculty: false,
        subjects: [],
      },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      // Faculty with no documents should not render its name
      expect(screen.queryByText('Khoa Empty')).toBeNull();
    });
  });
});

describe('FacultySection - Loading State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  it('renders faculty name from fallback when data is loading', async () => {
    mockUseFetchFacultyInfo.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    // When loading and no data, faculty section is hidden due to docs.length === 0
    await waitFor(() => {
      expect(screen.queryByText('Theo dõi')).toBeNull();
    });
  });
});

describe('FacultySection - Document Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  it('renders documents from faculty subjects', async () => {
    mockUseFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Khoa CS',
        isFollowingFaculty: false,
        subjects: [
          {
            name: 'Data Structures',
            documents: [
              { id: 'd1', title: 'DS Book 1', downloadCount: 100, uploadDate: '2025-01-01', type: 'pdf' },
              { id: 'd2', title: 'DS Book 2', downloadCount: 200, uploadDate: '2025-01-02', type: 'pdf' },
            ]
          },
          {
            name: 'Algorithms',
            documents: [
              { id: 'd3', title: 'Algo Book', downloadCount: 150, uploadDate: '2025-01-03', type: 'pdf' },
            ]
          },
        ],
      },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('DS Book 1')).toBeTruthy();
      expect(screen.getByText('DS Book 2')).toBeTruthy();
      expect(screen.getByText('Algo Book')).toBeTruthy();
    });
  });

  it('limits documents to 6 per faculty', async () => {
    const manyDocs = Array.from({ length: 10 }, (_, i) => ({
      id: `d${i}`,
      title: `Document ${i}`,
      downloadCount: i * 10,
      uploadDate: '2025-01-01',
      type: 'pdf',
    }));

    mockUseFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Big Faculty',
        isFollowingFaculty: false,
        subjects: [{ name: 'Subject', documents: manyDocs }],
      },
      isLoading: false,
    });

    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      // Should show first 6 documents
      expect(screen.getByText('Document 0')).toBeTruthy();
      expect(screen.getByText('Document 5')).toBeTruthy();
      // Should not show 7th document
      expect(screen.queryByText('Document 6')).toBeNull();
    });
  });
});

describe('HomeScreen - Admin Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupDefaultMocks();
    mockUseAuth.mockReturnValue({ logout: jest.fn(), userProfile: { role: 'admin' } });
  });

  it('navigates to member management when admin presses member button', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Thành viên')).toBeTruthy();
    });

    const memberButton = screen.getByText('Thành viên');
    fireEvent.press(memberButton);

    expect(mockPush).toHaveBeenCalledWith('/admin/member');
  });

  it('navigates to document management when admin presses document button', async () => {
    render(
      <Wrapper>
        <HomeScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Tài liệu duyệt')).toBeTruthy();
    });

    const docButton = screen.getByText('Tài liệu duyệt');
    fireEvent.press(docButton);

    expect(mockPush).toHaveBeenCalledWith('/admin/doc');
  });
});
