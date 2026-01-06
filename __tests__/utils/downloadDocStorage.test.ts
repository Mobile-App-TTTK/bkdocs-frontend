import { downloadedDocsStorage } from '@/utils/downloadDocStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const DOWNLOADED_DOCS_KEY = 'downloaded_docs';

describe('downloadedDocsStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getDownloadedDocIds', () => {
    it('should return empty array when no data stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await downloadedDocsStorage.getDownloadedDocIds();
      
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(DOWNLOADED_DOCS_KEY);
      expect(result).toEqual([]);
    });

    it('should return parsed array from storage', async () => {
      const mockData = ['doc1', 'doc2', 'doc3'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));
      
      const result = await downloadedDocsStorage.getDownloadedDocIds();
      
      expect(result).toEqual(mockData);
    });

    it('should return empty array on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const result = await downloadedDocsStorage.getDownloadedDocIds();
      
      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Error getting downloaded docs:',
        expect.any(Error)
      );
    });

    it('should handle empty string from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('');
      
      const result = await downloadedDocsStorage.getDownloadedDocIds();
      
      expect(result).toEqual([]);
    });

    it('should handle single item array', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['single-doc']));
      
      const result = await downloadedDocsStorage.getDownloadedDocIds();
      
      expect(result).toEqual(['single-doc']);
    });

    it('should handle large arrays', async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `doc-${i}`);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(largeArray));
      
      const result = await downloadedDocsStorage.getDownloadedDocIds();
      
      expect(result).toHaveLength(100);
      expect(result[0]).toBe('doc-0');
      expect(result[99]).toBe('doc-99');
    });
  });

  describe('addDownloadedDoc', () => {
    it('should add new doc id to beginning of empty list', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.addDownloadedDoc('new-doc');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['new-doc'])
      );
    });

    it('should add new doc id to beginning of existing list', async () => {
      const existingDocs = ['doc1', 'doc2'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingDocs));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.addDownloadedDoc('doc3');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['doc3', 'doc1', 'doc2'])
      );
    });

    it('should not add duplicate doc id', async () => {
      const existingDocs = ['doc1', 'doc2'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingDocs));
      
      await downloadedDocsStorage.addDownloadedDoc('doc1');
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should not add duplicate even if at end of list', async () => {
      const existingDocs = ['doc1', 'doc2', 'doc3'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingDocs));
      
      await downloadedDocsStorage.addDownloadedDoc('doc3');
      
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle getItem error silently', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read error'));
      
      await downloadedDocsStorage.addDownloadedDoc('doc1');
      
      // Error được log từ getDownloadedDocIds (được gọi bên trong)
      expect(console.error).toHaveBeenCalledWith(
        'Error getting downloaded docs:',
        expect.any(Error)
      );
    });

    it('should handle setItem error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Write error'));
      
      await downloadedDocsStorage.addDownloadedDoc('doc1');
      
      expect(console.error).toHaveBeenCalledWith(
        'Error adding downloaded doc:',
        expect.any(Error)
      );
    });

    it('should handle empty string doc id', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['doc1']));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.addDownloadedDoc('');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['', 'doc1'])
      );
    });
  });

  describe('removeDownloadedDoc', () => {
    it('should remove doc id from list', async () => {
      const existingDocs = ['doc1', 'doc2', 'doc3'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingDocs));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.removeDownloadedDoc('doc2');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['doc1', 'doc3'])
      );
    });

    it('should remove first item from list', async () => {
      const existingDocs = ['doc1', 'doc2', 'doc3'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingDocs));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.removeDownloadedDoc('doc1');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['doc2', 'doc3'])
      );
    });

    it('should remove last item from list', async () => {
      const existingDocs = ['doc1', 'doc2', 'doc3'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingDocs));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.removeDownloadedDoc('doc3');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['doc1', 'doc2'])
      );
    });

    it('should handle removing non-existent doc id', async () => {
      const existingDocs = ['doc1', 'doc2'];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingDocs));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.removeDownloadedDoc('doc999');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['doc1', 'doc2'])
      );
    });

    it('should handle removing from empty list', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.removeDownloadedDoc('doc1');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify([])
      );
    });

    it('should handle getItem error silently', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      await downloadedDocsStorage.removeDownloadedDoc('doc1');
      
      // Error được log từ getDownloadedDocIds (được gọi bên trong)
      expect(console.error).toHaveBeenCalledWith(
        'Error getting downloaded docs:',
        expect.any(Error)
      );
    });

    it('should result in empty array when removing only item', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['only-doc']));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.removeDownloadedDoc('only-doc');
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify([])
      );
    });
  });

  describe('clearDownloadedDocs', () => {
    it('should remove all downloaded docs from storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      
      await downloadedDocsStorage.clearDownloadedDocs();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DOWNLOADED_DOCS_KEY);
    });

    it('should handle error silently', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Clear error'));
      
      await downloadedDocsStorage.clearDownloadedDocs();
      
      expect(console.error).toHaveBeenCalledWith(
        'Error clearing downloaded docs:',
        expect.any(Error)
      );
    });

    it('should not throw when storage is already empty', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
      
      await expect(downloadedDocsStorage.clearDownloadedDocs()).resolves.not.toThrow();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete download flow: add, get, remove', async () => {
      // Initially empty
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      let result = await downloadedDocsStorage.getDownloadedDocIds();
      expect(result).toEqual([]);

      // Add a doc
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      await downloadedDocsStorage.addDownloadedDoc('my-doc');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['my-doc'])
      );

      // Simulate storage has the doc now
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['my-doc']));
      result = await downloadedDocsStorage.getDownloadedDocIds();
      expect(result).toEqual(['my-doc']);

      // Remove the doc
      await downloadedDocsStorage.removeDownloadedDoc('my-doc');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify([])
      );
    });

    it('should maintain order: newest first', async () => {
      // First doc
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      await downloadedDocsStorage.addDownloadedDoc('doc1');
      
      // Second doc should be first
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['doc1']));
      await downloadedDocsStorage.addDownloadedDoc('doc2');
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['doc2', 'doc1'])
      );

      // Third doc should be first
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(['doc2', 'doc1']));
      await downloadedDocsStorage.addDownloadedDoc('doc3');
      expect(AsyncStorage.setItem).toHaveBeenLastCalledWith(
        DOWNLOADED_DOCS_KEY,
        JSON.stringify(['doc3', 'doc2', 'doc1'])
      );
    });
  });
});

