import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@react-native-firebase/storage';
import { API_URL, URL_IMAGE } from './Constant';
import { BaseApiClient } from './api/BaseApiClient';

// Cache để tránh gọi API nhiều lần cho cùng userId
const userInfoCache = new Map<string, { fullName: string; avatar: string; role: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

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
    // Thử các endpoint theo thứ tự ưu tiên:
    // 1. /profile/getname/${userId} - endpoint đơn giản chỉ lấy tên (giống ProfileService.ts line 60)
    // 2. /profile/${userId} - endpoint đầy đủ
    // 3. /users/${userId} - fallback

    // Thử 1: /profile/getname/ endpoint (đơn giản, nhanh hơn)
    try {
      const nameData = await BaseApiClient.get(`/profile/getname/${userId}`) as any;
      const fullName = nameData.fullName || nameData.name || userId;
      let avatarUrl = nameData.avatar ? URL_IMAGE + nameData.avatar.substring(1) : '';
        
      // Lấy role từ profile endpoint đầy đủ nếu cần
      try {
        const profileData = await BaseApiClient.get(`/profile/${userId}`) as any;
        const role = profileData?.role || 'tenant';
        const result = { fullName, avatar: avatarUrl, role: role as 'landlord' | 'tenant' | 'admin' };
        userInfoCache.set(userId, { ...result, timestamp: Date.now() });
        //console.log(' User info fetched (getname + profile):', { userId, fullName, hasAvatar: !!avatarUrl });
        
        // Nếu không có avatar từ getname, thử users endpoint
        if (!result.avatar) {
          try {
            const userData = await BaseApiClient.get(`/users/${userId}`) as any;
            
            // Sử dụng avatar từ API và construct URL
            let userAvatarUrl = userData.avatar ? URL_IMAGE + userData.avatar.substring(1) : '';
            
            if (userAvatarUrl) {
              result.avatar = userAvatarUrl;
              userInfoCache.set(userId, { ...result, timestamp: Date.now() });
              //console.log('Avatar updated from users endpoint:', userAvatarUrl);
            }
          } catch (userError: any) {
            console.warn(`Users endpoint error for avatar userId ${userId}:`, userError?.message || userError);
          }
        }
        
        return result;
      } catch (profileError) {
        console.warn('Failed to fetch profile for role, user:', userId, 'error:', (profileError as Error).message);
        // Nếu không lấy được role, dùng tenant
        const result = { fullName, avatar: avatarUrl, role: 'tenant' as const };
        userInfoCache.set(userId, { ...result, timestamp: Date.now() });
        //console.log('User info fetched (getname only):', { userId, fullName, hasAvatar: !!avatarUrl });
        return result;
      }

    } catch (getNameError: any) {
      console.warn(`Getname endpoint error for userId ${userId}:`, getNameError?.message || getNameError);
    }

    // Thu 3: /users/${userId} endpoint (fallback)
    try {
      const userData = await BaseApiClient.get(`/users/${userId}`) as any;

      // Su dung avatar tu API va construct URL
      let avatarUrl = userData.avatar ? URL_IMAGE + userData.avatar.substring(1) : '';

      const result = {
        fullName: userData.fullName || userData.username || userId,
        avatar: avatarUrl,
        role: userData.role || 'tenant', // Assume tenant if no role specified
      };

      // Luu vao cache
      userInfoCache.set(userId, { ...result, timestamp: Date.now() });

      console.log('User info fetched (users endpoint):', { userId, fullName: result.fullName, hasAvatar: !!avatarUrl });

      return result;
    } catch (userError: any) {
      console.warn(`Users endpoint error for userId ${userId}:`, userError?.message || userError);
    }

    // Nếu cả 2 endpoint đều fail, return default và cache để không gọi lại ngay
    console.warn(`Both endpoints failed for userId: ${userId}, using default`);
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