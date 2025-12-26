import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADED_DOCS_KEY = 'downloaded_docs';

export const downloadedDocsStorage = {
  async getDownloadedDocIds(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(DOWNLOADED_DOCS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting downloaded docs:', error);
      return [];
    }
  },

  async addDownloadedDoc(docId: string): Promise<void> {
    try {
      const ids = await this.getDownloadedDocIds();
      if (!ids.includes(docId)) {
        ids.unshift(docId);
        await AsyncStorage.setItem(DOWNLOADED_DOCS_KEY, JSON.stringify(ids));
      }
    } catch (error) {
      console.error('Error adding downloaded doc:', error);
    }
  },

  async removeDownloadedDoc(docId: string): Promise<void> {
    try {
      const ids = await this.getDownloadedDocIds();
      const filtered = ids.filter(id => id !== docId);
      await AsyncStorage.setItem(DOWNLOADED_DOCS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing downloaded doc:', error);
    }
  },

  async clearDownloadedDocs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(DOWNLOADED_DOCS_KEY);
    } catch (error) {
      console.error('Error clearing downloaded docs:', error);
    }
  }
};