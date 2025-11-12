import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DocumentFile {
  uri: string;
  name: string;
  mimeType: string;
}

interface UploadState {
  documentFile: DocumentFile | null;
  title: string;
  description: string;
  selectedFaculties: string[];
  selectedSubjects: string[];
  selectedLists: string[];
  selectedImages: string[];
  coverImage: string | null;
}

const initialState: UploadState = {
  documentFile: null,
  title: '',
  description: '',
  selectedFaculties: [],
  selectedSubjects: [],
  selectedLists: [],
  selectedImages: [],
  coverImage: null,
};

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    setDocumentFile: (state, action: PayloadAction<DocumentFile | null>) => {
      state.documentFile = action.payload;
    },
    setTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    setDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    setSelectedFaculties: (state, action: PayloadAction<string[]>) => {
      state.selectedFaculties = action.payload;
    },
    setSelectedSubjects: (state, action: PayloadAction<string[]>) => {
      state.selectedSubjects = action.payload;
    },
    setSelectedLists: (state, action: PayloadAction<string[]>) => {
      state.selectedLists = action.payload;
    },
    setSelectedImages: (state, action: PayloadAction<string[]>) => {
      state.selectedImages = action.payload;
    },
    setCoverImage: (state, action: PayloadAction<string | null>) => {
      state.coverImage = action.payload;
    },
    clearUploadState: () => initialState,
  },
});

export const {
  setDocumentFile,
  setTitle,
  setDescription,
  setSelectedFaculties,
  setSelectedSubjects,
  setSelectedLists,
  setSelectedImages,
  setCoverImage,
  clearUploadState,
} = uploadSlice.actions;

export default uploadSlice.reducer;
