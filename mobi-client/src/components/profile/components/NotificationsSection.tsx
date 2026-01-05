/**
 * NotificationsSection Component
 * 
 * Component hiển thị và quản lý cài đặt thông báo email
 * 
 * Features:
 * - Toggle switch để bật/tắt thông báo email
 * - Mô tả chức năng
 * - Loading state khi đang cập nhật
 */

import React from 'react';
import { View, Text, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NotificationsSectionProps } from '../types';
import { styles } from '../ProfileInformation.styles';

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  emailNotificationsEnabled,
  loadingNotifications,
  onToggleNotifications,
}) => {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="notifications-outline" size={24} color="#F59E0B" />
        <Text style={styles.sectionTitle}>Cài đặt thông báo</Text>
      </View>

      {/* Notification Row - Email Notifications */}
      <View style={styles.notificationRow}>
        {/* Text Container */}
        <View style={styles.notificationTextContainer}>
          <Text style={styles.notificationTitle}>
            Thông báo qua Email
          </Text>
          <Text style={styles.notificationDescription}>
            Nhận thông báo về tin nhắn mới, yêu cầu đặt phòng và cập nhật quan trọng qua email
          </Text>
        </View>

        {/* Switch hoặc Loading Indicator */}
        {loadingNotifications ? (
          // Hiển thị loading spinner khi đang cập nhật settings
          <ActivityIndicator
            size="small"
            color="#3B82F6"
            style={styles.notificationLoading}
          />
        ) : (
          // Toggle Switch
          <Switch
            value={emailNotificationsEnabled}
            onValueChange={onToggleNotifications}
            trackColor={{
              false: '#D1D5DB', // Gray khi tắt
              true: '#93C5FD',  // Light blue khi bật
            }}
            thumbColor={emailNotificationsEnabled ? '#3B82F6' : '#F3F4F6'}
            ios_backgroundColor="#D1D5DB"
          />
        )}
      </View>
    </View>
  );
};

export default NotificationsSection;
