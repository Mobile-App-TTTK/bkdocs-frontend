import { api } from '@/api/apiClient';
import { API_FCM_TOKEN } from '@/api/apiRoutes';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and get the FCM token
 * @returns The FCM/Expo push token or null if registration fails
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Log device info for debugging
  console.log('Device info:', {
    isDevice: Device.isDevice,
    brand: Device.brand,
    modelName: Device.modelName,
  });

  // Check and request notification permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    // Get the FCM token (for Android) or APNs token (for iOS)
    // Using getDevicePushTokenAsync to get native FCM token
    const pushTokenData = await Notifications.getDevicePushTokenAsync();
    token = pushTokenData.data;
    
    console.log('Push token obtained:', token);
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }

  // Set up notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Thông báo chung',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF3300',
      sound: 'default',
    });
  }

  return token;
}

/**
 * Send the FCM token to the backend server
 * @param fcmToken The FCM token to register
 */
export async function sendFcmTokenToServer(fcmToken: string): Promise<boolean> {
  try {
    await api.post(API_FCM_TOKEN, { fcmToken });
    console.log('FCM token registered successfully');
    return true;
  } catch (error) {
    console.error('Failed to register FCM token:', error);
    return false;
  }
}

/**
 * Initialize push notifications - register and send token to server
 */
export async function initializePushNotifications(): Promise<void> {
  const token = await registerForPushNotificationsAsync();
  
  if (token) {
    await sendFcmTokenToServer(token);
  }
}

/**
 * Add a listener for when a notification is received while app is foregrounded
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add a listener for when a user taps on a notification
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get the last notification response (if app was opened via notification)
 */
export async function getLastNotificationResponse() {
  return await Notifications.getLastNotificationResponseAsync();
}
