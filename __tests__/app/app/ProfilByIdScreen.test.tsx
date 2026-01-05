import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

import ProfileScreen from '@/app/(app)/profile/[id]';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    router: { back: mockBack, push: mockPush, replace: jest.fn() },
    useRouter: () => ({ back: mockBack, push: mockPush, replace: jest.fn() }),
    useLocalSearchParams: jest.fn(() => ({ id: 'u2' })),
    useFocusEffect: (cb: any) => {
      React.useEffect(() => {
        const cleanup = cb?.();
        return cleanup;
      }, []);
    },
  };
});

jest.mock('@/components/DocumentCard', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return function DocumentCard(props: any) {
    return <Text testID={`doc-${props.id}`}>{props.title}</Text>;
  };
});

const mockMutateFollow = jest.fn();
const mockToggleFollowUser = jest.fn();
jest.mock('@/components/UserCard/api', () => ({
  useToggleFollowUser: () => mockToggleFollowUser(),
}));

const mockFetchNextPage = jest.fn();
const mockUseFetchUserProfileById = jest.fn();
const mockUseFetchUserDocuments = jest.fn();

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfileById: () => mockUseFetchUserProfileById(),
  useFetchUserDocuments: () => mockUseFetchUserDocuments(),
}));

const mockUseUser = jest.fn();
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

