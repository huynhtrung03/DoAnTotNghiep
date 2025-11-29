/**
 * AIChatbot Component - Fixed Keyboard Issue
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Image,
  ActivityIndicator,
  Platform,
  Alert,
  StatusBar,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../../styles/colors';
import { API_URL } from '../../../services/Constant';
import { StyleSheet } from 'react-native';

const AI_API_URL = `${API_URL}/ai_chatbot`;

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AIChatbotProps {
  visible: boolean;
  onClose: () => void;
}

export default function AIChatbot({ visible, onClose }: AIChatbotProps) {
  const [history, setHistory] = useState<Message[]>([
    {
      role: "assistant",
      text: "Xin chào! Tôi là Ants AI Assistant. Tôi có thể giúp bạn tìm phòng trọ phù hợp. Bạn đang tìm loại phòng nào?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const flatListRef = useRef<FlatList<Message>>(null);

  // Load history from AsyncStorage
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save history to AsyncStorage
  useEffect(() => {
    saveChatHistory();
  }, [history]);

  // Auto scroll to bottom
  useEffect(() => {
    if (history.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [history, showTyping]);

  // Keyboard listeners
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardOffset(e.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardOffset(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const loadChatHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem('ai-chat-history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async () => {
    try {
      await AsyncStorage.setItem('ai-chat-history', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newHistory = [...history, { role: "user" as const, text: input }];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setShowTyping(true);

    try {
      const res = await fetch(AI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: newHistory }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setHistory([...newHistory, { role: "assistant", text: data.reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      Alert.alert('Lỗi', 'Không thể kết nối với AI Assistant. Vui lòng thử lại sau.');
      setHistory([
        ...newHistory,
        {
          role: "assistant",
          text: "Xin lỗi, có lỗi kết nối server. Vui lòng thử lại sau.",
        },
      ]);
    }
    setLoading(false);
    setShowTyping(false);
  };

  const clearHistory = () => {
    const initialHistory = [
      {
        role: "assistant" as const,
        text: "Xin chào! Tôi là Ants AI Assistant. Tôi có thể giúp bạn tìm phòng trọ phù hợp. Bạn đang tìm loại phòng nào?",
      },
    ];
    setHistory(initialHistory);
  };

  const formatTime = (date: Date | null) => {
    if (!date) return '';

    const now = new Date();
    const messageDate = new Date(date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDate = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
    
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Vừa xong (< 1 phút)
    if (diffMins < 1) return 'Vừa xong';
    
    // Vài phút trước (< 1 giờ)
    if (diffMins < 60) return `${diffMins} phút`;
    
    // Hôm nay
    if (msgDate.getTime() === today.getTime()) {
      if (diffHours < 24) return `${diffHours} giờ`;
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // Hôm qua
    if (msgDate.getTime() === yesterday.getTime()) {
      return 'Hôm qua';
    }
    
    // Tuần này
    if (diffDays < 7) {
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return days[messageDate.getDay()];
    }
    
    // Ngày tháng năm
    return messageDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: messageDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.role === "user";
    const showTime = index === 0 ||
      formatTime(new Date()) !== formatTime(new Date());

    return (
      <View style={styles.messageContainer}>
        {showTime && (
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>
              {formatTime(new Date()) || ''}
            </Text>
          </View>
        )}

        <View style={[
          styles.messageWrapper,
          isOwnMessage ? styles.ownMessageWrapper : styles.otherMessageWrapper
        ]}>
          {!isOwnMessage && (
            <Image 
              source={require('../../../../assets/chatbot.png')} 
              style={styles.avatarSmall}
              resizeMode="cover"
            />
          )}

          <View style={[
            styles.messageBubble,
            isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
          ]}>
            <Text style={[
              styles.messageText,
              isOwnMessage ? styles.ownMessageText : styles.otherMessageText
            ]}>
              {item.text || ''}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Image 
          source={require('../../../../assets/chatbot.png')} 
          style={styles.emptyAvatar}
          resizeMode="cover"
        />
        <Text style={styles.emptyTitle}>Chào mừng đến với AI Assistant</Text>
        <Text style={styles.emptySubtitle}>
          Tôi có thể giúp bạn tìm phòng trọ phù hợp với nhu cầu của bạn
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onClose}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../../../assets/chatbot.png')} 
                style={styles.headerAvatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>
                Ants AI Assistant
              </Text>
              <Text style={styles.headerStatus}>Luôn sẵn sàng</Text>
            </View>
          </View>

          <TouchableOpacity onPress={clearHistory} style={styles.headerButton}>
            <Ionicons name="trash" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        <View style={styles.flex1}>
          <FlatList
            ref={flatListRef}
            data={history}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.messagesContainer}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            inverted={false}
            ListFooterComponent={
              <>
                {/* Typing Indicator */}
                {showTyping && (
                  <View style={[styles.messageContainer, styles.otherMessageWrapper]}>
                    <Image 
                      source={require('../../../../assets/chatbot.png')} 
                      style={styles.avatarSmall}
                      resizeMode="cover"
                    />
                    <View style={[styles.messageBubble, styles.otherMessageBubble, styles.typingBubble]}>
                      <View style={styles.typingDots}>
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                      </View>
                    </View>
                  </View>
                )}
              </>
            }
          />

          {/* Input Area */}
          <View style={[styles.inputWrapperAbsolute, { bottom: keyboardOffset }]}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Nhập tin nhắn của bạn..."
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  maxLength={500}
                  onSubmitEditing={sendMessage}
                  blurOnSubmit={false}
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!input.trim() || loading) && styles.sendButtonDisabled
                ]}
                onPress={sendMessage}
                disabled={!input.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.hintContainer}>
              <Ionicons name="bulb-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.hintText}>
                Hỏi về phòng trọ, giá cả, vị trí hoặc tiện nghi?
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex1: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  headerStatus: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Messages
  messagesContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  messageContainer: {
    marginBottom: 8,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textTertiary,
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  ownMessageWrapper: {
    justifyContent: 'flex-end',
  },
  otherMessageWrapper: {
    justifyContent: 'flex-start',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  ownMessageBubble: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  ownMessageText: {
    color: Colors.textWhite,
  },
  otherMessageText: {
    color: Colors.textPrimary,
  },
  typingBubble: {
    paddingVertical: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: 2,
  },

  // Input
  inputWrapperAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    backgroundColor: Colors.backgroundDark,
    borderWidth: 0.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
    minHeight: 40,
    color: Colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  hintText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginLeft: 6,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
});