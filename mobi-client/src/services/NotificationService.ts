import { db, serverTimestamp } from "../lib/firebase";
import { collection, addDoc, query, where, orderBy, getDocs, updateDoc, doc } from "@react-native-firebase/firestore";
import { getLandlordByRoomId } from "./rooms/RoomService";

// Hàm tạo notification cho landlord
export const createBookingNotification = async (
  roomId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string,
) => {
  try {
    if (!roomId) {
      console.error("roomId is required for createBookingNotification");
      return;
    }
    
    const landlordId = await getLandlordByRoomId(roomId as string);
    
    if (!landlordId || !landlordId.id) {
      console.error("Could not find landlord for roomId:", roomId);
      return;
    }
    
    await addDoc(collection(db, "notifications"), {
      receiverId: landlordId.id,     // landlord sẽ nhận
      senderId: tenantId,         // user tạo booking
      type: "booking_success",
      message: message,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};

export const bookingConfirmationNotification = async (
  senderId: number | string | undefined,
  receiverId: number | string | undefined,
  message: string,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      receiverId: receiverId,     // landlord sẽ nhận
      senderId: senderId,         // user tạo booking
      type: "booking_success",
      message: message,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};

export const createRequestNotification = async (
  roomId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string,
) => {
  try {
    if (!roomId) {
      console.error("roomId is required for createRequestNotification");
      return;
    }
    
    const landlordId = await getLandlordByRoomId(roomId as string);
    
    if (!landlordId || !landlordId.id) {
      console.error("Could not find landlord for roomId:", roomId);
      return;
    }
    
    await addDoc(collection(db, "notifications"), {
      receiverId: landlordId.id,     // landlord sẽ nhận
      senderId: tenantId,         // user tạo booking
      type: "request_success",
      message: message,
      isRead: false,
      createdAt: serverTimestamp()
    });
    
    console.log("Request notification created successfully for landlord:", landlordId.id);
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
    throw error; // Re-throw để caller có thể handle
  }
};

export const requestProcessedNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      receiverId: tenantId,     // landlord sẽ nhận
      senderId: landlordId,         // user tạo booking
      type: "request_success",
      message: message,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};

export const createResidentNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
  contractId: number | string | undefined,
  message: string,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      receiverId: landlordId,     // landlord sẽ nhận
      senderId: tenantId,         // user tạo booking
      type: "resident_success",
      message: message,
      contractId: contractId,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};

export const paymentNotification = async (
  senderId: number | string | undefined,
  receiverId: number | string | undefined,
  contractId: number | string | undefined,
  message: string,
) => {
  try {
    await addDoc(collection(db, "notifications"), {
      senderId: senderId,         // user tạo booking
      receiverId: receiverId,     // landlord sẽ nhận
      type: "payment_success",
      message: message,
      contractId: contractId,
      isRead: false,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
  }
};

// Thêm hàm để lấy danh sách thông báo cho một user (phù hợp với React Native để hiển thị trong app)
export const getNotificationsForUser = async (userId: string) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("receiverId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map((document: any) => ({
      id: document.id,
      ...document.data()
    }));
    return notifications;
  } catch (error) {
    console.error("Lỗi khi lấy notifications:", error);
    return [];
  }
};

// Thêm hàm để đánh dấu thông báo đã đọc
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), { isRead: true });
  } catch (error) {
    console.error("Lỗi khi cập nhật notification:", error);
  }
};