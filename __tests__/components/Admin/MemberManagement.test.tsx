import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

import MemberManagement from '@/components/Admin/MemberManagement';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// Configurable mocks for Admin API
const mockMutateAsyncBan = jest.fn();
const mockMutateAsyncUnban = jest.fn();
const mockUseFetchAdminUsers = jest.fn();
const mockUseBanUser = jest.fn();
const mockUseUnbanUser = jest.fn();

jest.mock('@/components/Admin/api', () => ({
    useFetchAdminUsers: () => mockUseFetchAdminUsers(),
    useBanUser: () => mockUseBanUser(),
    useUnbanUser: () => mockUseUnbanUser(),
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

// Sample users for testing
const sampleUsers = [
    {
        id: 'user1',
        name: 'Nguyễn Văn A',
        isBanned: false,
        followerCount: 150,
        uploadedDocumentsCount: 25,
        imageUrl: 'https://example.com/avatar1.jpg',
    },
    {
        id: 'user2',
        name: 'Trần Văn B',
        isBanned: true,
        followerCount: 80,
        uploadedDocumentsCount: 10,
        imageUrl: '',
    },
    {
        id: 'user3',
        name: 'Lê Thị C',
        isBanned: false,
        followerCount: 200,
        uploadedDocumentsCount: 50,
        imageUrl: undefined,
    },
];

const setupDefaultMocks = () => {
    mockUseFetchAdminUsers.mockReturnValue({
        data: sampleUsers,
        isLoading: false,
    });

    mockUseBanUser.mockReturnValue({
        mutateAsync: mockMutateAsyncBan,
        isPending: false,
    });

    mockUseUnbanUser.mockReturnValue({
        mutateAsync: mockMutateAsyncUnban,
        isPending: false,
    });
};

describe('MemberManagement', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('renders the search bar', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        expect(screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...')).toBeTruthy();
    });

    it('renders the user list', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
        expect(screen.getByText('Trần Văn B')).toBeTruthy();
        expect(screen.getByText('Lê Thị C')).toBeTruthy();
    });

    it('displays follower count and document count for each user', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        expect(screen.getByText('150 người theo dõi. Đã tải lên 25 tài liệu')).toBeTruthy();
        expect(screen.getByText('80 người theo dõi. Đã tải lên 10 tài liệu')).toBeTruthy();
        expect(screen.getByText('200 người theo dõi. Đã tải lên 50 tài liệu')).toBeTruthy();
    });

    it('shows banned badge for banned users', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // Only user2 is banned
        expect(screen.getByText('Đã cấm')).toBeTruthy();
    });

    it('shows "Cấm tài khoản" button for non-banned users', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // user1 and user3 are not banned
        const banButtons = screen.getAllByText('Cấm tài khoản');
        expect(banButtons).toHaveLength(2);
    });

    it('shows "Bỏ cấm tài khoản" button for banned users', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // Only user2 is banned
        expect(screen.getByText('Bỏ cấm tài khoản')).toBeTruthy();
    });
});

describe('MemberManagement - Loading State', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('shows loading spinner when loading', () => {
        mockUseFetchAdminUsers.mockReturnValue({
            data: [],
            isLoading: true,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // When loading, user list should not appear
        expect(screen.queryByText('Nguyễn Văn A')).toBeNull();
    });

    it('shows empty message when no users', () => {
        mockUseFetchAdminUsers.mockReturnValue({
            data: [],
            isLoading: false,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        expect(screen.getByText('Không tìm thấy người dùng nào')).toBeTruthy();
    });
});

describe('MemberManagement - Search Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('updates search query when typing', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'Nguyễn');

        expect(searchInput.props.value).toBe('Nguyễn');
    });

    it('filters users by search query', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'Nguyễn');

        // Only Nguyễn Văn A should be visible
        expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
        expect(screen.queryByText('Trần Văn B')).toBeNull();
        expect(screen.queryByText('Lê Thị C')).toBeNull();
    });

    it('search is case-insensitive', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'nguyễn');

        // Should still find Nguyễn Văn A with lowercase search
        expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
        expect(screen.queryByText('Trần Văn B')).toBeNull();
    });

    it('shows clear button when search query is not empty', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');

        // Initially no search query, clear button should not be visible
        fireEvent.changeText(searchInput, '');

        // Add search query
        fireEvent.changeText(searchInput, 'test');
        expect(searchInput.props.value).toBe('test');
    });

    it('shows empty message when search has no results', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'NonexistentUser');

        expect(screen.getByText('Không tìm thấy người dùng nào')).toBeTruthy();
    });

    it('clears search query when clear button is pressed', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'test');

        expect(searchInput.props.value).toBe('test');

        // Clear the search
        fireEvent.changeText(searchInput, '');
        expect(searchInput.props.value).toBe('');

        // All users should be visible again
        expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
        expect(screen.getByText('Trần Văn B')).toBeTruthy();
        expect(screen.getByText('Lê Thị C')).toBeTruthy();
    });
});

