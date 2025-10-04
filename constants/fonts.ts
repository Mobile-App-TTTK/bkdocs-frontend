import { useFonts } from 'expo-font';

export const fontConfig = {
  'Gilroy-Regular': require('../assets/Gilroy/400-Gilroy-Regular.ttf'),
  'Gilroy-Medium': require('../assets/Gilroy/500-Gilroy-Medium.ttf'),
  'Gilroy-Semibold': require('../assets/Gilroy/600-Gilroy-Semibold.ttf'),
  'Gilroy-Bold': require('../assets/Gilroy/700-Gilroy-Bold.ttf'),
};

export const useAppFonts = () => {
  const [fontsLoaded] = useFonts(fontConfig);
  return fontsLoaded;
};

export const fontFamily = {
  default: 'Gilroy-Regular',
} as const;