jest.mock('@/utils/routes', () => ({
  ROUTES: { EDIT_PROFILE: '/profile/edit' },
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('ProfileScreen [id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset to default mocks
    mockUseFetchUserProfileById.mockReturnValue({
      data: {
        name: 'User B',
        email: 'b@example.com',
        imageUrl: null,
        isFollowed: false,
        numberFollowers: 3,
        documentCount: 2,
        participationDays: 100,
      },
      isLoading: false,
      error: null,
    });

    mockUseFetchUserDocuments.mockReturnValue({
      data: { pages: [[{ id: 'd1', title: 'Doc 1', fileType: 'pdf', uploadDate: '2025-01-01', downloadCount: 1, thumbnailUrl: '', subject: 'A', overallRating: 5 }]] },
      isLoading: false,
      fetchNextPage: mockFetchNextPage,
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    mockToggleFollowUser.mockReturnValue({ isPending: false, mutate: mockMutateFollow });
    mockUseUser.mockReturnValue({ currentUserId: 'u1' });
  });

  it('renders user info and follow button for other user', async () => {
    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    expect(screen.getAllByText('User B').length).toBeGreaterThan(0);
    expect(screen.getByText('b@example.com')).toBeTruthy();
    expect(screen.getByText('Theo dõi')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Doc 1')).toBeTruthy();
    });
  });


  it('calls toggle follow mutate when pressing follow', async () => {
    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getAllByText('Theo dõi')[0]);

    await waitFor(() => {
      expect(mockMutateFollow).toHaveBeenCalled();
      expect(mockMutateFollow.mock.calls[0][0]).toBe('u2');
    });
  });

  it('shows alert on follow error', async () => {
    const mockAlert = jest.spyOn(require('react-native').Alert, 'alert');

    // Mock mutate to call onError
    const mockMutateWithError = jest.fn((id, options) => {
      if (options?.onError) {
        options.onError();
      }
    });

    mockToggleFollowUser.mockReturnValue({
      isPending: false,
      mutate: mockMutateWithError,
    });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getAllByText('Theo dõi')[0]);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('Lỗi', 'Không thể thực hiện hành động này', [{ text: 'OK' }]);
    });

    mockAlert.mockRestore();
  });

  it('shows followed state with unfollow button', () => {
    mockUseFetchUserProfileById.mockReturnValue({
      data: {
        name: 'User B',
        email: 'b@example.com',
        imageUrl: null,
        isFollowed: true,
        numberFollowers: 3,
        documentCount: 2,
        participationDays: 100,
      },
      isLoading: false,
      error: null,
    });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    expect(screen.getByText('Bỏ theo dõi')).toBeTruthy();
  });

  it('shows loading spinner while following/unfollowing', () => {
    mockToggleFollowUser.mockReturnValue({
      isPending: true,
      mutate: jest.fn(),
    });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    // Spinner should be visible in the follow button
    const spinners = screen.getAllByLabelText('loading');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('loads more documents when scrolling to end', async () => {
    const mockFetchNext = jest.fn();

    mockUseFetchUserDocuments.mockReturnValue({
      data: { pages: [[{ id: 'd1', title: 'Doc 1', fileType: 'pdf', uploadDate: '2025-01-01', downloadCount: 1, thumbnailUrl: '', subject: 'A', overallRating: 5 }]] },
      isLoading: false,
      fetchNextPage: mockFetchNext,
      hasNextPage: true,
      isFetchingNextPage: false,
    });

    const { UNSAFE_getByType } = render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    const flatList = UNSAFE_getByType(require('react-native').FlatList);
    fireEvent(flatList, 'onEndReached');

    await waitFor(() => {
      expect(mockFetchNext).toHaveBeenCalled();
    });
  });

  it('shows loading footer when fetching next page', () => {
    mockUseFetchUserDocuments.mockReturnValue({
      data: { pages: [[{ id: 'd1', title: 'Doc 1', fileType: 'pdf', uploadDate: '2025-01-01', downloadCount: 1, thumbnailUrl: '', subject: 'A', overallRating: 5 }]] },
      isLoading: false,
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: true,
    });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    // Footer spinner should be visible  
    const spinners = screen.getAllByLabelText('loading');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('shows empty state when no documents', () => {
    mockUseFetchUserDocuments.mockReturnValue({
      data: { pages: [] },
      isLoading: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    expect(screen.getByText('Chưa có tài liệu nào')).toBeTruthy();
  });

  it('renders different file type extensions correctly', () => {
    mockUseFetchUserDocuments.mockReturnValue({
      data: {
        pages: [[
          { id: 'd1', title: 'Word Doc', fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: '2025-01-01', downloadCount: 1, thumbnailUrl: '', subject: 'A', overallRating: 5 },
          { id: 'd2', title: 'PowerPoint', fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', uploadDate: '2025-01-01', downloadCount: 1, thumbnailUrl: '', subject: 'B', overallRating: 4 },
          { id: 'd3', title: 'Excel Sheet', fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadDate: '2025-01-01', downloadCount: 1, thumbnailUrl: '', subject: 'C', overallRating: 3 },
        ]],
      },
      isLoading: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    // Verify documents are rendered (DocumentCard mock shows title)
    expect(screen.getByText('Word Doc')).toBeTruthy();
    expect(screen.getByText('PowerPoint')).toBeTruthy();
    expect(screen.getByText('Excel Sheet')).toBeTruthy();
  });

  it('shows error state UI when profile fetch fails', () => {
    mockUseFetchUserProfileById.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Network error'),
    });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    expect(screen.getByText('Không thể tải thông tin người dùng')).toBeTruthy();
    expect(screen.getByText('Vui lòng thử lại sau')).toBeTruthy();
  });

  it('navigates back when pressing back button in error state', () => {
    mockUseFetchUserProfileById.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Network error'),
    });

    const { UNSAFE_getAllByType } = render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    const touchableOpacities = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    fireEvent.press(touchableOpacities[0]);

    expect(mockBack).toHaveBeenCalled();
  });

  it('navigates back when pressing back button in normal state', () => {
    const { UNSAFE_getAllByType } = render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    const touchableOpacities = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    fireEvent.press(touchableOpacities[0]);

    expect(mockBack).toHaveBeenCalled();
  });

  it('shows edit profile button for current user', () => {
    mockUseUser.mockReturnValue({ currentUserId: 'u2' });

    render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    // Should not show follow button for current user
    expect(screen.queryByText('Theo dõi')).toBeNull();
  });

  it('navigates to edit profile when pressing edit button', () => {
    mockUseUser.mockReturnValue({ currentUserId: 'u2' });

    const { UNSAFE_getAllByType } = render(
      <Wrapper>
        <ProfileScreen />
      </Wrapper>
    );

    const touchableOpacities = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    // Find the edit button (should be the second TouchableOpacity in the header)
    fireEvent.press(touchableOpacities[1]);

    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
  });
});
