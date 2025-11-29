// components/cards/RoomCardActions.tsx
import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCompareStore } from '../../stores/CompareStore';
import { useFavoriteStore } from '../../stores/FavoriteStore';
import { RoomInUser } from '../../types/types';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addFavorite as addFavoriteAPI, removeFavorite as removeFavoriteAPI, getFavoriteCount } from '../../services/FavoriteService';

export default function RoomCardActions({ room, showHeartOnly = false }: { room: RoomInUser; showHeartOnly?: boolean }) {
  const { items, addItem } = useCompareStore();
  const { 
    favoriteRoomIds, 
    addFavorite, 
    removeFavorite,
    getFavoriteCount: getLocalFavoriteCount,
    setFavoriteCount,
    incrementFavoriteCount,
    decrementFavoriteCount
  } = useFavoriteStore();
  const navigation = useNavigation<any>();

  const isCompared = items.some((item: any) => item.room.id === room.id);
  const isFavorite = favoriteRoomIds.has(room.id);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteCount, setLocalFavoriteCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Kiểm tra đăng nhập
  useEffect(() => {
    checkLoginStatus();
    loadFavoriteCount();
  }, []);

  // Update local count when store changes
  useEffect(() => {
    const count = getLocalFavoriteCount(room.id);
    if (count > 0) {
      setLocalFavoriteCount(count);
    }
  }, [room.id, getLocalFavoriteCount]);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  const loadFavoriteCount = async () => {
    try {
      const count = await getFavoriteCount(room.id);
      setLocalFavoriteCount(count);
      setFavoriteCount(room.id, count);
    } catch (error) {
      console.error('Error loading favorite count:', error);
    }
  };

  const handleFavorite = async () => {
    // Kiểm tra đăng nhập
    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để thêm phòng vào danh sách yêu thích',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Đăng nhập', 
            onPress: () => navigation.navigate('Auth/Login' as never)
          }
        ]
      );
      return;
    }

    if (isProcessing) return;

    setIsProcessing(true);
    const wasAlreadyFavorite = isFavorite;

    try {
      if (wasAlreadyFavorite) {
        // Xóa khỏi favorite
        const success = await removeFavoriteAPI(room.id);
        
        if (success) {
          removeFavorite(room.id);
          decrementFavoriteCount(room.id);
          setLocalFavoriteCount(prev => Math.max(0, prev - 1));
          ////console.log(` Removed from favorites: ${room.id}`);
        } else {
          Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích');
        }
      } else {
        // Thêm vào favorite
        const success = await addFavoriteAPI(room.id);
        
        if (success) {
          addFavorite(room.id);
          incrementFavoriteCount(room.id);
          setLocalFavoriteCount(prev => prev + 1);
          //console.log(` Added to favorites: ${room.id}`);
        } else {
          Alert.alert('Lỗi', 'Không thể thêm vào danh sách yêu thích');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsProcessing(false);
    }
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