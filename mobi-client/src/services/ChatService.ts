import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@react-native-firebase/storage';
import { API_URL, URL_IMAGE } from './Constant';
import { BaseApiClient } from './api/BaseApiClient';

// Cache để tránh gọi API nhiều lần cho cùng userId
const userInfoCache = new Map<string, { fullName: string; avatar: string; role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Cache for user online status
const userStatusCache = new Map<string, { isOnline: boolean; timestamp: number }>();
const STATUS_CACHE_DURATION = 30 * 1000; // 30 giây

export interface ChatUser {
  id: string;
  name?: string;
  avatar?: string;
  lastMessageTime?: Date;
  lastMessageText?: string;
  unreadCount?: number;
  receivedMessageCount?: number; // Tổng số tin nhắn nhận được từ người khác
  lastMessageSenderId?: string; // ID của người gửi tin nhắn cuối cùng (để phân biệt sent vs received)
  role?: 'landlord' | 'tenant' | 'admin'; // Role của user
  isOnline?: boolean; // Trạng thái online/offline
}

export interface Message {
  id: string;
  text?: string;
  imageUrl?: string;
  imageFileName?: string;
  senderId: string;
  recipientId: string;
  createdAt: Date | null;
  messageType: 'text' | 'image';
}

/**
 * Lấy trạng thái online/offline của user
 */
export const getUserStatus = async (userId: string): Promise<{ isOnline: boolean; status?: string; lastSeen?: Date | null }> => {
  try {
    // Kiểm tra cache trước
    const cached = userStatusCache.get(userId);
    if (cached && Date.now() - cached.timestamp < STATUS_CACHE_DURATION) {
      return {
        isOnline: cached.isOnline,
        status: cached.isOnline ? 'ONLINE' : 'OFFLINE',
        lastSeen: (cached as any).lastSeen || null,
      };
    }

    // Gửi API để lấy trạng thái
    const response = await BaseApiClient.get<{ isOnline: boolean; status?: string; lastSeen?: any }>(
      `/messages/user-status/${userId}`
    );

    const isOnline = response.isOnline || false;
    const status = response.status || (isOnline ? 'ONLINE' : 'OFFLINE');
    const lastSeen = response.lastSeen ? new Date(response.lastSeen) : null;

    userStatusCache.set(userId, { 
      isOnline, 
      timestamp: Date.now(),
      status,
      lastSeen,
    } as any);

    console.log('👤 [ChatService] User status fetched:', { userId, isOnline, status, lastSeen });
    return { isOnline, status, lastSeen };
  } catch (error) {
    console.warn('⚠️ [ChatService] Error getting user status:', error);
    return { isOnline: false, status: 'OFFLINE', lastSeen: null };
  }
};

/**
 * Lấy trạng thái online/offline của nhiều user
 */
export const getUsersStatus = async (userIds: string[]): Promise<{ [key: string]: boolean }> => {
  try {
    if (userIds.length === 0) return {};

    const response = await BaseApiClient.post<{ [key: string]: boolean }>(
      `/messages/users-status`,
      userIds
    );

    // Cache kết quả
    Object.entries(response).forEach(([userId, isOnline]) => {
      userStatusCache.set(userId, { isOnline: isOnline as boolean, timestamp: Date.now() });
    });

    console.log('📋 [ChatService] Multiple users status fetched:', Object.keys(response).length);
    return response;
  } catch (error) {
    console.warn('⚠️ [ChatService] Error getting users status:', error);
    return {};
  }
};

/**
 * Set user chat active (khi mở App)
 */
export const setChatActive = async (userId: string): Promise<void> => {
  try {
    console.log('🟢 [ChatService] Setting user chat active:', userId);
    await BaseApiClient.post(`/messages/chat-active?userId=${userId}`, null);
    // Clear cache to force refresh
    userStatusCache.delete(userId);
  } catch (error) {
    console.warn('⚠️ [ChatService] Error setting chat active:', error);
  }
};

/**
 * Set user chat inactive (khi tắt App / Background)
 */
export const setChatInactive = async (userId: string): Promise<void> => {
  try {
    console.log('🔴 [ChatService] Setting user chat inactive:', userId);
    await BaseApiClient.post(`/messages/chat-inactive?userId=${userId}`, null);
    // Clear cache to force refresh
    userStatusCache.delete(userId);
  } catch (error) {
    console.warn('⚠️ [ChatService] Error setting chat inactive:', error);
  }
};/**
 * Send heartbeat (gửi định kỳ mỗi 30s)
 */
export const sendHeartbeat = async (userId: string): Promise<void> => {
  try {
    await BaseApiClient.post(`/messages/heartbeat?userId=${userId}`, null);
  } catch (error) {
    console.warn('⚠️ [ChatService] Error sending heartbeat:', error);
  }
};

/**
 * Get user full name and avatar
 * Sử dụng profile endpoint (giống ProfileService và UserScreen)
 * Có cache để tránh gọi API nhiều lần
 */
const getFullName = async (userId: string): Promise<{ fullName: string; avatar: string; role: string }> => {
  // Kiem tra cache truoc
  const cached = userInfoCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached user info for:', userId);
    return { fullName: cached.fullName, avatar: cached.avatar, role: cached.role };
  }

  try {
    // Sử dụng /profile/getname endpoint trực tiếp (endpoint chính)
    // /users endpoint thường bị lỗi 500, bỏ qua
    
    try {
      const nameData = await BaseApiClient.get(`/profile/getname/${userId}`) as any;
      const fullName = nameData.fullName || nameData.name || userId;
      let avatarUrl = nameData.avatar ? URL_IMAGE + nameData.avatar.substring(1) : '';
      
      // Lấy role từ response của getname endpoint (nếu có) hoặc dùng default
      const role = nameData?.role || 'tenant';
      
      const result = { fullName, avatar: avatarUrl, role: role as 'landlord' | 'tenant' | 'admin' };
      userInfoCache.set(userId, { ...result, timestamp: Date.now() });
      
      console.log('✅ User info fetched successfully:', { userId, fullName, hasAvatar: !!avatarUrl, role });
      
      return result;

    } catch (getNameError: any) {
      console.warn(`⚠️ Getname endpoint error for userId ${userId}:`, getNameError?.message || getNameError);
    }

    // Nếu endpoint chính fail, return default và cache để không gọi lại ngay
    console.warn(`⚠️ Failed to fetch user info for userId: ${userId}, using default`);
    const defaultInfo = { fullName: userId, avatar: '', role: 'tenant' as const };
    userInfoCache.set(userId, { ...defaultInfo, timestamp: Date.now() });
    return defaultInfo;
    
  } catch (error: any) {
    console.warn(`Error fetching user info for userId ${userId}:`, error?.message || error);
    // Return với userId làm tên tạm thời và cache để không gọi lại ngay
    const defaultInfo = { fullName: userId, avatar: '', role: 'tenant' as const };
    userInfoCache.set(userId, { ...defaultInfo, timestamp: Date.now() });
    return defaultInfo;
  }
};

