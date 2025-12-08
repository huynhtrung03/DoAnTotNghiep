/**
 * MessengerNotification Service - Website (React)
 * Gửi thông báo Firebase khi có tin nhắn mới
 * 
 * Khác biệt với mobile:
 * - Website dùng Firestore listener thay vì FCM device tokens
 * - Notification Web API cho desktop notifications
 * - Không cần UserPresenceService (dùng Firestore status thay thế)
 */

import { API_URL } from '../Constant';

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
 * Interface cho user status response
 */
interface UserStatusResponse {
  userId: string;
  isOnline: boolean;
  status: 'ONLINE' | 'OFFLINE';
  lastSeen?: string;
}

/**
 * Lấy trạng thái online/offline của user từ API backend
 */
const getUserStatus = async (userId: string): Promise<UserStatusResponse> => {
  try {
    const response = await fetch(
      `${API_URL}/messages/user-status/${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get user status: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ [MesengerNotification] Error getting user status:', error);
    throw error;
  }
};

/**
 * Service xử lý thông báo cho tính năng nhắn tin - Website Version
 * Tích hợp với Notification Web API cho desktop notifications
 */
class MessengerNotificationService {
  
  /**
   * Kiểm tra xem browser hỗ trợ Notification API
   */
  private isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Yêu cầu permission để gửi notification
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!this.isNotificationSupported()) {
      console.warn('⚠️ [MesengerNotification] Notification API not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('❌ [MesengerNotification] Error requesting notification permission:', error);
        return false;
      }
    }

    return false;
  }

  /**
   * Gửi desktop notification (Web API)
   */
  private showDesktopNotification(title: string, options?: NotificationOptions): void {
    if (!this.isNotificationSupported() || Notification.permission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        icon: '/images/app-icon.png',
        badge: '/images/app-badge.png',
        ...options,
      });
    } catch (error) {
      console.error('❌ [MesengerNotification] Error showing desktop notification:', error);
    }
  }

  /**
   * Gửi thông báo khi có tin nhắn mới
   * Chỉ gửi thông báo nếu người nhận ở trạng thái offline
   * @param data - Dữ liệu tin nhắn để gửi thông báo
   * @param userSessionId - Session ID của user hiện tại (optional, để check xem có phải recipient không)
   */
  async sendMessageNotification(
    data: MessageNotificationData,
    userSessionId?: string
  ): Promise<boolean> {
    try {
      console.log("💬 [MesengerNotification] Starting sendMessageNotification with data:", JSON.stringify(data));

      // Validate required fields
      if (!data.senderId || !data.recipientId) {
        console.error('❌ [MesengerNotification] Missing required fields:', {
          hasSenderId: !!data.senderId,
          hasRecipientId: !!data.recipientId,
        });
        return false;
      }

      // Nếu user session ID được cung cấp, kiểm tra xem có phải recipient không
      // Nếu là recipient và đang ở page chat, không gửi notification
      if (userSessionId && userSessionId === data.recipientId) {
        // User hiện tại là người nhận
        // Có thể bỏ qua gửi notification nếu đang active trên chat page
        console.log('💬 [MesengerNotification] Current user is recipient, checking if active...');
      }

      // Validate sender name
      if (!data.senderName || data.senderName.trim() === '') {
        console.warn('⚠️ [MesengerNotification] Missing sender name, using default');
        data.senderName = 'User';
      }

      console.log('💬 [MesengerNotification] Checking recipient status before sending notification:', {
        senderId: data.senderId,
        senderName: data.senderName,
        recipientId: data.recipientId,
        messageType: data.messageType,
      });

      // Kiểm tra trạng thái online/offline của người nhận
      try {
        const recipientStatus = await getUserStatus(data.recipientId);
        console.log('✅ [MesengerNotification] Retrieved recipient status:', recipientStatus);
        
        if (recipientStatus.isOnline) {
          console.log('ℹ️ [MesengerNotification] Recipient is ONLINE, skipping notification:', {
            recipientId: data.recipientId,
            status: recipientStatus.status,
          });
          // Không gửi thông báo nếu người nhận đang online
          return true; // Trả về true vì đây là hành vi mong muốn
        }

        console.log('✅ [MesengerNotification] Recipient is OFFLINE, sending notification:', {
          recipientId: data.recipientId,
          status: recipientStatus.status,
          lastSeen: recipientStatus.lastSeen,
        });
      } catch (statusError) {
        console.warn('⚠️ [MesengerNotification] Error checking recipient status, proceeding with notification:', statusError);
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

      console.log('📦 [MesengerNotification] Notification payload:', JSON.stringify(notificationPayload, null, 2));

      // 1. Gửi request đến backend để backend gửi FCM notification tới mobile devices
      console.log('📤 [MesengerNotification] Sending to backend API:', `${API_URL}/notifications/send-message-notification`);
      
      const response = await fetch(
        `${API_URL}/notifications/send-message-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(notificationPayload),
        }
      );

      console.log('📥 [MesengerNotification] Backend response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.warn('⚠️ [MesengerNotification] Backend notification failed:', errorData.message);
        return false;
      }

      const result = await response.json();
      console.log('📥 [MesengerNotification] Backend response:', result);

      // 2. Gửi desktop notification cho website user (Web API)
      await this.showDesktopNotificationForMessage(data);

      if (result.success) {
        console.log('✅ [MesengerNotification] Message notification sent successfully:', result.message);
        return true;
      } else {
        console.warn('⚠️ [MesengerNotification] Backend rejected notification:', result.message);
        return false;
      }

    } catch (error: any) {
      console.error('❌ [MesengerNotification] Error sending message notification:', {
        error: error.message || error,
        stack: error.stack,
        data: {
          senderId: data.senderId,
          recipientId: data.recipientId,
          messageType: data.messageType,
        }
      });
      
      // Vẫn cho phép tin nhắn được gửi ngay cả khi notification thất bại
      return false;
    }
  }

  /**
   * Gửi desktop notification cho message
   */
  private async showDesktopNotificationForMessage(data: MessageNotificationData): Promise<void> {
    try {
      const hasPermission = await this.requestNotificationPermission();
      
      if (!hasPermission) {
        console.log('ℹ️ [MesengerNotification] Notification permission not granted');
        return;
      }

      const title = `Tin nhắn từ ${data.senderName}`;
      const notificationOptions: NotificationOptions = {
        body: data.messageType === 'image' 
          ? '📷 Đã gửi một hình ảnh'
          : (data.messageText || 'Có tin nhắn mới'),
        tag: `message-${data.senderId}`,
        requireInteraction: false,
        ...(data.senderAvatar && { image: data.senderAvatar }),
      };

      this.showDesktopNotification(title, notificationOptions);
      console.log('✅ [MesengerNotification] Desktop notification sent');
    } catch (error) {
      console.error('❌ [MesengerNotification] Error showing desktop notification:', error);
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
    senderAvatar?: string,
    userSessionId?: string
  ): Promise<boolean> {
    return this.sendMessageNotification({
      senderId,
      senderName,
      senderAvatar,
      recipientId,
      messageText,
      messageType: 'text',
    }, userSessionId);
  }

  /**
   * Gửi thông báo khi có tin nhắn hình ảnh
   */
  async notifyImageMessage(
    senderId: string,
    senderName: string,
    recipientId: string,
    imageUrl: string,
    senderAvatar?: string,
    userSessionId?: string
  ): Promise<boolean> {
    return this.sendMessageNotification({
      senderId,
      senderName,
      senderAvatar,
      recipientId,
      imageUrl,
      messageType: 'image',
    }, userSessionId);
  }

  /**
   * Gửi thông báo typing indicator (optional)
   * Trên website có thể không gửi server notification, chỉ dùng local state
   */
  async notifyTyping(
    senderId: string,
    senderName: string,
    recipientId: string,
    isTyping: boolean = true
  ): Promise<boolean> {
    try {
      console.log(`${isTyping ? '⌨️' : '⏹️'} [MesengerNotification] ${isTyping ? 'User is typing' : 'User stopped typing'}`);

      // Optional: Gửi server notification nếu cần
      // Hiện tại chỉ log, không gửi server
      // const response = await fetch(`${API_URL}/notifications/typing-indicator`, {...})

      return true;
    } catch (error) {
      console.error('❌ [MesengerNotification] Error with typing notification:', error);
      return false;
    }
  }

  /**
   * Gửi read receipt notification (optional)
   */
  async notifyMessageRead(
    senderId: string,
    recipientId: string,
    messageId: string
  ): Promise<boolean> {
    try {
      console.log('👁️ [MesengerNotification] Sending read receipt notification');

      const response = await fetch(
        `${API_URL}/notifications/message-read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            senderId,
            recipientId,
            messageId,
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send read receipt');
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('❌ [MesengerNotification] Error sending read receipt:', error);
      return false;
    }
  }

  /**
   * Sound notification (play sound khi có tin nhắn mới)
   */
  playMessageSound(): void {
    try {
      // Tạo audio context để play sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1000; // 1000 Hz
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      console.log('🔊 [MesengerNotification] Message sound played');
    } catch (error) {
      console.error('❌ [MesengerNotification] Error playing notification sound:', error);
    }
  }
}

// Export singleton instance
export default new MessengerNotificationService();

// Export class nếu cần tạo instance mới
export { MessengerNotificationService, type MessageNotificationData, type NotificationResponse };
