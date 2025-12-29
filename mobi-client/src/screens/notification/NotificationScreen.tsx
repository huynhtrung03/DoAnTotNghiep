import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationsForUser, markNotificationAsRead } from '../../services/NotificationService';
import { styles } from './NotificationScreen.style';

interface Notification {
  id: string;
  senderId: string;
  receiverId: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: any; // Timestamp
  contractId?: string;
}

const NotificationScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId]);

  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
    }
  };

  const loadNotifications = async () => {
    if (!userId) return;
    try {
      const data = await getNotificationsForUser(userId);
      setNotifications(data as Notification[]);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const handleNotificationPress = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể đánh dấu đã đọc');
      }
    }
    // Điều hướng dựa trên type nếu cần
    // Ví dụ: navigation.navigate('BookingDetail', { id: notification.contractId });
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'booking_success': return 'Đặt phòng thành công';
      case 'request_success': return 'Yêu cầu thuê phòng';
      case 'resident_success': return 'Cư dân mới';
      case 'payment_success': return 'Thanh toán thành công';
      default: return 'Thông báo';
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getNotificationTitle(item.type).charAt(0)}
        </Text>
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, !item.isRead && styles.unreadText]}>
          {getNotificationTitle(item.type)}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.time}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          </View>
        }
      />
    </View>
  );
};

export default NotificationScreen;
