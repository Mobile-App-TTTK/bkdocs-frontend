import uploadReducer, {
    clearUploadState,
    setCoverImage,
    setDescription,
    setDocumentFile,
    setSelectedFaculties,
    setSelectedImages,
    setSelectedLists,
    setSelectedSubjects,
    setTitle,
} from '@/store/uploadSlice';

describe('uploadSlice', () => {
  const initialState = {
    documentFile: null,
    title: '',
    description: '',
    selectedFaculties: [],
    selectedSubjects: [],
    selectedLists: [],
    selectedImages: [],
    coverImage: null,
  };

  describe('Initial State', () => {
    it('should return the initial state when passed undefined', () => {
      const result = uploadReducer(undefined, { type: 'unknown' });
      expect(result).toEqual(initialState);
    });

    it('should have all required properties in initial state', () => {
      const result = uploadReducer(undefined, { type: 'unknown' });
      
      expect(result).toHaveProperty('documentFile');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('selectedFaculties');
      expect(result).toHaveProperty('selectedSubjects');
      expect(result).toHaveProperty('selectedLists');
      expect(result).toHaveProperty('selectedImages');
      expect(result).toHaveProperty('coverImage');
    });
  });

  describe('setDocumentFile', () => {
    it('should set document file with valid data', () => {
      const file = { 
        uri: 'file://test.pdf', 
        name: 'test.pdf', 
        mimeType: 'application/pdf' 
      };
      
      const state = uploadReducer(initialState, setDocumentFile(file));
      
      expect(state.documentFile).toEqual(file);
    });

    it('should set document file to null', () => {
      const stateWithFile = {
        ...initialState,
        documentFile: { uri: 'test', name: 'test', mimeType: 'pdf' }
      };
      
      const state = uploadReducer(stateWithFile, setDocumentFile(null));
      
      expect(state.documentFile).toBeNull();
    });

    it('should preserve other state when setting document file', () => {
      const stateWithTitle = { ...initialState, title: 'My Title' };
      const file = { uri: 'test', name: 'test', mimeType: 'pdf' };
      
      const state = uploadReducer(stateWithTitle, setDocumentFile(file));
      
      expect(state.title).toBe('My Title');
      expect(state.documentFile).toEqual(file);
    });
  });

  describe('setTitle', () => {
    it('should set title', () => {
      const state = uploadReducer(initialState, setTitle('My Document Title'));
      
      expect(state.title).toBe('My Document Title');
    });

    it('should set empty title', () => {
      const stateWithTitle = { ...initialState, title: 'Existing Title' };
      
      const state = uploadReducer(stateWithTitle, setTitle(''));
      
      expect(state.title).toBe('');
    });

    it('should handle long titles', () => {
      const longTitle = 'A'.repeat(500);
      
      const state = uploadReducer(initialState, setTitle(longTitle));
      
      expect(state.title).toBe(longTitle);
      expect(state.title.length).toBe(500);
    });

    it('should handle special characters in title', () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      const state = uploadReducer(initialState, setTitle(specialTitle));
      
      expect(state.title).toBe(specialTitle);
    });

    it('should handle Vietnamese characters in title', () => {
      const vietnameseTitle = 'Tài liệu học tập Đại học Bách Khoa';
      
      const state = uploadReducer(initialState, setTitle(vietnameseTitle));
      
      expect(state.title).toBe(vietnameseTitle);
    });
  });

  describe('setDescription', () => {
    it('should set description', () => {
      const state = uploadReducer(initialState, setDescription('Document description'));
      
      expect(state.description).toBe('Document description');
    });

    it('should set empty description', () => {
      const stateWithDesc = { ...initialState, description: 'Existing' };
      
      const state = uploadReducer(stateWithDesc, setDescription(''));
      
      expect(state.description).toBe('');
    });

    it('should handle multiline description', () => {
      const multilineDesc = 'Line 1\nLine 2\nLine 3';
      
      const state = uploadReducer(initialState, setDescription(multilineDesc));
      
      expect(state.description).toBe(multilineDesc);
    });
  });

  describe('setSelectedFaculties', () => {
    it('should set selected faculties', () => {
      const faculties = ['faculty-1', 'faculty-2'];
      
      const state = uploadReducer(initialState, setSelectedFaculties(faculties));
      
      expect(state.selectedFaculties).toEqual(faculties);
    });

    it('should set empty faculties array', () => {
      const stateWithFaculties = { 
        ...initialState, 
        selectedFaculties: ['f1', 'f2'] 
      };
      
      const state = uploadReducer(stateWithFaculties, setSelectedFaculties([]));
      
      expect(state.selectedFaculties).toEqual([]);
    });

    it('should replace existing faculties', () => {
      const stateWithFaculties = { 
        ...initialState, 
        selectedFaculties: ['old-1', 'old-2'] 
      };
      
      const state = uploadReducer(
        stateWithFaculties, 
        setSelectedFaculties(['new-1', 'new-2', 'new-3'])
      );
      
      expect(state.selectedFaculties).toEqual(['new-1', 'new-2', 'new-3']);
    });
  });

  describe('setSelectedSubjects', () => {
    it('should set selected subjects', () => {
      const subjects = ['subject-1', 'subject-2'];
      
      const state = uploadReducer(initialState, setSelectedSubjects(subjects));
      
      expect(state.selectedSubjects).toEqual(subjects);
    });

    it('should handle single subject', () => {
      const state = uploadReducer(initialState, setSelectedSubjects(['only-one']));
      
      expect(state.selectedSubjects).toHaveLength(1);
      expect(state.selectedSubjects[0]).toBe('only-one');
    });
  });

  describe('setSelectedLists', () => {
    it('should set selected lists', () => {
      const lists = ['list-1', 'list-2', 'list-3'];
      
      const state = uploadReducer(initialState, setSelectedLists(lists));
      
      expect(state.selectedLists).toEqual(lists);
    });

    it('should clear selected lists', () => {
      const stateWithLists = { ...initialState, selectedLists: ['l1'] };
      
      const state = uploadReducer(stateWithLists, setSelectedLists([]));
      
      expect(state.selectedLists).toEqual([]);
    });
  });

  describe('setSelectedImages', () => {
    it('should set selected images', () => {
      const images = ['image1.png', 'image2.jpg', 'image3.webp'];
      
      const state = uploadReducer(initialState, setSelectedImages(images));
      
      expect(state.selectedImages).toEqual(images);
    });

    it('should handle image URIs', () => {
      const imageUris = [
        'file:///storage/image1.png',
        'content://media/external/images/1234'
      ];
      
      const state = uploadReducer(initialState, setSelectedImages(imageUris));
      
      expect(state.selectedImages).toEqual(imageUris);
    });

    it('should handle large number of images', () => {
      const manyImages = Array.from({ length: 20 }, (_, i) => `image-${i}.png`);
      
      const state = uploadReducer(initialState, setSelectedImages(manyImages));
      
      expect(state.selectedImages).toHaveLength(20);
    });
  });

  describe('setCoverImage', () => {
    it('should set cover image', () => {
      const state = uploadReducer(initialState, setCoverImage('cover.png'));
      
      expect(state.coverImage).toBe('cover.png');
    });

    it('should set cover image to null', () => {
      const stateWithCover = { ...initialState, coverImage: 'existing.png' };
      
      const state = uploadReducer(stateWithCover, setCoverImage(null));
      
      expect(state.coverImage).toBeNull();
    });

    it('should handle full path cover image', () => {
      const fullPath = 'file:///storage/emulated/0/DCIM/cover.jpg';
      
      const state = uploadReducer(initialState, setCoverImage(fullPath));
      
      expect(state.coverImage).toBe(fullPath);
    });
  });

  describe('clearUploadState', () => {
    it('should reset to initial state', () => {
      const modifiedState = {
        documentFile: { uri: 'test', name: 'test', mimeType: 'pdf' },
        title: 'Test Title',
        description: 'Test Description',
        selectedFaculties: ['f1', 'f2'],
        selectedSubjects: ['s1'],
        selectedLists: ['l1', 'l2', 'l3'],
        selectedImages: ['img1', 'img2'],
        coverImage: 'cover.png',
      };
      
      const state = uploadReducer(modifiedState, clearUploadState());
      
      expect(state).toEqual(initialState);
    });

    it('should reset partial state', () => {
      const partialState = {
        ...initialState,
        title: 'Only Title Set',
      };
      
      const state = uploadReducer(partialState, clearUploadState());
      
      expect(state.title).toBe('');
    });

    it('should return new object reference', () => {
      const state = uploadReducer(initialState, clearUploadState());
      
      // Should be equal by value but different reference
      expect(state).toEqual(initialState);
    });
  });

  describe('Action Creators', () => {
    it('setDocumentFile should create correct action', () => {
      const file = { uri: 'test', name: 'test', mimeType: 'pdf' };
      const action = setDocumentFile(file);
      
      expect(action.type).toBe('upload/setDocumentFile');
      expect(action.payload).toEqual(file);
    });

    it('setTitle should create correct action', () => {
      const action = setTitle('Test');
      
      expect(action.type).toBe('upload/setTitle');
      expect(action.payload).toBe('Test');
    });

    it('clearUploadState should create correct action', () => {
      const action = clearUploadState();
      
      expect(action.type).toBe('upload/clearUploadState');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple sequential updates', () => {
      let state = initialState;
      
      state = uploadReducer(state, setTitle('My Document'));
      state = uploadReducer(state, setDescription('Description'));
      state = uploadReducer(state, setSelectedFaculties(['f1']));
      state = uploadReducer(state, setSelectedSubjects(['s1']));
      
      expect(state.title).toBe('My Document');
      expect(state.description).toBe('Description');
      expect(state.selectedFaculties).toEqual(['f1']);
      expect(state.selectedSubjects).toEqual(['s1']);
    });

    it('should handle complete upload flow', () => {
      let state = initialState;
      
      // Step 1: Select file
      const file = { uri: 'doc.pdf', name: 'doc.pdf', mimeType: 'application/pdf' };
      state = uploadReducer(state, setDocumentFile(file));
      
      // Step 2: Add metadata
      state = uploadReducer(state, setTitle('Bài giảng Giải tích'));
      state = uploadReducer(state, setDescription('Bài giảng chương 1-3'));
      
      // Step 3: Select categories
      state = uploadReducer(state, setSelectedFaculties(['cse', 'math']));
      state = uploadReducer(state, setSelectedSubjects(['calculus']));
      
      // Step 4: Add images
      state = uploadReducer(state, setSelectedImages(['img1.png', 'img2.png']));
      state = uploadReducer(state, setCoverImage('cover.png'));
      
      // Verify complete state
      expect(state.documentFile).toEqual(file);
      expect(state.title).toBe('Bài giảng Giải tích');
      expect(state.selectedFaculties).toHaveLength(2);
      expect(state.selectedImages).toHaveLength(2);
      expect(state.coverImage).toBe('cover.png');
      
      // Step 5: Clear after upload
      state = uploadReducer(state, clearUploadState());
      expect(state).toEqual(initialState);
    });
  });
});

