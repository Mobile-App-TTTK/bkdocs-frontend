import SplashScreen from '@/components/splash-screen';
import ThemeWrapper from '@/components/theme-wrapper';
import { useAppFonts } from '@/constants/fonts';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSplashScreen } from '@/hooks/use-splash-screen';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NativeBaseProvider, extendTheme } from 'native-base';
import 'react-native-reanimated';
import '../global.css';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { isLoading, finishLoading } = useSplashScreen(1000);
  const fontsLoaded = useAppFonts();

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
      heading: 'Gilroy-Bold',
      body: 'Gilroy-Regular',
      mono: 'Gilroy-Medium',
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
              fontFamily: 'Gilroy-Semibold',
            },
            _pressed: { bg: `${colorScheme}.600` },
            _hover: { bg: `${colorScheme}.400` },
          }),
        },
      },
      Text: {
        defaultProps: {
          fontFamily: 'Gilroy-Regular',
        },
      },
      Heading: {
        defaultProps: {
          fontFamily: 'Gilroy-Bold',
        },
      },
    },
  });

  return (
    <ThemeProvider>
      <ThemeWrapper>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <NativeBaseProvider theme={nativeBaseTheme}>
            <AuthProvider>
              <Stack screenOptions={{ animation: 'none', headerShown: false }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(public)" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </AuthProvider>
          </NativeBaseProvider>
        </NavigationThemeProvider>
      </ThemeWrapper>
    </ThemeProvider>
  );
}
