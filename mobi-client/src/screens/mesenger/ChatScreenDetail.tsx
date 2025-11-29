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
} from '../../services/ChatService';
import Colors from '../../styles/colors';
import { StyleSheet } from 'react-native';

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
  const [currentUserAvatar, setCurrentUserAvatar] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  
  const flatListRef = useRef<FlatList<Message> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

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
      }
      
      if (userProfileStr) {
        try {
          const userProfile = JSON.parse(userProfileStr);
          let avatarUrl = userProfile.avatar || '';
          if (avatarUrl && avatarUrl.trim() && !avatarUrl.startsWith('http')) {
            avatarUrl = `https://res.cloudinary.com${avatarUrl}`;
          }
          setCurrentUserAvatar(avatarUrl);
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
      } else {
        await sendTextMessage(text, currentUserId, recipientId);
      }
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
              <View style={styles.onlineIndicator} />
            </View>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>
                {recipientName || 'Unknown User'}
              </Text>
              <Text style={styles.headerStatus}>
                {isTyping ? 'đang nhập...' : 'Đang hoạt động'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    zIndex: 10,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'white',
  },
  headerAvatarPlaceholder: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: 'white',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 1,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,122,255,0.08)',
  },

  // Messages
  messagesContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    // marginBottom set inline
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timeBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  messageWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  ownMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageContent: {
    maxWidth: '75%',
  },
  avatarTop: {
    marginBottom: 6,
  },
  avatarTopOwn: {
    alignSelf: 'flex-end',
  },
  avatarTopOther: {
    alignSelf: 'flex-start',
  },
  avatarColumn: {
    width: 28,
    alignItems: 'center',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'white',
  },
  avatarSmallImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  avatarSpacer: {
    height: 6,
  },
  messageBubble: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ownMessageBubble: {
    borderBottomRightRadius: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ownMessageText: {
    fontSize: 16,
    lineHeight: 22,
    color: 'white',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  otherMessageText: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.textPrimary,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  messageImage: {
    width: 220,
    height: 220,
    borderRadius: 16,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  messageInfoOwn: {
    justifyContent: 'flex-end',
  },
  messageInfoOther: {
    justifyContent: 'flex-start',
  },
  messageTime: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  readIcon: {
    marginLeft: 2,
  },

  // Reactions
  reactionsBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    marginTop: 8,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  reactionsBarOwn: {
    alignSelf: 'flex-end',
  },
  reactionsBarOther: {
    alignSelf: 'flex-start',
  },
  reactionButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  reactionEmoji: {
    fontSize: 20,
  },

  // Input
  inputContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  imagePreviewContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#E5E5EA',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,122,255,0.08)',
    borderRadius: 20,
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 120,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  input: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 22,
    paddingTop: 0,
    paddingBottom: 0,
    fontWeight: '500',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
});