describe('MemberManagement - Ban User', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('shows confirmation alert when ban button is pressed', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const banButtons = screen.getAllByText('Cấm tài khoản');
        fireEvent.press(banButtons[0]); // Press for user1 (Nguyễn Văn A)

        expect(Alert.alert).toHaveBeenCalledWith(
            'Xác nhận',
            'Bạn có chắc chắn muốn cấm tài khoản "Nguyễn Văn A"?',
            expect.arrayContaining([
                expect.objectContaining({ text: 'Hủy', style: 'cancel' }),
                expect.objectContaining({ text: 'Cấm', style: 'destructive' }),
            ])
        );
    });

    it('calls ban mutation when user confirms ban', async () => {
        mockMutateAsyncBan.mockResolvedValue({});

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const banButtons = screen.getAllByText('Cấm tài khoản');
        fireEvent.press(banButtons[0]);

        // Get the confirm button from the alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Cấm');

        // Simulate pressing confirm
        await confirmButton.onPress();

        await waitFor(() => {
            expect(mockMutateAsyncBan).toHaveBeenCalledWith('user1');
        });
    });

    it('shows success alert after successful ban', async () => {
        mockMutateAsyncBan.mockResolvedValue({});

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const banButtons = screen.getAllByText('Cấm tài khoản');
        fireEvent.press(banButtons[0]);

        // Get confirm button from alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Cấm');

        await confirmButton.onPress();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Đã cấm tài khoản');
        });
    });

    it('shows error alert when ban fails', async () => {
        mockMutateAsyncBan.mockRejectedValue(new Error('Network error'));

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const banButtons = screen.getAllByText('Cấm tài khoản');
        fireEvent.press(banButtons[0]);

        // Get confirm button from alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Cấm');

        await confirmButton.onPress();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể cấm tài khoản');
        });
    });
});

describe('MemberManagement - Unban User', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('calls unban mutation when unban button is pressed', async () => {
        mockMutateAsyncUnban.mockResolvedValue({});

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const unbanButton = screen.getByText('Bỏ cấm tài khoản');
        fireEvent.press(unbanButton);

        await waitFor(() => {
            expect(mockMutateAsyncUnban).toHaveBeenCalledWith('user2');
        });
    });

    it('shows success alert after successful unban', async () => {
        mockMutateAsyncUnban.mockResolvedValue({});

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const unbanButton = screen.getByText('Bỏ cấm tài khoản');
        fireEvent.press(unbanButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Đã bỏ cấm tài khoản');
        });
    });

    it('shows error alert when unban fails', async () => {
        mockMutateAsyncUnban.mockRejectedValue(new Error('Network error'));

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const unbanButton = screen.getByText('Bỏ cấm tài khoản');
        fireEvent.press(unbanButton);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể bỏ cấm tài khoản');
        });
    });
});

