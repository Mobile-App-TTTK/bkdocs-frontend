import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { NativeBaseProvider } from 'native-base';
import React from 'react';
import { Alert } from 'react-native';

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

const mockDispatch = jest.fn();

let mockUploadState: any = {
  documentFile: null,
  title: '',
  description: '',
  selectedFaculties: [],
  selectedSubjects: [],
  selectedLists: [],
  selectedImages: [],
  coverImage: null,
};

jest.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (sel: any) => {
    // Use a getter to access current mockUploadState
    const getCurrentState = () => ({ upload: mockUploadState });
    return sel(getCurrentState());
  },
}));

jest.mock('@/store/uploadSlice', () => ({
  setTitle: (payload: string) => ({ type: 'upload/setTitle', payload }),
  setDescription: (payload: string) => ({ type: 'upload/setDescription', payload }),
  setCoverImage: (payload: string) => ({ type: 'upload/setCoverImage', payload }),
  clearUploadState: () => ({ type: 'upload/clear' }),
}));

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: mockBack,
    push: mockPush,
  },
  useFocusEffect: jest.fn((callback) => {
    callback();
  }),
}));

const mockRequestMediaLibraryPermissionsAsync = jest.fn();
const mockLaunchImageLibraryAsync = jest.fn();
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: () => mockRequestMediaLibraryPermissionsAsync(),
  launchImageLibraryAsync: (opts: any) => mockLaunchImageLibraryAsync(opts),
}));

const mockRequestPermissionsAsync = jest.fn();
const mockGetAssetInfoAsync = jest.fn();
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: () => mockRequestPermissionsAsync(),
  getAssetInfoAsync: (id: string) => mockGetAssetInfoAsync(id),
}));

const mockMutateAsync = jest.fn();
const mockIsPending = { value: false };
jest.mock('@/components/Upload/api', () => ({
  useUploadDocument: () => ({ mutateAsync: mockMutateAsync, isPending: mockIsPending.value }),
}));

jest.mock('@/components/searchResultScreen/api', () => ({
  useFetchFacultiesAndSubjects: () => ({
    data: {
      faculties: [{ id: 'f1', name: 'Khoa A' }],
      subjects: [{ id: 's1', name: 'Mon 1' }],
      documentTypes: [{ id: 'd1', name: 'Slide' }],
    },
  }),
}));

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfile: () => ({
    data: { name: 'User X', documentCount: 10, imageUrl: '' },
  }),
}));

const inset = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

const UploadDetailScreen = require('@/components/Upload/detail').default;

