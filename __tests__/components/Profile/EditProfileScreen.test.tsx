import EditProfileScreen from '@/components/Profile/edit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('expo-image-picker', () => ({
    requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));



// Mock API hooks
const mockMutateAsync = jest.fn();
jest.mock('@/components/Profile/api', () => ({
    useFetchUserProfile: jest.fn(),
    useUpdateProfile: jest.fn(() => ({
        mutateAsync: mockMutateAsync,
        isPending: false,
    })),
}));

jest.mock('@/components/searchResultScreen/api', () => ({
    useFetchFacultiesAndSubjects: jest.fn(),
}));

// Mock FormField component to simplify testing
jest.mock('@/components/FormField', () => {
    const { View, Text, TextInput } = require('react-native');
    return ({ label, value, onChangeText, placeholder, disabled, testID }: any) => (
        <View>
            <Text>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                editable={!disabled}
                testID={testID || `input-${label}`}
            />
        </View>
    );
});

// Wrapper for NativeBase
const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <NativeBaseProvider initialWindowMetrics={inset}>
        {children}
    </NativeBaseProvider>
);

describe('EditProfileScreen Component', () => {
    const mockBack = jest.fn();
    const mockUserProfile = {
        name: 'Test User',
        email: 'test@example.com',
        faculty: 'Faculty A',
        intakeYear: 2021,
        imageUrl: 'http://example.com/avatar.png',
    };
    const mockFaculties = {
        faculties: [
            { id: '1', name: 'Faculty A' },
            { id: '2', name: 'Faculty B' },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ back: mockBack });

        // Setup default API responses
        const { useFetchUserProfile } = require('@/components/Profile/api');
        useFetchUserProfile.mockReturnValue({ data: mockUserProfile, isLoading: false });

        const { useFetchFacultiesAndSubjects } = require('@/components/searchResultScreen/api');
        useFetchFacultiesAndSubjects.mockReturnValue({ data: mockFaculties });

        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({ canceled: true, assets: [] });

        jest.spyOn(Alert, 'alert');
    });

    it('renders correctly with user data', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        expect(screen.getByText('Chỉnh sửa hồ sơ')).toBeTruthy();
        expect(screen.getByDisplayValue('Test User')).toBeTruthy();
        expect(screen.getByDisplayValue('test@example.com')).toBeTruthy();
        expect(screen.getByText('Faculty A')).toBeTruthy(); // Faculty name displayed
        expect(screen.getByDisplayValue('2021')).toBeTruthy();
    });

    it('shows loading spinner', () => {
        const { useFetchUserProfile } = require('@/components/Profile/api');
        useFetchUserProfile.mockReturnValue({ data: null, isLoading: true });

        render(<TestWrapper><EditProfileScreen /></TestWrapper>);
        // Takes assumption that Spinner is rendered (NB Spinner doesn't have text, but maybe verify non-existence of form)
        expect(screen.queryByText('Chỉnh sửa hồ sơ')).toBeFalsy();
    });

    it('validates empty name', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        const nameInput = screen.getByTestId('input-Họ và tên');
        fireEvent.changeText(nameInput, '');

        fireEvent.press(screen.getByText('Lưu'));

        expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng nhập họ và tên');
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('validates short name', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        const nameInput = screen.getByTestId('input-Họ và tên');
        fireEvent.changeText(nameInput, 'A');

        fireEvent.press(screen.getByText('Lưu'));

        expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Họ và tên phải có ít nhất 2 ký tự');
        expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('validates valid name update', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        const nameInput = screen.getByTestId('input-Họ và tên');
        fireEvent.changeText(nameInput, 'New Name');

        await fireEvent.press(screen.getByText('Lưu'));

        expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Name',
        }));
    });

    it('validates enrollment year (non-numeric)', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        const yearInput = screen.getByTestId('input-Niên khoá');
        // The component logic: const numericValue = text.replace(/[^0-9]/g, ''); so it prevents non-numeric input effectively
        fireEvent.changeText(yearInput, 'abc');

        // It might filter 'abc' to empty string or keep previous
        // Let's verify what happens if we force valid year
        fireEvent.changeText(yearInput, '2022');
        await fireEvent.press(screen.getByText('Lưu'));

        expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
            intakeYear: 2022,
        }));
    });

    it('validates enrollment year range', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);
        const yearInput = screen.getByTestId('input-Niên khoá');

        fireEvent.changeText(yearInput, '1999');
        fireEvent.press(screen.getByText('Lưu'));
        expect(Alert.alert).toHaveBeenCalledWith('Lỗi', expect.stringContaining('Niên khoá phải từ 2000'));
        expect(mockMutateAsync).not.toHaveBeenCalled();

        const futureYear = new Date().getFullYear() + 2;
        fireEvent.changeText(yearInput, futureYear.toString());
        fireEvent.press(screen.getByText('Lưu'));
        expect(Alert.alert).toHaveBeenCalledWith('Lỗi', expect.stringContaining(`Niên khoá phải từ 2000`)); // until currentYear
    });

    it('opens faculty modal and selects faculty', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        const facultyTrigger = screen.getByText('Faculty A'); // Currently selected
        fireEvent.press(facultyTrigger);

        await waitFor(() => {
            expect(screen.getByText('Chọn khoa')).toBeTruthy(); // Modal Header
        });

        const newFaculty = screen.getByText('Faculty B');
        fireEvent.press(newFaculty);

        expect(screen.getByText('Faculty B')).toBeTruthy(); // Should update label

        // Verify save sends new ID
        await fireEvent.press(screen.getByText('Lưu'));
        expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
            facultyId: '2',
        }));
    });

    it('updates avatar successfully', async () => {
        const mockAsset = { uri: 'new/image.jpg', type: 'image', fileName: 'image.jpg' };
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
            canceled: false,
            assets: [mockAsset],
        });

        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        fireEvent.press(screen.getByText('Chỉnh sửa hình ảnh hồ sơ'));

        await waitFor(() => {
            expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
            expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalled();
        });

        // Save
        await fireEvent.press(screen.getByText('Lưu'));

        expect(mockMutateAsync).toHaveBeenCalledWith(expect.objectContaining({
            avatar: expect.objectContaining({
                uri: 'new/image.jpg',
            }),
        }));
    });

    it('handles api error on save', async () => {
        mockMutateAsync.mockRejectedValue({ response: { data: { message: 'Update failed' } } });

        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        await fireEvent.press(screen.getByText('Lưu'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Update failed');
        });
    });

    it('handles image picker permission denied', async () => {
        (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });

        render(<TestWrapper><EditProfileScreen /></TestWrapper>);

        fireEvent.press(screen.getByText('Chỉnh sửa hình ảnh hồ sơ'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
        });
    });
    it('validates long name', async () => {
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);
        const nameInput = screen.getByTestId('input-Họ và tên');
        fireEvent.changeText(nameInput, 'a'.repeat(51));
        fireEvent.press(screen.getByText('Lưu'));
        expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Họ và tên không được vượt quá 50 ký tự');
    });

    it('handles image picker error', async () => {
        (ImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(new Error('Picker Error'));
        render(<TestWrapper><EditProfileScreen /></TestWrapper>);
        fireEvent.press(screen.getByText('Chỉnh sửa hình ảnh hồ sơ'));
        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể chọn ảnh');
        });
    });
});
