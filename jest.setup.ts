import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-router với tất cả các functions cần thiết
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  useLocalSearchParams: jest.fn(() => ({})),
  useGlobalSearchParams: jest.fn(() => ({})),
  usePathname: jest.fn(() => '/'),
  useSegments: jest.fn(() => []),
  useFocusEffect: jest.fn((callback) => {
    // Gọi callback ngay để simulate focus
    callback();
  }),
  Link: 'Link',
  Redirect: 'Redirect',
  Stack: 'Stack',
  Tabs: 'Tabs',
}));

// Mock react-native-safe-area-context một lần duy nhất
jest.mock('react-native-safe-area-context', () => {
  const actualReact = jest.requireActual('react');
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    initialWindowMetrics: {
      frame: { x: 0, y: 0, width: 0, height: 0 },
      insets: { top: 0, bottom: 0, left: 0, right: 0 },
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});