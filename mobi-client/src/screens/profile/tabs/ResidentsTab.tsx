/**
 * ResidentsTab Component
 * 
 * Tab hiển thị thông tin người ở cùng
 * - Danh sách cư dân trong phòng
 * - Thông tin liên hệ
 * - Quản lý thành viên
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ResidentsTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Icon và message trống */}
        <Ionicons name="people-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Chưa có thông tin cư dân</Text>
        <Text style={styles.emptyText}>
          Hiện tại chưa có thông tin về người ở cùng.{'\n'}
          Thông tin sẽ hiển thị khi bạn thuê phòng.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
