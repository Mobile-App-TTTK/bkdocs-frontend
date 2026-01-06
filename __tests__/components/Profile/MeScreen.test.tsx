import MeScreen from '@/components/Profile/me';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

// Mock dependencies
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
    useRouter: () => ({
        push: mockPush,
        back: mockBack,
    }),
}));

const mockFetchNextPage = jest.fn();
const mockUseFetchUserDocuments = jest.fn();
const mockUseFetchUserProfile = jest.fn();

jest.mock('@/components/Profile/api', () => ({
    useFetchUserDocuments: (id: string, limit: number) => mockUseFetchUserDocuments(id, limit),
    useFetchUserProfile: () => mockUseFetchUserProfile(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Mock DocumentCard to verify props
jest.mock('@/components/DocumentCard', () => {
    const { View, Text } = require('react-native');
    return (props: any) => (
        <View testID="document-card">
            <Text>{props.title}</Text>
            <Text testID={`type-${props.id}`}>{props.type}</Text>
        </View>
    );
});

const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('MeScreen', () => {
    const mockProfile = {
        id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        imageUrl: 'https://example.com/avatar.png',
        numberFollowers: 100,
        documentCount: 50,
        participationDays: 365,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseFetchUserProfile.mockReturnValue({
            data: mockProfile,
            isLoading: false,
        });
        mockUseFetchUserDocuments.mockReturnValue({
            data: { pages: [] },
            isLoading: false,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
        });
    });

    describe('Rendering', () => {
        it('renders user profile information correctly', () => {
            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );

            expect(screen.getByText('Test User')).toBeTruthy();
            expect(screen.getByText('test@example.com')).toBeTruthy();
            expect(screen.getByText('100')).toBeTruthy(); // Followers
            expect(screen.getByText('50')).toBeTruthy();  // Documents
            expect(screen.getByText('365')).toBeTruthy(); // Days
        });

        it('renders loading skeleton for profile', () => {
            mockUseFetchUserProfile.mockReturnValue({ data: null, isLoading: true });
            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );
            // NativeBase Skeleton doesn't have text we can query easily, but we can verify user data is NOT shown
            expect(screen.queryByText('Test User')).toBeNull();
        });

        it('renders error state when profile fails to load', () => {
            mockUseFetchUserProfile.mockReturnValue({ data: null, isLoading: false });
            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );
            expect(screen.getByText('Không thể tải thông tin người dùng')).toBeTruthy();
        });
    });

    describe('Document List', () => {
        it('renders empty state when no documents and loading', () => {
            mockUseFetchUserDocuments.mockReturnValue({
                data: undefined,
                isLoading: true,
                pages: [], // fallback
            });
            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );
            // Should show skeletons, implicitly checked by absence of "Chưa có tài liệu nào"
            expect(screen.queryByText('Chưa có tài liệu nào')).toBeNull();
        });

        it('renders empty state message when no documents loaded', () => {
            mockUseFetchUserDocuments.mockReturnValue({
                data: { pages: [] },
                isLoading: false,
            });
            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );
            expect(screen.getByText('Chưa có tài liệu nào')).toBeTruthy();
        });

        it('renders document list with correct file extension logic', () => {
            const mockDocs = [
                { id: '1', title: 'Doc 1', fileType: 'application/pdf', uploadDate: '2023-01-01', downloadCount: 10 },
                { id: '2', title: 'Doc 2', fileType: 'application/msword', uploadDate: '2023-01-01', downloadCount: 10 },
                { id: '3', title: 'Doc 3', fileType: 'application/vnd.ms-powerpoint', uploadDate: '2023-01-01', downloadCount: 10 },
                { id: '4', title: 'Doc 4', fileType: 'application/vnd.ms-excel', uploadDate: '2023-01-01', downloadCount: 10 },
                { id: '5', title: 'Doc 5', fileType: 'unknown', uploadDate: '2023-01-01', downloadCount: 10 },
                { id: '6', title: 'Doc 6', fileType: undefined, uploadDate: '2023-01-01', downloadCount: 10 },
            ];

            mockUseFetchUserDocuments.mockReturnValue({
                data: { pages: [mockDocs] }, // pages is array of arrays
                isLoading: false,
            });

            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );

            expect(screen.getByText('Doc 1')).toBeTruthy();
            expect(screen.getByTestId('type-1').children[0]).toBe('pdf');
            expect(screen.getByTestId('type-2').children[0]).toBe('doc');
            expect(screen.getByTestId('type-3').children[0]).toBe('ppt');
            expect(screen.getByTestId('type-4').children[0]).toBe('xls');
            expect(screen.getByTestId('type-5').children[0]).toBe('file');
            expect(screen.getByTestId('type-6').children[0]).toBe('file');
        });
    });

    describe('Pagination', () => {
        it('calls fetchNextPage when end reached if hasNextPage is true', () => {
            mockUseFetchUserDocuments.mockReturnValue({
                data: { pages: [[{ id: '1', title: 'Doc 1' }]] },
                isLoading: false,
                fetchNextPage: mockFetchNextPage,
                hasNextPage: true,
                isFetchingNextPage: false,
            });

            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );

            const list = screen.getByTestId('document-list');
            fireEvent(list, 'onEndReached');
            expect(mockFetchNextPage).toHaveBeenCalled();
        });

        it('does not call fetchNextPage if hasNextPage is false', () => {
            mockUseFetchUserDocuments.mockReturnValue({
                data: { pages: [[{ id: '1', title: 'Doc 1' }]] },
                isLoading: false,
                fetchNextPage: mockFetchNextPage,
                hasNextPage: false,
                isFetchingNextPage: false,
            });

            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );

            const list = screen.getByTestId('document-list');
            fireEvent(list, 'onEndReached');
            expect(mockFetchNextPage).not.toHaveBeenCalled();
        });

        it('renders spinner in footer when fetching next page', () => {
            mockUseFetchUserDocuments.mockReturnValue({
                data: { pages: [[{ id: '1', title: 'Doc 1' }]] },
                isLoading: false,
                fetchNextPage: mockFetchNextPage,
                hasNextPage: true,
                isFetchingNextPage: true,
            });

            render(
                <TestWrapper>
                    <MeScreen />
                </TestWrapper>
            );

            // Spinner from native-base usually relates to ActivityIndicator or has specific accessibility role
            // But NativeBase Spinner renders a structure. Let's check for standard accessibility if possible, or just look for the View wrapper if needed.
            // Easiest is to verify it doesn't crash and maybe look for something distinguishable.
            // NativeBase Spinner typically renders an ActivityIndicator.
            expect(screen.UNSAFE_getByType(require('native-base').Spinner)).toBeTruthy();
        });
    });

    describe('Navigation', () => {
        it('navigates back', () => {
            render(<TestWrapper><MeScreen /></TestWrapper>);
            fireEvent.press(screen.getByTestId('btn-back'));
            expect(mockBack).toHaveBeenCalled();
        });

        it('navigates to edit profile', () => {
            render(<TestWrapper><MeScreen /></TestWrapper>);
            fireEvent.press(screen.getByTestId('btn-edit'));
            expect(mockPush).toHaveBeenCalledWith(ROUTES.EDIT_PROFILE);
        });
    });
});
