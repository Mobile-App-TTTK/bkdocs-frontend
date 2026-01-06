import { api } from '@/api/apiClient';
import {
    addNotificationReceivedListener,
    addNotificationResponseReceivedListener,
    getLastNotificationResponse,
    initializePushNotifications,
    registerForPushNotificationsAsync,
    sendFcmTokenToServer
} from '@/services/pushNotification';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Mock the API client
jest.mock('@/api/apiClient', () => ({
    api: {
        post: jest.fn(),
    },
}));

describe('Push Notification Service', () => {
    const originalPlatformOS = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as any).OS = originalPlatformOS;
    });

    afterAll(() => {
        (Platform as any).OS = originalPlatformOS;
    });

    describe('configuration', () => {
        it('sets the notification handler with correct settings', async () => {
            jest.isolateModules(async () => {
                const Notifications = require('expo-notifications');
                require('@/services/pushNotification');

                expect(Notifications.setNotificationHandler).toHaveBeenCalled();

                const handler = (Notifications.setNotificationHandler as jest.Mock).mock.calls[0][0];
                const settings = await handler.handleNotification();

                expect(settings).toEqual({
                    shouldShowAlert: true,
                    shouldPlaySound: true,
                    shouldSetBadge: true,
                    shouldShowBanner: true,
                    shouldShowList: true,
                });
            });
        });
    });

    describe('registerForPushNotificationsAsync', () => {
        it('returns null if permissions are not granted (initial check)', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
            (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            const token = await registerForPushNotificationsAsync();

            expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
            expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
            expect(token).toBeNull();
        });

        it('requests permissions if initial status is not granted', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
            (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-token' });

            await registerForPushNotificationsAsync();

            expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
        });

        it('returns null if requestPermissionsAsync is denied', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'undetermined' });
            (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            const token = await registerForPushNotificationsAsync();

            expect(token).toBeNull();
        });

        it('returns token when permissions are granted', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-token' });

            const token = await registerForPushNotificationsAsync();

            expect(token).toBe('test-token');
            expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
        });

        it('handles errors when getting device push token', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Notifications.getDevicePushTokenAsync as jest.Mock).mockRejectedValue(new Error('Failed to get token'));

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const token = await registerForPushNotificationsAsync();

            expect(token).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Error getting push token:', expect.any(Error));

            consoleSpy.mockRestore();
        });

        it('sets notification channel on Android', async () => {
            Object.defineProperty(Platform, 'OS', { get: () => 'android', configurable: true });
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-token' });

            await registerForPushNotificationsAsync();

            expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', expect.objectContaining({
                name: 'Thông báo chung',
                importance: Notifications.AndroidImportance.MAX,
            }));
        });

        it('does not set notification channel on iOS', async () => {
            Object.defineProperty(Platform, 'OS', { get: () => 'ios', configurable: true });
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({ data: 'test-token' });

            await registerForPushNotificationsAsync();

            expect(Notifications.setNotificationChannelAsync).not.toHaveBeenCalled();
        });
    });

    describe('sendFcmTokenToServer', () => {
        it('sends token to server successfully', async () => {
            (api.post as jest.Mock).mockResolvedValue({});
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });

            const result = await sendFcmTokenToServer('test-token');

            expect(api.post).toHaveBeenCalledWith(expect.any(String), { fcmToken: 'test-token' });
            expect(result).toBe(true);
            expect(consoleSpy).toHaveBeenCalledWith('FCM token registered successfully');

            consoleSpy.mockRestore();
        });

        it('handles error when sending token', async () => {
            (api.post as jest.Mock).mockRejectedValue(new Error('Network error'));
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const result = await sendFcmTokenToServer('test-token');

            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Failed to register FCM token:', expect.any(Error));

            consoleSpy.mockRestore();
        });
    });

    describe('initializePushNotifications', () => {
        it('registers and sends token if successful', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
            (Notifications.getDevicePushTokenAsync as jest.Mock).mockResolvedValue({ data: 'new-token' });
            (api.post as jest.Mock).mockResolvedValue({});

            await initializePushNotifications();

            expect(api.post).toHaveBeenCalledWith(expect.any(String), { fcmToken: 'new-token' });
        });

        it('does not send token if registration fails', async () => {
            (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
            (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

            await initializePushNotifications();

            expect(api.post).not.toHaveBeenCalled();
        });
    });

    describe('listeners', () => {
        it('adds notification received listener', () => {
            const callback = jest.fn();
            addNotificationReceivedListener(callback);
            expect(Notifications.addNotificationReceivedListener).toHaveBeenCalledWith(callback);
        });

        it('adds notification response received listener', () => {
            const callback = jest.fn();
            addNotificationResponseReceivedListener(callback);
            expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalledWith(callback);
        });

        it('gets last notification response', async () => {
            await getLastNotificationResponse();
            expect(Notifications.getLastNotificationResponseAsync).toHaveBeenCalled();
        });
    });
});