/**
 * Listen for all messages and group by conversation
 * Hiển thị tất cả tin nhắn của user (sent + received) được nhóm theo người khác
 * Lắng nghe REAL-TIME cho cả sent và received messages
 */
export const listenForConversations = (
  userId: string,
  lastReadTimestamps: React.MutableRefObject<Map<string, Date>>,
  setUserList: (users: ChatUser[]) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string) => void
): (() => void) => {
  if (!userId) {
    setIsLoading(false);
    return () => {};
  }

  //console.log('Listening for all messages for user:', userId);

  let senderData: any[] = [];
  let recipientData: any[] = [];
  let hasSentLoaded = false;
  let hasReceivedLoaded = false;

  const updateUserList = () => {
    try {
      const conversations = new Map<string, ChatUser>();
      const unreadCounts = new Map<string, number>();
      const receivedMessageCounts = new Map<string, number>(); // Đếm tổng tin nhắn nhận được
      const uniqueUserIds = new Set<string>();

      // Process all sent messages
      senderData.forEach((data) => {
        const otherUserId = data.recipientId;

        if (!otherUserId || otherUserId === userId) return;
        uniqueUserIds.add(otherUserId);

        if (!conversations.has(otherUserId)) {
          const lastMessageTime = data.createdAt?.toDate() || new Date();
          const lastMessageText =
            data.messageType === 'image' ? '[Hình ảnh]' : (data.text || '').substring(0, 100);
          conversations.set(otherUserId, {
            id: otherUserId,
            lastMessageTime,
            lastMessageText,
            lastMessageSenderId: userId, // Tôi gửi
          });
        } else {
          const currentConv = conversations.get(otherUserId)!;
          const messageTime = data.createdAt?.toDate() || new Date();
          if (messageTime > (currentConv.lastMessageTime || new Date(0))) {
            const lastMessageText =
              data.messageType === 'image' ? '[Hình ảnh]' : (data.text || '').substring(0, 100);
            conversations.set(otherUserId, {
              ...currentConv,
              lastMessageTime: messageTime,
              lastMessageText,
              lastMessageSenderId: userId, // Tôi gửi
            });
          }
        }
      });

      // Process all received messages
      recipientData.forEach((data) => {
        const otherUserId = data.senderId;

        if (!otherUserId || otherUserId === userId) return;
        uniqueUserIds.add(otherUserId);

        // Count all received messages
        const currentReceivedCount = receivedMessageCounts.get(otherUserId) || 0;
        receivedMessageCounts.set(otherUserId, currentReceivedCount + 1);

        if (!conversations.has(otherUserId)) {
          const lastMessageTime = data.createdAt?.toDate() || new Date();
          const lastMessageText =
            data.messageType === 'image' ? '[Hình ảnh]' : (data.text || '').substring(0, 100);
          conversations.set(otherUserId, {
            id: otherUserId,
            lastMessageTime,
            lastMessageText,
            lastMessageSenderId: otherUserId, // Họ gửi
          });
        } else {
          const currentConv = conversations.get(otherUserId)!;
          const messageTime = data.createdAt?.toDate() || new Date();
          if (messageTime > (currentConv.lastMessageTime || new Date(0))) {
            const lastMessageText =
              data.messageType === 'image' ? '[Hình ảnh]' : (data.text || '').substring(0, 100);
            conversations.set(otherUserId, {
              ...currentConv,
              lastMessageTime: messageTime,
              lastMessageText,
              lastMessageSenderId: otherUserId, // Họ gửi
            });
          }
        }

        // Count unread messages
        const lastReadTime = lastReadTimestamps.current.get(otherUserId);
        const messageTime = data.createdAt?.toDate() || new Date();

        if (!lastReadTime || lastReadTime < messageTime) {
          const currentCount = unreadCounts.get(otherUserId) || 0;
          unreadCounts.set(otherUserId, currentCount + 1);
        }
      });

      if (uniqueUserIds.size === 0) {
        //console.log('No conversations found');
        setUserList([]);
        setIsLoading(false);
        return;
      }

      // Fetch user details for all unique users
      const userIds = Array.from(uniqueUserIds);
      const namePromises = userIds.map(async (id) => {
        try {
          const data = await getFullName(id);
          return { id, name: data.fullName, avatar: data.avatar, role: data.role };
        } catch (error) {
          console.error(`Failed to get name for user ${id}:`, error);
          return { id, name: id, avatar: '', role: 'tenant' as const };
        }
      });

      Promise.all(namePromises).then((names) => {
        const updatedUserList: ChatUser[] = names
          .map(({ id, name, avatar, role }) => {
            const chatData = conversations.get(id);
            const unreadCount = unreadCounts.get(id) || 0;
            const receivedMessageCount = receivedMessageCounts.get(id) || 0;
            return {
              ...chatData!,
              name,
              avatar,
              role: role as 'landlord' | 'tenant' | 'admin',
              unreadCount,
              receivedMessageCount,
            };
          })
          .sort((a, b) => {
            const timeA = a.lastMessageTime || new Date(0);
            const timeB = b.lastMessageTime || new Date(0);
            return timeB.getTime() - timeA.getTime();
          });

        //console.log('All messages updated:', updatedUserList.length, 'conversations');
        setUserList(updatedUserList);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error processing messages:', error);
      setError('Không thể tải tin nhắn. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  // Listen for SENT messages (real-time)
  const unsubscribeSent = onSnapshot(
    query(
      collection(getFirestore(), 'messages'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    ),
    (snapshot) => {
      senderData = snapshot.docs.map((doc: any) => doc.data());
      hasSentLoaded = true;
      //console.log('Sent messages updated:', senderData.length);
      
      // Update list only if both queries are loaded
      if (hasSentLoaded && hasReceivedLoaded) {
        updateUserList();
      }
    },
    (error) => {
      console.error('Firebase sent messages error:', error);
      setError('Không thể tải tin nhắn. Vui lòng thử lại.');
    }
  );

  // Listen for RECEIVED messages (real-time)
  const unsubscribeReceived = onSnapshot(
    query(
      collection(getFirestore(), 'messages'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    ),
    (snapshot) => {
      recipientData = snapshot.docs.map((doc: any) => doc.data());
      hasReceivedLoaded = true;
      //console.log('Received messages updated:', recipientData.length);
      
      // Update list only if both queries are loaded
      if (hasSentLoaded && hasReceivedLoaded) {
        updateUserList();
      }
    },
    (error) => {
      console.error('Firebase received messages error:', error);
      setError('Không thể tải tin nhắn. Vui lòng thử lại.');
    }
  );

  // Return unsubscribe function that unsubscribes from both listeners
  return () => {
    unsubscribeSent();
    unsubscribeReceived();
  };
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (
  userId: string,
  otherUserId: string
): Promise<void> => {
  try {
    //console.log('Marking conversation as read:', { userId, otherUserId });

    await setDoc(
      doc(getFirestore(), 'readStatuses', `${userId}-${otherUserId}`),
      {
        userId,
        conversationId: otherUserId,
        lastRead: serverTimestamp(),
      },
      { merge: true }
    );

    //console.log('Conversation marked as read');
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

/**
 * Upload image to Firebase Storage
 */
export const uploadImageToFirebase = async (
  fileUri: string,
  fileName: string
): Promise<{ imageUrl: string; fileName: string }> => {
  try {
    //console.log('Uploading image to Firebase:', fileName);

    const reference = ref(getStorage(), `chat-images/${Date.now()}_${fileName}`);
    await reference.putFile(fileUri);
    const url = await getDownloadURL(reference);

    //console.log('Image uploaded:', url);
    return { imageUrl: url, fileName };
  } catch (error) {
    console.error('Upload image error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Send image message
 */
export const sendImageMessage = async (
  fileUri: string,
  fileName: string,
  senderId: string,
  recipientId: string
): Promise<void> => {
  try {
    //console.log('Sending image message');

    const { imageUrl } = await uploadImageToFirebase(fileUri, fileName);

    await addDoc(collection(getFirestore(), 'messages'), {
      imageUrl,
      imageFileName: fileName,
      senderId,
      recipientId,
      createdAt: serverTimestamp(),
      messageType: 'image',
    });

    //console.log('Image message sent');
  } catch (error) {
    console.error('Send image error:', error);
    throw error;
  }
};

/**
 * Send text message
 */
export const sendTextMessage = async (
  text: string,
  senderId: string,
  recipientId: string
): Promise<void> => {
  try {
    //console.log('Sending text message');

    await addDoc(collection(getFirestore(), 'messages'), {
      text,
      senderId,
      recipientId,
      createdAt: serverTimestamp(),
      messageType: 'text',
    });

    //console.log('Text message sent');
  } catch (error) {
    console.error('Send text error:', error);
    throw error;
  }
};

/**
 * Listen for unread count (for dashboard badge)
 */
export const listenForUnreadCount = (
  userId: string,
  setUnreadCount: (count: number) => void
): (() => void) => {
  if (!userId) {
    return () => {};
  }

  //console.log('Listening for unread count for user:', userId);

  let currentReadTimestamps = new Map<string, Date>();

  // Listen for read statuses
  const unsubscribeReadStatus = onSnapshot(
    query(
      collection(getFirestore(), 'readStatuses'),
      where('userId', '==', userId)
    ),
    (snapshot) => {
      const newTimestamps = new Map<string, Date>();
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        if (data.lastRead) {
          newTimestamps.set(data.conversationId, data.lastRead.toDate());
        }
      });
      currentReadTimestamps = newTimestamps;
      //console.log('Read timestamps updated');
    });

  // Listen for messages
  const unsubscribeMessages = onSnapshot(
    query(
      collection(getFirestore(), 'messages'),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc')
    ),
    (snapshot) => {
      const unreadCounts = new Map<string, number>();

      snapshot.forEach((doc: any) => {
        const data = doc.data();
        const senderId = data.senderId;

        if (!senderId || senderId === userId) return;

        const lastReadTime = currentReadTimestamps.get(senderId);
        const messageTime = data.createdAt?.toDate() || new Date();

        if (!lastReadTime || lastReadTime < messageTime) {
          const currentCount = unreadCounts.get(senderId) || 0;
          unreadCounts.set(senderId, currentCount + 1);
        }
      });

      const totalUnread = Array.from(unreadCounts.values()).reduce(
        (sum, count) => sum + count,
        0
      );
      //console.log('Total unread messages:', totalUnread);
      setUnreadCount(totalUnread);
    });

  return () => {
    unsubscribeReadStatus();
    unsubscribeMessages();
  };
};

/**
 * Delete message
 */
export const deleteMessage = async (
  messageId: string,
  senderId: string
): Promise<void> => {
  try {
    //console.log('Deleting message:', messageId);

    // Check if user is sender
    const messageDoc = await getDocs(
      query(
        collection(getFirestore(), 'messages'),
        where('__name__', '==', messageId)
      )
    );
    if (messageDoc.docs[0]?.data()?.senderId !== senderId) {
      throw new Error('Unauthorized to delete this message');
    }

    await deleteDoc(doc(getFirestore(), 'messages', messageId));
    //console.log('Message deleted');
  } catch (error) {
    console.error('Delete message error:', error);
    throw new Error('Không thể xóa tin nhắn');
  }
};

/**
 * Listen for messages in a conversation (real-time)
 */
export const listenForMessages = (
  userId: string,
  otherUserId: string,
  setMessages: (messages: Message[]) => void
): (() => void) => {
  //console.log('Listening for messages:', { userId, otherUserId });

  const unsubscribe = onSnapshot(
    query(
      collection(getFirestore(), 'messages'),
      where('senderId', 'in', [userId, otherUserId]),
      where('recipientId', 'in', [userId, otherUserId]),
      orderBy('createdAt', 'asc')
    ),
    (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          text: data.text || '',
          imageUrl: data.imageUrl,
          imageFileName: data.imageFileName,
          senderId: data.senderId,
          recipientId: data.recipientId,
          createdAt: data.createdAt?.toDate() || null,
          messageType: data.messageType || 'text',
        });
      });

      //console.log('Messages updated:', messages.length);
      setMessages(messages);
    });

  return unsubscribe;
};