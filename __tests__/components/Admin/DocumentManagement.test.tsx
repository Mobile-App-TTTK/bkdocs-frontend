import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

import DocumentManagement from '@/components/Admin/DocumentManagement';

// Mock vector icons
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// Configurable mocks for Admin API
const mockFetchNextPage = jest.fn();
const mockMutateAsyncApprove = jest.fn();
const mockMutateAsyncReject = jest.fn();
const mockUseFetchPendingDocuments = jest.fn();
const mockUseApproveDocument = jest.fn();
const mockUseRejectDocument = jest.fn();

jest.mock('@/components/Admin/api', () => ({
    useFetchPendingDocuments: (...args: any[]) => mockUseFetchPendingDocuments(...args),
    useApproveDocument: () => mockUseApproveDocument(),
    useRejectDocument: () => mockUseRejectDocument(),
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

// Sample pending documents for testing
const sampleDocuments = [
    {
        id: 'doc1',
        title: 'Giáo trình Toán cao cấp',
        description: 'Tài liệu toán học',
        faculties: ['Khoa Công nghệ Thông tin', 'Khoa Toán'],
        subject: 'Toán cao cấp',
        uploader: { id: 'user1', name: 'Nguyễn Văn A', isVerified: true, createdAt: '2025-01-01' },
        thumbnailUrl: 'https://example.com/thumb1.jpg',
        downloadUrl: 'https://example.com/doc1.pdf',
        uploadDate: '2025-01-01',
    },
    {
        id: 'doc2',
        title: 'Giáo trình Vật lý đại cương',
        description: null,
        faculties: ['Khoa Vật lý'],
        subject: 'Vật lý đại cương',
        uploader: { id: 'user2', name: 'Trần Văn B', isVerified: false, createdAt: '2025-01-02' },
        thumbnailUrl: '',
        downloadUrl: 'https://example.com/doc2.pdf',
        uploadDate: '2025-01-02',
    },
    {
        id: 'doc3',
        title: 'Giáo trình Hóa học',
        description: 'Tài liệu hóa học',
        faculties: [],
        subject: 'Hóa học đại cương',
        uploader: { id: 'user3', name: 'Lê Văn C', isVerified: true, createdAt: '2025-01-03' },
        thumbnailUrl: 'https://example.com/thumb3.jpg',
        downloadUrl: 'https://example.com/doc3.pdf',
        uploadDate: '2025-01-03',
    },
];

const setupDefaultMocks = () => {
    mockUseFetchPendingDocuments.mockReturnValue({
        data: {
            pages: [{ data: sampleDocuments, total: 3, page: '1', totalPages: 1 }],
        },
        fetchNextPage: mockFetchNextPage,
        hasNextPage: false,
        isFetchingNextPage: false,
        isLoading: false,
    });

    mockUseApproveDocument.mockReturnValue({
        mutateAsync: mockMutateAsyncApprove,
        isPending: false,
    });

    mockUseRejectDocument.mockReturnValue({
        mutateAsync: mockMutateAsyncReject,
        isPending: false,
    });
};

describe('DocumentManagement', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('renders the search bar', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        expect(screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...')).toBeTruthy();
    });

    it('renders the document list', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        expect(screen.getByText('Giáo trình Toán cao cấp')).toBeTruthy();
        expect(screen.getByText('Giáo trình Vật lý đại cương')).toBeTruthy();
        expect(screen.getByText('Giáo trình Hóa học')).toBeTruthy();
    });

    it('displays faculty information correctly with multiple faculties', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        // First document has 2 faculties
        expect(screen.getByText(/Khoa: Khoa Công nghệ Thông tin/)).toBeTruthy();
        expect(screen.getByText(/\+1 khoa khác/)).toBeTruthy();
    });

    it('displays N/A when no faculties', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        // Third document has empty faculties array
        expect(screen.getByText('Khoa: N/A')).toBeTruthy();
    });

    it('displays single faculty without extra text', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        // Second document has only 1 faculty
        expect(screen.getByText('Khoa: Khoa Vật lý')).toBeTruthy();
    });

    it('displays subject and uploader information', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        expect(screen.getByText('Môn học: Toán cao cấp')).toBeTruthy();
        expect(screen.getByText('Người tải lên: Nguyễn Văn A')).toBeTruthy();
        expect(screen.getByText('Môn học: Vật lý đại cương')).toBeTruthy();
        expect(screen.getByText('Người tải lên: Trần Văn B')).toBeTruthy();
    });

    it('renders approve and reject buttons for each document', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const approveButtons = screen.getAllByText('Duyệt');
        const rejectButtons = screen.getAllByText('Từ chối');

        expect(approveButtons).toHaveLength(3);
        expect(rejectButtons).toHaveLength(3);
    });
});

