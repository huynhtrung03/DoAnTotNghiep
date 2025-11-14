/**
 * FavoritedRoomsTab Component
 * 
 * Tab hiển thị danh sách phòng yêu thích của user
 * - Các phòng đã lưu
 * - Thông tin cơ bản
 * - Trạng thái còn/hết phòng
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritedRoomsTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Icon và message trống */}
        <Ionicons name="heart-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Chưa có phòng yêu thích</Text>
        <Text style={styles.emptyText}>
          Bạn chưa lưu phòng nào.{'\n'}
          Hãy khám phá và lưu những phòng bạn thích!
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
