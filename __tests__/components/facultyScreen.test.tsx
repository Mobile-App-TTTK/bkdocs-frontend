import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

import FacultyScreen from '@/components/FacultyScreen';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: any) => {
    const { Text } = require('react-native');
    return <Text testID={name}>{name}</Text>;
  },
}));


let mockLocalParams: any = { id: 'f1' };

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockLocalParams,
}));

// Update internal mockBack to reference the mocked router
const mockBack = require('expo-router').router.back;

// ...


jest.mock('../../components/DocumentCard', () => {
  const actualReact = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return (props: any) => actualReact.createElement(Text, null, props.title);
});

const mockFetchFacultyInfo = jest.fn();
const mockSubscribeFaculty = jest.fn();
const mockUnsubscribeFaculty = jest.fn();
const mockSubscribeSubject = jest.fn();
const mockUnsubscribeSubject = jest.fn();

const mockLogFollowUser = jest.fn();
jest.mock('@/services/analytics', () => ({
  logFollowUser: (...args: any[]) => mockLogFollowUser(...args),
  logViewFaculty: jest.fn(),
}));

jest.mock('@/components/FacultyScreen/api', () => ({
  useFetchFacultyInfo: (...args: any[]) => mockFetchFacultyInfo(...args),
  useSubscribeFaculty: (...args: any[]) => mockSubscribeFaculty(...args),
  useUnsubscribeFaculty: (...args: any[]) => mockUnsubscribeFaculty(...args),
  useSubscribeSubject: () => mockSubscribeSubject(),
  useUnsubscribeSubject: () => mockUnsubscribeSubject(),
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('FacultyScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => { });
  });

  it('shows loading header when loading', () => {
    mockFetchFacultyInfo.mockReturnValue({ data: undefined, isLoading: true });

    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(
      <Wrapper>
        <FacultyScreen />
      </Wrapper>
    );

    expect(screen.getByText('Đang tải...')).toBeTruthy();
  });

  it('renders faculty info and toggles follow faculty', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Khoa CNTT',
        imageUrl: '',
        followers_count: 10,
        document_count: 99,
        isFollowingFaculty: false,
        subjects: [
          {
            id: 's1',
            name: 'Mon 1',
            isFollowing: false,
            documents: [{ id: 'd1', title: 'Doc 1', downloadCount: 1, uploadDate: '2025-01-01', thumbnail: '', score: 0, type: 'pdf' }],
          },
        ],
      },
      isLoading: false,
    });

    const mutateFollowFaculty = jest.fn();
    mockSubscribeFaculty.mockReturnValue({ mutate: mutateFollowFaculty, isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });

    const mutateFollowSubject = jest.fn();
    mockSubscribeSubject.mockReturnValue({ mutate: mutateFollowSubject, isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(
      <Wrapper>
        <FacultyScreen />
      </Wrapper>
    );

    expect(screen.getAllByText('Khoa CNTT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10 người theo dõi · 99 tài liệu').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Theo dõi').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Doc 1').length).toBeGreaterThan(0);

    fireEvent.press(screen.getAllByText('Theo dõi')[0]);

    await waitFor(() => {
      expect(mutateFollowFaculty).toHaveBeenCalledWith('f1', expect.any(Object));
    });
  });


  it('navigates back when back button is pressed', async () => {
    mockFetchFacultyInfo.mockReturnValue({ data: undefined, isLoading: true });
    // Default mocks
    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const backBtn = screen.getByTestId('chevron-back');
    fireEvent.press(backBtn);
    expect(mockBack).toHaveBeenCalled();
  });

  it('unsubscribes from faculty successfully', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: { name: 'Faculty 1', isFollowingFaculty: true, followers_count: 10, document_count: 5, subjects: [] },
      isLoading: false
    });
    const mutateUnsubscribe = jest.fn();
    mockUnsubscribeFaculty.mockReturnValue({ mutate: mutateUnsubscribe, isPending: false });
    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });

    // Mocks for subjects to avoid crash
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const followBtn = screen.getByText('Bỏ theo dõi');
    fireEvent.press(followBtn);

    await waitFor(() => {
      expect(mutateUnsubscribe).toHaveBeenCalledWith('f1', expect.any(Object));
    });
  });

  it('handles subscribe faculty error', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: { name: 'Faculty 1', isFollowingFaculty: false, followers_count: 10, document_count: 5, subjects: [] },
      isLoading: false
    });
    const mutateSubscribe = jest.fn((id, options) => {
      // Trigger onError
      options.onError();
    });
    mockSubscribeFaculty.mockReturnValue({ mutate: mutateSubscribe, isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });

    jest.spyOn(Alert, 'alert');

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const followBtn = screen.getByText('Theo dõi');
    fireEvent.press(followBtn);

    expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Không thể theo dõi khoa", expect.any(Array));
  });

  it('handles unsubscribe faculty error', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: { name: 'Faculty 1', isFollowingFaculty: true, followers_count: 10, document_count: 5, subjects: [] },
      isLoading: false
    });
    const mutateUnsubscribe = jest.fn((id, options) => {
      options.onError();
    });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: mutateUnsubscribe, isPending: false });
    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });

    jest.spyOn(Alert, 'alert');

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const followBtn = screen.getByText('Bỏ theo dõi');
    fireEvent.press(followBtn);

    expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Không thể hủy theo dõi khoa", expect.any(Array));
  });

  it('handles toggle follow subject (subscribe success)', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Faculty 1',
        isFollowingFaculty: true,
        followers_count: 10,
        document_count: 5,
        subjects: [{ id: 's1', name: 'Subject 1', isFollowing: false, documents: [] }]
      },
      isLoading: false
    });
    const mutateSubSubject = jest.fn();
    mockSubscribeSubject.mockReturnValue({ mutate: mutateSubSubject, isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const subFollowBtn = screen.getByText('Theo dõi');
    fireEvent.press(subFollowBtn);

    expect(mutateSubSubject).toHaveBeenCalledWith('s1', expect.any(Object));

    expect(mutateSubSubject).toHaveBeenCalledWith('s1', expect.any(Object));
  });

  it('handles toggle follow subject (unsubscribe success)', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Faculty 1',
        followers_count: 10,
        document_count: 5,
        subjects: [{ id: 's1', name: 'Subject 1', isFollowing: true, documents: [] }]
      },
      isLoading: false
    });
    const mutateUnsubSubject = jest.fn();
    mockUnsubscribeSubject.mockReturnValue({ mutate: mutateUnsubSubject, isPending: false });
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const subFollowBtn = screen.getByText('Bỏ theo dõi');
    fireEvent.press(subFollowBtn);

    expect(mutateUnsubSubject).toHaveBeenCalledWith('s1', expect.any(Object));
  });

  it('handles toggle follow subject (subscribe error)', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Faculty 1',
        isFollowingFaculty: true,
        followers_count: 10,
        document_count: 5,
        subjects: [{ id: 's1', name: 'Subject 1', isFollowing: false, documents: [] }]
      },
      isLoading: false
    });
    const mutateSubSubject = jest.fn((id, options) => {
      options.onError();
    });
    mockSubscribeSubject.mockReturnValue({ mutate: mutateSubSubject, isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });

    jest.spyOn(Alert, 'alert');

    render(<Wrapper><FacultyScreen /></Wrapper>);

    // Handle potential ambiguous text
    const buttons = screen.getAllByText('Theo dõi');
    fireEvent.press(buttons[buttons.length - 1]);

    expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Không thể theo dõi môn học", expect.any(Array));
  });

  it('handles toggle follow subject (unsubscribe error)', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: {
        name: 'Faculty 1',
        followers_count: 10,
        document_count: 5,
        subjects: [{ id: 's1', name: 'Subject 1', isFollowing: true, documents: [] }]
      },
      isLoading: false
    });
    const mutateUnsubSubject = jest.fn((id, options) => {
      options.onError();
    });
    mockUnsubscribeSubject.mockReturnValue({ mutate: mutateUnsubSubject, isPending: false });
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });

    jest.spyOn(Alert, 'alert');

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const subFollowBtn = screen.getByText('Bỏ theo dõi');
    fireEvent.press(subFollowBtn);

    expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Không thể hủy theo dõi môn học", expect.any(Array));
  });

  it('calls logFollowUser on subscribe faculty success', async () => {
    mockFetchFacultyInfo.mockReturnValue({
      data: { name: 'Faculty 1', isFollowingFaculty: false, followers_count: 10, document_count: 5, subjects: [] },
      isLoading: false
    });
    const mutateSubscribe = jest.fn((id, options) => {
      options.onSuccess();
    });
    mockSubscribeFaculty.mockReturnValue({ mutate: mutateSubscribe, isPending: false });
    mockUnsubscribeFaculty.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockSubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });
    mockUnsubscribeSubject.mockReturnValue({ mutate: jest.fn(), isPending: false });

    render(<Wrapper><FacultyScreen /></Wrapper>);

    const followBtn = screen.getByText('Theo dõi');
    fireEvent.press(followBtn);

    expect(mockLogFollowUser).toHaveBeenCalledWith('f1');
  });
});
