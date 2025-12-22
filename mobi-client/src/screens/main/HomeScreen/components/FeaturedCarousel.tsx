import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { RoomInUser } from '../../../../types/types';
import { URL_IMAGE } from '../../../../services/Constant';
import SkeletonLoader from './SkeletonLoader';
import EmptyState from './EmptyState';
import { useCompareStore } from '../../../../stores/CompareStore';
import { useFavoriteStore } from '../../../../stores/FavoriteStore';
import { getRoomById } from '../../../../services/RoomService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

// Shuffle function để random vị trí phòng VIP (công bằng cho mọi người dùng)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface FeaturedCarouselProps {
  rooms: RoomInUser[];
  onRoomPress: (room: RoomInUser) => void;
  onSeeAllPress: () => void;
  onFavoriteToggle?: (roomId: string) => void;
  loading?: boolean;
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  rooms,
  onRoomPress,
  onSeeAllPress,
  onFavoriteToggle,
  loading = false,
}) => {
  // Random thứ tự phòng VIP để công bằng
  const shuffledRooms = useMemo(() => shuffleArray(rooms), [rooms]);
  const getImageUrl = (room: RoomInUser) => {
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

// VIP Room Card Item Component with Compare and Favorite functionality
const VIPRoomCardItem: React.FC<{
  room: RoomInUser;
  onPress: (room: RoomInUser) => void;
  getImageUrl: (room: RoomInUser) => any;
  onFavoriteToggle?: (roomId: string) => void;
}> = ({ room, onPress, getImageUrl, onFavoriteToggle }) => {
  const { items, addItem, removeItem } = useCompareStore();
  const { favoriteRoomIds } = useFavoriteStore();
  const [isAddingToCompare, setIsAddingToCompare] = useState(false);
  const isInCompare = items.some(item => item.room.id === room.id);
  const isFavorite = favoriteRoomIds.has(room.id);

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
      {/* Image */}
      <Image
        source={getImageUrl(room)}
        style={styles.image}
        resizeMode="cover"
      />

      {/* VIP Badge */}
      <View style={styles.vipBadge}>
        <LinearGradient
          colors={['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.vipGradient}
        >
          <Ionicons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.vipText}>VIP</Text>
        </LinearGradient>
      </View>

      {/* Action Buttons */}
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
            onPress={(e) => {
              e.stopPropagation();
              onFavoriteToggle(room.id);
            }}
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

      {/* Info Overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlay}
      >
        <Text style={styles.price}>{formatPrice(room.priceMonth)}/tháng</Text>
        <Text style={styles.roomTitle} numberOfLines={1}>
          {room.title}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.location} numberOfLines={1}>
            {room.address?.ward?.district?.name}, {room.address?.ward?.district?.province?.name}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

  // Show skeleton while loading
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.title}>Nổi bật nhất</Text>
          </View>
        </View>
        <SkeletonLoader type="carousel" count={2} />
      </View>
    );
  }

  // Show empty state if no rooms
  if (rooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.title}>Nổi bật nhất</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="star-outline"
            title="Chưa có phòng VIP"
            message="Hiện tại chưa có phòng VIP nào. Hãy quay lại sau nhé!"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.title}>Nổi bật nhất</Text>
        </View>
        
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      {/* Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {shuffledRooms.map((room, index) => (
          <VIPRoomCardItem 
            key={room.id || index}
            room={room}
            onPress={onRoomPress}
            getImageUrl={getImageUrl}
            onFavoriteToggle={onFavoriteToggle}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },

  emptyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },

  scrollContent: {
    paddingLeft: 20,
    paddingRight: 4,
    gap: 16,
  },

  card: {
    width: CARD_WIDTH,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    // Shadow - reduced to prevent covering content below
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Reduced from 8
    zIndex: 1, // Ensure proper layering
  },

  image: {
    width: '100%',
    height: '100%',
  },

  vipBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },

  vipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  vipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  compareButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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

  actionButtons: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'column',
    gap: 8,
  },

  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    justifyContent: 'flex-end',
  },

  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },

  roomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  location: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
});

export default FeaturedCarousel;