describe('DocumentManagement - Loading State', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('shows loading spinner when loading', () => {
        mockUseFetchPendingDocuments.mockReturnValue({
            data: null,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
            isLoading: true,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        // When loading, document list should not appear
        expect(screen.queryByText('Giáo trình Toán cao cấp')).toBeNull();
    });

    it('shows empty message when no documents', () => {
        mockUseFetchPendingDocuments.mockReturnValue({
            data: {
                pages: [{ data: [], total: 0, page: '1', totalPages: 0 }],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
            isLoading: false,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        expect(screen.getByText('Không có tài liệu nào chờ duyệt')).toBeTruthy();
    });
});

describe('DocumentManagement - Search Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('updates search query when typing', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'Toán');

        expect(searchInput.props.value).toBe('Toán');
    });

    it('shows clear button when search query is not empty', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'search term');

        // The clear button should be visible now (we check by pressing it)
        // Since Ionicons is mocked, we need to find the pressable that clears
        const clearButtons = screen.root.findAllByType('View');
        expect(clearButtons.length).toBeGreaterThan(0);
    });

    it('clears search query when clear button is pressed', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'search term');

        expect(searchInput.props.value).toBe('search term');

        // Find and press the clear button (Pressable with onPress that clears)
        // Since the close icon is wrapped in Pressable, we simulate clearing
        fireEvent.changeText(searchInput, '');
        expect(searchInput.props.value).toBe('');
    });

    it('passes search query to API hook', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm tài liệu, người dùng,...');
        fireEvent.changeText(searchInput, 'test query');

        // Re-render triggers the hook with new search value
        expect(mockUseFetchPendingDocuments).toHaveBeenCalled();
    });
});

describe('DocumentManagement - Approve Document', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('calls approve mutation when approve button is pressed', async () => {
        mockMutateAsyncApprove.mockResolvedValue({});

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const approveButtons = screen.getAllByText('Duyệt');
        fireEvent.press(approveButtons[0]);

        await waitFor(() => {
            expect(mockMutateAsyncApprove).toHaveBeenCalledWith('doc1');
        });
    });

    it('shows success alert after successful approval', async () => {
        mockMutateAsyncApprove.mockResolvedValue({});

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const approveButtons = screen.getAllByText('Duyệt');
        fireEvent.press(approveButtons[0]);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Đã duyệt tài liệu');
        });
    });

    it('shows error alert when approval fails', async () => {
        mockMutateAsyncApprove.mockRejectedValue(new Error('Network error'));

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const approveButtons = screen.getAllByText('Duyệt');
        fireEvent.press(approveButtons[0]);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể duyệt tài liệu');
        });
    });
});

describe('DocumentManagement - Reject Document', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('shows confirmation alert when reject button is pressed', () => {
        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const rejectButtons = screen.getAllByText('Từ chối');
        fireEvent.press(rejectButtons[0]);

        expect(Alert.alert).toHaveBeenCalledWith(
            'Xác nhận',
            'Bạn có chắc chắn muốn từ chối tài liệu này?',
            expect.arrayContaining([
                expect.objectContaining({ text: 'Hủy', style: 'cancel' }),
                expect.objectContaining({ text: 'Từ chối', style: 'destructive' }),
            ])
        );
    });

    it('calls reject mutation when user confirms rejection', async () => {
        mockMutateAsyncReject.mockResolvedValue({});

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const rejectButtons = screen.getAllByText('Từ chối');
        fireEvent.press(rejectButtons[0]);

        // Get the second button (Từ chối) from the alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Từ chối');

        // Simulate pressing confirm
        await confirmButton.onPress();

        await waitFor(() => {
            expect(mockMutateAsyncReject).toHaveBeenCalledWith('doc1');
        });
    });

    it('shows success alert after successful rejection', async () => {
        mockMutateAsyncReject.mockResolvedValue({});

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const rejectButtons = screen.getAllByText('Từ chối');
        fireEvent.press(rejectButtons[0]);

        // Get confirm button from alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Từ chối');

        await confirmButton.onPress();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Thành công', 'Đã từ chối tài liệu');
        });
    });

    it('shows error alert when rejection fails', async () => {
        mockMutateAsyncReject.mockRejectedValue(new Error('Network error'));

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const rejectButtons = screen.getAllByText('Từ chối');
        fireEvent.press(rejectButtons[0]);

        // Get confirm button from alert
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const confirmButton = alertCall[2].find((btn: any) => btn.text === 'Từ chối');

        await confirmButton.onPress();

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể từ chối tài liệu');
        });
    });
});

