
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import SelectFacultyScreen from '../../../../app/(app)/select-faculty/index';
// @ts-ignore
import { useFetchFacultiesAndSubjects } from '@/components/searchResultScreen/api';
// @ts-ignore
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// @ts-ignore
import { router } from 'expo-router';
// @ts-ignore
import { logUploadFunnelStep } from '@/services/analytics';
// @ts-ignore
import { setSelectedFaculties } from '@/store/uploadSlice';
// @ts-ignore

// Mock dependencies
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
}));

jest.mock('@/components/searchResultScreen/api', () => ({
    useFetchFacultiesAndSubjects: jest.fn(),
}));

jest.mock('@/store/hooks', () => ({
    useAppDispatch: jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock('@/services/analytics', () => ({
    logUploadFunnelStep: jest.fn(),
    UploadFunnel: {
        SELECT_FACULTY: 'SELECT_FACULTY',
    },
}));

jest.mock('@/store/uploadSlice', () => ({
    setSelectedFaculties: jest.fn(),
}));

jest.mock('@/utils/functions', () => ({
    removeDiacritics: jest.fn((str) => str || ''),
}));

// Mock Ionicons
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

describe('SelectFacultyScreen', () => {
    const mockDispatch = jest.fn();
    const mockFacultiesData = {
        faculties: [
            { id: '1', name: 'Computer Science' },
            { id: '2', name: 'Electrical Engineering' },
            { id: '3', name: 'Mechanical Engineering' },
            { id: '4', name: 'Physics' },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAppDispatch as jest.Mock).mockReturnValue(mockDispatch);
        // Default no filtered selection
        (useAppSelector as jest.Mock).mockReturnValue([]);
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({ data: null, isLoading: true });

        // Use unknown cast to avoid TS lint error about ActionCreator vs Mock conflict
        ((setSelectedFaculties as unknown) as jest.Mock).mockImplementation((data) => ({ type: 'set', payload: data }));
    });

    it('renders loading skeletons', () => {
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        // Skeletons are hard to query by text, assuming standard view won't be there
        expect(screen.queryByText('Computer Science')).toBeFalsy();
    });

    it('renders faculty list', () => {
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: mockFacultiesData,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        expect(screen.getByText('Computer Science')).toBeTruthy();
        expect(screen.getByText('Electrical Engineering')).toBeTruthy();
        expect(screen.getByText('Mechanical Engineering')).toBeTruthy();
    });

    it('filters faculties by search query', () => {
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: mockFacultiesData,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        const searchInput = screen.getByPlaceholderText('Tìm kiếm khoa');
        fireEvent.changeText(searchInput, 'Mech');

        expect(screen.queryByText('Computer Science')).toBeFalsy();
        expect(screen.getByText('Mechanical Engineering')).toBeTruthy();

        // Test case insensitive and diacritics
        fireEvent.changeText(searchInput, 'computer');
        expect(screen.getByText('Computer Science')).toBeTruthy();
    });

    it('toggles selection', () => {
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: mockFacultiesData,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        const item = screen.getByText('Computer Science');
        fireEvent.press(item);

        const saveBtn = screen.getByText(/Lưu \(đã chọn 1\)/);
        expect(saveBtn).toBeTruthy();

        // Unselect
        fireEvent.press(item);
        expect(screen.queryByText(/Lưu \(đã chọn 1\)/)).toBeFalsy();
    });

    it('handles select all', () => {
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: mockFacultiesData,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Chọn tất cả'));

        expect(screen.getByText('Lưu (đã chọn 4)')).toBeTruthy();
        expect(screen.getByText('Bỏ chọn tất cả')).toBeTruthy();

        fireEvent.press(screen.getByText('Bỏ chọn tất cả'));
        expect(screen.queryByText('Lưu (đã chọn 4)')).toBeFalsy();
    });

    it('saves selection', () => {
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: mockFacultiesData,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        fireEvent.press(screen.getByText('Computer Science'));

        const saveBtn = screen.getByText(/Lưu \(đã chọn 1\)/);
        fireEvent.press(saveBtn);

        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'set', payload: ['Computer Science'] }));
        expect(router.back).toHaveBeenCalled();
    });

    it('initializes with redux state', () => {
        (useAppSelector as jest.Mock).mockReturnValue(['Physics']);
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: mockFacultiesData,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        expect(screen.getByText(/Lưu \(đã chọn 1\)/)).toBeTruthy();
        // Since Physics is selected, count should be 1
    });

    it('tracks analytics on mount', () => {
        (useFetchFacultiesAndSubjects as jest.Mock).mockReturnValue({
            data: mockFacultiesData,
            isLoading: false,
        });

        render(
            <TestWrapper>
                <SelectFacultyScreen />
            </TestWrapper>
        );

        expect(logUploadFunnelStep).toHaveBeenCalledWith('SELECT_FACULTY', true);
    });
});
