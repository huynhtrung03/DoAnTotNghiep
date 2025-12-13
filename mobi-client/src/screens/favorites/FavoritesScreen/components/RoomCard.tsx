import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomInUser } from '../types';
import Colors from '../../../../colors/colors';
import { URL_IMAGE } from '../../../../services/Constant';

interface RoomCardProps {
  room: RoomInUser;
  onPress: (room: RoomInUser) => void;
  onFavoriteToggle: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onPress, onFavoriteToggle }) => {
  // ===== FORMAT HELPERS =====
  const formatPrice = (price: number) => {
    // Format: 3.500.000₫
    return `${price.toLocaleString('vi-VN')}₫`;
  };

  const formatArea = (area: number) => {
    return `${area}m²`;
  };

  // ===== GET IMAGE URL =====
  const getImageUrl = () => {
    if (room.images && room.images.length > 0) {
      const imageUrl = room.images[0].url;
      if (imageUrl.startsWith('http')) {
        return { uri: imageUrl };
      }
      return { uri: `${URL_IMAGE}${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}` };
    }
    if (room.mainImage) {
      const mainImageUrl = room.mainImage;
      if (mainImageUrl.startsWith('http')) {
        return { uri: mainImageUrl };
      }
      return { uri: `${URL_IMAGE}${mainImageUrl.startsWith('/') ? mainImageUrl.slice(1) : mainImageUrl}` };
    }
    return require('../../../../../assets/images/default/room.png');
  };

  // ===== FORMAT ADDRESS =====
  const getShortAddress = () => {
    if (!room.address) return 'Địa chỉ chưa cập nhật';
    const district = room.address.ward?.district?.name || '';
    const province = room.address.ward?.district?.province?.name || '';
    return `${district}, ${province}`;
  };

  // ===== HANDLE FAVORITE =====
  const handleFavoritePress = (e: any) => {
    e.stopPropagation(); // Prevent card press
    Alert.alert(
      'Xóa khỏi yêu thích',
      `Bạn có chắc muốn xóa "${room.title}" khỏi danh sách yêu thích?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onFavoriteToggle(room.id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        minimalStyles.card,
        room.isVip && minimalStyles.cardVip
      ]}
      onPress={() => onPress(room)}
      activeOpacity={0.9}
    >
      {/* Image Wrapper - 16:9 ratio */}
      <View style={minimalStyles.imageWrapper}>
        <Image 
          source={getImageUrl()} 
          style={minimalStyles.coverImage} 
          resizeMode="cover" 
        />

        {/* Heart Button Overlay */}
        <TouchableOpacity 
          style={minimalStyles.heartBtnOverlay} 
          onPress={handleFavoritePress}
          activeOpacity={0.7}
        >
          <View style={minimalStyles.heartBackground}>
            <Ionicons name="heart" size={20} color="#EF4444" />
          </View>
        </TouchableOpacity>

        {/* VIP Tag - Minimal */}
        {room.isVip && (
          <View style={minimalStyles.miniVipTag}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={minimalStyles.vipTagText}>VIP</Text>
          </View>
        )}
      </View>

      {/* Info Wrapper - Compact */}
      <View style={minimalStyles.infoWrapper}>
        {/* Row 1: Price & Area */}
        <View style={minimalStyles.rowBetween}>
          <Text style={minimalStyles.priceText} numberOfLines={1}>
            {formatPrice(room.priceMonth)}
          </Text>
          <Text style={minimalStyles.areaText}>
            {formatArea(room.area)}
          </Text>
        </View>

        {/* Row 2: Title */}
        <Text style={minimalStyles.titleText} numberOfLines={1}>
          {room.title}
        </Text>

        {/* Row 3: Address */}
        <View style={minimalStyles.addressRow}>
          <Ionicons name="location" size={14} color="#9CA3AF" />
          <Text style={minimalStyles.addressText} numberOfLines={1}>
            {getShortAddress()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ===== MINIMAL STYLES =====
const minimalStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardVip: {
    // VIP: Thin gold border
    borderWidth: 1.5,
    borderColor: '#FFD700',
  },

  // Image - 16:9 ratio
  imageWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },

  // Heart button
  heartBtnOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  heartBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // VIP tag
  miniVipTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vipTagText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Info section
  infoWrapper: {
    padding: 12,
    gap: 6,
  },

  // Row 1: Price & Area
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981', // Green
    flex: 1,
  },
  areaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 8,
  },

  // Row 2: Title
  titleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 20,
  },

  // Row 3: Address
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
});

export default RoomCard;
