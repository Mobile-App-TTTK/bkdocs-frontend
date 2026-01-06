import SelectImagesScreen from '@/app/(app)/select-images/index';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as MediaLibrary from 'expo-media-library';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

// Mock dependencies
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));
jest.mock('expo-image', () => ({ Image: 'Image' }));

const mockDispatch = jest.fn();
let mockUploadState: any = {
    coverImage: null,
    selectedImages: [],
};

jest.mock('@/store/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (sel: any) => {
        const getCurrentState = () => ({ upload: mockUploadState });
        return sel(getCurrentState());
    },
}));

jest.mock('@/store/uploadSlice', () => ({
    setCoverImage: (payload: string | null) => ({ type: 'upload/setCoverImage', payload }),
    setSelectedImages: (payload: string[]) => ({ type: 'upload/setSelectedImages', payload }),
}));

// Create mocks that will be used in the jest.mock and accessed in tests
let mockBackFn: jest.Mock;
let mockUseLocalSearchParamsFn: jest.Mock;

jest.mock('expo-router', () => {
    mockBackFn = jest.fn();
    mockUseLocalSearchParamsFn = jest.fn(() => ({}));

    return {
        router: {
            back: (...args: any[]) => mockBackFn(...args),
        },
        useLocalSearchParams: (...args: any[]) => mockUseLocalSearchParamsFn(...args),
    };
});

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const mockRequestPermissionsAsync = jest.fn();
const mockGetAssetsAsync = jest.fn();

jest.mock('expo-media-library', () => ({
    requestPermissionsAsync: () => mockRequestPermissionsAsync(),
    getAssetsAsync: (opts: any) => mockGetAssetsAsync(opts),
    MediaType: {
        photo: 'photo',
    },
    SortBy: {
        creationTime: 'creationTime',
    },
}));

