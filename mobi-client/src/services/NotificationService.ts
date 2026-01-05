import firestore from "@react-native-firebase/firestore";
import { getLandlordByRoomId } from "./RoomService";

// === HÀM QUAN TRỌNG: Lọc sạch dữ liệu trước khi gửi ===
// Hàm này biến mọi giá trị không hợp lệ thành null để tránh crash Firebase
// Xử lý: undefined, null, "", 0, false, NaN
const sanitizeData = (data: Record<string, any>) => {
  const cleaned: Record<string, any> = {};
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // Chuyển tất cả giá trị không hợp lệ thành null
    // Firestore chấp nhận null, nhưng KHÔNG chấp nhận undefined
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "number" && (isNaN(value) || value === 0)) ||
      value === false
    ) {
      cleaned[key] = null;
    } else if (typeof value === "string") {
      // Trim whitespace từ strings
      cleaned[key] = value.trim() || null;
    } else {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

/**
 * Validate receiver ID (landlord ID)
 * Đảm bảo giá trị hợp lệ để gửi notification
 */
const validateReceiverId = (receiverId: any): boolean => {
  if (!receiverId) {
    console.error(" VALIDATION FAILED: receiverId is missing or invalid", { receiverId });
    return false;
  }
  if (typeof receiverId === "string" && receiverId.trim() === "") {
    console.error(" VALIDATION FAILED: receiverId is empty string", { receiverId });
    return false;
  }
  if (typeof receiverId === "number" && (isNaN(receiverId) || receiverId === 0)) {
    console.error(" VALIDATION FAILED: receiverId is invalid number", { receiverId });
    return false;
  }
  return true;
};

/**
 * Validate sender ID (tenant ID)
 */
const validateSenderId = (senderId: any): boolean => {
  if (!senderId) {
    console.error(" VALIDATION FAILED: senderId is missing or invalid", { senderId });
    return false;
  }
  if (typeof senderId === "string" && senderId.trim() === "") {
    console.error(" VALIDATION FAILED: senderId is empty string", { senderId });
    return false;
  }
  if (typeof senderId === "number" && (isNaN(senderId) || senderId === 0)) {
    console.error(" VALIDATION FAILED: senderId is invalid number", { senderId });
    return false;
  }
  return true;
};

export const createBookingNotification = async (
  roomId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string
) => {
  try {
    // console.log(" createBookingNotification START:", { roomId, tenantId, message });

    // STEP 0: Validate input parameters
    if (!roomId) {
      // console.warn("️ ABORT: roomId is missing");
      return;
    }

    if (!validateSenderId(tenantId)) {
      // console.warn("️ ABORT: Invalid senderId (tenantId)");
      return;
    }

    // STEP 1: Lấy thông tin chủ nhà
    // console.log(" Calling getLandlordByRoomId...");
    let landlord;
    try {
      landlord = await getLandlordByRoomId(roomId as string);
      // console.log(" Landlord response received");
    } catch (fetchError) {
      console.error(" getLandlordByRoomId threw error:", fetchError);
      // console.warn("️ Cannot send notification: Failed to fetch landlord info");
      return;
    }

    // console.log(" Landlord object:", JSON.stringify(landlord, null, 2));

    if (!landlord) {
      console.error(" ABORT: landlord object is null or undefined");
      // console.warn("️ Cannot send notification: Landlord data is empty");
      return;
    }

    // STEP 1b: Kiểm tra cấu trúc landlord object
    // console.log("=== LANDLORD STRUCTURE CHECK ===");
    // console.log("landlord keys:", Object.keys(landlord));
    // console.log("landlord.id:", landlord.id);
    // console.log("landlord.id type:", typeof landlord.id);
    // console.log("=================================");

    if (!validateReceiverId(landlord.id)) {
      console.error(" ABORT: landlord.id is invalid or missing", { 
        landlord: JSON.stringify(landlord, null, 2),
        landlordId: landlord.id
      });
      // console.warn("️ Cannot send notification: No valid landlord ID");
      return;
    }

    // STEP 2: Chuẩn bị dữ liệu thô
    const rawData = {
      receiverId: landlord.id,
      senderId: tenantId,
      type: "booking_success",
      message: message || "",
      isRead: false,
      contractId: null,
    };

    // console.log(" Raw data before sanitize:", JSON.stringify(rawData, null, 2));

    // STEP 3: Làm sạch dữ liệu
    const cleanPayload = sanitizeData(rawData);
    // console.log(" Cleaned data:", JSON.stringify(cleanPayload, null, 2));

    // STEP 4: Validate cleaned payload
    // console.log("=== VALIDATE CLEANED PAYLOAD ===");
    // Object.entries(cleanPayload).forEach(([key, value]) => {
    //   console.log(`  ${key}: ${value} (type: ${typeof value})`);
    // });
    // console.log("==================================");

    // STEP 5: Thêm timestamp
    cleanPayload.createdAt = firestore.FieldValue.serverTimestamp();

    // console.log(" FINAL PAYLOAD to Firestore:", JSON.stringify(cleanPayload, null, 2));

    // STEP 6: Gửi lên Firestore
    await firestore().collection("notifications").add(cleanPayload);
    
    // console.log(" SUCCESS: Booking notification created successfully");
  } catch (error) {
    console.error(" CRITICAL ERROR in createBookingNotification:", error);
  }
};

// --- Các hàm khác cũng áp dụng sanitizeData tương tự ---

export const bookingConfirmationNotification = async (
  senderId: number | string | undefined,
  receiverId: number | string | undefined,
  message: string
) => {
  try {
    // console.log(" bookingConfirmationNotification START", { senderId, receiverId });

    // Validate
    if (!validateSenderId(senderId)) return;
    if (!validateReceiverId(receiverId)) return;

    const rawData = {
      receiverId,
      senderId,
      type: "booking_success",
      message: message || "",
      isRead: false,
    };
    
    const cleanPayload = sanitizeData(rawData);
    cleanPayload.createdAt = firestore.FieldValue.serverTimestamp();

    await firestore().collection("notifications").add(cleanPayload);
    // console.log(" SUCCESS: Booking confirmation notification created");
  } catch (error) {
    console.error(" Error in bookingConfirmationNotification:", error);
  }
};

export const createRequestNotification = async (
  roomId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string
) => {
  try {
    // console.log(" createRequestNotification START", { roomId, tenantId });

    if (!roomId) {
      // console.warn("️ ABORT: roomId is missing");
      return;
    }

    if (!validateSenderId(tenantId)) {
      // console.warn("️ ABORT: Invalid senderId");
      return;
    }

    // Lấy landlord info
    let landlord;
    try {
      landlord = await getLandlordByRoomId(roomId as string);
    } catch (error) {
      console.error(" Failed to fetch landlord:", error);
      return;
    }

    if (!landlord || !validateReceiverId(landlord?.id)) {
      console.error(" ABORT: Invalid landlord or landlord.id");
      return;
    }

    const rawData = {
      receiverId: landlord.id,
      senderId: tenantId,
      type: "request_success",
      message: message || "",
      isRead: false,
    };

    const cleanPayload = sanitizeData(rawData);
    cleanPayload.createdAt = firestore.FieldValue.serverTimestamp();

    await firestore().collection("notifications").add(cleanPayload);
    // console.log(" SUCCESS: Request notification created");
  } catch (error) {
    console.error(" Error in createRequestNotification:", error);
  }
};

export const requestProcessedNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
  message: string
) => {
  try {
    // console.log(" requestProcessedNotification START", { landlordId, tenantId });

    if (!validateReceiverId(tenantId)) {
      // console.warn("️ ABORT: Invalid receiverId (tenantId)");
      return;
    }

    if (!validateSenderId(landlordId)) {
      // console.warn("️ ABORT: Invalid senderId (landlordId)");
      return;
    }

    const rawData = {
      receiverId: tenantId,
      senderId: landlordId,
      type: "request_success",
      message: message || "",
      isRead: false,
    };

    const cleanPayload = sanitizeData(rawData);
    cleanPayload.createdAt = firestore.FieldValue.serverTimestamp();

    await firestore().collection("notifications").add(cleanPayload);
    // console.log(" SUCCESS: Request processed notification created");
  } catch (error) {
    console.error(" Error in requestProcessedNotification:", error);
  }
};

