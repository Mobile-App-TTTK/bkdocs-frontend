import FollowingScreen from '@/components/FollowingScreen';
import { useFetchFollowList } from '@/components/Profile/api';
import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

// Mocks
jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        SafeAreaView: ({ children }: any) => <View>{children}</View>,
        useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    };
});

jest.mock('native-base', () => {
    const React = require('react');
    const { View, Text, Image } = require('react-native');
    return {
        NativeBaseProvider: ({ children }: any) => <View>{children}</View>,
        View: (props: any) => <View {...props} />,
        Text: (props: any) => <Text {...props} />,
        Skeleton: Object.assign((props: any) => <View {...props} testID="skeleton" />, {
            Text: (props: any) => <View {...props} testID="skeleton-text" />,
        }),
        Image: (props: any) => <Image {...props} />,
        Spinner: (props: any) => <View {...props} testID="spinner" />,
    };
});

jest.mock('@/components/Profile/api', () => ({
    useFetchFollowList: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ name }: any) => {
        const { Text } = require('react-native');
        return <Text>{name}</Text>;
    },
}));

jest.mock('@/components/UserCard', () => {
    const { Text, View } = require('react-native');
    return ({ name }: any) => (
        <View testID="user-card">
            <Text>User: {name}</Text>
        </View>
    );
});

jest.mock('@/components/FacultyCard', () => {
    const { Text, View } = require('react-native');
    return ({ name }: any) => (
        <View testID="faculty-card">
            <Text>Faculty: {name}</Text>
        </View>
    );
});

jest.mock('@/components/SubjectCard', () => {
    const { Text, View } = require('react-native');
    return ({ name }: any) => (
        <View testID="subject-card">
            <Text>Subject: {name}</Text>
        </View>
    );
});

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <React.Fragment>{children}</React.Fragment>
);

describe('FollowingScreen', () => {
    const mockUseFetchFollowList = useFetchFollowList as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state correctly', () => {
        mockUseFetchFollowList.mockReturnValue({
            data: null,
            isLoading: true,
        });

        render(
            <Wrapper>
                <FollowingScreen />
            </Wrapper>
        );

        // Check for skeletons
        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('skeleton-text').length).toBeGreaterThan(0);

        // Should not show error or content
        expect(screen.queryByText('Không thể tải dữ liệu')).toBeNull();
        expect(screen.queryByTestId('user-card')).toBeNull();
    });

    it('renders error state when data is missing and not loading', () => {
        mockUseFetchFollowList.mockReturnValue({
            data: null,
            isLoading: false,
        });

        render(
            <Wrapper>
                <FollowingScreen />
            </Wrapper>
        );

        expect(screen.getByText('Không thể tải dữ liệu')).toBeTruthy();
        expect(screen.queryByTestId('skeleton')).toBeNull();
    });

    it('renders empty state when all lists are empty', () => {
        mockUseFetchFollowList.mockReturnValue({
            data: {
                followingUsers: [],
                subscribedFacultyIds: [],
                subscribedSubjectIds: [],
            },
            isLoading: false,
        });

        render(
            <Wrapper>
                <FollowingScreen />
            </Wrapper>
        );

        expect(screen.getByText('Chưa theo dõi ai hoặc khoa/môn học nào')).toBeTruthy();
    });

    it('renders content correctly with all data and "all" filter', () => {
        mockUseFetchFollowList.mockReturnValue({
            data: {
                followingUsers: [{ id: 'u1', name: 'User A', imageUrl: '', documentCount: 5 }],
                subscribedFacultyIds: [{ id: 'f1', name: 'Faculty A', documentCount: 10, imageUrl: '' }],
                subscribedSubjectIds: [{ id: 's1', name: 'Subject A', documentCount: 3, imageUrl: '' }],
            },
            isLoading: false,
        });

        render(
            <Wrapper>
                <FollowingScreen />
            </Wrapper>
        );

        // Content
        expect(screen.getByText('User: User A')).toBeTruthy();
        expect(screen.getByText('Faculty: Faculty A')).toBeTruthy();
        expect(screen.getByText('Subject: Subject A')).toBeTruthy();

        // Verify section headers (checking at least 2 occurances of "Người dùng" etc - one filter, one header)
        expect(screen.getAllByText('Người dùng').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('Khoa').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('Môn học').length).toBeGreaterThanOrEqual(2);
    });

    it('filters content functionality', () => {
        mockUseFetchFollowList.mockReturnValue({
            data: {
                followingUsers: [{ id: 'u1', name: 'User A', imageUrl: '', documentCount: 5 }],
                subscribedFacultyIds: [{ id: 'f1', name: 'Faculty A', documentCount: 10, imageUrl: '' }],
                subscribedSubjectIds: [{ id: 's1', name: 'Subject A', documentCount: 3, imageUrl: '' }],
            },
            isLoading: false,
        });

        render(
            <Wrapper>
                <FollowingScreen />
            </Wrapper>
        );

        // Switch to User filter (Click the filter chip)
        // Since we have multiple texts "Người dùng", we need to click the right one.
        // The filter chips are at the top. The section header is below.
        // However, standard `getByText` might fail if multiple found.
        // `getAllByText` returns array.
        // The filter chip is rendered BEFORE the content.
        // So index 0 is likely the filter.
        const userFilter = screen.getAllByText('Người dùng')[0];
        fireEvent.press(userFilter);

        expect(screen.getByText('User: User A')).toBeTruthy();
        expect(screen.queryByText('Faculty: Faculty A')).toBeNull();
        expect(screen.queryByText('Subject: Subject A')).toBeNull();

        // Switch to Faculty filter
        const facultyFilter = screen.getAllByText('Khoa')[0];
        fireEvent.press(facultyFilter);
        expect(screen.queryByText('User: User A')).toBeNull();
        expect(screen.getByText('Faculty: Faculty A')).toBeTruthy();
        expect(screen.queryByText('Subject: Subject A')).toBeNull();

        // Switch to Subject filter
        const subjectFilter = screen.getAllByText('Môn học')[0];
        fireEvent.press(subjectFilter);
        expect(screen.queryByText('User: User A')).toBeNull();
        expect(screen.queryByText('Faculty: Faculty A')).toBeNull();
        expect(screen.getByText('Subject: Subject A')).toBeTruthy();

        // Switch back to All
        const allFilter = screen.getByText('Tất cả');
        fireEvent.press(allFilter);
        expect(screen.getByText('User: User A')).toBeTruthy();
        expect(screen.getByText('Faculty: Faculty A')).toBeTruthy();
        expect(screen.getByText('Subject: Subject A')).toBeTruthy();
    });

    it('renders screen header with back button when onBack provided', () => {
        mockUseFetchFollowList.mockReturnValue({
            data: {},
            isLoading: false,
        });
        const onBackMock = jest.fn();

        render(
            <Wrapper>
                <FollowingScreen onBack={onBackMock} />
            </Wrapper>
        );

        expect(screen.getByText('Đã theo dõi')).toBeTruthy();

        const backButtonIcon = screen.getByText('chevron-back-outline');
        fireEvent.press(backButtonIcon);

        expect(onBackMock).toHaveBeenCalled();
    });
});
