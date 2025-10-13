import { slides } from '@/components/onboard/constants';
import { IOnboardSlide } from '@/components/onboard/interfaces';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'expo-router';
import { Box, Button, HStack, Pressable, Text } from 'native-base';
import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

export default function OnboardScreen() {
  const router = useRouter();
  const listRef = useRef<FlatList<IOnboardSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const insets = useSafeAreaInsets();


  const handleSkip = () => router.replace(ROUTES.LOGIN);

  const handlePrimary = () => {
    const isLast = activeIndex === slides.length - 1;
    if (isLast) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    const nextIndex = activeIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  return (
    <View className="flex-1 bg-white dark:bg-dark-900">
      <Pressable
        onPress={handleSkip}
        className="absolute right-4 z-10 px-3"
        style={{ top: insets.top + 8 }}
      >
        <Text className="text-sm !text-neutral-700font-medium">Bỏ qua</Text>
      </Pressable>

      <View style={{ height: screenHeight * 0.6, width: '100%' }}>
        <Image
          source={slides[activeIndex].image}
          className='!rounded-b-3xl !h-full !w-full'
          resizeMode="cover"
        />
      </View>

      <Box className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-10">
        <Text className="mb-5 !text-4xl !font-bold text-neutral-900 dark:text-white">{slides[activeIndex]?.title}</Text>
        <Text className="leading-5 text-neutral-500 dark:text-gray-300">{slides[activeIndex]?.description}</Text>

        <HStack className="mb-4 mt-6 items-center justify-center space-x-1 flex gap-1">
          {slides.map((s, idx) => (
            <View
              key={s.id}
              className={idx === activeIndex ? 'h-2 w-6 rounded-full bg-primary-500' : 'h-2 w-2 rounded-full bg-neutral-200 dark:bg-gray-600'}
            />
          ))}
        </HStack>

        <Button onPress={handlePrimary} colorScheme="primary" size="lg" borderRadius="xl" mt={2} height={52} _text={{ fontWeight: '600' }}>
          {slides[activeIndex]?.primaryCta}
        </Button>
      </Box>
    </View>
  );
}