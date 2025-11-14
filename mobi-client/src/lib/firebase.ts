import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

// Khởi tạo Firestore
export const db = firestore();

// Khởi tạo Messaging (cho push notifications)
export const messagingService = messaging();

// Server timestamp helper
export const serverTimestamp = firestore.FieldValue.serverTimestamp;

// Export các utilities
export default {
  db,
  messagingService,
  serverTimestamp,
};
