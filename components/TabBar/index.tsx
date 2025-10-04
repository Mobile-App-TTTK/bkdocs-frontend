import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text, TouchableOpacity, View } from 'react-native';

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: '#333',
      margin: 20,
      borderRadius: 30,
      padding: 10,
    }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: 'center' }}
          >
            <Text style={{ color: isFocused ? 'tomato' : 'white' }}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