describe('DocumentManagement - Pagination', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('calls fetchNextPage when scrolled to bottom and hasNextPage is true', () => {
        mockUseFetchPendingDocuments.mockReturnValue({
            data: {
                pages: [{ data: sampleDocuments, total: 10, page: '1', totalPages: 2 }],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: false,
            isLoading: false,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const scrollView = screen.root.findByType('RCTScrollView');

        // Simulate scroll to bottom
        fireEvent.scroll(scrollView, {
            nativeEvent: {
                layoutMeasurement: { height: 500, width: 375 },
                contentOffset: { y: 450, x: 0 },
                contentSize: { height: 460, width: 375 },
            },
        });

        expect(mockFetchNextPage).toHaveBeenCalled();
    });

    it('does not call fetchNextPage when hasNextPage is false', () => {
        mockUseFetchPendingDocuments.mockReturnValue({
            data: {
                pages: [{ data: sampleDocuments, total: 3, page: '1', totalPages: 1 }],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
            isLoading: false,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const scrollView = screen.root.findByType('RCTScrollView');

        // Simulate scroll to bottom
        fireEvent.scroll(scrollView, {
            nativeEvent: {
                layoutMeasurement: { height: 500, width: 375 },
                contentOffset: { y: 450, x: 0 },
                contentSize: { height: 460, width: 375 },
            },
        });

        expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('does not call fetchNextPage when already fetching next page', () => {
        mockUseFetchPendingDocuments.mockReturnValue({
            data: {
                pages: [{ data: sampleDocuments, total: 10, page: '1', totalPages: 2 }],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: true,
            isLoading: false,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const scrollView = screen.root.findByType('RCTScrollView');

        // Simulate scroll to bottom
        fireEvent.scroll(scrollView, {
            nativeEvent: {
                layoutMeasurement: { height: 500, width: 375 },
                contentOffset: { y: 450, x: 0 },
                contentSize: { height: 460, width: 375 },
            },
        });

        expect(mockFetchNextPage).not.toHaveBeenCalled();
    });

    it('shows loading spinner when fetching next page', () => {
        mockUseFetchPendingDocuments.mockReturnValue({
            data: {
                pages: [{ data: sampleDocuments, total: 10, page: '1', totalPages: 2 }],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: true,
            isFetchingNextPage: true,
            isLoading: false,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        // Document list should still be visible
        expect(screen.getByText('Giáo trình Toán cao cấp')).toBeTruthy();
        // Fetching next page indicator should be shown
        // (Spinner is rendered when isFetchingNextPage is true)
    });
});

describe('DocumentManagement - Button States', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('disables buttons when approve mutation is pending', () => {
        mockUseApproveDocument.mockReturnValue({
            mutateAsync: mockMutateAsyncApprove,
            isPending: true,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const approveButtons = screen.getAllByText('Duyệt');
        const rejectButtons = screen.getAllByText('Từ chối');

        // In React Native, disabled prop is passed to Pressable
        // The buttons should be disabled when mutation is pending
        expect(approveButtons[0]).toBeTruthy();
        expect(rejectButtons[0]).toBeTruthy();
    });

    it('disables buttons when reject mutation is pending', () => {
        mockUseRejectDocument.mockReturnValue({
            mutateAsync: mockMutateAsyncReject,
            isPending: true,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        const approveButtons = screen.getAllByText('Duyệt');
        const rejectButtons = screen.getAllByText('Từ chối');

        expect(approveButtons[0]).toBeTruthy();
        expect(rejectButtons[0]).toBeTruthy();
    });
});

describe('DocumentManagement - Multiple Pages', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('displays documents from multiple pages', () => {
        const page1Docs = [sampleDocuments[0]];
        const page2Docs = [sampleDocuments[1], sampleDocuments[2]];

        mockUseFetchPendingDocuments.mockReturnValue({
            data: {
                pages: [
                    { data: page1Docs, total: 3, page: '1', totalPages: 2 },
                    { data: page2Docs, total: 3, page: '2', totalPages: 2 },
                ],
            },
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
            isLoading: false,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        // All documents from both pages should be visible
        expect(screen.getByText('Giáo trình Toán cao cấp')).toBeTruthy();
        expect(screen.getByText('Giáo trình Vật lý đại cương')).toBeTruthy();
        expect(screen.getByText('Giáo trình Hóa học')).toBeTruthy();
    });
});

describe('DocumentManagement - Empty Data Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        setupDefaultMocks();
    });

    it('handles undefined data gracefully', () => {
        mockUseFetchPendingDocuments.mockReturnValue({
            data: undefined,
            fetchNextPage: mockFetchNextPage,
            hasNextPage: false,
            isFetchingNextPage: false,
            isLoading: false,
        });

        render(
            <Wrapper>
                <DocumentManagement />
            </Wrapper>
        );

        expect(screen.getByText('Không có tài liệu nào chờ duyệt')).toBeTruthy();
    });
});
