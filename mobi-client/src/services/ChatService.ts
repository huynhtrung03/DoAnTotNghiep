import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, doc, setDoc, getDocs, deleteDoc, serverTimestamp } from '@react-native-firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@react-native-firebase/storage';
import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';


export interface ChatUser {
  id: string;
  name?: string;
  avatar?: string;
  lastMessageTime?: Date;
  lastMessageText?: string;
  unreadCount?: number;
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
 */
const getFullName = async (userId: string): Promise<{ fullName: string; avatar: string }> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    return {
      fullName: data.fullName || data.username || userId,
      avatar: data.avatar || '',
    };
  } catch (error) {
    console.error('Error fetching user name:', error);
    return { fullName: userId, avatar: '' };
  }
};

/**
 * Listen for conversations of a user
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

  console.log('👂 Listening for conversations for user:', userId);

  const unsubscribe = onSnapshot(
    query(
      collection(getFirestore(), 'messages'),
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc')
    ),
      async (senderSnapshot) => {
        // Also listen for received messages
        const recipientSnapshot = await getDocs(
          query(
            collection(getFirestore(), 'messages'),
            where('recipientId', '==', userId),
            orderBy('createdAt', 'desc')
          )
        );

        const conversations = new Map<string, ChatUser>();
        const unreadCounts = new Map<string, number>();
        const uniqueUserIds = new Set<string>();

        // Process sent messages
        senderSnapshot.forEach((doc: any) => {
          const data = doc.data();
          const otherUserId = data.recipientId;

          if (!otherUserId || otherUserId === userId) return;
          uniqueUserIds.add(otherUserId);

          if (!conversations.has(otherUserId)) {
            const lastMessageTime = data.createdAt?.toDate() || new Date();
            const lastMessageText =
              data.messageType === 'image' ? '[Hinh anh]' : data.text || '';
            conversations.set(otherUserId, {
              id: otherUserId,
              lastMessageTime,
              lastMessageText,
            });
          }
        });

        // Process received messages
        recipientSnapshot.forEach((doc: any) => {
          const data = doc.data();
          const otherUserId = data.senderId;

          if (!otherUserId || otherUserId === userId) return;
          uniqueUserIds.add(otherUserId);

          if (!conversations.has(otherUserId)) {
            const lastMessageTime = data.createdAt?.toDate() || new Date();
            const lastMessageText =
              data.messageType === 'image' ? '[Hinh anh]' : data.text || '';
            conversations.set(otherUserId, {
              id: otherUserId,
              lastMessageTime,
              lastMessageText,
            });
          }

          // Count unread messages
          const lastReadTime = lastReadTimestamps.current.get(otherUserId);
          const messageTime = data.createdAt?.toDate() || new Date();

          if (!lastReadTime || lastReadTime < messageTime) {
            const currentCount = unreadCounts.get(otherUserId) || 0;
            unreadCounts.set(otherUserId, currentCount + 1);
          }
        });

        // Fetch user details
        const userIds = Array.from(uniqueUserIds);
        const namePromises = userIds.map(async (id) => {
          try {
            const data = await getFullName(id);
            return { id, name: data.fullName, avatar: data.avatar };
          } catch (error) {
            console.error(`Failed to get name for user ${id}:`, error);
            return { id, name: id, avatar: '' };
          }
        });

        const names = await Promise.all(namePromises);
        const updatedUserList: ChatUser[] = names.map(({ id, name, avatar }) => {
          const chatData = conversations.get(id);
          const unreadCount = unreadCounts.get(id) || 0;
          return {
            ...chatData!,
            name,
            avatar,
            unreadCount,
          };
        });

        console.log('✅ Conversations updated:', updatedUserList.length);
        setUserList(updatedUserList);
        setIsLoading(false);
      },
      (error) => {
        console.error('❌ Firebase fetch error:', error);
        setError('Không thể tải tin nhắn. Vui lòng thử lại.');
        setIsLoading(false);
      }
    );

  return unsubscribe;
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (
  userId: string,
  otherUserId: string
): Promise<void> => {
  try {
    console.log('✅ Marking conversation as read:', { userId, otherUserId });

    await setDoc(
      doc(getFirestore(), 'readStatuses', `${userId}-${otherUserId}`),
      {
        userId,
        conversationId: otherUserId,
        lastRead: serverTimestamp(),
      },
      { merge: true }
    );

    console.log('✅ Conversation marked as read');
  } catch (error) {
    console.error('❌ Error marking conversation as read:', error);
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
    console.log('📤 Uploading image to Firebase:', fileName);

    const reference = ref(getStorage(), `chat-images/${Date.now()}_${fileName}`);
    await reference.putFile(fileUri);
    const url = await getDownloadURL(reference);

    console.log('✅ Image uploaded:', url);
    return { imageUrl: url, fileName };
  } catch (error) {
    console.error('❌ Upload image error:', error);
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
    console.log('📤 Sending image message');

    const { imageUrl } = await uploadImageToFirebase(fileUri, fileName);

    await addDoc(collection(getFirestore(), 'messages'), {
      imageUrl,
      imageFileName: fileName,
      senderId,
      recipientId,
      createdAt: serverTimestamp(),
      messageType: 'image',
    });

    console.log('✅ Image message sent');
  } catch (error) {
    console.error('❌ Send image error:', error);
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
    console.log('💬 Sending text message');

    await addDoc(collection(getFirestore(), 'messages'), {
      text,
      senderId,
      recipientId,
      createdAt: serverTimestamp(),
      messageType: 'text',
    });

    console.log('✅ Text message sent');
  } catch (error) {
    console.error('❌ Send text error:', error);
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

  console.log('👂 Listening for unread count for user:', userId);

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
      console.log('📚 Read timestamps updated');
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
      console.log('🔔 Total unread messages:', totalUnread);
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
    console.log('🗑️ Deleting message:', messageId);

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
    console.log('✅ Message deleted');
  } catch (error) {
    console.error('❌ Delete message error:', error);
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
  console.log('👂 Listening for messages:', { userId, otherUserId });

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

      console.log('✅ Messages updated:', messages.length);
      setMessages(messages);
    });

  return unsubscribe;
};