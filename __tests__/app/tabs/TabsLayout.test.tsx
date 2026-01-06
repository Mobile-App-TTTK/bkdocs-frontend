import TabsLayout from '@/app/(app)/(tabs)/_layout';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';

// Mocks
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
    Tabs: Object.assign(
        ({ children, screenOptions }: any) => {
            const { View } = require('react-native');
            return <View testID="tabs">{children}</View>;
        },
        {
            Screen: ({ name, options, listeners }: any) => {
                const { View, Text, TouchableOpacity } = require('react-native');
                return (
                    <View testID={`tab-${name}`}>
                        <TouchableOpacity
                            testID={`tab-button-${name}`}
                            onPress={() => {
                                const mockEvent = { preventDefault: jest.fn() };
                                if (listeners?.tabPress) {
                                    listeners.tabPress(mockEvent);
                                }
                            }}
                        >
                            <Text>{options.title}</Text>
                        </TouchableOpacity>
                    </View>
                );
            },
        }
    ),
}));

jest.mock('@/contexts/ThemeContext', () => ({
    useTheme: jest.fn(),
}));

jest.mock('@/store/hooks', () => ({
    useAppDispatch: jest.fn(),
}));

jest.mock('@/store/uploadSlice', () => ({
    setDocumentFile: jest.fn((payload) => ({ type: 'upload/setDocumentFile', payload })),
}));

jest.mock('expo-document-picker', () => ({
    getDocumentAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
    File: jest.fn(),
    Paths: {
        cache: '/cache',
    },
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ name }: any) => {
        const { Text } = require('react-native');
        return <Text>{name}</Text>;
    },
}));

// Mock alert
global.alert = jest.fn();

describe('TabsLayout', () => {
    const mockUseTheme = require('@/contexts/ThemeContext').useTheme;
    const mockUseAppDispatch = require('@/store/hooks').useAppDispatch;
    const mockSetDocumentFile = require('@/store/uploadSlice').setDocumentFile;
    const mockGetDocumentAsync = DocumentPicker.getDocumentAsync as jest.Mock;

    const mockDispatch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseTheme.mockReturnValue({
            isDark: false,
        });

        mockUseAppDispatch.mockReturnValue(mockDispatch);
    });

    it('renders all tab screens', () => {
        render(<TabsLayout />);

        expect(screen.getByTestId('tab-home')).toBeTruthy();
        expect(screen.getByTestId('tab-search')).toBeTruthy();
        expect(screen.getByTestId('tab-upload/index')).toBeTruthy();
        expect(screen.getByTestId('tab-notification/index')).toBeTruthy();
        expect(screen.getByTestId('tab-profile')).toBeTruthy();
    });

    it('renders correct tab titles', () => {
        render(<TabsLayout />);

        expect(screen.getByText('Trang chủ')).toBeTruthy();
        expect(screen.getByText('Tìm kiếm')).toBeTruthy();
        expect(screen.getByText('Tải lên')).toBeTruthy();
        expect(screen.getByText('Thông báo')).toBeTruthy();
        expect(screen.getByText('Hồ sơ')).toBeTruthy();
    });

    it('handles upload tab press with successful document selection', async () => {
        const mockDocument = {
            canceled: false,
            assets: [
                {
                    uri: 'file:///document.pdf',
                    name: 'test.pdf',
                    mimeType: 'application/pdf',
                },
            ],
        };

        mockGetDocumentAsync.mockResolvedValue(mockDocument);

        render(<TabsLayout />);

        const uploadButton = screen.getByTestId('tab-button-upload/index');
        fireEvent.press(uploadButton);

        await waitFor(() => {
            expect(mockGetDocumentAsync).toHaveBeenCalledWith({
                multiple: false,
                copyToCacheDirectory: true,
            });
            expect(mockDispatch).toHaveBeenCalledWith(
                mockSetDocumentFile({
                    uri: 'file:///document.pdf',
                    name: 'test.pdf',
                    mimeType: 'application/pdf',
                })
            );
            expect(router.push).toHaveBeenCalledWith('/(app)/upload-detail');
        });
    });

    it('handles canceled document picker', async () => {
        mockGetDocumentAsync.mockResolvedValue({
            canceled: true,
        });

        render(<TabsLayout />);

        const uploadButton = screen.getByTestId('tab-button-upload/index');
        fireEvent.press(uploadButton);

        await waitFor(() => {
            expect(mockGetDocumentAsync).toHaveBeenCalled();
            expect(mockDispatch).not.toHaveBeenCalled();
            expect(router.push).not.toHaveBeenCalled();
        });
    });

    it('handles photo library URI with file copying', async () => {
        const mockDocument = {
            canceled: false,
            assets: [
                {
                    uri: 'ph://ABC123',
                    name: 'photo.pdf',
                    mimeType: 'application/pdf',
                },
            ],
        };

        const mockSourceFile = {
            copy: jest.fn().mockResolvedValue(undefined),
        };

        const mockCacheFile = {
            uri: 'file:///cache/photo.pdf',
        };

        (FileSystem.File as unknown as jest.Mock)
            .mockReturnValueOnce(mockCacheFile)
            .mockReturnValueOnce(mockSourceFile);

        mockGetDocumentAsync.mockResolvedValue(mockDocument);

        render(<TabsLayout />);

        const uploadButton = screen.getByTestId('tab-button-upload/index');
        fireEvent.press(uploadButton);

        await waitFor(() => {
            expect(mockSourceFile.copy).toHaveBeenCalledWith(mockCacheFile);
            expect(mockDispatch).toHaveBeenCalledWith(
                mockSetDocumentFile({
                    uri: 'file:///cache/photo.pdf',
                    name: 'photo.pdf',
                    mimeType: 'application/pdf',
                })
            );
        });
    });

    it('handles file copy error', async () => {
        const mockDocument = {
            canceled: false,
            assets: [
                {
                    uri: 'ph-upload://ABC123',
                    name: 'photo.pdf',
                    mimeType: 'application/pdf',
                },
            ],
        };

        const mockSourceFile = {
            copy: jest.fn().mockRejectedValue(new Error('Copy failed')),
        };

        const mockCacheFile = {
            uri: 'file:///cache/photo.pdf',
        };

        (FileSystem.File as unknown as jest.Mock)
            .mockReturnValueOnce(mockCacheFile)
            .mockReturnValueOnce(mockSourceFile);

        mockGetDocumentAsync.mockResolvedValue(mockDocument);

        render(<TabsLayout />);

        const uploadButton = screen.getByTestId('tab-button-upload/index');
        fireEvent.press(uploadButton);

        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Không thể copy file. Vui lòng thử lại.');
            expect(mockDispatch).not.toHaveBeenCalled();
            expect(router.push).not.toHaveBeenCalled();
        });
    });

    it('applies dark theme styling', () => {
        mockUseTheme.mockReturnValue({
            isDark: true,
        });

        render(<TabsLayout />);

        // Component should render successfully with dark theme
        expect(screen.getByTestId('tabs')).toBeTruthy();
    });

    it('applies light theme styling', () => {
        mockUseTheme.mockReturnValue({
            isDark: false,
        });

        render(<TabsLayout />);

        // Component should render successfully with light theme
        expect(screen.getByTestId('tabs')).toBeTruthy();
    });
});
