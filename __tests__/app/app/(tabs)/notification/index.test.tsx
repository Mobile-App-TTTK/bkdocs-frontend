import { api } from '@/api/apiClient';
import { API_MARK_NOTIFICATION_AS_READ, API_NOTIFICATIONS } from '@/api/apiRoutes';
import NotificationPage from '@/app/(app)/(tabs)/notification/index';
import { ROUTES } from '@/utils/routes';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { NativeBaseProvider } from 'native-base';
import React from 'react';

// Mock dependencies
jest.mock('@/api/apiClient', () => ({
    api: {
        get: jest.fn(),
        patch: jest.fn(),
    },
}));

jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
        back: jest.fn(),
    },
    useFocusEffect: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
    SafeAreaProvider: ({ children }: any) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Wrapper component for NativeBase
const inset = {
    frame: { x: 0, y: 0, width: 0, height: 0 },
    insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <NativeBaseProvider initialWindowMetrics={inset}>{children}</NativeBaseProvider>
);

describe('NotificationPage', () => {
    const mockNotifications = [
        {
            id: "1",
            title: "Thông báo 1",
            message: "Message 1",
            image: 123,
            isRead: false,
            createdAt: new Date().toISOString(),
            targetId: "doc1",
        },
        {
            id: "2",
            title: "Thông báo 2",
            message: "Message 2",
            image: 123,
            isRead: true,
            createdAt: "2023-01-01T00:00:00Z",
            targetId: "doc2",
        }
    ];

    let focusEffectCallback: (() => void) | null = null;

    beforeEach(() => {
        jest.clearAllMocks();
        focusEffectCallback = null;

        // Mock useFocusEffect to capture but NOT execute the callback
        const { useFocusEffect } = require('expo-router');
        useFocusEffect.mockImplementation((callback: () => void) => {
            focusEffectCallback = callback;
            // Don't execute it automatically - let tests control when to call it
        });
    });

    it('should render header correctly', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: { data: { data: [] } } });

        const { getByText } = render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        // Manually trigger the focus effect
        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        expect(getByText('Thông báo')).toBeTruthy();
    });

    it('should fetch and display notifications on mount', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: { data: { data: mockNotifications } } });

        const { getByText, getAllByText } = render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        // Manually trigger the focus effect
        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(API_NOTIFICATIONS, expect.objectContaining({
                params: { page: 1, limit: 10 }
            }));
        });

        // Check if notifications are displayed
        await waitFor(() => {
            expect(getByText('Message 1')).toBeTruthy();
            expect(getByText('Message 2')).toBeTruthy();
        });

        // Check formatDate results
        expect(getAllByText('Vừa xong').length).toBeGreaterThan(0);
    });

    it('should handle API error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        (api.get as jest.Mock).mockRejectedValue({ message: 'Error fetching', response: { status: 500 } });

        render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        // Manually trigger the focus effect
        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalled();
        });

        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[NOTI] error message'), 'Error fetching');
        consoleSpy.mockRestore();
    });

    it('should handle invalid response data (not array)', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: { data: { data: null } } });

        const { queryByText } = render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        // Manually trigger the focus effect
        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalled();
        });

        // Should default to empty list, no crash
        expect(queryByText('Message 1')).toBeNull();
    });
});

describe('NotificationPage interactions', () => {
    const mockNotifications = [
        {
            id: "1",
            title: "Thông báo 1",
            message: "Message 1",
            image: 123,
            isRead: false,
            createdAt: new Date().toISOString(),
            targetId: "doc1",
        }
    ];

    let focusEffectCallback: (() => void) | null = null;

    beforeEach(() => {
        jest.clearAllMocks();
        focusEffectCallback = null;

        const { useFocusEffect } = require('expo-router');
        useFocusEffect.mockImplementation((callback: () => void) => {
            focusEffectCallback = callback;
        });
    });

    it('should navigate back when back button is pressed', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: { data: { data: [] } } });
        const { getByTestId } = render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalled();
        });

        const backBtn = getByTestId('back-button');
        fireEvent.press(backBtn);

        expect(router.back).toHaveBeenCalled();
    });

    it('should mark as read and navigate when notification pressed', async () => {
        (api.get as jest.Mock).mockResolvedValue({ data: { data: { data: mockNotifications } } });
        (api.patch as jest.Mock).mockResolvedValue({});

        const { findByText } = render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        const item = await findByText('Message 1');

        await act(async () => {
            fireEvent.press(item);
        });

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalledWith(API_MARK_NOTIFICATION_AS_READ("1"));
            expect(router.push).toHaveBeenCalledWith(expect.objectContaining({
                pathname: ROUTES.DOWNLOAD_DOC,
                params: { id: "doc1" }
            }));
        });
    });

    it('should NOT call mark as read if already read', async () => {
        const readNoti = [{ ...mockNotifications[0], isRead: true, id: "2" }];
        (api.get as jest.Mock).mockResolvedValue({ data: { data: { data: readNoti } } });

        const { findByText } = render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        const item = await findByText('Message 1');

        await act(async () => {
            fireEvent.press(item);
        });

        await waitFor(() => {
            expect(api.patch).not.toHaveBeenCalled();
            expect(router.push).toHaveBeenCalled();
        });
    });

    it('should handle markAsRead error', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        (api.get as jest.Mock).mockResolvedValue({ data: { data: { data: mockNotifications } } });
        (api.patch as jest.Mock).mockRejectedValue({ message: "Patch failed" });

        const { findByText } = render(
            <Wrapper>
                <NotificationPage />
            </Wrapper>
        );

        await act(async () => {
            if (focusEffectCallback) focusEffectCallback();
        });

        const item = await findByText('Message 1');

        await act(async () => {
            fireEvent.press(item);
        });

        await waitFor(() => {
            expect(api.patch).toHaveBeenCalled();
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('mark as read error'), 'Patch failed');
        });

        consoleSpy.mockRestore();
    });
});