import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

import FacultyScreen from '@/components/FacultyScreen';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockBack = jest.fn();
let mockLocalParams: any = { id: 'f1' };

jest.mock('expo-router', () => ({
  router: { back: mockBack, push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => mockLocalParams,
}));

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
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
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
});
