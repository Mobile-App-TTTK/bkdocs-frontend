import SubjectScreen from '@/components/subjectScreen';
import { useFetchSubjectInfo, useSubscribeSubject, useUnsubscribeSubject } from '@/components/subjectScreen/api';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { Alert } from 'react-native';

// Mocks
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
    useLocalSearchParams: () => ({ id: 'subject-123' }),
}));

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        useSafeAreaInsets: () => ({ top: 10, bottom: 0, left: 0, right: 0 }),
    };
});

jest.mock('native-base', () => {
    const React = require('react');
    const { View, Text, ScrollView, TouchableOpacity, Image } = require('react-native');
    return {
        View: (props: any) => <View {...props} />,
        Text: (props: any) => <Text {...props} />,
        ScrollView: (props: any) => <ScrollView {...props} testID="scroll-view">{props.children}</ScrollView>,
        Skeleton: Object.assign((props: any) => <View {...props} testID="skeleton" />, {
            Text: (props: any) => <View {...props} testID="skeleton-text" />,
        }),
        Spinner: (props: any) => <View {...props} testID="spinner" />,
        Image: (props: any) => <Image {...props} />,
    };
});

jest.mock('@/components/subjectScreen/api', () => ({
    useFetchSubjectInfo: jest.fn(),
    useSubscribeSubject: jest.fn(),
    useUnsubscribeSubject: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ name }: any) => {
        const { Text } = require('react-native');
        return <Text>{name}</Text>;
    },
}));

jest.mock('@/components/DocumentCard', () => {
    const { Text, View } = require('react-native');
    return ({ title }: any) => (
        <View testID="document-card">
            <Text>Doc: {title}</Text>
        </View>
    );
});

