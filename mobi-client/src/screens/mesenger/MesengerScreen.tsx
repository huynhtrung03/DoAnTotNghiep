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
import { ChatUser, listenForConversations, markConversationAsRead } from '../../services/ChatService';
import { getFirestore, collection, query, where, onSnapshot } from '@react-native-firebase/firestore';
import Colors from '../../styles/colors';
import MessCard from './component/MessCard';
import AIChatbot from './component/AIChatbot';
import styles from './MesengerScreen.styles';

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

  // Trigger for recalculating unread counts when read status changes
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        console.log(' Current user ID:', userData.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Không thể tải thông tin người dùng');
    }
  };

  useEffect(() => {
    if (!currentUserId) return;

    console.log(' Setting up all messages listener');
    const unsubscribe = listenForConversations(
      currentUserId,
      lastReadTimestamps,
      setUserList,
      setIsLoading,
      setError
    );

    return () => {
      console.log(' Unsubscribing from messages');
      unsubscribe();
    };
  }, [currentUserId, refreshTrigger]);

  // Listen for read statuses to update lastReadTimestamps
  useEffect(() => {
    if (!currentUserId) return;

    console.log(' Listening for read statuses for user:', currentUserId);

    const unsubscribeReadStatuses = onSnapshot(
      query(
        collection(getFirestore(), 'readStatuses'),
        where('userId', '==', currentUserId)
      ),
      (snapshot) => {
        const newTimestamps = new Map<string, Date>();
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          if (data.lastRead) {
            newTimestamps.set(data.conversationId, data.lastRead.toDate());
          }
        });
        lastReadTimestamps.current = newTimestamps;
        console.log(' Read timestamps updated:', newTimestamps.size, 'conversations');

        // Trigger recalculation of unread counts
        setRefreshTrigger(prev => prev + 1);
      },
      (error) => {
        console.error(' Error listening to read statuses:', error);
      }
    );

    return () => {
      console.log(' Unsubscribing from read statuses');
      unsubscribeReadStatuses();
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
      avatar: '', // MessCard sẽ xử lý đặc biệt cho ai-assistant
      lastMessageText: 'Tôi có thể giúp bạn tìm phòng trọ phù hợp',
      lastMessageTime: new Date(),
      unreadCount: 0,
    };
    return [aiUser, ...filteredUsers];
  }, [filteredUsers]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Real-time listener will auto-update, just close the refresh indicator
    setTimeout(() => setRefreshing(false), 500);
  };

  const handlePressConversation = async (user: ChatUser) => {
    if (user.id === 'ai-assistant') {
      setShowAIChat(true);
      return;
    }

    // Mark conversation as read locally first for immediate UI update
    lastReadTimestamps.current.set(user.id, new Date());

    // Trigger recalculation of unread counts immediately
    setRefreshTrigger(prev => prev + 1);

    // Mark conversation as read in Firebase
    try {
      await markConversationAsRead(currentUserId, user.id);
      console.log(' Conversation marked as read:', user.id);
    } catch (error) {
      console.error(' Error marking conversation as read:', error);
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
