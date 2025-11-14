import { db, serverTimestamp } from '../../lib/firebase';
import { getLandlordByRoomId } from '../rooms/RoomService';

interface NotificationData {
  receiverId: string | number;
  senderId: string | number;
  type: string;
  message: string;
  isRead?: boolean;
  contractId?: string | number;
  roomId?: string | number;
}

/**
 * Tạo notification chung (sử dụng Firebase Firestore)
 */
const createNotification = async (data: NotificationData) => {
  try {
    const docRef = await db.collection('notifications').add({
      receiverId: data.receiverId,
      senderId: data.senderId,
      type: data.type,
      message: data.message,
      isRead: data.isRead || false,
      contractId: data.contractId,
      roomId: data.roomId,
      createdAt: serverTimestamp(),
    });

    console.log('Notification created successfully with ID:', docRef.id);
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error('Lỗi khi tạo notification:', error);
    throw error;
  }
};

/**
 * Tạo notification cho landlord khi có booking mới
 * @param roomId - ID của phòng
 * @param tenantId - ID của tenant (người thuê)
 * @param message - Nội dung thông báo
 */
export const createBookingNotification = async (
  roomId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string,
) => {
  try {
    if (!roomId) {
      console.error('roomId is required for createBookingNotification');
      return;
    }

    // Lấy thông tin landlord từ roomId
    const landlordId = await getLandlordByRoomId(roomId as string);

    if (!landlordId || !landlordId.id) {
      console.error('Could not find landlord for roomId:', roomId);
      return;
    }

    await createNotification({
      receiverId: landlordId.id,
      senderId: tenantId!,
      type: 'booking_success',
      message: message,
      roomId: roomId,
    });

    console.log('Booking notification created successfully for landlord:', landlordId.id);
  } catch (error) {
    console.error('Lỗi khi tạo booking notification:', error);
    throw error;
  }
};

/**
 * Tạo notification xác nhận booking (từ tenant gửi cho landlord)
 * @param senderId - ID người gửi (tenant)
 * @param receiverId - ID người nhận (landlord)
 * @param message - Nội dung thông báo
 */
export const bookingConfirmationNotification = async (
  senderId: number | string | undefined,
  receiverId: number | string | undefined,
  message: string,
) => {
  try {
    if (!senderId || !receiverId) {
      console.error('senderId and receiverId are required');
      return;
    }

    await createNotification({
      receiverId: receiverId,
      senderId: senderId,
      type: 'booking_confirmation',
      message: message,
    });

    console.log('Booking confirmation notification sent successfully');
  } catch (error) {
    console.error('Lỗi khi tạo booking confirmation notification:', error);
    throw error;
  }
};

/**
 * Tạo notification khi tenant tạo request/yêu cầu mới
 * @param roomId - ID của phòng
 * @param tenantId - ID của tenant
 * @param message - Nội dung yêu cầu
 */
export const createRequestNotification = async (
  roomId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string,
) => {
  try {
    if (!roomId) {
      console.error('roomId is required for createRequestNotification');
      return;
    }

    // Lấy thông tin landlord từ roomId
    const landlordId = await getLandlordByRoomId(roomId as string);

    if (!landlordId || !landlordId.id) {
      console.error('Could not find landlord for roomId:', roomId);
      return;
    }

    await createNotification({
      receiverId: landlordId.id,
      senderId: tenantId!,
      type: 'request_success',
      message: message,
      roomId: roomId,
    });

    console.log('Request notification created successfully for landlord:', landlordId.id);
  } catch (error) {
    console.error('Lỗi khi tạo request notification:', error);
    throw error;
  }
};

/**
 * Tạo notification khi landlord xử lý request
 * @param landlordId - ID của landlord
 * @param tenantId - ID của tenant
 * @param message - Nội dung phản hồi
 */
export const requestProcessedNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string,
) => {
  try {
    if (!landlordId || !tenantId) {
      console.error('landlordId and tenantId are required');
      return;
    }

    await createNotification({
      receiverId: tenantId,
      senderId: landlordId,
      type: 'request_processed',
      message: message,
    });

    console.log('Request processed notification sent successfully');
  } catch (error) {
    console.error('Lỗi khi tạo request processed notification:', error);
    throw error;
  }
};

