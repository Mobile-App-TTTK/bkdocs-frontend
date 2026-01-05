// __tests__/app/app/WriteCommentScreen.test.tsx
import { fireEvent, render, screen } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

import WriteComment from '@/app/(app)/write-comment';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ id: '123' }),
}));

jest.mock('@/api/apiClient', () => ({ api: { get: jest.fn() } }));
jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfile: () => ({ data: { name: 'Thuận', imageUrl: null } }),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: async () => ({ granted: true }),
  launchImageLibraryAsync: async () => ({ canceled: true, assets: [] }),
}));

jest.mock('expo-media-library', () => ({
  getAssetInfoAsync: async () => ({ localUri: 'file:///mock.jpg' }),
}));

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('WriteCommentScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('alerts when submitting with no score', () => {
    render(
      <Wrapper>
        <WriteComment />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Gửi đánh giá'));
    expect(alertSpy).toHaveBeenCalledWith('Thiếu đánh giá', 'Vui lòng chọn số sao');
  });

  it('alerts when submitting with score but empty comment', () => {
    render(
      <Wrapper>
        <WriteComment />
      </Wrapper>
    );
  });
});