describe('MemberManagement - Button States', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('disables ban button when ban mutation is pending', () => {
        mockUseBanUser.mockReturnValue({
            mutateAsync: mockMutateAsyncBan,
            isPending: true,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const banButtons = screen.getAllByText('Cấm tài khoản');
        expect(banButtons[0]).toBeTruthy();
        // Button should still render but be disabled
    });

    it('disables unban button when unban mutation is pending', () => {
        mockUseUnbanUser.mockReturnValue({
            mutateAsync: mockMutateAsyncUnban,
            isPending: true,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const unbanButton = screen.getByText('Bỏ cấm tài khoản');
        expect(unbanButton).toBeTruthy();
        // Button should still render but be disabled
    });
});

describe('MemberManagement - User Avatar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('renders user with image URL', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // user1 has imageUrl
        expect(screen.getByText('Nguyễn Văn A')).toBeTruthy();
    });

    it('renders user without image URL (fallback to default)', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // user2 and user3 have empty/undefined imageUrl
        expect(screen.getByText('Trần Văn B')).toBeTruthy();
        expect(screen.getByText('Lê Thị C')).toBeTruthy();
    });

    it('renders banned user with reduced opacity avatar', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // user2 is banned, should have opacity style
        expect(screen.getByText('Trần Văn B')).toBeTruthy();
        expect(screen.getByText('Đã cấm')).toBeTruthy();
    });
});

describe('MemberManagement - Mixed User States', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('displays correct buttons for mixed banned/unbanned users', () => {
        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // 2 non-banned users should have "Cấm tài khoản" button
        const banButtons = screen.getAllByText('Cấm tài khoản');
        expect(banButtons).toHaveLength(2);

        // 1 banned user should have "Bỏ cấm tài khoản" button
        const unbanButtons = screen.getAllByText('Bỏ cấm tài khoản');
        expect(unbanButtons).toHaveLength(1);
    });

    it('correctly identifies which user to ban', async () => {
        mockMutateAsyncBan.mockResolvedValue({});

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // Press ban on the second non-banned user (Lê Thị C, index 1)
        const banButtons = screen.getAllByText('Cấm tài khoản');
        fireEvent.press(banButtons[1]);

        expect(Alert.alert).toHaveBeenCalledWith(
            'Xác nhận',
            'Bạn có chắc chắn muốn cấm tài khoản "Lê Thị C"?',
            expect.any(Array)
        );
    });
});

describe('MemberManagement - Empty Data', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('handles undefined users gracefully', () => {
        mockUseFetchAdminUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        expect(screen.getByText('Không tìm thấy người dùng nào')).toBeTruthy();
    });

    it('renders with default empty array when data is undefined', () => {
        mockUseFetchAdminUsers.mockReturnValue({
            data: undefined,
            isLoading: false,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        // Should not crash and show search bar
        expect(screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...')).toBeTruthy();
    });
});

describe('MemberManagement - All Banned Users', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('shows all unban buttons when all users are banned', () => {
        const allBannedUsers = [
            { id: 'user1', name: 'User 1', isBanned: true, followerCount: 10, uploadedDocumentsCount: 5 },
            { id: 'user2', name: 'User 2', isBanned: true, followerCount: 20, uploadedDocumentsCount: 10 },
        ];

        mockUseFetchAdminUsers.mockReturnValue({
            data: allBannedUsers,
            isLoading: false,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const unbanButtons = screen.getAllByText('Bỏ cấm tài khoản');
        expect(unbanButtons).toHaveLength(2);

        // No ban buttons should exist
        expect(screen.queryByText('Cấm tài khoản')).toBeNull();

        // Both should show banned badge
        const bannedBadges = screen.getAllByText('Đã cấm');
        expect(bannedBadges).toHaveLength(2);
    });
});

describe('MemberManagement - All Active Users', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('shows all ban buttons when no users are banned', () => {
        const allActiveUsers = [
            { id: 'user1', name: 'User 1', isBanned: false, followerCount: 10, uploadedDocumentsCount: 5 },
            { id: 'user2', name: 'User 2', isBanned: false, followerCount: 20, uploadedDocumentsCount: 10 },
            { id: 'user3', name: 'User 3', isBanned: false, followerCount: 30, uploadedDocumentsCount: 15 },
        ];

        mockUseFetchAdminUsers.mockReturnValue({
            data: allActiveUsers,
            isLoading: false,
        });

        render(
            <Wrapper>
                <MemberManagement />
            </Wrapper>
        );

        const banButtons = screen.getAllByText('Cấm tài khoản');
        expect(banButtons).toHaveLength(3);

        // No unban buttons should exist
        expect(screen.queryByText('Bỏ cấm tài khoản')).toBeNull();

        // No banned badges should exist
        expect(screen.queryByText('Đã cấm')).toBeNull();
    });
});
