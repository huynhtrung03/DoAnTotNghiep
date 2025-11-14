/**
 * RequestStatusTab Component
 * 
 * Tab hiển thị trạng thái các yêu cầu của user
 * - Yêu cầu xem phòng
 * - Yêu cầu sửa chữa
 * - Yêu cầu khác
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RequestStatusTab() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Icon và message trống */}
        <Ionicons name="clipboard-outline" size={80} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>Chưa có yêu cầu</Text>
        <Text style={styles.emptyText}>
          Bạn chưa có yêu cầu nào.{'\n'}
          Các yêu cầu và trạng thái của bạn sẽ hiển thị ở đây.
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
