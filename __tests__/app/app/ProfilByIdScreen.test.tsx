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
      useLocalSearchParams: () => ({ id: 'u2' }),
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
    return <Text>{props.title}</Text>;
  };
});

const mockMutateFollow = jest.fn();
jest.mock('@/components/UserCard/api', () => ({
  useToggleFollowUser: () => ({ isPending: false, mutate: mockMutateFollow }),
}));

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfileById: () => ({
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
  }),
  useFetchUserDocuments: () => ({
    data: { pages: [[{ id: 'd1', title: 'Doc 1', fileType: 'pdf', uploadDate: '2025-01-01', downloadCount: 1, thumbnailUrl: '', subject: 'A', overallRating: 5 }]] },
    isLoading: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

jest.mock('@/contexts/UserContext', () => ({
  useUser: () => ({ currentUserId: 'u1' }),
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
});
