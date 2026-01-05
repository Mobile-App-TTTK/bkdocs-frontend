import PdfViewer from '@/app/(app)/pdf-viewer';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Mocks
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
    useLocalSearchParams: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
    File: jest.fn(),
}));

jest.mock('react-native-webview', () => ({
    WebView: (props: any) => {
        const { View, Text } = require('react-native');
        return <View testID="webview"><Text>WebView Mock</Text></View>;
    },
}));

jest.mock('react-native-gesture-handler', () => ({
    GestureHandlerRootView: ({ children }: any) => {
        const { View } = require('react-native');
        return <View>{children}</View>;
    },
}));

jest.mock('native-base', () => {
    const { Text } = require('react-native');
    return {
        Text: (props: any) => <Text {...props} />,
    };
});

jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ name }: any) => {
        const { Text } = require('react-native');
        return <Text>{name}</Text>;
    },
}));

describe('PdfViewer', () => {
    const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders error state when no URI provided', async () => {
        mockUseLocalSearchParams.mockReturnValue({});

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.getByText('Không có URI')).toBeTruthy();
            expect(screen.getByText('Quay lại')).toBeTruthy();
            expect(screen.getByText('alert-circle-outline')).toBeTruthy();
        });
    });

    it('navigates back when "Quay lại" button pressed in error state', async () => {
        mockUseLocalSearchParams.mockReturnValue({});

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.getByText('Quay lại')).toBeTruthy();
        });

        const backButton = screen.getByText('Quay lại');
        fireEvent.press(backButton);

        expect(router.back).toHaveBeenCalled();
    });

    it('displays title from params', async () => {
        mockUseLocalSearchParams.mockReturnValue({
            uri: 'https://example.com/document.pdf',
            title: 'My Test PDF',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.getByText('My Test PDF')).toBeTruthy();
        });
    });

    it('displays default title when no title provided', async () => {
        mockUseLocalSearchParams.mockReturnValue({
            uri: 'https://example.com/document.pdf',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.getByText('PDF Viewer')).toBeTruthy();
        });
    });

    it('navigates back when back button in header pressed', async () => {
        mockUseLocalSearchParams.mockReturnValue({
            uri: 'https://example.com/document.pdf',
            title: 'Test',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            const backIcon = screen.getByText('chevron-back-outline');
            expect(backIcon).toBeTruthy();
        });

        const backButton = screen.getByText('chevron-back-outline');
        fireEvent.press(backButton);

        expect(router.back).toHaveBeenCalled();
    });

    it('renders WebView for remote URL', async () => {
        mockUseLocalSearchParams.mockReturnValue({
            uri: 'https://example.com/document.pdf',
            title: 'Remote PDF',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.queryByTestId('webview')).toBeTruthy();
        });
    });

    it('handles local file URI on iOS', async () => {
        Platform.OS = 'ios';
        mockUseLocalSearchParams.mockReturnValue({
            uri: 'file:///path/to/local.pdf',
            title: 'Local PDF',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.queryByTestId('webview')).toBeTruthy();
        });
    });

    it('handles local file URI on Android with base64', async () => {
        Platform.OS = 'android';

        const mockFile = {
            exists: true,
            base64: jest.fn().mockResolvedValue('base64data'),
        };

        (FileSystem.File as jest.Mock).mockImplementation(() => mockFile);

        mockUseLocalSearchParams.mockReturnValue({
            uri: 'file:///path/to/local.pdf',
            title: 'Local PDF Android',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(mockFile.base64).toHaveBeenCalled();
            expect(screen.queryByTestId('webview')).toBeTruthy();
        });
    });

    it('shows error when local file does not exist on Android', async () => {
        Platform.OS = 'android';

        const mockFile = {
            exists: false,
        };

        (FileSystem.File as jest.Mock).mockImplementation(() => mockFile);

        mockUseLocalSearchParams.mockReturnValue({
            uri: 'file:///path/to/nonexistent.pdf',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.getByText('File không tồn tại')).toBeTruthy();
        });
    });

    it('handles array URI param (takes first element)', async () => {
        mockUseLocalSearchParams.mockReturnValue({
            uri: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf'],
            title: 'Array URI',
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.queryByTestId('webview')).toBeTruthy();
        });
    });

    it('handles array title param (takes first element)', async () => {
        mockUseLocalSearchParams.mockReturnValue({
            uri: 'https://example.com/document.pdf',
            title: ['First Title', 'Second Title'],
        });

        render(<PdfViewer />);

        await waitFor(() => {
            expect(screen.getByText('First Title')).toBeTruthy();
        });
    });
});