describe('SubjectScreen', () => {
    const mockUseFetchSubjectInfo = useFetchSubjectInfo as jest.Mock;
    const mockUseSubscribeSubject = useSubscribeSubject as jest.Mock;
    const mockUseUnsubscribeSubject = useUnsubscribeSubject as jest.Mock;

    // Mutation mocks
    const mockSubscribeMutate = jest.fn();
    const mockUnsubscribeMutate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup default mutation mocks
        mockUseSubscribeSubject.mockReturnValue({
            mutate: mockSubscribeMutate,
            isPending: false,
        });
        mockUseUnsubscribeSubject.mockReturnValue({
            mutate: mockUnsubscribeMutate,
            isPending: false,
        });

        // Setup default Alert spy
        jest.spyOn(Alert, 'alert');
    });

    it('renders loading state correctly', () => {
        mockUseFetchSubjectInfo.mockReturnValue({
            data: null,
            isLoading: true,
        });

        render(<SubjectScreen />);

        expect(screen.getByText('Đang tải...')).toBeTruthy();
        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
        expect(screen.getAllByTestId('skeleton-text').length).toBeGreaterThan(0);
    });

    it('renders empty state (not loading, no props)', () => {
        mockUseFetchSubjectInfo.mockReturnValue({
            data: null,
            isLoading: false,
        });

        render(<SubjectScreen />);

        expect(screen.getByText('Môn học')).toBeTruthy();
        expect(screen.getByText('Không tìm thấy thông tin môn học')).toBeTruthy();
    });

    it('renders data state without documents', () => {
        const mockData = {
            id: 'subject-123',
            name: 'Giải tích 1',
            followers_count: 100,
            document_count: 0,
            imageUrl: 'http://example.com/image.png',
            isFollowingSubject: false,
            typeList: [],
        };

        mockUseFetchSubjectInfo.mockReturnValue({
            data: mockData,
            isLoading: false,
        });

        render(<SubjectScreen />);

        expect(screen.getAllByText('Giải tích 1').length).toBeGreaterThan(0);
        expect(screen.getByText('100 người theo dõi · 0 tài liệu')).toBeTruthy();
        expect(screen.getByText('Theo dõi')).toBeTruthy();
        expect(screen.getByText('Chưa có tài liệu nào')).toBeTruthy();
    });

    it('renders data state with documents', () => {
        const mockData = {
            id: 'subject-123',
            name: 'Giải tích 1',
            followers_count: 100,
            document_count: 2,
            isFollowingSubject: true,
            typeList: [
                {
                    name: 'Đề thi',
                    documents: [
                        { id: '1', title: 'Đề thi GK 2023', type: 'Exam' },
                        { id: '2', title: 'Đề thi CK 2023', type: 'Exam' },
                    ],
                },
            ],
        };

        mockUseFetchSubjectInfo.mockReturnValue({
            data: mockData,
            isLoading: false,
        });

        render(<SubjectScreen />);

        expect(screen.getAllByText('Giải tích 1').length).toBeGreaterThan(0);
        expect(screen.getByText('Bỏ theo dõi')).toBeTruthy();
        expect(screen.getByText('Đề thi')).toBeTruthy(); // Type header
        expect(screen.getByText('Doc: Đề thi GK 2023')).toBeTruthy();
        expect(screen.getByText('Doc: Đề thi CK 2023')).toBeTruthy();
        expect(screen.getAllByTestId('document-card').length).toBe(2);
    });

    it('navigates back when back button pressed', () => {
        mockUseFetchSubjectInfo.mockReturnValue({
            data: null,
            isLoading: false,
        });

        render(<SubjectScreen />);

        const backButton = screen.getByText('chevron-back');
        fireEvent.press(backButton);

        expect(router.back).toHaveBeenCalled();
    });

    it('handles subscribe subject action', () => {
        const mockData = {
            id: 'subject-123',
            name: 'Môn học A',
            isFollowingSubject: false,
        };
        mockUseFetchSubjectInfo.mockReturnValue({
            data: mockData,
            isLoading: false,
        });

        render(<SubjectScreen />);

        const followButton = screen.getByText('Theo dõi');
        fireEvent.press(followButton);

        expect(mockSubscribeMutate).toHaveBeenCalledWith('subject-123', expect.any(Object));
    });

    it('handles unsubscribe subject action', () => {
        const mockData = {
            id: 'subject-123',
            name: 'Môn học A',
            isFollowingSubject: true,
        };
        mockUseFetchSubjectInfo.mockReturnValue({
            data: mockData,
            isLoading: false,
        });

        render(<SubjectScreen />);

        const unfollowButton = screen.getByText('Bỏ theo dõi');
        fireEvent.press(unfollowButton);

        expect(mockUnsubscribeMutate).toHaveBeenCalledWith('subject-123', expect.any(Object));
    });

    it('displays loading spinner on follow button when pending', () => {
        const mockData = {
            id: 'subject-123',
            name: 'Môn học A',
            isFollowingSubject: false,
        };
        mockUseFetchSubjectInfo.mockReturnValue({
            data: mockData,
            isLoading: false,
        });

        // Mock pending state
        mockUseSubscribeSubject.mockReturnValue({
            mutate: mockSubscribeMutate,
            isPending: true,
        });

        render(<SubjectScreen />);

        expect(screen.getByTestId('spinner')).toBeTruthy();
        expect(screen.queryByText('Theo dõi')).toBeNull();
    });

    it('shows error alert on subscribe failure', () => {
        const mockData = {
            id: 'subject-123',
            name: 'Môn học A',
            isFollowingSubject: false,
        };
        mockUseFetchSubjectInfo.mockReturnValue({
            data: mockData,
            isLoading: false,
        });

        // Mock mutation with error callback
        mockSubscribeMutate.mockImplementation((id, options) => {
            options.onError();
        });

        render(<SubjectScreen />);

        const followButton = screen.getByText('Theo dõi');
        fireEvent.press(followButton);

        expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Không thể theo dõi môn học", expect.any(Array));
    });

    it('shows error alert on unsubscribe failure', () => {
        const mockData = {
            id: 'subject-123',
            name: 'Môn học A',
            isFollowingSubject: true,
        };
        mockUseFetchSubjectInfo.mockReturnValue({
            data: mockData,
            isLoading: false,
        });

        // Mock mutation with error callback
        mockUnsubscribeMutate.mockImplementation((id, options) => {
            options.onError();
        });

        render(<SubjectScreen />);

        const unfollowButton = screen.getByText('Bỏ theo dõi');
        fireEvent.press(unfollowButton);

        expect(Alert.alert).toHaveBeenCalledWith("Lỗi", "Không thể hủy theo dõi môn học", expect.any(Array));
    });
});
