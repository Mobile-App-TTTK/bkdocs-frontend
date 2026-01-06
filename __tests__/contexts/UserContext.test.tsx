import { useFetchUserProfile } from '@/components/Profile/api';
import { useAuth } from '@/contexts/AuthContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@/components/Profile/api', () => ({
  useFetchUserProfile: jest.fn(),
}));

describe('UserContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <UserProvider>{children}</UserProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('When authenticated', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: true,
      });
    });

    it('should provide user profile when data is loaded', () => {
      const mockProfile = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@test.com',
      };

      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.userProfile).toEqual(mockProfile);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentUserId).toBe('user-123');
    });

    it('should show loading state when fetching profile', () => {
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.userProfile).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.currentUserId).toBeUndefined();
    });

    it('should handle undefined profile data', () => {
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.userProfile).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.currentUserId).toBeUndefined();
    });

    it('should update when profile data changes', async () => {
      const initialProfile = { id: 'user-1', name: 'Initial Name', email: 'test@test.com' };
      const updatedProfile = { id: 'user-1', name: 'Updated Name', email: 'test@test.com' };

      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: initialProfile,
        isLoading: false,
      });

      const { result, rerender } = renderHook(() => useUser(), { wrapper });

      expect(result.current.userProfile?.name).toBe('Initial Name');

      // Simulate profile update
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: updatedProfile,
        isLoading: false,
      });

      rerender({});

      await waitFor(() => {
        expect(result.current.userProfile?.name).toBe('Updated Name');
      });
    });
  });

  describe('When not authenticated', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({
        isAuthenticated: false,
      });
    });

    it('should return undefined for userProfile', () => {
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: { id: 'user-1', name: 'Test' },
        isLoading: false,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      // Even if profile data exists, it should be undefined when not authenticated
      expect(result.current.userProfile).toBeUndefined();
    });

    it('should return isLoading as false', () => {
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      // When not authenticated, isLoading should be false regardless
      expect(result.current.isLoading).toBe(false);
    });

    it('should still return currentUserId from cached profile data', () => {
      // Note: currentUserId is `userProfile?.id` which is NOT guarded by isAuthenticated
      // So it can return a value even when not authenticated (from cached data)
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: { id: 'user-1', name: 'Test' },
        isLoading: false,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      // currentUserId comes from userProfile?.id directly (not guarded by isAuthenticated)
      expect(result.current.currentUserId).toBe('user-1');
    });
  });

  describe('Authentication state changes', () => {
    it('should update context when user logs in', async () => {
      const mockProfile = { id: 'user-1', name: 'User', email: 'user@test.com' };

      // Initially not authenticated
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      const { result, rerender } = renderHook(() => useUser(), { wrapper });

      expect(result.current.userProfile).toBeUndefined();
      expect(result.current.currentUserId).toBeUndefined();

      // Simulate login
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });

      rerender({});

      await waitFor(() => {
        expect(result.current.userProfile).toEqual(mockProfile);
        expect(result.current.currentUserId).toBe('user-1');
      });
    });

    it('should clear context when user logs out', async () => {
      const mockProfile = { id: 'user-1', name: 'User', email: 'user@test.com' };

      // Initially authenticated
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });

      const { result, rerender } = renderHook(() => useUser(), { wrapper });

      expect(result.current.userProfile).toEqual(mockProfile);

      // Simulate logout
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      rerender({});

      await waitFor(() => {
        expect(result.current.userProfile).toBeUndefined();
        expect(result.current.currentUserId).toBeUndefined();
      });
    });
  });

  describe('useUser hook', () => {
    it('should throw error when used outside UserProvider', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useUser());
      }).toThrow('useUser must be used within a UserProvider');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Context Value', () => {
    it('should provide all required values', () => {
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: { id: 'user-1', name: 'Test' },
        isLoading: false,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current).toHaveProperty('userProfile');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('currentUserId');
    });

    it('should memoize context value correctly', () => {
      const mockProfile = { id: 'user-1', name: 'Test', email: 'test@test.com' };

      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: mockProfile,
        isLoading: false,
      });

      const { result, rerender } = renderHook(() => useUser(), { wrapper });

      const firstValue = result.current;

      // Rerender without changes
      rerender({});

      // Value should be memoized (same reference)
      expect(result.current).toBe(firstValue);
    });
  });

  describe('Profile data edge cases', () => {
    beforeEach(() => {
      (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
    });

    it('should handle profile with minimal data', () => {
      const minimalProfile = { id: 'user-1' };

      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: minimalProfile,
        isLoading: false,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.currentUserId).toBe('user-1');
      expect(result.current.userProfile).toEqual(minimalProfile);
    });

    it('should handle profile with all fields', () => {
      const fullProfile = {
        id: 'user-123',
        name: 'Full User',
        email: 'full@test.com',
        faculty: 'CSE',
        intakeYear: 2020,
        avatarUrl: 'https://example.com/avatar.jpg',
        isVerified: true,
        numberFollowers: 100,
        numberFollowing: 50,
      };

      (useFetchUserProfile as jest.Mock).mockReturnValue({
        data: fullProfile,
        isLoading: false,
      });

      const { result } = renderHook(() => useUser(), { wrapper });

      expect(result.current.userProfile).toEqual(fullProfile);
      expect(result.current.currentUserId).toBe('user-123');
    });
  });
});

