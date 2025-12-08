import * as Notifications from 'expo-notifications';
import { createBookingNotification } from '../NotificationService';

/**
 * Service quản lý các thông báo liên quan đến quy trình đặt phòng (Booking)
 * Sử dụng Expo Notifications để hiển thị thông báo local (giả lập Push Notification)
 * Và wrapper cho Firestore notifications
 */
class BookingNotification {
  
  /**
   * Gửi thông báo cho chủ nhà (Firestore)
   * Wrapper cho createBookingNotification từ NotificationService
   */
  async sendLandlordNotification(
    roomId: number | string | undefined,
    tenantId: number | string | undefined,
    message: string
  ): Promise<void> {
    try {
      console.log('📤 [BookingNotification] Sending notification to landlord via Firestore');
      await createBookingNotification(roomId, tenantId, message);
    } catch (error) {
      console.error('❌ [BookingNotification] Error sending landlord notification:', error);
      // Không throw error để tránh ảnh hưởng luồng chính
    }
  }

  
  /**
   * Hiển thị thông báo khi đặt phòng thành công
   * @param roomTitle Tên phòng vừa đặt
   */
  async notifyBookingSuccess(roomTitle: string): Promise<void> {
    try {
      console.log('🏨 [BookingNotification] Sending booking success notification');

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Yêu cầu đặt phòng thành công! 🎉',
          body: `Bạn đã gửi yêu cầu thuê phòng "${roomTitle}". Chủ nhà sẽ sớm phản hồi lại bạn.`,
          data: { type: 'booking_success', roomTitle },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          badge: 1,
        },
        trigger: null, // Hiển thị ngay lập tức
      });

      console.log('✅ [BookingNotification] Booking success notification scheduled');
    } catch (error) {
      console.error('❌ [BookingNotification] Error scheduling notification:', error);
    }
  }

  /**
   * Hiển thị thông báo khi có lỗi đặt phòng (nếu cần)
   */
  async notifyBookingError(message: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Đặt phòng thất bại ⚠️',
          body: message || 'Có lỗi xảy ra trong quá trình đặt phòng. Vui lòng thử lại.',
          data: { type: 'booking_error' },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('❌ [BookingNotification] Error scheduling error notification:', error);
    }
  }
}

export default new BookingNotification();
