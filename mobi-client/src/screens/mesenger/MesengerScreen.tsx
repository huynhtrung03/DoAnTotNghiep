/**
 * MessengerScreen
 * 
 * Màn hình tin nhắn với danh sách các cuộc hội thoại
 * - Header với search và filter
 * - Danh sách conversations
 * - Unread badge
 * - Real-time updates từ Firebase
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatUser, listenForConversations } from '../../services/ChatService';
import Colors, { withOpacity } from '../../styles/colors';
import { StyleSheet } from 'react-native';
import MessCard from './component/MessCard';
import AIChatbot from './component/AIChatbot';

export default function MessengerScreen() {
  const navigation = useNavigation<any>();
  const [userList, setUserList] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const lastReadTimestamps = useRef(new Map<string, Date>());

  // AI Chatbot state
  const [showAIChat, setShowAIChat] = useState(false);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setCurrentUserId(userData.id);
        console.log('👤 Current user ID:', userData.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Không thể tải thông tin người dùng');
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    console.log('🔄 Setting up conversations listener');
    const unsubscribe = listenForConversations(
      currentUserId,
      lastReadTimestamps,
      setUserList,
      setIsLoading,
      setError
    );

    return () => {
      console.log('🔌 Unsubscribing from conversations');
      unsubscribe();
    };
  }, [currentUserId]);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim()) {
      const filtered = userList.filter((user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(userList);
    }
  }, [searchQuery, userList]);

  // Add AI assistant to the beginning of filtered users
  const usersWithAI = React.useMemo(() => {
    const aiUser: ChatUser = {
      id: 'ai-assistant',
      name: 'Ants AI Assistant',
      avatar: '', // Will use robot icon
      lastMessageText: 'Tôi có thể giúp bạn tìm phòng trọ phù hợp',
      lastMessageTime: new Date(),
      unreadCount: 0,
    };
    return [aiUser, ...filteredUsers];
  }, [filteredUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Force reload by clearing and re-listening
    setUserList([]);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handlePressConversation = (user: ChatUser) => {
    if (user.id === 'ai-assistant') {
      setShowAIChat(true);
      return;
    }

    navigation.navigate('Chat', {
      recipientId: user.id,
      recipientName: user.name,
      recipientAvatar: user.avatar,
    });
  };

  const renderConversationItem = ({ item, index }: { item: ChatUser; index: number }) => (
    <MessCard
      user={item}
      onPress={() => handlePressConversation(item)}
      index={index}
    />
  );

  const renderEmptyState = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons name="chatbubbles-outline" size={80} color={Colors.textTertiary} />
        <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
        <Text style={styles.emptySubtitle}>
          Tin nhắn của bạn sẽ xuất hiện ở đây khi bạn bắt đầu trò chuyện
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="create-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm tin nhắn..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error Message */}
      {error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={Colors.error} />
          <Text style={styles.errorText}>{error || 'Có lỗi xảy ra'}</Text>
        </View>
      ) : null}

      {/* Conversations List */}
      {isLoading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải tin nhắn...</Text>
        </View>
      ) : (
        <FlatList
          data={usersWithAI}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            usersWithAI.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}

      {/* AI Chatbot Modal */}
      <AIChatbot visible={showAIChat} onClose={() => setShowAIChat(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(Colors.primary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: withOpacity(Colors.error, 0.1),
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // List
  listContent: {
    paddingBottom: 100, // Space for tab bar
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // Conversation Item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },

  // Content
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  userNameUnread: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },

  // Message Row
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 8,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Unread Badge
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
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
});
