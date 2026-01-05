/**
 * MessCard Component
 *
 * Component hiển thị một cuộc hội thoại trong danh sách tin nhắn
 * - Avatar và thông tin người dùng
 * - Tin nhắn cuối cùng và thời gian
 * - Unread badge
 * - Animation khi render
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChatUser } from '../../../services/ChatService';
import Colors from '../../../colors/colors';
import styles from '../MesengerScreen.styles';
import { URL_IMAGE } from '../../../services/Constant';

interface MessCardProps {
  user: ChatUser;
  onPress: () => void;
  index?: number;
}

export default function MessCard({ user, onPress, index = 0 }: MessCardProps) {
  const [avatarError, setAvatarError] = useState(false);

  // Reset avatar error khi user hoặc avatar thay đổi
  useEffect(() => {
    setAvatarError(false);
    console.log('️ MessCard avatar for user:', user.id, 'avatar:', user.avatar);
    console.log(' Full user info:', {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      lastMessageTime: user.lastMessageTime,
      lastMessageText: user.lastMessageText,
      unreadCount: user.unreadCount,
      receivedMessageCount: user.receivedMessageCount,
      lastMessageSenderId: user.lastMessageSenderId,
    });
  }, [user.id, user.avatar]);
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
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const messageDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    // Vừa xong (< 1 phút)
    if (diffMins < 1) return 'Vừa xong';
    
    // Vài phút trước (< 1 giờ)
    if (diffMins < 60) return `${diffMins} phút`;
    
    // Vài giờ trước (hôm nay)
    if (messageDate.getTime() === today.getTime()) {
      if (diffHours < 24) return `${diffHours} giờ`;
      return dateObj.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    // Hôm qua
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Hôm qua';
    }
    
    // Tuần này
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays < 7) {
      const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      return days[dateObj.getDay()];
    }
    
    // Ngày tháng năm
    return dateObj.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const hasUnread = (user.unreadCount ?? 0) > 0;

  // Log cách hiển thị avatar
  const avatarDisplayType = user.id === 'ai-assistant' 
    ? 'AI assets' 
    : user.role === 'landlord' 
      ? (user.avatar ? 'landlord URL' : 'landlord placeholder') 
      : (user.avatar && user.avatar.trim() && !avatarError ? 'user URL' : 'user placeholder');
  console.log('️ Avatar display type:', avatarDisplayType, 'for user:', user.id, 'avatar:', user.avatar);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 50)}>
      <TouchableOpacity
        style={[
          styles.conversationItem,
          hasUnread && styles.conversationItemUnread
        ]}
        onPress={onPress}
        activeOpacity={0.6}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {user.id === 'ai-assistant' ? (
            // AI Assistant - dùng ảnh từ assets
            <Image 
              source={require('../../../../assets/chatbot.png')} 
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : user.role === 'landlord' ? (
            // Landlord - sử dụng logic hiển thị đặc biệt
            user.avatar ? (
              <Image 
                source={{ uri: user.avatar }} 
                style={styles.avatar}
                resizeMode="cover"
                onError={(error) => {
                  console.warn('️ Failed to load landlord avatar for user:', user.id);
                  setAvatarError(true);
                }}
                onLoad={() => {
                  console.log(' Landlord avatar loaded successfully for user:', user.id);
                  setAvatarError(false);
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color={Colors.textSecondary} />
              </View>
            )
          ) : user.avatar && user.avatar.trim() && !avatarError ? (
            // User thường - dùng URI trực tiếp
            <Image 
              source={{ uri: user.avatar }} 
              style={styles.avatar}
              resizeMode="cover"
              onError={(error) => {
                console.warn('️ Failed to load avatar for user:', user.id);
                setAvatarError(true);
              }}
              onLoad={() => {
                console.log(' Avatar loaded successfully for user:', user.id);
                setAvatarError(false);
              }}
            />
          ) : (
            // Placeholder cho user không có avatar hoặc avatar lỗi
            <View style={styles.avatarPlaceholder}>
              <Ionicons 
                name="person" 
                size={28} 
                color={Colors.textSecondary} 
              />
            </View>
          )}
          {/* Online indicator - xanh nếu online, xám nếu offline */}
          {user.id !== 'ai-assistant' && (
            <View 
              style={[
                styles.onlineIndicator,
                {
                  backgroundColor: user.isOnline ? '#31A24C' : '#9CA3AF',
                  borderWidth: 3,
                  borderColor: 'white',
                  opacity: user.isOnline ? 1 : 0.6,
                },
              ]} 
            />
          )}
          {/* AI Always online */}
          {user.id === 'ai-assistant' && (
            <View 
              style={[
                styles.onlineIndicator,
                {
                  backgroundColor: '#31A24C',
                  borderWidth: 3,
                  borderColor: 'white',
                },
              ]}
            />
          )}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text
              style={[
                styles.userName,
                hasUnread && styles.userNameUnread,
              ]}
              numberOfLines={1}
            >
              {user.name || 'Unknown User'}
            </Text>
            {user.lastMessageTime && (
              <Text style={[
                styles.timeText,
                hasUnread && styles.timeTextUnread
              ]}>
                {formatTime(user.lastMessageTime)}
              </Text>
            )}
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                hasUnread && styles.lastMessageUnread,
              ]}
              numberOfLines={2}
            >
              {user.lastMessageText || 'Không có tin nhắn'}
            </Text>
            {/* Display received message count only if last message is from other user */}
            {user.lastMessageSenderId === user.id && user.receivedMessageCount && user.receivedMessageCount > 0 ? (
              <View style={styles.receivedBadge}>
                <Text style={styles.receivedBadgeText}>
                  {user.receivedMessageCount > 99 ? '99+' : user.receivedMessageCount}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}