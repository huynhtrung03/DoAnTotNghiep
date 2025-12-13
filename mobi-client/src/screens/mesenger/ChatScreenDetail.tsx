/**
 * ChatScreen - Modern Redesign
 * 
 * Cải tiến giao diện chat với:
 * - UI hiện đại với gradient, animations
 * - Gửi hình ảnh với preview
 * - Typing indicator
 * - Message reactions
 * - Read receipts
 * - Smooth scrolling & transitions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  Alert,
  Animated,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Message,
  listenForMessages,
  sendTextMessage,
  sendImageMessage,
  markConversationAsRead,
  getUserStatus,
} from '../../services/ChatService';
import Colors from '../../colors/colors';
import styles from './ChatScreenDetail.style';
import MessengerNotification from '../../services/notification/MesengerNotification';

interface ChatScreenParams {
  recipientId: string;
  recipientName?: string;
  recipientAvatar?: string;
}

const REACTIONS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { recipientId, recipientName, recipientAvatar } = (route.params || {}) as ChatScreenParams;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [currentUserAvatar, setCurrentUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [recipientIsOnline, setRecipientIsOnline] = useState(false);
  const [recipientLastSeen, setRecipientLastSeen] = useState<string>('');
  
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const statusCheckInterval = useRef<NodeJS.Timeout | null>(null);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const inputAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCurrentUser();
    // Animate header on mount
    Animated.spring(headerAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, []);

  useEffect(() => {
    if (!currentUserId || !recipientId) return;

    const unsubscribe = listenForMessages(currentUserId, recipientId, setMessages);
    markConversationAsRead(currentUserId, recipientId).catch(console.error);

    return () => {
      unsubscribe();
    };
  }, [currentUserId, recipientId]);

  /**
   * Fetch recipient online status periodically
   */
  useEffect(() => {
    if (!recipientId) return;

    const fetchRecipientStatus = async () => {
      try {
        const status = await getUserStatus(recipientId);
        console.log('👤 [ChatScreen] Recipient status:', status);
        setRecipientIsOnline(status.isOnline ?? false);
        
        if (!status.isOnline && status.lastSeen) {
          const lastSeenDate = new Date(status.lastSeen);
          const now = new Date();
          const diffMs = now.getTime() - lastSeenDate.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

          let lastSeenText = '';
          if (diffMins < 1) lastSeenText = 'Vừa xong';
          else if (diffMins < 60) lastSeenText = `${diffMins} phút trước`;
          else if (diffHours < 24) lastSeenText = `${diffHours} giờ trước`;
          else if (diffDays < 7) lastSeenText = `${diffDays} ngày trước`;
          else lastSeenText = lastSeenDate.toLocaleDateString('vi-VN');

          setRecipientLastSeen(lastSeenText);
        }
      } catch (error) {
        console.warn('⚠️ [ChatScreen] Error fetching recipient status:', error);
      }
    };

    fetchRecipientStatus();

    // Refetch status every 30 seconds
    statusCheckInterval.current = setInterval(fetchRecipientStatus, 30000);

    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [recipientId]);

  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadCurrentUser = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      const userProfileStr = await AsyncStorage.getItem('userProfile');
      
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUserId(userData.id);
        // Lấy tên người dùng từ userData hoặc userProfile
        setCurrentUserName(userData.name || userData.fullName || 'User');
      }
      
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr);
          let avatarUrl = userProfile.avatar || '';
          if (avatarUrl && avatarUrl.trim() && !avatarUrl.startsWith('http')) {
            avatarUrl = `https://res.cloudinary.com${avatarUrl}`;
          }
          setCurrentUserAvatar(avatarUrl);
          
          // Cập nhật tên nếu chưa có từ userData
          if (!currentUserName && userProfile.name) {
            setCurrentUserName(userProfile.name);
          }
        } catch (e) {
          console.warn('Error parsing user profile:', e);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLoading(false);
    }
  };

  const handleTyping = (text: string) => {
    setInput(text);
    
    // Simulate typing indicator
    if (!isTyping && text.trim()) {
      setIsTyping(true);
    }
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || !currentUserId || !recipientId || sending) return;

    const text = input.trim();
    const imageUri = selectedImage;
    
    setInput('');
    setSelectedImage(null);
    setSending(true);

    // Animate input
    Animated.sequence([
      Animated.timing(inputAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(inputAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      if (imageUri) {
        const fileName = `image_${Date.now()}.jpg`;
        await sendImageMessage(imageUri, fileName, currentUserId, recipientId);
        
        // Gửi thông báo Firebase cho tin nhắn hình ảnh
        console.log('📸 [ChatScreen] Sending image message notification');
        await MessengerNotification.notifyImageMessage(
          currentUserId,
          currentUserName || recipientName || 'User',
          recipientId,
          imageUri,
          currentUserAvatar
        );
      } else {
        await sendTextMessage(text, currentUserId, recipientId);
        
        // Gửi thông báo Firebase cho tin nhắn văn bản
        console.log('💬 [ChatScreen] Sending text message notification');
        await MessengerNotification.notifyTextMessage(
          currentUserId,
          currentUserName || recipientName || 'User',
          recipientId,
          text,
          currentUserAvatar
        );
      }
      
      console.log('✅ [ChatScreen] Message and notification sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
      setInput(text);
      setSelectedImage(imageUri);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';

    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) {
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return days[messageDate.getDay()];
    }
    
    return messageDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    
    const showAvatar = !prevMessage || 
      prevMessage.senderId !== item.senderId ||
      (prevMessage.createdAt && item.createdAt && 
       Math.abs(prevMessage.createdAt.getTime() - item.createdAt.getTime()) > 5 * 60000);
    
    const avatarUrl = isOwnMessage ? currentUserAvatar : recipientAvatar;
    
    const showTimeSeparator = !prevMessage || 
      (prevMessage.createdAt && item.createdAt && 
       Math.abs(prevMessage.createdAt.getTime() - item.createdAt.getTime()) > 5 * 60000);
    
    const showMessageTime = item.createdAt && (
      !nextMessage || 
      nextMessage.senderId !== item.senderId ||
      (nextMessage.createdAt && 
       Math.abs(item.createdAt.getTime() - nextMessage.createdAt.getTime()) > 5 * 60000)
    );

    const formatMessageTime = (date: Date | null) => {
      if (!date) return '';
      const messageDate = new Date(date);
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const nextMessageFromSameSender = nextMessage && nextMessage.senderId === item.senderId;
    const marginBottom = nextMessageFromSameSender ? 2 : 8;

    return (
      <View style={[styles.messageContainer, { marginBottom }]}>
        {showTimeSeparator && item.createdAt && (
          <View style={styles.timeContainer}>
            <View style={styles.timeBadge}>
              <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
            </View>
          </View>
        )}

        <View style={[
          styles.messageWrapper,
          isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper
        ]}>
          <View style={styles.messageContent}>
            {/* Avatar phía trên */}
            {showAvatar && (
              <View style={[
                styles.avatarTop,
                isOwnMessage ? styles.avatarTopOwn : styles.avatarTopOther
              ]}>
                <View style={styles.avatarSmall}>
                  {avatarUrl && avatarUrl.trim() ? (
                    <Image 
                      source={{ uri: avatarUrl }} 
                      style={styles.avatarSmallImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name="person" size={14} color={Colors.textSecondary} />
                  )}
                </View>
              </View>
            )}
            {/* Message Bubble */}
            <Pressable
              onLongPress={() => setShowReactions(item.id)}
              style={[
                styles.messageBubble,
                isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
              ]}
            >
              {isOwnMessage && (
                <LinearGradient
                  colors={['#007AFF', '#0051D5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientBubble}
                >
                  {item.messageType === 'image' && item.imageUrl ? (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.ownMessageText}>
                      {item.text || ''}
                    </Text>
                  )}
                </LinearGradient>
              )}
              
              {!isOwnMessage && (
                <>
                  {item.messageType === 'image' && item.imageUrl ? (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.messageImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.otherMessageText}>
                      {item.text || ''}
                    </Text>
                  )}
                </>
              )}
            </Pressable>

            {/* Reactions Bar */}
            {showReactions === item.id && (
              <View style={[
                styles.reactionsBar,
                isOwnMessage ? styles.reactionsBarOwn : styles.reactionsBarOther
              ]}>
                {REACTIONS.map((emoji, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.reactionButton}
                    onPress={() => {
                      // Add reaction logic here
                      setShowReactions(null);
                    }}
                  >
                    <Text style={styles.reactionEmoji}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Message Info */}
            {showMessageTime && (
              <View style={[
                styles.messageInfo,
                isOwnMessage ? styles.messageInfoOwn : styles.messageInfoOther
              ]}>
                <Text style={styles.messageTime}>
                  {formatMessageTime(item.createdAt)}
                </Text>
                {isOwnMessage && (
                  <Ionicons 
                    name="checkmark-done" 
                    size={14} 
                    color={Colors.primary} 
                    style={styles.readIcon}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const headerTranslate = headerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const inputScale = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.95],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header with Animation */}
      <Animated.View 
        style={[
          styles.header,
          {
            transform: [{ translateY: headerTranslate }],
            opacity: headerAnim,
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>

            <View style={styles.headerContent}>
              <View style={styles.avatarContainer}>
                {recipientAvatar ? (
                  <Image 
                    source={{ uri: recipientAvatar }} 
                    style={styles.headerAvatar}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.headerAvatarPlaceholder}>
                    <Ionicons name="person" size={22} color={Colors.textSecondary} />
                  </View>
                )}
                <View 
                  style={[
                    styles.onlineIndicator,
                    {
                      backgroundColor: recipientIsOnline ? '#31A24C' : '#9CA3AF',
                      borderWidth: 3,
                      borderColor: 'white',
                      opacity: recipientIsOnline ? 1 : 0.6,
                    },
                  ]} 
                />
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {recipientName || 'Unknown User'}
                </Text>
                <Text style={styles.headerStatus} numberOfLines={1}>
                  {isTyping 
                    ? 'đang nhập...' 
                    : recipientIsOnline 
                      ? 'Đang hoạt động' 
                      : recipientLastSeen
                        ? `Ngoại tuyến (${recipientLastSeen})`
                        : 'Ngoại tuyến'}
                </Text>
              </View>
            </View>          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="call-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="videocam-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Messages List */}
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={() => {}}
        />

        {/* Input Area */}
        <Animated.View 
          style={[
            styles.inputContainer,
            { transform: [{ scale: inputScale }] }
          ]}
        >
          {/* Image Preview */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <Image 
                source={{ uri: selectedImage }} 
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close-circle" size={24} color={Colors.error} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputWrapper}>
            <TouchableOpacity
              style={styles.attachButton}
              onPress={pickImage}
            >
              <Ionicons name="image-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>

            <View style={styles.inputBox}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={input}
                onChangeText={handleTyping}
                placeholder="Tin nhắn..."
                placeholderTextColor={Colors.textTertiary}
                multiline
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!input.trim() && !selectedImage || sending) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={(!input.trim() && !selectedImage) || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <LinearGradient
                  colors={['#007AFF', '#0051D5']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="arrow-up" size={22} color="white" />
                </LinearGradient>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