describe('UploadDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert').mockImplementation(() => { });
    mockIsPending.value = false;

    mockUploadState = {
      documentFile: null,
      title: '',
      description: '',
      selectedFaculties: [],
      selectedSubjects: [],
      selectedLists: [],
      selectedImages: [],
      coverImage: null,
    };
  });

  it('renders header and user profile', () => {
    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    expect(screen.getByText('Thêm mô tả chi tiết')).toBeTruthy();
    expect(screen.getByText('User X')).toBeTruthy();
    expect(screen.getAllByText(/tài liệu/i)[0]).toBeTruthy();
  });

  it('auto-fills title from document name when title empty', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///a.pdf', name: 'a.pdf' },
      title: '',
    };

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'upload/setTitle', payload: 'a.pdf' });
    });
  });

  it('pick cover: permission denied shows alert', async () => {
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: false });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const coverButton = screen.getByTestId('cover-image-picker');
    fireEvent.press(coverButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Cần quyền truy cập', 'Vui lòng cấp quyền truy cập thư viện ảnh');
    });
  });

  it('pick cover: success dispatches setCoverImage', async () => {
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    mockLaunchImageLibraryAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file:///cover.jpg' }],
    });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const coverButton = screen.getByTestId('cover-image-picker');
    fireEvent.press(coverButton);

    await waitFor(() => {
      expect(mockLaunchImageLibraryAsync).toHaveBeenCalled();
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'upload/setCoverImage', payload: 'file:///cover.jpg' });
    });
  });

  it('upload: media permission denied shows alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh để upload');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('upload: cannot resolve subject/documentType IDs shows alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon DOES NOT EXIST'],
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể xác định ID của môn học hoặc loại tài liệu');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('upload: success calls mutateAsync with processed ph:// URIs, clears state, and back on OK', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      description: 'Desc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
      coverImage: 'ph://ASSET_COVER/something',
      selectedImages: ['ph://ASSET_IMG_1/abc', 'file:///img2.jpg'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    mockGetAssetInfoAsync.mockImplementation(async (assetId: string) => {
      if (assetId === 'ASSET_COVER') return { localUri: 'file:///local-cover.jpg' };
      if (assetId === 'ASSET_IMG_1') return { localUri: 'file:///local-img-1.jpg' };
      return { localUri: null };
    });

    mockMutateAsync.mockResolvedValue({});

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    const callArg = mockMutateAsync.mock.calls[0][0];

    expect(callArg.title).toBe('My Doc');
    expect(callArg.description).toBe('Desc');
    expect(callArg.facultyIds).toEqual(['f1']);
    expect(callArg.subjectId).toBe('s1');
    expect(callArg.documentTypeId).toBe('d1');

    expect(callArg.thumbnailFile.uri).toBe('file:///local-cover.jpg');

    expect(callArg.images.length).toBe(2);
    expect(callArg.images[0].uri).toBe('file:///local-img-1.jpg');
    expect(callArg.images[1].uri).toBe('file:///img2.jpg');

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'upload/clear' });

    const successCall = (Alert.alert as jest.Mock).mock.calls.find((c) => c[0] === 'Thành công');
    expect(successCall).toBeTruthy();
    const buttons = successCall?.[2];
    const okBtn = buttons.find((b: any) => b?.text === 'OK');
    okBtn.onPress();
    expect(mockBack).toHaveBeenCalled();
  });

  // ==================== VALIDATION ERRORS ====================

  it('upload: empty title shows alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: '   ', // whitespace only
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng nhập tiêu đề tài liệu');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('upload: missing document file shows alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: null,
      title: 'My Doc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không tìm thấy file tài liệu');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('upload: no faculty selected shows alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      selectedFaculties: [], // empty
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng chọn ít nhất một khoa');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('upload: no subject selected shows alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: [], // empty
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng chọn môn học');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('upload: no document type selected shows alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: [], // empty
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByText('Tải tài liệu lên'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Vui lòng chọn loại tài liệu');
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  // ==================== ERROR HANDLING ====================

  it('pick cover: error during launch shows alert', async () => {
    mockRequestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    mockLaunchImageLibraryAsync.mockRejectedValue(new Error('Picker failed'));

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const coverButton = screen.getByTestId('cover-image-picker');
    fireEvent.press(coverButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể chọn ảnh bìa');
    });
  });

  it('upload: photo library URI conversion error is caught', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      description: 'Desc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
      coverImage: 'ph://ASSET_FAIL/something',
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetAssetInfoAsync.mockRejectedValue(new Error('Asset not found'));

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByTestId('upload-button'));

    await waitFor(() => {
      // Error should be caught and generic error message shown
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', expect.any(String));
    });
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('upload: server error with message shows custom alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      description: 'Desc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockMutateAsync.mockRejectedValue({
      response: {
        data: {
          message: 'File quá lớn',
        },
      },
    });

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByTestId('upload-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'File quá lớn');
    });
  });

  it('upload: server error without message shows generic alert', async () => {
    mockUploadState = {
      ...mockUploadState,
      documentFile: { uri: 'file:///doc.pdf', name: 'doc.pdf' },
      title: 'My Doc',
      selectedFaculties: ['Khoa A'],
      selectedSubjects: ['Mon 1'],
      selectedLists: ['Slide'],
    };

    mockRequestPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockMutateAsync.mockRejectedValue(new Error('Network error'));

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    fireEvent.press(screen.getByTestId('upload-button'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Lỗi', 'Không thể tải tài liệu lên');
    });
  });

  // ==================== UI RENDERING & NAVIGATION ====================

  it('renders back button and navigates back when pressed', () => {
    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const backButton = screen.getByTestId('back-button');
    expect(backButton).toBeTruthy();

    fireEvent.press(backButton);
    expect(mockBack).toHaveBeenCalled();
  });

  it('renders keyboard dismiss on TouchableWithoutFeedback press', () => {
    const keyboardDismissSpy = jest.spyOn(require('react-native').Keyboard, 'dismiss');

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const touchableWithoutFeedback = screen.getByTestId('keyboard-dismiss-area');
    fireEvent.press(touchableWithoutFeedback);

    expect(keyboardDismissSpy).toHaveBeenCalled();
    keyboardDismissSpy.mockRestore();
  });

  it('displays selected images count', () => {
    mockUploadState = {
      ...mockUploadState,
      selectedImages: ['file:///img1.jpg', 'file:///img2.jpg', 'file:///img3.jpg'],
    };

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    expect(screen.getByText('3 ảnh')).toBeTruthy();
  });

  it('displays selected faculties with count', () => {
    mockUploadState = {
      ...mockUploadState,
      selectedFaculties: ['Khoa A', 'Khoa B', 'Khoa C'],
    };

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    expect(screen.getByText(/Khoa A/)).toBeTruthy();
    expect(screen.getByText(/\+2 khoa/)).toBeTruthy();
  });

  it('displays single faculty without count', () => {
    mockUploadState = {
      ...mockUploadState,
      selectedFaculties: ['Khoa A'],
    };

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    expect(screen.getByText('Khoa A')).toBeTruthy();
    expect(screen.queryByText(/\+/)).toBeNull();
  });

  it('displays selected subjects with count', () => {
    mockUploadState = {
      ...mockUploadState,
      selectedSubjects: ['Mon 1', 'Mon 2', 'Mon 3'],
    };

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    expect(screen.getByText(/Mon 1/)).toBeTruthy();
    expect(screen.getByText(/\+2/)).toBeTruthy();
  });

  it('displays selected document types with count', () => {
    mockUploadState = {
      ...mockUploadState,
      selectedLists: ['Slide', 'Bài tập'],
    };

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    expect(screen.getByText(/Slide/)).toBeTruthy();
    expect(screen.getByText(/\+1/)).toBeTruthy();
  });

  it('navigates to select-images when pressing add images button', () => {
    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const addImagesButton = screen.getByTestId('add-images-button');
    expect(addImagesButton).toBeTruthy();

    fireEvent.press(addImagesButton);
    expect(mockPush).toHaveBeenCalledWith('/(app)/select-images');
  });

  it('navigates to select-faculty with params when pressing select faculty button', () => {
    mockUploadState = {
      ...mockUploadState,
      selectedFaculties: ['Khoa A', 'Khoa B'],
    };

    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const selectFacultyButton = screen.getByTestId('select-faculty-button');
    expect(selectFacultyButton).toBeTruthy();

    fireEvent.press(selectFacultyButton);
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(app)/select-faculty',
      params: { faculties: JSON.stringify(['Khoa A', 'Khoa B']) },
    });
  });

  it('navigates to select-subject when pressing select subject button', () => {
    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const selectSubjectButton = screen.getByTestId('select-subject-button');
    expect(selectSubjectButton).toBeTruthy();

    fireEvent.press(selectSubjectButton);
    expect(mockPush).toHaveBeenCalledWith('/(app)/select-subject');
  });

  it('navigates to select-list when pressing select list button', () => {
    render(
      <Wrapper>
        <UploadDetailScreen />
      </Wrapper>
    );

    const selectListButton = screen.getByTestId('select-list-button');
    expect(selectListButton).toBeTruthy();

    fireEvent.press(selectListButton);
    expect(mockPush).toHaveBeenCalledWith('/(app)/select-list');
  });
});
