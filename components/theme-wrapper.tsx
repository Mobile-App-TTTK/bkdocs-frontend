import { useTheme } from '@/contexts/ThemeContext';
import { View } from 'react-native';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { isDark } = useTheme();
  
  return (
    <View className={isDark ? 'dark' : ''} style={{ flex: 1 }}>
      {children}
    </View>
  );
}
