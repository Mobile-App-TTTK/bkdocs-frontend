import React, { useEffect, useState } from 'react';
import { Animated, Image, Text, View } from 'react-native';

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export default function SplashScreen({ onFinish, duration = 3000 }: SplashScreenProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onFinish?.();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish, duration]);

  return (
    <View className="flex-1 bg-primary-500 items-center justify-center">
      <Animated.View 
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center justify-center flex-row gap-4"
      >
        <View>
          <Image
            source={require('@/assets/images/logo.png')}
            className='w-16 h-16'
          />
        </View>
        <Text className="text-white text-4xl font-bold font-gilroy-bold">
          BKDocs
        </Text>
      </Animated.View>
    </View>
  );
}
