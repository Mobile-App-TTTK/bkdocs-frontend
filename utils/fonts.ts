import {
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from '@expo-google-fonts/inter';

export const fontConfig = {
  'Inter-Regular': Inter_400Regular,
  'Inter-Medium': Inter_500Medium,
  'Inter-Semibold': Inter_600SemiBold,
  'Inter-Bold': Inter_700Bold,
};

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts(fontConfig);
  return fontsLoaded;
};

export const fontFamily = {
  default: 'Inter-Regular',
} as const;
