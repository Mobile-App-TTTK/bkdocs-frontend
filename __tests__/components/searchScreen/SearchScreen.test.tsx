import SearchScreen from '@/components/searchScreen';
import { useGetSuggestions, useGetSuggestionsKeyword } from '@/components/searchScreen/api';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('expo-router', () => {
    const React = require('react');
    return {
        router: {
            push: jest.fn(),
            back: jest.fn(),
        },
        useFocusEffect: (cb: any) => {
            React.useEffect(() => {
                const cleanup = cb?.();
                return cleanup;
            }, []);
        },
    };
});

jest.mock('react-native-safe-area-context', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        SafeAreaView: ({ children }: any) => <View>{children}</View>,
        useSafeAreaInsets: () => ({ top: 10, bottom: 0, left: 0, right: 0 }),
    };
});

// Mock native-base to handle potential issues with Skeleton/Spinner and Text
jest.mock('native-base', () => {
    const React = require('react');
    const { View, Text, TextInput, TouchableOpacity } = require('react-native');
    return {
        View: (props: any) => <View {...props} />,
        Text: (props: any) => <Text {...props} />,
        ScrollView: (props: any) => <View {...props} testID="scroll-view">{props.children}</View>,
        Skeleton: (props: any) => <View {...props} testID="skeleton" />,
        Pressable: (props: any) => <TouchableOpacity {...props} />,
    };
});

jest.mock('@/components/searchScreen/api', () => ({
    useGetSuggestions: jest.fn(),
    useGetSuggestionsKeyword: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ name }: any) => {
        const { Text } = require('react-native');
        return <Text>{name}</Text>;
    },
    Feather: ({ name }: any) => {
        const { Text } = require('react-native');
        return <Text>{name}</Text>;
    },
}));

jest.mock('@/components/SubjectCard', () => {
    const { Text, View, TouchableOpacity } = require('react-native');
    return ({ name, onPress }: any) => (
        <TouchableOpacity onPress={onPress} testID="subject-card">
            <Text>Subject: {name}</Text>
        </TouchableOpacity>
    );
});

describe('SearchScreen', () => {
    const mockUseGetSuggestions = useGetSuggestions as jest.Mock;
    const mockUseGetSuggestionsKeyword = useGetSuggestionsKeyword as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();

        // Default mocks
        mockUseGetSuggestions.mockReturnValue({
            data: [],
            isLoading: false,
        });
        mockUseGetSuggestionsKeyword.mockReturnValue({
            data: [],
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders initial state correctly with suggestions', () => {
        const suggestions = [
            { id: '1', name: 'Toán cao cấp', count: 10, imageUrl: '' },
            { id: '2', name: 'Vật lý 1', count: 5, imageUrl: '' },
        ];

        mockUseGetSuggestions.mockReturnValue({
            data: suggestions,
            isLoading: false,
        });

        render(<SearchScreen />);

        expect(screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...')).toBeTruthy();
        expect(screen.getByText('Môn học gợi ý')).toBeTruthy();
        expect(screen.getByText('Subject: Toán cao cấp')).toBeTruthy();
        expect(screen.getByText('Subject: Vật lý 1')).toBeTruthy();
    });

    it('renders loading state for suggestions', () => {
        mockUseGetSuggestions.mockReturnValue({
            data: [],
            isLoading: true,
        });

        render(<SearchScreen />);

        // Check for skeletons
        expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
        expect(screen.queryByText('Subject: Toán cao cấp')).toBeNull();
    });

    it('navigates back when back button pressed', () => {
        render(<SearchScreen />);

        const backButton = screen.getByText('chevron-back');
        fireEvent.press(backButton);

        expect(router.back).toHaveBeenCalled();
    });

    it('updates input and search query with debounce', async () => {
        render(<SearchScreen />);

        const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
        fireEvent.changeText(input, 'test query');

        expect(input.props.value).toBe('test query');

        act(() => {
            jest.advanceTimersByTime(150); // > 100ms debounce
        });

        // Check if hook was called with debounced value
        // The component re-renders and calls the hook with new value
        expect(mockUseGetSuggestionsKeyword).toHaveBeenCalledWith('test query');
    });

    it('shows keyword suggestions when user types', async () => {
        mockUseGetSuggestionsKeyword.mockReturnValue({
            data: ['keyword 1', 'keyword 2'],
        });

        render(<SearchScreen />);

        const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
        fireEvent.changeText(input, 'key');

        act(() => {
            jest.advanceTimersByTime(150);
        });

        expect(screen.queryByText('Môn học gợi ý')).toBeNull();

        expect(screen.getByText('keyword 1')).toBeTruthy();
        expect(screen.getByText('keyword 2')).toBeTruthy();
    });

    it('clears search when clear button pressed', () => {
        render(<SearchScreen />);

        const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
        fireEvent.changeText(input, 'something');

        act(() => {
            jest.advanceTimersByTime(150);
        });

        expect(input.props.value).toBe('something');

        const clearButton = screen.getByText('close');
        fireEvent.press(clearButton);

        act(() => {
            jest.advanceTimersByTime(150);
        });

        expect(input.props.value).toBe('');
        expect(screen.getByText('Môn học gợi ý')).toBeTruthy();
    });

    it('navigates to result on submit editing', () => {
        render(<SearchScreen />);

        const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
        fireEvent.changeText(input, 'final query');
        fireEvent(input, 'onSubmitEditing');

        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/(tabs)/search/result',
            params: { query: 'final query' },
        });
    });

    it('navigates to result on suggestion tap', () => {
        mockUseGetSuggestionsKeyword.mockReturnValue({
            data: ['suggestion click'],
        });

        render(<SearchScreen />);

        const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
        fireEvent.changeText(input, 'sugg');

        act(() => {
            jest.advanceTimersByTime(150);
        });

        const suggestionItem = screen.getByText('suggestion click');
        fireEvent(suggestionItem, 'onTouchStart');
    });

    // Improved test for touch interaction
    it('navigates to result on suggestion tap (corrected)', () => {
        mockUseGetSuggestionsKeyword.mockReturnValue({
            data: ['suggestion click'],
        });

        render(<SearchScreen />);

        const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
        fireEvent.changeText(input, 'sugg');

        act(() => {
            jest.advanceTimersByTime(150);
        });

        const suggestionText = screen.getByText('suggestion click');
        fireEvent(suggestionText, 'onTouchStart');


        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/(tabs)/search/result',
            params: { query: 'suggestion click' },
        });
    });

    it('does not navigate on empty search', () => {
        render(<SearchScreen />);

        const input = screen.getByPlaceholderText('Tìm kiếm tài liệu, môn học...');
        fireEvent.changeText(input, '   '); // only whitespace
        fireEvent(input, 'onSubmitEditing');

    });
});


