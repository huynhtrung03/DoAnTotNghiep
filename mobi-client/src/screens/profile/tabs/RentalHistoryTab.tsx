/**
 * RentalHistoryTab Component
 * 
 * Tab hiển thị lịch sử thuê trọ của user
 * - Các phòng đã thuê
 * - Thời gian thuê
 * - Đánh giá và nhận xét
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RentalHistoryTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Icon và message trống */}
        <Ionicons name="time-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Chưa có lịch sử thuê</Text>
        <Text style={styles.emptyText}>
          Bạn chưa có lịch sử thuê trọ.{'\n'}
          Lịch sử các phòng bạn đã thuê sẽ hiển thị ở đây.
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
