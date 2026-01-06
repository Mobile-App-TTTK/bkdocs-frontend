import SavedDocCard from '@/components/ui/saved-doc-card';
import { ROUTES } from '@/utils/routes';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert, Linking } from 'react-native';

// Mocks
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));

jest.mock('expo-file-system', () => {
    return {
        Paths: { document: 'file:///documents/' },
        File: jest.fn(),
    };
});

jest.mock('expo-sharing', () => ({
    isAvailableAsync: jest.fn(),
    shareAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.spyOn(Alert, 'alert');
jest.spyOn(Linking, 'openURL');

const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NativeBaseProvider initialWindowMetrics={inset}>
        {children}
    </NativeBaseProvider>
);

describe('SavedDocCard', () => {
    const defaultProps = {
        id: '123',
        title: 'Test Document',
        uploadDate: '2023-01-01',
        subject: 'Test Subject',
        thumbnailUrl: 'http://example.com/thumb.png',
        type: 'pdf',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Default File mock: exists = false
        (FileSystem.File as unknown as jest.Mock).mockImplementation((dir, name) => ({
            exists: false,
            uri: dir + name,
        }));
    });

    it('renders correctly', () => {
        render(
            <TestWrapper>
                <SavedDocCard {...defaultProps} />
            </TestWrapper>
        );

        expect(screen.getByText('Test Document')).toBeTruthy();
        expect(screen.getByText('Test Subject')).toBeTruthy();
        expect(screen.getByText('Xem')).toBeTruthy();
    });

    it('handles file not found and shows alert', async () => {
        (FileSystem.File as unknown as jest.Mock).mockImplementation((dir, name) => ({
            exists: false,
            uri: dir + name,
        }));

        render(
            <TestWrapper>
                <SavedDocCard {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Xem'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                "Không tìm thấy file",
                expect.stringContaining("File có thể đã bị xóa"),
                expect.any(Array)
            );
        });

        const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
        const reloadBtn = alertButtons.find((b: any) => b.text === 'Tải lại');

        reloadBtn.onPress();
        expect(router.push).toHaveBeenCalledWith({
            pathname: ROUTES.DOWNLOAD_DOC,
            params: { id: '123' },
        });
    });

    it('opens PDF file if found', async () => {
        (FileSystem.File as unknown as jest.Mock).mockImplementation((dir, name) => {
            const exists = name && name.endsWith('.pdf');
            return {
                exists: !!exists,
                uri: 'file:///path/to/test.pdf',
            };
        });

        render(
            <TestWrapper>
                <SavedDocCard {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Xem'));

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
                pathname: ROUTES.PDF_VIEWER,
                params: { uri: 'file:///path/to/test.pdf', title: 'Test Document' }
            }));
        });
    });

    it('opens Image file if found', async () => {
        (FileSystem.File as unknown as jest.Mock).mockImplementation((dir, name) => ({
            exists: name && name.endsWith('.png'),
            uri: 'file:///path/to/test.png',
        }));

        render(
            <TestWrapper>
                <SavedDocCard {...defaultProps} />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Xem'));

        await waitFor(() => {
            // Check if modal image is present by accessibility label (alt text)
            // NativeBase Image alt maps to aria-label or accessibilityLabel
            expect(screen.getByLabelText('Full size image')).toBeTruthy();
        });
    });

    it('opens via Sharing if other file type found', async () => {
        (FileSystem.File as unknown as jest.Mock).mockImplementation((dir, name) => ({
            exists: name && name.endsWith('.docx'),
            uri: 'file:///path/to/test.docx',
        }));
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);

        render(
            <TestWrapper>
                <SavedDocCard {...defaultProps} type="docx" />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Xem'));

        await waitFor(() => {
            expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///path/to/test.docx', expect.any(Object));
        });
    });

    it('falls back to Linking if Sharing is unavailable', async () => {
        (FileSystem.File as unknown as jest.Mock).mockImplementation((dir, name) => ({
            exists: name && name.endsWith('.docx'),
            uri: 'file:///path/to/test.docx',
        }));
        (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false);

        render(
            <TestWrapper>
                <SavedDocCard {...defaultProps} type="docx" />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Xem'));

        await waitFor(() => {
            expect(Linking.openURL).toHaveBeenCalledWith('file:///path/to/test.docx');
        });
    });

    it('opens image modal using thumbnail if file missing but type is image', async () => {
        (FileSystem.File as unknown as jest.Mock).mockImplementation(() => ({
            exists: false,
            uri: '',
        }));

        render(
            <TestWrapper>
                <SavedDocCard {...defaultProps} type="image" thumbnailUrl="http://thumb.png" />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Xem'));

        await waitFor(() => {
            expect(Alert.alert).not.toHaveBeenCalled();
            expect(screen.getByLabelText('Full size image')).toBeTruthy();
        });
    });
});
