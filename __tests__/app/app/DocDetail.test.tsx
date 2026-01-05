// __tests__/app/app/DocDetailScreen.test.tsx
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

import DocDetail from '@/app/(app)/doc-detail';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  router: { back: mockBack, push: jest.fn() },
  useLocalSearchParams: () => ({ id: '123' }),
  useFocusEffect: (cb: any) => cb(),
}));

const mockApiGet = jest.fn();
jest.mock('@/api/apiClient', () => ({
  api: { get: (...args: any[]) => mockApiGet(...args) },
}));

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfile: () => ({ data: { name: 'Thuận', imageUrl: null } }),
  useFetchUserProfileById: () => ({ data: { faculty: 'HCMUT', imageUrl: null } }),
}));

jest.mock('expo-file-system', () => {
  class FakeFile {
    uri: string;
    exists = false;
    constructor(_base: string, name: string) {
      this.uri = `file:///mock/${name}`;
    }
    delete() {}
    static async downloadFileAsync(_url: string, dest: any) {
      return { uri: dest.uri };
    }
  }
  return {
    Paths: { document: 'document' },
    File: FakeFile,
  };
});

jest.mock('expo-file-system/legacy', () => ({
  StorageAccessFramework: {
    requestDirectoryPermissionsAsync: jest.fn(),
    createFileAsync: jest.fn(),
  },
  EncodingType: { Base64: 'base64' },
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
}));

const mockShareAsync = jest.fn();
jest.mock('expo-sharing', () => ({
  isAvailableAsync: async () => true,
  shareAsync: (...args: any[]) => mockShareAsync(...args),
}));

jest.mock('@/utils/downloadDocStorage', () => ({
  downloadedDocsStorage: { addDownloadedDoc: jest.fn() },
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('DocDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockApiGet.mockImplementation((url: string, config?: any) => {
        const u = String(url);
      
        if (u.includes('download')) {
          return Promise.resolve({ data: { data: 'https://example.com/file.pdf' } });
        }

        if (/rating|ratings/i.test(u)) {
          return Promise.resolve({
            data: {
              data: [
                { userName: 'X', score: 5, comment: 'ok', imageUrl: null },
              ],
            },
          });
        }

        if (u.includes('doc-detail') || u.includes('document-detail') || u.includes('document/detail')) {
          return Promise.resolve({
            data: {
              data: {
                title: 'Tài liệu A',
                downloadCount: 10,
                uploader: { id: 'u1', name: 'Uploader' },
              },
            },
          });
        }
      
        return Promise.resolve({ data: { data: [] } });
      });      
  });

  it('renders download button', async () => {
    render(
      <Wrapper>
        <DocDetail />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Tải về')).toBeTruthy();
    });
  });

  it('pressing download triggers share flow (iOS-like)', async () => {
    render(
      <Wrapper>
        <DocDetail />
      </Wrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Tải về')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Tải về'));

    await waitFor(() => {
      expect(mockShareAsync).toHaveBeenCalled();
    });
  });
});
