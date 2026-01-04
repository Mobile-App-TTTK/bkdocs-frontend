import SplashScreen from '@/components/splash-screen';
import ThemeWrapper from '@/components/theme-wrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSplashScreen } from '@/hooks/use-splash-screen';
import { logAppOpen, logNotificationOpened, logScreenView, logSessionStart, trackScreenEnter, trackScreenExit } from '@/services/analytics';
import { addNotificationResponseReceivedListener } from '@/services/pushNotification';
import { store } from '@/store';
import { useAppFonts } from '@/utils/fonts';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';
import { Provider as ReduxProvider } from 'react-redux';
import '../global.css';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',

  // Environment tracking
  environment: __DEV__ ? 'development' : 'production',

  // Release tracking - helps identify which version has issues
  release: `bkdocs-frontend@${require('../package.json').version}`,

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // Enable Spotlight in development for better debugging
  spotlight: __DEV__,
});

const queryClient = new QueryClient();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, finishLoading } = useSplashScreen(1000);
  const fontsLoaded = useAppFonts();
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  // Log app open for analytics
  useEffect(() => {
    logAppOpen();
    logSessionStart();
  }, []);

  // Track screen views and screen time
  useEffect(() => {
    if (!pathname) return;
    
    const screenName = pathname.replace(/\//g, '_').replace(/^_/, '') || 'home';
    
    // Exit previous screen
    if (previousPathnameRef.current) {
      const prevScreenName = previousPathnameRef.current.replace(/\//g, '_').replace(/^_/, '') || 'home';
      trackScreenExit(prevScreenName);
    }
    
    // Enter new screen and log screen view
    trackScreenEnter(screenName);
    logScreenView(screenName);
    
    previousPathnameRef.current = pathname;
    
    // Cleanup on unmount
    return () => {
      if (previousPathnameRef.current) {
        const exitScreenName = previousPathnameRef.current.replace(/\//g, '_').replace(/^_/, '') || 'home';
        trackScreenExit(exitScreenName);
      }
    };
  }, [pathname]);

  // Listen for notification taps
  useEffect(() => {
    const subscription = addNotificationResponseReceivedListener((response) => {
      const notificationType = response.notification?.request?.content?.data?.type as string || 'general';
      logNotificationOpened(notificationType);
    });

    return () => subscription.remove();
  }, []);

  if (isLoading || !fontsLoaded) {
    return (
      <SplashScreen onFinish={finishLoading} duration={1000} />
    );
  }

  const nativeBaseTheme = extendTheme({
    config: {
      useSystemColorMode: true,
      initialColorMode: 'light',
    },
    fonts: {
      heading: 'Inter-Bold',
      body: 'Inter-Regular',
      mono: 'Inter-Medium',
    },
    colors: {
      primary: {
        50: '#FFEBE6',
        100: '#FFCEC2',
        200: '#FFA792',
        300: '#FF7E5D',
        400: '#FF582F',
        500: '#FF3300',
        600: '#D92B00',
        700: '#B52300',
        800: '#911D00',
        900: '#731701',
      },
    },
    components: {
      Button: {
        defaultProps: {
          colorScheme: 'primary',
          variant: 'solid',
        },
        variants: {
          solid: ({ colorScheme }: any) => ({
            bg: `${colorScheme}.500`,
            _text: {
              color: 'white',
              fontFamily: 'Inter-Semibold',
            },
            _pressed: { bg: `${colorScheme}.600` },
            _hover: { bg: `${colorScheme}.400` },
          }),
        },
      },
      Text: {
        defaultProps: {
          fontFamily: 'Inter-Regular',
        },
      },
      Heading: {
        defaultProps: {
          fontFamily: 'Inter-Bold',
        },
      },
    },
  });

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ThemeWrapper>
            <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
              <NativeBaseProvider theme={nativeBaseTheme}>
                <AuthProvider>
                  <UserProvider>
                    <Stack screenOptions={{ animation: 'none', headerShown: false }}>
                      <Stack.Screen name="index" options={{ headerShown: false }} />
                      <Stack.Screen name="(public)" options={{ headerShown: false }} />
                    </Stack>
                    <StatusBar style="auto" />
                  </UserProvider>
                </AuthProvider>
              </NativeBaseProvider>
            </NavigationThemeProvider>
          </ThemeWrapper>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
});