import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Request permission để nhận push notifications
 */
export async function requestUserPermission(): Promise<boolean> {
  try {
    // Android 13+ cần request permission riêng
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Push notification permission denied');
        return false;
      }
    }

    // Request Firebase Cloud Messaging permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Push notification authorization status:', authStatus);
      await getFCMToken();
      return true;
    }

    console.log('Push notification permission not granted');
    return false;
  } catch (error) {
    console.error('Error requesting push notification permission:', error);
    return false;
  }
}

/**
 * Lấy FCM Token (Firebase Cloud Messaging Token)
 */
export async function getFCMToken(): Promise<string | null> {
  try {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      console.log('FCM Token:', fcmToken);
      
      // Lưu token vào AsyncStorage
      await AsyncStorage.setItem('fcmToken', fcmToken);
      
      // TODO: Gửi token lên server để lưu vào database
      // await saveTokenToServer(fcmToken);
      
      return fcmToken;
    }
    return null;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Lắng nghe khi token được refresh
 */
export function subscribeToTokenRefresh() {
  return messaging().onTokenRefresh(async token => {
    console.log('FCM Token refreshed:', token);
    await AsyncStorage.setItem('fcmToken', token);
    
    // TODO: Cập nhật token mới lên server
    // await updateTokenOnServer(token);
  });
}

/**
 * Xử lý notification khi app đang mở (foreground)
 */
export function subscribeForegroundNotifications(
  callback: (remoteMessage: any) => void
) {
  return messaging().onMessage(async remoteMessage => {
    console.log('Foreground notification received:', remoteMessage);
    
    // Hiển thị local notification hoặc in-app notification
    callback(remoteMessage);
  });
}

/**
 * Xử lý notification khi user tap vào notification (background/quit state)
 */
export function subscribeNotificationOpened(
  callback: (remoteMessage: any) => void
) {
  // Background state - app đang chạy ở background
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('Notification opened from background:', remoteMessage);
    callback(remoteMessage);
  });

  // Quit state - app đã tắt hoàn toàn
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification opened from quit state:', remoteMessage);
        callback(remoteMessage);
      }
    });
}

/**
 * Setup background message handler
 * Phải được gọi bên ngoài component (ở file index.js)
 */
export function setupBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background notification received:', remoteMessage);
    // Xử lý notification khi app ở background
    // Có thể cập nhật local database, hiển thị badge, etc.
  });
}

/**
 * Xóa FCM token (khi user logout)
 */
export async function deleteFCMToken(): Promise<boolean> {
  try {
    await messaging().deleteToken();
    await AsyncStorage.removeItem('fcmToken');
    console.log('FCM token deleted');
    return true;
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    return false;
  }
}

/**
 * Subscribe to topic (nhận notification theo topic)
 */
export async function subscribeToTopic(topic: string): Promise<void> {
  try {
    await messaging().subscribeToTopic(topic);
    console.log(`Subscribed to topic: ${topic}`);
  } catch (error) {
    console.error('Error subscribing to topic:', error);
  }
}

/**
 * Unsubscribe from topic
 */
export async function unsubscribeFromTopic(topic: string): Promise<void> {
  try {
    await messaging().unsubscribeFromTopic(topic);
    console.log(`Unsubscribed from topic: ${topic}`);
  } catch (error) {
    console.error('Error unsubscribing from topic:', error);
  }
}