const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('SelectImagesScreen', () => {
    const mockAssets = [
        { uri: 'file:///img1.jpg' },
        { uri: 'file:///img2.jpg' },
        { uri: 'file:///img3.jpg' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock alert properly for React Native
        global.alert = jest.fn();
        // Reset params for each test
        mockUseLocalSearchParamsFn.mockReturnValue({});
        mockUploadState = {
            coverImage: null,
            selectedImages: [],
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Initial Rendering & Permissions', () => {
        it('should render header with title "Thêm ảnh"', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: [] });

            const { getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(getByText('Thêm ảnh')).toBeTruthy();
            });
        });

        it('should request media library permissions on mount', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: [] });

            render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockRequestPermissionsAsync).toHaveBeenCalled();
            });
        });

        it('should show alert when permissions denied', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

            render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(global.alert).toHaveBeenCalledWith('Cần quyền truy cập thư viện ảnh!');
            });
            expect(mockGetAssetsAsync).not.toHaveBeenCalled();
        });

        it('should load and display images when permissions granted', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalledWith({
                    mediaType: MediaLibrary.MediaType.photo,
                    first: 100,
                    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
                });
            });
        });
    });

    describe('Single Mode (Cover Image)', () => {
        beforeEach(() => {
            mockUseLocalSearchParamsFn.mockReturnValue({ single: '1' });
        });

        it('should initialize with existing cover image from Redux', async () => {
            mockUploadState.coverImage = 'file:///existing-cover.jpg';
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { findByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            // Check that the "Ảnh đã chọn" section is rendered (since we have 1 pre-selected)
            const selectedSection = await findByText('Ảnh đã chọn');
            expect(selectedSection).toBeTruthy();
        });

        it('should select an image in single mode', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, findByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            // Get all pressable images
            const imageButtons = getAllByTestId(/^image-pressable-/);
            expect(imageButtons.length).toBeGreaterThan(0);

            // Press the first image
            fireEvent.press(imageButtons[0]);

            // Should show selected section
            const selectedSection = await findByText('Ảnh đã chọn');
            expect(selectedSection).toBeTruthy();
        });

        it('should deselect current image by clicking again in single mode', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, queryByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);

            // Select first image
            fireEvent.press(imageButtons[0]);

            await waitFor(() => {
                expect(queryByText('Ảnh đã chọn')).toBeTruthy();
            });

            // Click same image again to deselect
            fireEvent.press(imageButtons[0]);

            await waitFor(() => {
                expect(queryByText('Ảnh đã chọn')).toBeNull();
            });
        });

        it('should dispatch setCoverImage and navigate back on save in single mode', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);
            fireEvent.press(imageButtons[0]);

            await waitFor(() => {
                expect(getByText(/Lưu \(1\)/)).toBeTruthy();
            });

            const saveButton = getByText(/Lưu \(1\)/);
            fireEvent.press(saveButton);

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'upload/setCoverImage',
                    payload: 'file:///img1.jpg',
                });
                expect(mockBackFn).toHaveBeenCalled();
            });
        });

        it('should replace previous selection when selecting new image in single mode', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, queryByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);

            // Select first image
            fireEvent.press(imageButtons[0]);
            await waitFor(() => {
                expect(queryByText(/Lưu \(1\)/)).toBeTruthy();
            });

            // Select second image - should replace first
            fireEvent.press(imageButtons[1]);
            await waitFor(() => {
                expect(queryByText(/Lưu \(1\)/)).toBeTruthy();
            });
        });
    });

    describe('Multi-Select Mode', () => {
        beforeEach(() => {
            mockUseLocalSearchParamsFn.mockReturnValue({});
        });

        it('should initialize with existing selected images from Redux', async () => {
            mockUploadState.selectedImages = ['file:///img1.jpg', 'file:///img2.jpg'];
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { findByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            // Should show 2 selected images
            const saveButton = await findByText(/Lưu \(2\)/);
            expect(saveButton).toBeTruthy();
        });

        it('should select multiple images in multi-select mode', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, findByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);

            // Select first image
            fireEvent.press(imageButtons[0]);
            await waitFor(() => {
                expect(findByText(/Lưu \(1\)/)).toBeTruthy();
            });

            // Select second image
            fireEvent.press(imageButtons[1]);
            await waitFor(() => {
                expect(findByText(/Lưu \(2\)/)).toBeTruthy();
            });

            // Select third image
            fireEvent.press(imageButtons[2]);
            await waitFor(() => {
                expect(findByText(/Lưu \(3\)/)).toBeTruthy();
            });
        });

        it('should deselect images by clicking selected images in multi-select mode', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, findByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);

            // Select two images
            fireEvent.press(imageButtons[0]);
            fireEvent.press(imageButtons[1]);

            await waitFor(() => {
                expect(findByText(/Lưu \(2\)/)).toBeTruthy();
            });

            // Deselect first image
            fireEvent.press(imageButtons[0]);

            await waitFor(() => {
                expect(findByText(/Lưu \(1\)/)).toBeTruthy();
            });
        });

        it('should display selected images with numbered badges', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);

            // Select three images
            fireEvent.press(imageButtons[0]);
            fireEvent.press(imageButtons[1]);
            fireEvent.press(imageButtons[2]);

            await waitFor(() => {
                expect(getByText('1')).toBeTruthy();
                expect(getByText('2')).toBeTruthy();
                expect(getByText('3')).toBeTruthy();
            });
        });

        it('should remove images from selected section via close button', async () => {
            mockUploadState.selectedImages = ['file:///img1.jpg', 'file:///img2.jpg'];
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, findByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            // Find remove buttons
            const removeButtons = getAllByTestId(/^remove-selected-/);
            expect(removeButtons.length).toBe(2);

            // Remove first image
            fireEvent.press(removeButtons[0]);

            await waitFor(() => {
                expect(findByText(/Lưu \(1\)/)).toBeTruthy();
            });
        });

        it('should dispatch setSelectedImages and navigate back on save in multi-select mode', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);
            fireEvent.press(imageButtons[0]);
            fireEvent.press(imageButtons[1]);

            await waitFor(() => {
                expect(getByText(/Lưu \(2\)/)).toBeTruthy();
            });

            const saveButton = getByText(/Lưu \(2\)/);
            fireEvent.press(saveButton);

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalledWith({
                    type: 'upload/setSelectedImages',
                    payload: ['file:///img1.jpg', 'file:///img2.jpg'],
                });
                expect(mockBackFn).toHaveBeenCalled();
            });
        });
    });

    describe('Navigation & UI Interactions', () => {
        beforeEach(() => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });
        });

        it('should navigate back when back button in header is pressed', async () => {
            const { getByTestId } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const backButton = getByTestId('back-button');
            fireEvent.press(backButton);

            expect(mockBackFn).toHaveBeenCalled();
        });

        it('should navigate back when cancel button is pressed', async () => {
            const { getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const cancelButton = getByText('Huỷ');
            fireEvent.press(cancelButton);

            expect(mockBackFn).toHaveBeenCalled();
        });

        it('should have save button disabled when no images selected', async () => {
            const { getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const saveButton = getByText(/Lưu \(0\)/);
            expect(saveButton).toBeTruthy();

            // The button should have isDisabled prop set to true
            // We can verify this by checking that pressing it doesn't dispatch
            fireEvent.press(saveButton);

            // Wait a bit to ensure no dispatch happens
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(mockDispatch).not.toHaveBeenCalled();
        });

        it('should have save button enabled when images selected', async () => {
            const { getAllByTestId, getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);
            fireEvent.press(imageButtons[0]);

            await waitFor(() => {
                expect(getByText(/Lưu \(1\)/)).toBeTruthy();
            });

            const saveButton = getByText(/Lưu \(1\)/);
            fireEvent.press(saveButton);

            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled();
            });
        });

        it('should show correct count in save button text', async () => {
            const { getAllByTestId, getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            // Initially 0
            expect(getByText(/Lưu \(0\)/)).toBeTruthy();

            const imageButtons = getAllByTestId(/^image-pressable-/);

            // Select 1
            fireEvent.press(imageButtons[0]);
            await waitFor(() => {
                expect(getByText(/Lưu \(1\)/)).toBeTruthy();
            });

            // Select 2
            fireEvent.press(imageButtons[1]);
            await waitFor(() => {
                expect(getByText(/Lưu \(2\)/)).toBeTruthy();
            });

            // Deselect 1
            fireEvent.press(imageButtons[0]);
            await waitFor(() => {
                expect(getByText(/Lưu \(1\)/)).toBeTruthy();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty library', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: [] });

            const { queryByTestId, getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            // Should not find any image pressables
            const imageButtons = queryByTestId(/^image-pressable-/);
            expect(imageButtons).toBeNull();

            // Save button should show 0
            expect(getByText(/Lưu \(0\)/)).toBeTruthy();
        });

        it('should handle library with single image', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: [{ uri: 'file:///single.jpg' }] });

            const { getAllByTestId } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);
            expect(imageButtons.length).toBe(1);
        });

        it('should handle library with many images', async () => {
            const manyAssets = Array.from({ length: 100 }, (_, i) => ({
                uri: `file:///img${i + 1}.jpg`,
            }));

            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: manyAssets });

            const { getAllByTestId } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);
            expect(imageButtons.length).toBe(100);
        });

        it('should handle rapid selection/deselection', async () => {
            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: mockAssets });

            const { getAllByTestId, getByText } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            const imageButtons = getAllByTestId(/^image-pressable-/);

            // Rapid clicks
            fireEvent.press(imageButtons[0]);
            fireEvent.press(imageButtons[1]);
            fireEvent.press(imageButtons[2]);
            fireEvent.press(imageButtons[0]); // Deselect
            fireEvent.press(imageButtons[1]); // Deselect
            fireEvent.press(imageButtons[0]); // Select again

            await waitFor(() => {
                expect(getByText(/Lưu \(2\)/)).toBeTruthy();
            });
        });

        it('should handle assets with null/empty URIs', async () => {
            const assetsWithNulls = [
                { uri: 'file:///img1.jpg' },
                { uri: null },
                { uri: '' },
                { uri: 'file:///img2.jpg' },
            ];

            mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
            mockGetAssetsAsync.mockResolvedValue({ assets: assetsWithNulls });

            const { getAllByTestId } = render(
                <Wrapper>
                    <SelectImagesScreen />
                </Wrapper>
            );

            await waitFor(() => {
                expect(mockGetAssetsAsync).toHaveBeenCalled();
            });

            // Should render all 4 items (even with empty URIs)
            const imageButtons = getAllByTestId(/^image-pressable-/);
            expect(imageButtons.length).toBe(4);
        });
    });
});
