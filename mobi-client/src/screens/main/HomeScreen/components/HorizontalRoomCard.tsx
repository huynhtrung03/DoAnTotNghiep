import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RoomInUser } from '../../../../types/types';
import { URL_IMAGE } from '../../../../services/Constant';
import { useCompareStore } from '../../../../stores/CompareStore';
import { getRoomById } from '../../../../services/RoomService';

interface HorizontalRoomCardProps {
  room: RoomInUser;
  onPress: (room: RoomInUser) => void;
  isFavorite?: boolean;
  onFavoriteToggle?: (roomId: string) => void;
}

const HorizontalRoomCard: React.FC<HorizontalRoomCardProps> = ({
  room,
  onPress,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  // Compare store
  const { items, addItem, removeItem } = useCompareStore();
  const [isAddingToCompare, setIsAddingToCompare] = useState(false);
  const isInCompare = items.some(item => item.room.id === room.id);

  const getImageUrl = () => {
    if (room.images && room.images.length > 0) {
      const imageUrl = room.images[0].url;
      if (imageUrl.startsWith('http')) return { uri: imageUrl };
      return { uri: `${URL_IMAGE}${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}` };
    }
    return require('../../../../../assets/images/default/room.png');
  };

  const formatPrice = (price: number) => {
    return `${(price / 1_000_000).toFixed(1)}tr`;
  };

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(room.id);
    }
  };

  const handleCompareToggle = async (e: any) => {
    e.stopPropagation();
    if (isInCompare) {
      removeItem(room.id);
    } else {
      setIsAddingToCompare(true);
      try {
        if (items.length >= 2) {
          removeItem(items[0].room.id);
        }
        
        const roomDetail = await getRoomById(room.id);
        
        if (roomDetail) {
          addItem({ room: roomDetail });
        } else {
          console.error('Không thể lấy thông tin chi tiết phòng');
        }
      } catch (error) {
        console.error('Lỗi khi fetch room detail:', error);
      } finally {
        setIsAddingToCompare(false);
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(room)}
      activeOpacity={0.9}
    >
      {/* Left: Image */}
      <View style={styles.imageContainer}>
        <Image
          source={getImageUrl()}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* VIP Badge - Hiển thị nếu là phòng VIP */}
        {(room.isVip || room.postType === 'VIP' || room.postType?.toUpperCase() === 'VIP') && (
          <View style={styles.vipBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vipGradient}
            >
              <Ionicons name="star" size={10} color="#FFFFFF" />
              <Text style={styles.vipText}>VIP</Text>
            </LinearGradient>
          </View>
        )}
        
        {/* Action Buttons Container */}
        <View style={styles.actionButtons}>
          {/* Compare Button */}
          <TouchableOpacity 
            onPress={handleCompareToggle}
            style={[
              styles.compareButton,
              isInCompare && styles.compareButtonSelected
            ]}
            disabled={isAddingToCompare}
          >
            {isAddingToCompare ? (
              <ActivityIndicator size={16} color="white" />
            ) : (
              <Ionicons 
                name={isInCompare ? "checkmark" : "add"} 
                size={16} 
                color="white" 
              />
            )}
          </TouchableOpacity>

          {/* Favorite Button */}
          {onFavoriteToggle && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoritePress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#FFFFFF'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Right: Info */}
      <View style={styles.infoContainer}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {room.title}
        </Text>

        {/* Price - Prominent */}
        <Text style={styles.price}>{formatPrice(room.priceMonth)}/tháng</Text>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="#6B7280" />
          <Text style={styles.location} numberOfLines={1}>
            {room.address?.ward?.district?.name}, {room.address?.ward?.district?.province?.name}
          </Text>
        </View>

        {/* Amenities */}
        <View style={styles.amenitiesRow}>
          <View style={styles.amenityItem}>
            <Ionicons name="resize-outline" size={14} color="#9CA3AF" />
            <Text style={styles.amenityText}>{room.area}m²</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  imageContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  vipBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },

  vipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  vipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    gap: 8,
  },

  compareButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(26, 26, 25, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },

  compareButtonSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },

  favoriteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 4,
  },

  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10B981', // Green
    marginBottom: 6,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },

  location: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },

  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  amenityText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default HorizontalRoomCard;
