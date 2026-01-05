import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => {
  const router = {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
  };

  return {
    router,
    useRouter: () => router,
    useLocalSearchParams: jest.fn(() => ({})),
    useGlobalSearchParams: jest.fn(() => ({})),
    usePathname: jest.fn(() => '/'),
    useSegments: jest.fn(() => []),
    useFocusEffect: jest.fn((callback) => {
      callback();
    }),
    Link: 'Link',
    Redirect: 'Redirect',
    Stack: 'Stack',
    Tabs: 'Tabs',
  };
});

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



jest.mock('@react-native-firebase/analytics', () => {
  return () => ({
    logEvent: jest.fn(),
    setUserId: jest.fn(),
    setUserProperty: jest.fn(),
    logSearch: jest.fn(),
    logShare: jest.fn(),
    logAppOpen: jest.fn(),
    setAnalyticsCollectionEnabled: jest.fn(),
  });
}, { virtual: true });

// Mock @react-native-firebase/perf
jest.mock('@react-native-firebase/perf', () => {
  return () => ({
    startTrace: jest.fn(() => Promise.resolve({
      putMetric: jest.fn(),
      putAttribute: jest.fn(),
      stop: jest.fn(),
    })),
    setPerformanceCollectionEnabled: jest.fn(),
  });
}, { virtual: true });

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  osName: 'Android',
  osVersion: '10',
  manufacturer: 'Google',
  brand: 'Google',
  modelName: 'Pixel',
}), { virtual: true });

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getExpoPushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-expo-push-token' })),
  getDevicePushTokenAsync: jest.fn(() => Promise.resolve({ data: 'mock-device-push-token' })),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  removeNotificationSubscription: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(() => Promise.resolve(null)),
  AndroidImportance: {
    MAX: 5,
    HIGH: 4,
    DEFAULT: 3,
    LOW: 2,
    MIN: 1,
    NONE: 0,
  },
}), { virtual: true });

beforeEach(() => {
  jest.clearAllMocks();
});