/**
 * Tạo notification khi có resident (cư dân) mới
 * @param landlordId - ID của landlord
 * @param tenantId - ID của tenant
 * @param contractId - ID của hợp đồng
 * @param message - Nội dung thông báo
 */
export const createResidentNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
  contractId: number | string | undefined,
  message: string,
) => {
  try {
    if (!landlordId || !tenantId || !contractId) {
      console.error('landlordId, tenantId and contractId are required');
      return;
    }

    await createNotification({
      receiverId: landlordId,
      senderId: tenantId,
      type: 'resident_success',
      message: message,
      contractId: contractId,
    });

    console.log('Resident notification created successfully');
  } catch (error) {
    console.error('Lỗi khi tạo resident notification:', error);
    throw error;
  }
};

/**
 * Tạo notification về thanh toán
 * @param senderId - ID người gửi
 * @param receiverId - ID người nhận
 * @param contractId - ID hợp đồng
 * @param message - Nội dung thông báo thanh toán
 */
export const paymentNotification = async (
  senderId: number | string | undefined,
  receiverId: number | string | undefined,
  contractId: number | string | undefined,
  message: string,
) => {
  try {
    if (!senderId || !receiverId || !contractId) {
      console.error('senderId, receiverId and contractId are required');
      return;
    }

    await createNotification({
      senderId: senderId,
      receiverId: receiverId,
      type: 'payment_success',
      message: message,
      contractId: contractId,
    });

    console.log('Payment notification created successfully');
  } catch (error) {
    console.error('Lỗi khi tạo payment notification:', error);
    throw error;
  }
};

/**
 * Lấy danh sách notifications của user (từ Firestore)
 */
export const getUserNotifications = async (userId: string | number) => {
  try {
    const querySnapshot = await db
      .collection('notifications')
      .where('receiverId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Đánh dấu notification là đã đọc (Firestore)
 */
export const markNotificationAsRead = async (notificationId: string | number) => {
  try {
    await db.collection('notifications').doc(notificationId as string).update({
      isRead: true,
    });

    console.log('Notification marked as read:', notificationId);
    return { success: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Đánh dấu tất cả notifications là đã đọc (Firestore)
 */
export const markAllNotificationsAsRead = async (userId: string | number) => {
  try {
    const querySnapshot = await db
      .collection('notifications')
      .where('receiverId', '==', userId)
      .where('isRead', '==', false)
      .get();

    const batch = db.batch();
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
    console.log('All notifications marked as read for user:', userId);
    return { success: true, count: querySnapshot.size };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Xóa notification (Firestore)
 */
export const deleteNotification = async (notificationId: string | number) => {
  try {
    await db.collection('notifications').doc(notificationId as string).delete();
    
    console.log('Notification deleted:', notificationId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Lấy số lượng notifications chưa đọc (Firestore)
 */
export const getUnreadNotificationCount = async (userId: string | number) => {
  try {
    const querySnapshot = await db
      .collection('notifications')
      .where('receiverId', '==', userId)
      .where('isRead', '==', false)
      .get();

    const count = querySnapshot.size;
    console.log('Unread notification count:', count);
    return count;
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
};

/**
 * Lắng nghe notifications real-time (Firestore listener)
 * @param userId - ID của user
 * @param callback - Function được gọi khi có notification mới
 * @returns Unsubscribe function
 */
export const subscribeToNotifications = (
  userId: string | number,
  callback: (notifications: any[]) => void
) => {
  const unsubscribe = db
    .collection('notifications')
    .where('receiverId', '==', userId)
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      querySnapshot => {
        const notifications = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        callback(notifications);
      },
      error => {
        console.error('Error in notification listener:', error);
      }
    );

  return unsubscribe;
};

/**
 * Lắng nghe số lượng notifications chưa đọc real-time
 * @param userId - ID của user
 * @param callback - Function được gọi khi số lượng thay đổi
 * @returns Unsubscribe function
 */
export const subscribeToUnreadCount = (
  userId: string | number,
  callback: (count: number) => void
) => {
  const unsubscribe = db
    .collection('notifications')
    .where('receiverId', '==', userId)
    .where('isRead', '==', false)
    .onSnapshot(
      querySnapshot => {
        callback(querySnapshot.size);
      },
      error => {
        console.error('Error in unread count listener:', error);
      }
    );

  return unsubscribe;
};
