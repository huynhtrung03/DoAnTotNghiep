// components/cards/RoomCardActions.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCompareStore } from '../../stores/CompareStore';
import { useFavoriteStore } from '../../stores/FavoriteStore';
import { RoomInUser } from '../../types/types';
import { useNavigation } from '@react-navigation/native';
// Giả sử bạn có một service để gọi API
// import { updateFavoriteStatus } from '@/services/FavoriteService';

export default function RoomCardActions({ room, showHeartOnly = false }: { room: RoomInUser; showHeartOnly?: boolean }) {
  const { items, addItem } = useCompareStore();
  const { favoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();
  const navigation = useNavigation<any>();

  const isCompared = items.some((item: any) => item.room.id === room.id);
  const isFavorite = favoriteRoomIds.has(room.id);
  
  // Bạn cần một cơ chế session tương tự trên mobile, có thể qua Context hoặc Redux/Zustand
  const session = true; // Giả sử người dùng đã đăng nhập

  const [favoriteCount, setFavoriteCount] = useState(0); // Cần lấy dữ liệu này từ API

  const handleFavorite = async () => {
    if (!session) {
      navigation.navigate('Login');
      return;
    }
    isFavorite ? removeFavorite(room.id) : addFavorite(room.id);
    // Tích hợp logic gọi API để đồng bộ với server ở đây
  };
  
  const handleCompare = () => {
    if (items.length >= 2) {
      alert("Bạn chỉ có thể so sánh tối đa 2 phòng.");
      return;
    }
    addItem({ room });
  };
  
  // Hiển thị chỉ trái tim (cho ảnh)
  if (showHeartOnly) {
    return (
      <View style={styles.heartOnlyContainer}>
        <TouchableOpacity onPress={handleFavorite} style={styles.heartButton}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={22} color={isFavorite ? "#EF4444" : "#FFFFFF"} />
        </TouchableOpacity>
        <Text style={styles.heartCount}>{favoriteCount}</Text>
      </View>
    );
  }

  // Hiển thị đầy đủ actions (cho phần nội dung)
  return (
    <View style={styles.fullActionsContainer}>
      <TouchableOpacity onPress={handleFavorite} style={[styles.actionButton, isFavorite && styles.favoriteActiveButton]}>
        <Ionicons name="heart" size={16} color={isFavorite ? '#EF4444' : '#6B7280'} />
        <Text style={[styles.actionText, isFavorite && styles.favoriteActiveText]}>{favoriteCount}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleCompare} disabled={isCompared} style={[styles.actionButton, isCompared && styles.disabledButton]}>
        <Ionicons name={isCompared ? "checkmark-circle" : "add-circle-outline"} size={18} color={isCompared ? '#9CA3AF' : '#3B82F6'} />
        <Text style={[styles.actionText, { color: isCompared ? '#9CA3AF' : '#3B82F6' }]}>So sánh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Heart Only Styles
  heartOnlyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  heartButton: {},
  heartCount: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 6,
  },
  // Full Actions Styles
  fullActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  favoriteActiveButton: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  actionText: {
    marginLeft: 6,
    fontWeight: '500',
    color: '#6B7280',
  },
  favoriteActiveText: {
    color: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#F9FAFB',
  },
});