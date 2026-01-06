import RootLayout from '@/app/_layout';
import { render, screen, waitFor } from '@testing-library/react-native';

// Mocks
jest.mock('../../global.css', () => ({}));

jest.mock('@/components/splash-screen', () => {
    const { View, Text } = require('react-native');
    return ({ onFinish, duration }: any) => (
        <View testID="splash-screen">
            <Text>Splash Screen</Text>
        </View>
    );
});

jest.mock('@/components/theme-wrapper', () => {
    return ({ children }: any) => children;
});

jest.mock('@/contexts/AuthContext', () => ({
    AuthProvider: ({ children }: any) => children,
}));

jest.mock('@/contexts/ThemeContext', () => ({
    ThemeProvider: ({ children }: any) => children,
}));

jest.mock('@/contexts/UserContext', () => ({
    UserProvider: ({ children }: any) => children,
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: jest.fn(),
}));

jest.mock('@/hooks/use-splash-screen', () => ({
    useSplashScreen: jest.fn(),
}));

jest.mock('@/utils/fonts', () => ({
    useAppFonts: jest.fn(),
}));

jest.mock('@/store', () => ({
    store: {
        getState: jest.fn(),
        dispatch: jest.fn(),
        subscribe: jest.fn(),
        replaceReducer: jest.fn(),
    },
}));

jest.mock('@react-navigation/native', () => ({
    DarkTheme: { dark: true, colors: {} },
    DefaultTheme: { dark: false, colors: {} },
    ThemeProvider: ({ children }: any) => children,
}));

jest.mock('@sentry/react-native', () => ({
    init: jest.fn(),
    wrap: (component: any) => component,
    mobileReplayIntegration: jest.fn(),
    feedbackIntegration: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
    QueryClient: jest.fn().mockImplementation(() => ({})),
    QueryClientProvider: ({ children }: any) => children,
}));

jest.mock('expo-router', () => ({
    Stack: Object.assign(
        ({ children }: any) => {
            const { View } = require('react-native');
            return <View testID="stack">{children}</View>;
        },
        {
            Screen: ({ name }: any) => {
                const { View, Text } = require('react-native');
                return <View testID={`stack-screen-${name}`}><Text>Screen: {name}</Text></View>;
            },
        }
    ),
    usePathname: jest.fn(() => '/'),
}));

jest.mock('expo-status-bar', () => ({
    StatusBar: ({ style }: any) => {
        const { View, Text } = require('react-native');
        return <View testID="status-bar"><Text>StatusBar: {style}</Text></View>;
    },
}));

jest.mock('native-base', () => {
    const { View } = require('react-native');
    return {
        NativeBaseProvider: ({ children }: any) => <View testID="native-base-provider">{children}</View>,
        extendTheme: jest.fn((theme) => theme),
    };
});

jest.mock('react-redux', () => ({
    Provider: ({ children }: any) => children,
}));

describe('RootLayout', () => {
    const mockUseColorScheme = require('@/hooks/use-color-scheme').useColorScheme;
    const mockUseSplashScreen = require('@/hooks/use-splash-screen').useSplashScreen;
    const mockUseAppFonts = require('@/utils/fonts').useAppFonts;

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks
        mockUseColorScheme.mockReturnValue('light');
        mockUseAppFonts.mockReturnValue(true);
    });

    it('renders splash screen when isLoading is true', () => {
        mockUseSplashScreen.mockReturnValue({
            isLoading: true,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(true);

        render(<RootLayout />);

        expect(screen.getByTestId('splash-screen')).toBeTruthy();
        expect(screen.getByText('Splash Screen')).toBeTruthy();
    });

    it('renders splash screen when fonts are not loaded', () => {
        mockUseSplashScreen.mockReturnValue({
            isLoading: false,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(false);

        render(<RootLayout />);

        expect(screen.getByTestId('splash-screen')).toBeTruthy();
    });

    it('renders app layout when loading is complete and fonts are loaded', async () => {
        mockUseSplashScreen.mockReturnValue({
            isLoading: false,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(true);

        render(<RootLayout />);

        await waitFor(() => {
            expect(screen.queryByTestId('splash-screen')).toBeNull();
            expect(screen.getByTestId('stack')).toBeTruthy();
        });
    });

    it('renders navigation stack with correct screens', async () => {
        mockUseSplashScreen.mockReturnValue({
            isLoading: false,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(true);

        render(<RootLayout />);

        await waitFor(() => {
            expect(screen.getByTestId('stack-screen-index')).toBeTruthy();
            expect(screen.getByText('Screen: index')).toBeTruthy();
            expect(screen.getByTestId('stack-screen-(public)')).toBeTruthy();
            expect(screen.getByText('Screen: (public)')).toBeTruthy();
        });
    });

    it('renders StatusBar with auto style', async () => {
        mockUseSplashScreen.mockReturnValue({
            isLoading: false,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(true);

        render(<RootLayout />);

        await waitFor(() => {
            expect(screen.getByTestId('status-bar')).toBeTruthy();
            expect(screen.getByText('StatusBar: auto')).toBeTruthy();
        });
    });

    it('renders NativeBaseProvider', async () => {
        mockUseSplashScreen.mockReturnValue({
            isLoading: false,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(true);

        render(<RootLayout />);

        await waitFor(() => {
            expect(screen.getByTestId('native-base-provider')).toBeTruthy();
        });
    });

    it('uses dark theme when colorScheme is dark', async () => {
        mockUseColorScheme.mockReturnValue('dark');
        mockUseSplashScreen.mockReturnValue({
            isLoading: false,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(true);

        render(<RootLayout />);

        // Component should render successfully with dark theme
        await waitFor(() => {
            expect(screen.getByTestId('stack')).toBeTruthy();
        });
    });

    it('uses light theme when colorScheme is light', async () => {
        mockUseColorScheme.mockReturnValue('light');
        mockUseSplashScreen.mockReturnValue({
            isLoading: false,
            finishLoading: jest.fn(),
        });
        mockUseAppFonts.mockReturnValue(true);

        render(<RootLayout />);

        // Component should render successfully with light theme
        await waitFor(() => {
            expect(screen.getByTestId('stack')).toBeTruthy();
        });
    });
});
