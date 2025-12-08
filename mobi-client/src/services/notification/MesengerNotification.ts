import NotificationServiceMobi from '../NotificationServiceMobi';
import { BaseApiClient } from '../api/BaseApiClient';
import { getUserStatus } from '../ChatService';

/**
 * Interface cho dữ liệu gửi thông báo tin nhắn
 */
interface MessageNotificationData {
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  messageText?: string;
  messageType: 'text' | 'image';
  imageUrl?: string;
}

/**
 * Interface cho response từ backend
 */
interface NotificationResponse {
  success: boolean;
  message: string;
}

/**
 * Service xử lý thông báo cho tính năng nhắn tin
 * Sử dụng NotificationServiceMobi để gửi thông báo Firebase
 */
class MessengerNotificationService {
  
  /**
   * Gửi thông báo khi có tin nhắn mới
   * Chỉ gửi thông báo nếu người nhận ở trạng thái offline
   * @param data - Dữ liệu tin nhắn để gửi thông báo
   */
  async sendMessageNotification(data: MessageNotificationData): Promise<boolean> {
    try {
      // Validate required fields
      if (!data.senderId || !data.recipientId) {
        console.error('❌ [MessengerNotification] Missing required fields:', {
          hasSenderId: !!data.senderId,
          hasRecipientId: !!data.recipientId,
        });
        return false;
      }

      // Validate sender name
      if (!data.senderName || data.senderName.trim() === '') {
        console.warn('⚠️ [MessengerNotification] Missing sender name, using default');
        data.senderName = 'User';
      }

      console.log('💬 [MessengerNotification] Checking recipient status before sending notification:', {
        senderId: data.senderId,
        senderName: data.senderName,
        recipientId: data.recipientId,
        messageType: data.messageType,
      });

      // Kiểm tra trạng thái online/offline của người nhận
      try {
        const recipientStatus = await getUserStatus(data.recipientId);
        
        if (recipientStatus.isOnline) {
          console.log('ℹ️ [MessengerNotification] Recipient is ONLINE, skipping notification:', {
            recipientId: data.recipientId,
            status: recipientStatus.status,
          });
          // Không gửi thông báo nếu người nhận đang online
          return true; // Trả về true vì đây là hành vi mong muốn
        }

        console.log('✅ [MessengerNotification] Recipient is OFFLINE, sending notification:', {
          recipientId: data.recipientId,
          status: recipientStatus.status,
          lastSeen: recipientStatus.lastSeen,
        });
      } catch (statusError) {
        console.warn('⚠️ [MessengerNotification] Error checking recipient status, proceeding with notification:', statusError);
        // Nếu không lấy được trạng thái, vẫn gửi thông báo
      }

      // Chuẩn bị payload cho backend - đảm bảo không có undefined
      const notificationPayload = {
        type: 'new_message',
        senderId: String(data.senderId).trim(),
        senderName: String(data.senderName).trim(),
        senderAvatar: data.senderAvatar && data.senderAvatar.trim() !== '' 
          ? data.senderAvatar.trim() 
          : null,
        recipientId: String(data.recipientId).trim(),
        messageType: data.messageType,
        messageText: data.messageType === 'text' && data.messageText 
          ? data.messageText.trim() 
          : (data.messageType === 'image' ? '📷 Đã gửi một hình ảnh' : ''),
        imageUrl: data.imageUrl && data.imageUrl.trim() !== '' 
          ? data.imageUrl.trim() 
          : null,
        timestamp: new Date().toISOString(),
      };

      console.log('📦 [MessengerNotification] Notification payload:', JSON.stringify(notificationPayload, null, 2));

      // Gửi request đến backend để backend gửi FCM notification
      const response = await BaseApiClient.post<NotificationResponse>(
        '/notifications/send-message-notification',
        notificationPayload
      );

      console.log('📥 [MessengerNotification] Backend response:', response);

      if (response.success) {
        console.log('✅ [MessengerNotification] Message notification sent successfully:', response.message);
        return true;
      } else {
        console.warn('⚠️ [MessengerNotification] Backend rejected notification:', response.message);
        return false;
      }

    } catch (error: any) {
      console.error('❌ [MessengerNotification] Error sending message notification:', {
        error: error.message || error,
        stack: error.stack,
        data: {
          senderId: data.senderId,
          recipientId: data.recipientId,
          messageType: data.messageType,
        }
      });
      
      // Vẫn cho phép tin nhắn được gửi ngay cả khi notification thất bại
      // Không throw error để không ảnh hưởng đến việc gửi tin nhắn
      return false;
    }
  }

  /**
   * Gửi thông báo local để confirm tin nhắn đã được gửi (optional)
   */
  private async sendLocalConfirmation(data: MessageNotificationData): Promise<void> {
    try {
      // Có thể bỏ qua hoặc customize theo nhu cầu
      console.log('✅ [MessengerNotification] Message sent confirmation');
    } catch (error) {
      console.error('❌ [MessengerNotification] Error sending local confirmation:', error);
    }
  }

  /**
   * Gửi thông báo khi có tin nhắn văn bản
   */
  async notifyTextMessage(
    senderId: string,
    senderName: string,
    recipientId: string,
    messageText: string,
    senderAvatar?: string
  ): Promise<boolean> {
    return this.sendMessageNotification({
      senderId,
      senderName,
      senderAvatar,
      recipientId,
      messageText,
      messageType: 'text',
    });
  }

  /**
   * Gửi thông báo khi có tin nhắn hình ảnh
   */
  async notifyImageMessage(
    senderId: string,
    senderName: string,
    recipientId: string,
    imageUrl: string,
    senderAvatar?: string
  ): Promise<boolean> {
    return this.sendMessageNotification({
      senderId,
      senderName,
      senderAvatar,
      recipientId,
      imageUrl,
      messageType: 'image',
    });
  }

  /**
   * Gửi thông báo typing indicator (optional - nếu cần)
   */
  async notifyTyping(
    senderId: string,
    senderName: string,
    recipientId: string
  ): Promise<boolean> {
    try {
      console.log('⌨️ [MessengerNotification] Sending typing notification');

      const response = await BaseApiClient.post<NotificationResponse>(
        '/notifications/typing-indicator',
        {
          senderId,
          senderName,
          recipientId,
          timestamp: new Date().toISOString(),
        }
      );

      return response.success;
    } catch (error) {
      console.error('❌ [MessengerNotification] Error sending typing notification:', error);
      return false;
    }
  }

  /**
   * Đánh dấu tin nhắn đã đọc và gửi thông báo read receipt (optional)
   */
  async notifyMessageRead(
    senderId: string,
    recipientId: string,
    messageId: string
  ): Promise<boolean> {
    try {
      console.log('👁️ [MessengerNotification] Sending read receipt notification');

      const response = await BaseApiClient.post<NotificationResponse>(
        '/notifications/message-read',
        {
          senderId,
          recipientId,
          messageId,
          timestamp: new Date().toISOString(),
        }
      );

      return response.success;
    } catch (error) {
      console.error('❌ [MessengerNotification] Error sending read receipt:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new MessengerNotificationService();

// Export class nếu cần tạo instance mới
export { MessengerNotificationService };
