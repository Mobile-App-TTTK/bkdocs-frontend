import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

import SearchResultScreen from '@/components/searchResultScreen';

jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
  Ionicons: 'Ionicons',
  Octicons: 'Octicons',
}));

jest.mock('classnames', () => (...args: any[]) => args.filter(Boolean).join(' '));

jest.mock('react-native-safe-area-context', () => {
  const actualReact = jest.requireActual('react');
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, left: 0, right: 0, bottom: 0 },
    },
  };
});

// Không cần mock expo-router ở đây vì đã mock trong jest.setup.ts
// Chỉ cần lấy reference đến các mock functions
const mockPush = jest.fn();
const mockUseLocalSearchParams = jest.fn();

jest.mock('@/utils/constants', () => ({
  SearchFileType: { PDF: 'pdf', WORD: 'word', POWERPOINT: 'ppt', IMAGE: 'img' },
  SearchSortOption: { NEWEST: 'new', OLDEST: 'old', DOWNLOAD_COUNT: 'dl' },
}));

jest.mock('../../components/DocumentCard', () => {
  const actualReact = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return (props: any) => actualReact.createElement(Text, null, props.title);
});

jest.mock('../../components/UserCard', () => {
  const actualReact = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return (props: any) => actualReact.createElement(Text, null, props.name);
});

jest.mock('../../components/FacultyCard', () => {
  const actualReact = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return (props: any) => actualReact.createElement(Text, null, props.name);
});

jest.mock('../../components/SubjectCard', () => {
  const actualReact = jest.requireActual('react');
  const { Text } = jest.requireActual('react-native');
  return (props: any) => actualReact.createElement(Text, null, props.name);
});

const mockFetchSearchResult = jest.fn();
const mockFetchFacultiesAndSubjects = jest.fn();
jest.mock('@/components/searchResultScreen/api', () => ({
  useFetchSearchResult: (...args: any[]) => mockFetchSearchResult(...args),
  useFetchFacultiesAndSubjects: () => mockFetchFacultiesAndSubjects(),
}));

const mockGetSuggestionsKeyword = jest.fn();
jest.mock('@/components/searchScreen/api', () => ({
  useGetSuggestionsKeyword: (q: string) => mockGetSuggestionsKeyword(q),
}));

jest.mock('@/components/searchScreen/utils/constants', () => ({
  filterOptionsList: [
    { value: 'all', label: 'Tất cả' },
    { value: 'user', label: 'Người dùng' },
    { value: 'document', label: 'Tài liệu' },
    { value: 'faculty', label: 'Khoa' },
    { value: 'subject', label: 'Môn học' },
  ],
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('SearchResultScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Lấy mock từ jest.setup.ts và setup behavior
    const { router, useLocalSearchParams } = require('expo-router');
    router.push.mockImplementation(mockPush);
    useLocalSearchParams.mockReturnValue({ query: '' });

    mockFetchFacultiesAndSubjects.mockReturnValue({
      data: { faculties: [{ id: 'f1', name: 'Khoa A' }] },
    });

    mockFetchSearchResult.mockReturnValue({
      data: {
        documents: [{ id: 'd1', title: 'Doc 1' }],
        users: [{ id: 'u1', name: 'User 1' }],
        subjects: [{ id: 's1', name: 'Mon 1' }],
        faculties: [{ id: 'f1', name: 'Khoa A', count: 1, image_url: '' }],
      },
      isFetching: false,
    });

    mockGetSuggestionsKeyword.mockReturnValue({
      data: ['suggest 1', 'suggest 2'],
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders sections and items when not fetching', () => {
    render(
      <Wrapper>
        <SearchResultScreen />
      </Wrapper>
    );

    expect(screen.getAllByText('Người dùng').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tài liệu').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Khoa').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Môn học').length).toBeGreaterThan(0);

    expect(screen.getAllByText('User 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Doc 1').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Khoa A').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mon 1').length).toBeGreaterThan(0);
  });

  it('shows suggestions and navigates when tapping a suggestion', async () => {
    render(
      <Wrapper>
        <SearchResultScreen />
      </Wrapper>
    );

    const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');

    fireEvent.changeText(input, 'abc');
    jest.advanceTimersByTime(120);

    await waitFor(() => {
      expect(screen.getAllByText('suggest 1').length).toBeGreaterThan(0);
    });

    fireEvent(screen.getByText('suggest 1'), 'touchStart');

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(app)/(tabs)/search/result',
      params: { query: 'suggest 1' },
    });
  });
});