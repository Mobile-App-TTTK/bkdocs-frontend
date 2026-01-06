import { getBackgroundById, getDate, removeDiacritics } from '@/utils/functions';

jest.mock('@/assets/images/background/bg1.png', () => 'bg1.png', { virtual: true });
jest.mock('@/assets/images/background/bg2.png', () => 'bg2.png', { virtual: true });
jest.mock('@/assets/images/background/bg3.png', () => 'bg3.png', { virtual: true });
jest.mock('@/assets/images/background/bg4.png', () => 'bg4.png', { virtual: true });

describe('Utils Functions', () => {
  describe('getBackgroundById', () => {
    it('should return default background when id is empty string', () => {
      const result = getBackgroundById('');
      expect(result).toBeDefined();
    });

    it('should return a background for valid id', () => {
      const result = getBackgroundById('abc123');
      expect(result).toBeDefined();
    });

    it('should return consistent background for same id', () => {
      const result1 = getBackgroundById('test-id-1');
      const result2 = getBackgroundById('test-id-1');
      expect(result1).toEqual(result2);
    });

    it('should return different backgrounds for different ids', () => {
      const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const results = ids.map((id) => getBackgroundById(id));
      
      const uniqueResults = new Set(results.map(String));
      expect(uniqueResults.size).toBeGreaterThan(1);
    });

    it('should handle long string ids', () => {
      const longId = 'a'.repeat(1000);
      const result = getBackgroundById(longId);
      expect(result).toBeDefined();
    });

    it('should handle special characters in id', () => {
      const specialId = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const result = getBackgroundById(specialId);
      expect(result).toBeDefined();
    });

    it('should handle unicode characters in id', () => {
      const unicodeId = '日本語テスト文字列';
      const result = getBackgroundById(unicodeId);
      expect(result).toBeDefined();
    });
  });

  describe('getDate', () => {
    it('should format date string to Vietnamese format (dd/mm/yyyy)', () => {
      const result = getDate('2024-01-15');
      expect(result).toBe('15/01/2024');
    });

    it('should handle ISO date format', () => {
      const result = getDate('2024-12-25T10:30:00Z');
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle date at end of year', () => {
      const result = getDate('2024-12-31');
      expect(result).toBe('31/12/2024');
    });

    it('should handle date at start of year', () => {
      const result = getDate('2024-01-01');
      expect(result).toBe('01/01/2024');
    });

    it('should handle leap year date', () => {
      const result = getDate('2024-02-29');
      expect(result).toBe('29/02/2024');
    });

    it('should pad single digit day and month with zero', () => {
      const result = getDate('2024-03-05');
      expect(result).toBe('05/03/2024');
    });
  });

  describe('removeDiacritics', () => {
    it('should remove Vietnamese diacritics from lowercase letters', () => {
      expect(removeDiacritics('àáảãạ')).toBe('aaaaa');
      expect(removeDiacritics('èéẻẽẹ')).toBe('eeeee');
      expect(removeDiacritics('ìíỉĩị')).toBe('iiiii');
      expect(removeDiacritics('òóỏõọ')).toBe('ooooo');
      expect(removeDiacritics('ùúủũụ')).toBe('uuuuu');
      expect(removeDiacritics('ỳýỷỹỵ')).toBe('yyyyy');
    });

    it('should convert đ to d', () => {
      expect(removeDiacritics('đ')).toBe('d');
      expect(removeDiacritics('đây là đường đi')).toBe('day la duong di');
    });

    it('should convert Đ to D', () => {
      expect(removeDiacritics('Đ')).toBe('D');
      expect(removeDiacritics('Đà Nẵng')).toBe('Da Nang');
    });

    it('should handle mixed Vietnamese text', () => {
      expect(removeDiacritics('Xin chào Việt Nam')).toBe('Xin chao Viet Nam');
      expect(removeDiacritics('Hà Nội')).toBe('Ha Noi');
      expect(removeDiacritics('Thành phố Hồ Chí Minh')).toBe('Thanh pho Ho Chi Minh');
    });

    it('should preserve non-Vietnamese characters', () => {
      expect(removeDiacritics('Hello World')).toBe('Hello World');
      expect(removeDiacritics('ABC123')).toBe('ABC123');
      expect(removeDiacritics('!@#$%')).toBe('!@#$%');
    });

    it('should handle empty string', () => {
      expect(removeDiacritics('')).toBe('');
    });

    it('should handle string with only spaces', () => {
      expect(removeDiacritics('   ')).toBe('   ');
    });

    it('should handle complex Vietnamese sentences', () => {
      const input = 'Ăn quả nhớ kẻ trồng cây';
      const expected = 'An qua nho ke trong cay';
      expect(removeDiacritics(input)).toBe(expected);
    });

    it('should handle Vietnamese with special vowels (ă, â, ê, ô, ơ, ư)', () => {
      expect(removeDiacritics('ăâêôơư')).toBe('aaeoou');
      expect(removeDiacritics('ĂÂÊÔƠƯ')).toBe('AAEOOU');
    });

    it('should handle all tone marks on same vowel', () => {
      expect(removeDiacritics('ằắẳẵặ')).toBe('aaaaa');
      expect(removeDiacritics('ầấẩẫậ')).toBe('aaaaa');
      expect(removeDiacritics('ềếểễệ')).toBe('eeeee');
      expect(removeDiacritics('ồốổỗộ')).toBe('ooooo');
      expect(removeDiacritics('ờớởỡợ')).toBe('ooooo');
      expect(removeDiacritics('ừứửữự')).toBe('uuuuu');
    });
  });
});

