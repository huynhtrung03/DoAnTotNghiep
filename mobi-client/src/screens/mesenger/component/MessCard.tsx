/**
 * MessCard Component
 *
 * Component hiển thị một cuộc hội thoại trong danh sách tin nhắn
 * - Avatar và thông tin người dùng
 * - Tin nhắn cuối cùng và thời gian
 * - Unread badge
 * - Animation khi render
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChatUser } from '../../../services/ChatService';
import Colors from '../../../styles/colors';
import styles from '../MesengerScreen.styles';

interface MessCardProps {
  user: ChatUser;
  onPress: () => void;
  index?: number;
}

export default function MessCard({ user, onPress, index = 0 }: MessCardProps) {
  const formatTime = (date?: Date | any) => {
    if (!date) return '';

    let dateObj: Date;
    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date.toDate && typeof date.toDate === 'function') {
      // Firebase Timestamp
      dateObj = date.toDate();
    } else {
      return '';
    }

    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    if (diffDays < 7) return `${diffDays} ngày`;

    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 50)}>
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name={user.id === 'ai-assistant' ? "hardware-chip" : "person"} size={24} color={Colors.textSecondary} />
            </View>
          )}
          {/* Online indicator (optional) */}
          {/* <View style={styles.onlineIndicator} /> */}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.userName,
                (user.unreadCount ?? 0) > 0 ? styles.userNameUnread : undefined,
              ]}
              numberOfLines={1}
            >
              {user.name || 'Unknown User'}
            </Text>
            <Text style={styles.timeText}>
              {formatTime(user.lastMessageTime) || ''}
            </Text>
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                (user.unreadCount ?? 0) > 0 ? styles.lastMessageUnread : undefined,
              ]}
              numberOfLines={1}
            >
              {user.lastMessageText || 'Không có tin nhắn'}
            </Text>
            {user.unreadCount && user.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {user.unreadCount && user.unreadCount > 99 ? '99+' : user.unreadCount || 0}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}