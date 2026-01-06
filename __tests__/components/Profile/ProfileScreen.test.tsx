import ProfileScreen from '@/components/Profile';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
// @ts-ignore
import { useAuth } from '@/contexts/AuthContext';
// @ts-ignore
import { useRouter } from 'expo-router';
// @ts-ignore
import { useFetchUserProfile } from '@/components/Profile/api';
import { ROUTES } from '@/utils/routes';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/components/Profile/api', () => ({
    useFetchUserProfile: jest.fn(),
}));

// Mock Ionicons to avoid rendering issues
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));


const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NativeBaseProvider initialWindowMetrics={inset}>
        {children}
    </NativeBaseProvider>
);

describe('ProfileScreen', () => {
    const mockRouter = {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    };

    const mockLogout = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (useAuth as jest.Mock).mockReturnValue({ logout: mockLogout });
    });

    it('renders loading skeleton when loading', () => {
        (useFetchUserProfile as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
        });

        render(
            <TestWrapper>
                <ProfileScreen />
            </TestWrapper>
        );

        // Using testID could be better, but based on current code, we can check basic existence of Skeleton or absence of user elements
        // Since Skeleton is from NativeBase, verifying logic is simple: User name not there.
        expect(screen.queryByText('Hồ sơ')).toBeTruthy(); // Header always there
        // Add specific check if possible, or just ensure no user data is shown
    });

    it('renders error state when user profile is missing', () => {
        (useFetchUserProfile as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <ProfileScreen />
            </TestWrapper>
        );

        expect(screen.getByText('Không thể tải thông tin người dùng')).toBeTruthy();
    });

    it('renders user profile correctly', () => {
        const mockUser = {
            id: '1',
            name: 'Nguyen Van A',
            email: 'a@example.com',
            imageUrl: 'http://test.com/avatar.png',
            numberFollowers: 10,
            documentCount: 5,
            participationDays: 100,
        };

        (useFetchUserProfile as jest.Mock).mockReturnValue({
            data: mockUser,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <ProfileScreen />
            </TestWrapper>
        );

        expect(screen.getByText('Nguyen Van A')).toBeTruthy();
        expect(screen.getByText('a@example.com')).toBeTruthy();
        expect(screen.getByText('10')).toBeTruthy(); // Followers
        expect(screen.getByText('5')).toBeTruthy();  // Documents
        expect(screen.getByText('100')).toBeTruthy(); // Days
    });

    it('renders default avatar when no image url provided', () => {
        const mockUserNoImage = {
            id: '2',
            name: 'User No Image',
            email: 'b@example.com',
            imageUrl: null,
            numberFollowers: 0,
            documentCount: 0,
            participationDays: 0,
        };

        (useFetchUserProfile as jest.Mock).mockReturnValue({
            data: mockUserNoImage,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <ProfileScreen />
            </TestWrapper>
        );

        // We can't easily check the source of the Image without a testID on the Image or by checking props
        // But we can ensure it renders without error and shows the name
        expect(screen.getByText('User No Image')).toBeTruthy();

        // Ideally we check if it uses the require('../assets...') but that's hard to assert in transformed jest environment (it becomes a number usually)
        // However, simply running this path exercises the ternary operator.
    });

    it('handles navigation interactions', () => {
        (useFetchUserProfile as jest.Mock).mockReturnValue({
            data: { name: 'User' },
            isLoading: false,
        });

        render(
            <TestWrapper>
                <ProfileScreen />
            </TestWrapper>
        );

        // Edit Profile
        fireEvent.press(screen.getByTestId('btn-edit'));
        expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.EDIT_PROFILE);

        fireEvent.press(screen.getByText('Trang cá nhân'));
        expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.ME);

        fireEvent.press(screen.getByText('Đã theo dõi'));
        expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.FOLLOWING);

        fireEvent.press(screen.getByText('Tài liệu tải về'));
        expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.SAVED_DOC);

        fireEvent.press(screen.getByText('Chatbot AI'));
        expect(mockRouter.push).toHaveBeenCalledWith(ROUTES.CHATBOT);
    });

    it('handles logout', async () => {
        (useFetchUserProfile as jest.Mock).mockReturnValue({
            data: { name: 'User' },
            isLoading: false,
        });

        render(
            <TestWrapper>
                <ProfileScreen />
            </TestWrapper>
        );

        fireEvent.press(screen.getByTestId('btn-logout'));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
            expect(mockRouter.replace).toHaveBeenCalledWith(ROUTES.LOGIN);
        });
    });

    it('handles back navigation', () => {
        (useFetchUserProfile as jest.Mock).mockReturnValue({
            data: { name: 'User' },
            isLoading: false,
        });

        render(
            <TestWrapper>
                <ProfileScreen />
            </TestWrapper>
        );

        fireEvent.press(screen.getByTestId('btn-back'));
        expect(mockRouter.back).toHaveBeenCalled();
    });
});
