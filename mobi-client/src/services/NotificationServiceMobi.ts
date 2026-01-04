import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { BaseApiClient } from './api/BaseApiClient';

/**
 * Interface cho FCM token registration
 */
interface TokenRegistrationData {
  userId: string;
  token: string;
  deviceType: 'ANDROID' | 'IOS';
  deviceName?: string;
}

/**
 * Service xử lý Push Notifications với Firebase Cloud Messaging
 * Sử dụng Expo Notifications cho local notifications và Firebase cho remote
 */
class NotificationServiceMobi {
  private foregroundListener: (() => void) | null = null;
  private backgroundListener: (() => void) | null = null;

  constructor() {
    console.log('🏗️ [NotificationServiceMobi] Constructor called');
    this.setupNotificationHandler();
  }

  /**
   * Setup notification handler cho Expo Notifications
   */
  private setupNotificationHandler(): void {
    console.log('🔧 [NotificationServiceMobi] Setting up notification handler');

    // Xử lý khi user tap vào notification
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Lắng nghe khi user tap vào notification
    Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📱 [NotificationServiceMobi] Notification tapped:', response);
      // TODO: Navigate to appropriate screen based on notification data
      const data = response.notification.request.content.data;
      if (data && data.type) {
        this.handleNotificationTap(data);
      }
    });

    console.log('✅ [NotificationServiceMobi] Notification handler setup complete');
  }

  /**
   * Xử lý khi user tap vào notification
   */
  private handleNotificationTap(data: any): void {
    console.log('🎯 [NotificationServiceMobi] Handling notification tap:', data);

    try {
      switch (data.type) {
        case 'booking_success':
          // Navigate to booking screen
          console.log('📋 [NotificationServiceMobi] Navigate to booking details');
          break;
        case 'payment_success':
          // Navigate to payment history
          console.log('💰 [NotificationServiceMobi] Navigate to payment history');
          break;
        case 'request_success':
          // Navigate to request status
          console.log('📝 [NotificationServiceMobi] Navigate to request status');
          break;
        default:
          console.log('❓ [NotificationServiceMobi] Unknown notification type:', data.type);
      }
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error handling notification tap:', error);
    }
  }

  /**
   * Xin quyền thông báo từ user
   */
  async requestUserPermission(): Promise<boolean> {
    try {
      console.log('🔐 [NotificationServiceMobi] Requesting user permission');

      if (Platform.OS === 'android') {
        // Android 13+ cần xin quyền POST_NOTIFICATIONS
        if (Platform.Version >= 33) {
          console.log('🤖 [NotificationServiceMobi] Android 13+, requesting POST_NOTIFICATIONS');
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Quyền thông báo',
              message: 'Ứng dụng cần quyền gửi thông báo để cập nhật tin tức quan trọng',
              buttonNeutral: 'Hỏi sau',
              buttonNegative: 'Từ chối',
              buttonPositive: 'Đồng ý',
            }
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('⚠️ [NotificationServiceMobi] Android notification permission denied');
            return false;
          }
        }

        // Setup notification channel cho Android
        await this.setupAndroidNotificationChannel();

      } else {
        // iOS
        console.log('🍎 [NotificationServiceMobi] iOS, requesting permission');
        const authStatus = await messaging().requestPermission({
          alert: true,
          announcement: false,
          badge: true,
          carPlay: false,
          provisional: false,
          sound: true,
        });

        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          console.warn('⚠️ [NotificationServiceMobi] iOS notification permission denied');
          return false;
        }

        console.log('✅ [NotificationServiceMobi] iOS permission granted, status:', authStatus);
      }

      console.log('✅ [NotificationServiceMobi] User permission granted');
      return true;

    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Setup Android notification channel
   */
  private async setupAndroidNotificationChannel(): Promise<void> {
    if (Platform.OS !== 'android') return;

    console.log('🔧 [NotificationServiceMobi] Setting up Android notification channel');

    await Notifications.setNotificationChannelAsync('default', {
      name: 'Thông báo mặc định',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      showBadge: true,
    });

    console.log('✅ [NotificationServiceMobi] Android notification channel setup complete');
  }

  /**
   * Lấy FCM Token từ Firebase
   */
  async getFCMToken(): Promise<string | null> {
    try {
      console.log('🔑 [NotificationServiceMobi] Getting FCM token');

      // Kiểm tra thiết bị thật
      if (!Device.isDevice) {
        console.warn('⚠️ [NotificationServiceMobi] Must use physical device for Push Notifications');
        Alert.alert(
          'Thiết bị không hỗ trợ',
          'Push notifications chỉ hoạt động trên thiết bị thật, không phải simulator/emulator.'
        );
        return null;
      }

      // Đăng ký thiết bị với FCM
      console.log('📱 [NotificationServiceMobi] Registering device for remote messages');
      await messaging().registerDeviceForRemoteMessages();

      // Lấy token
      const token = await messaging().getToken();
      console.log('🔥 [NotificationServiceMobi] FCM Token obtained:', token.substring(0, 20) + '...');

      return token;

    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error getting FCM token:', error);

      // Thông báo lỗi cho user
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến dịch vụ thông báo. Vui lòng kiểm tra kết nối internet và thử lại.'
      );

      return null;
    }
  }

  /**
   * Gửi FCM Token lên Backend để lưu trữ
   */
  async registerTokenWithBackend(userId: string): Promise<boolean> {
    try {
      console.log('📤 [NotificationServiceMobi] Registering token with backend for user:', userId);

      // Lấy FCM token
      const token = await this.getFCMToken();
      if (!token) {
        console.error('❌ [NotificationServiceMobi] No FCM token available');
        return false;
      }

      // Chuẩn bị dữ liệu
      const registrationData: TokenRegistrationData = {
        userId,
        token,
        deviceType: Platform.OS === 'android' ? 'ANDROID' : 'IOS',
        deviceName: Device.deviceName || Device.modelName || 'Unknown Device',
      };

      console.log('📦 [NotificationServiceMobi] Registration data:', {
        ...registrationData,
        token: registrationData.token.substring(0, 20) + '...'
      });

      // Gửi lên backend sử dụng BaseApiClient
      const response = await BaseApiClient.post<{ success: boolean; message: string }>(
        '/notifications/register-token',
        registrationData
      );

      if (response.success) {
        console.log('✅ [NotificationServiceMobi] Token registered successfully with backend');
        return true;
      } else {
        console.warn('⚠️ [NotificationServiceMobi] Backend rejected token registration:', response.message);
        return false;
      }

    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error registering token with backend:', error);

      // Thông báo lỗi cho user
      Alert.alert(
        'Lỗi đăng ký',
        'Không thể đăng ký nhận thông báo. Vui lòng thử lại sau.'
      );

      return false;
    }
  }

  /**
   * Setup listener cho thông báo khi app đang chạy (foreground)
   */
  setupForegroundListener(): () => void {
    console.log('👂 [NotificationServiceMobi] Setting up foreground listener');

    if (this.foregroundListener) {
      console.warn('⚠️ [NotificationServiceMobi] Foreground listener already exists, removing old one');
      this.foregroundListener();
    }

    this.foregroundListener = messaging().onMessage(async (remoteMessage) => {
      console.log('🔔 [NotificationServiceMobi] Foreground message received:', remoteMessage);

      try {
        // Hiển thị thông báo local bằng Expo Notifications
        if (remoteMessage.notification) {
          console.log('📢 [NotificationServiceMobi] Showing local notification');

          await Notifications.scheduleNotificationAsync({
            content: {
              title: remoteMessage.notification.title || 'Thông báo mới',
              body: remoteMessage.notification.body || '',
              data: remoteMessage.data || {},
              sound: 'default',
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Hiện ngay lập tức
          });

          console.log('✅ [NotificationServiceMobi] Local notification scheduled');
        } else {
          console.log('ℹ️ [NotificationServiceMobi] Remote message has no notification payload');
        }
      } catch (error) {
        console.error('❌ [NotificationServiceMobi] Error showing local notification:', error);
      }
    });

    console.log('✅ [NotificationServiceMobi] Foreground listener setup complete');
    return this.foregroundListener;
  }

  /**
   * Setup listener cho thông báo khi app ở background/killed
   */
  setupBackgroundListener(): void {
    console.log('🌙 [NotificationServiceMobi] Setting up background listener');

    // Xử lý khi app mở từ notification (background/killed state)
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('🌙 [NotificationServiceMobi] Background message received:', remoteMessage);
      // Không cần làm gì đặc biệt, Expo sẽ tự động hiển thị notification
    });

    console.log('✅ [NotificationServiceMobi] Background listener setup complete');
  }

  /**
   * Cleanup listeners
   */
  cleanup(): void {
    console.log('🧹 [NotificationServiceMobi] Cleaning up listeners');

    if (this.foregroundListener) {
      this.foregroundListener();
      this.foregroundListener = null;
      console.log('🧹 [NotificationServiceMobi] Foreground listener removed');
    }

    if (this.backgroundListener) {
      this.backgroundListener();
      this.backgroundListener = null;
      console.log('🧹 [NotificationServiceMobi] Background listener removed');
    }
  }

  /**
   * Test notification (chỉ để debug)
   */
  async testNotification(): Promise<void> {
    try {
      console.log('🧪 [NotificationServiceMobi] Testing notification');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Test Notification',
          body: 'Đây là thông báo test từ NotificationServiceMobi',
          data: { type: 'test' },
        },
        trigger: null,
      });

      console.log('✅ [NotificationServiceMobi] Test notification sent');
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error testing notification:', error);
    }
  }

  /**
   * Kiểm tra trạng thái permission
   */
  async checkPermissionStatus(): Promise<{
    fcm: boolean;
    expo: boolean;
  }> {
    try {
      console.log('🔍 [NotificationServiceMobi] Checking permission status');

      // Kiểm tra FCM permission
      const fcmAuthStatus = await messaging().hasPermission();
      const fcmEnabled = fcmAuthStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                        fcmAuthStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // Kiểm tra Expo permission
      const expoStatus = await Notifications.getPermissionsAsync();
      const expoEnabled = expoStatus.granted;

      console.log('🔍 [NotificationServiceMobi] Permission status:', {
        fcm: fcmEnabled,
        expo: expoEnabled,
        fcmAuthStatus,
        expoStatus
      });

      return {
        fcm: fcmEnabled,
        expo: expoEnabled,
      };
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error checking permissions:', error);
      return {
        fcm: false,
        expo: false,
      };
    }
  }

  /**
   * Thông báo thanh toán thành công
   */
  async notifyPaymentSuccess(amount: number, transactionId?: string | null): Promise<void> {
    try {
      console.log('💰 [NotificationServiceMobi] Sending payment success notification');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Thanh toán thành công',
          body: `Đã thanh toán ${amount.toLocaleString('vi-VN')} VND thành công${transactionId ? ` (Mã: ${transactionId})` : ''}`,
          data: { type: 'payment_success', amount, transactionId: transactionId || undefined },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('✅ [NotificationServiceMobi] Payment success notification sent');
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error sending payment success notification:', error);
    }
  }

  /**
   * Thông báo lỗi thanh toán
   */
  async notifyPaymentError(message?: string): Promise<void> {
    try {
      console.log('❌ [NotificationServiceMobi] Sending payment error notification');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lỗi thanh toán',
          body: message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.',
          data: { type: 'payment_error' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('✅ [NotificationServiceMobi] Payment error notification sent');
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error sending payment error notification:', error);
    }
  }

  /**
   * Thông báo thanh toán bị hủy
   */
  async notifyPaymentCanceled(): Promise<void> {
    try {
      console.log('⚠️ [NotificationServiceMobi] Sending payment canceled notification');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Thanh toán đã hủy',
          body: 'Giao dịch thanh toán đã được hủy. Bạn có thể thử lại bất cứ lúc nào.',
          data: { type: 'payment_canceled' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null,
      });

      console.log('✅ [NotificationServiceMobi] Payment canceled notification sent');
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error sending payment canceled notification:', error);
    }
  }

  /**
   * Thông báo chưa cài đặt ZaloPay
   */
  async notifyZaloPayNotInstalled(): Promise<void> {
    try {
      console.log('📱 [NotificationServiceMobi] Sending ZaloPay not installed notification');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Chưa cài đặt ZaloPay',
          body: 'Bạn cần cài đặt ứng dụng ZaloPay để thanh toán. Nhấn vào đây để cài đặt.',
          data: { type: 'zalopay_not_installed' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });

      console.log('✅ [NotificationServiceMobi] ZaloPay not installed notification sent');
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error sending ZaloPay not installed notification:', error);
    }
  }

  /**
   * Đăng ký FCM token sau khi user đăng nhập (có thể gọi từ màn hình login)
   */
  async registerTokenAfterLogin(userId: string): Promise<boolean> {
    try {
      console.log('🔐 [NotificationServiceMobi] Registering FCM token after login for user:', userId);

      // Kiểm tra quyền đã được cấp chưa
      const permissionStatus = await this.checkPermissionStatus();
      if (!permissionStatus.fcm || !permissionStatus.expo) {
        console.log('⚠️ [NotificationServiceMobi] Permissions not granted, requesting...');
        const permissionGranted = await this.requestUserPermission();
        if (!permissionGranted) {
          console.log('❌ [NotificationServiceMobi] Permission denied during login registration');
          return false;
        }
      }

      // Đăng ký token với backend
      const success = await this.registerTokenWithBackend(userId);
      if (success) {
        console.log('✅ [NotificationServiceMobi] FCM token registered successfully after login');
      }

      return success;
    } catch (error) {
      console.error('❌ [NotificationServiceMobi] Error registering token after login:', error);
      return false;
    }
  }
}

export default new NotificationServiceMobi();

// Utility function để dễ dàng đăng ký FCM token sau khi login
export const registerFCMTokenAfterLogin = async (userId: string): Promise<boolean> => {
  const notificationService = new NotificationServiceMobi();
  return notificationService.registerTokenAfterLogin(userId);
};