export const createResidentNotification = async (
  landlordId: number | string | undefined,
  tenantId: number | string | undefined,
  contractId: number | string | undefined,
  message: string
) => {
  try {
    // console.log(" createResidentNotification START", { landlordId, tenantId, contractId });

    if (!validateReceiverId(landlordId)) {
      // console.warn("️ ABORT: Invalid receiverId (landlordId)");
      return;
    }

    if (!validateSenderId(tenantId)) {
      // console.warn("️ ABORT: Invalid senderId (tenantId)");
      return;
    }

    const rawData = {
      receiverId: landlordId,
      senderId: tenantId,
      type: "resident_success",
      message: message || "",
      contractId: contractId,
      isRead: false,
    };

    const cleanPayload = sanitizeData(rawData);
    cleanPayload.createdAt = firestore.FieldValue.serverTimestamp();

    await firestore().collection("notifications").add(cleanPayload);
    // console.log(" SUCCESS: Resident notification created");
  } catch (error) {
    console.error(" Error in createResidentNotification:", error);
  }
};

export const paymentNotification = async (
  senderId: number | string | undefined,
  receiverId: number | string | undefined,
  contractId: number | string | undefined,
  message: string
) => {
  try {
    // console.log(" paymentNotification START", { senderId, receiverId, contractId });

    if (!validateSenderId(senderId)) {
      // console.warn("️ ABORT: Invalid senderId");
      return;
    }

    if (!validateReceiverId(receiverId)) {
      // console.warn("️ ABORT: Invalid receiverId");
      return;
    }

    const rawData = {
      senderId,
      receiverId,
      type: "payment_success",
      message: message || "",
      contractId,
      isRead: false,
    };

    const cleanPayload = sanitizeData(rawData);
    cleanPayload.createdAt = firestore.FieldValue.serverTimestamp();

    await firestore().collection("notifications").add(cleanPayload);
    // console.log(" SUCCESS: Payment notification created");
  } catch (error) {
    console.error(" Error in paymentNotification:", error);
  }
};

// GET Notifications
export const getNotificationsForUser = async (userId: string | number) => {
  try {
    const querySnapshot = await firestore()
      .collection("notifications")
      .where("receiverId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return querySnapshot.docs.map((document) => ({
      id: document.id,
      ...document.data(),
    }));
  } catch (error) {
    console.error("Lỗi khi lấy notifications:", error);
    return [];
  }
};

// Mark as Read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await firestore()
      .collection("notifications")
      .doc(notificationId)
      .update({ isRead: true });
  } catch (error) {
    console.error("Lỗi khi cập nhật notification:", error);
  }
};