import React from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomInUser } from '../types';
import { styles } from '../styles';
import Colors from '../../../../styles/colors';
import { URL_IMAGE } from '../../../../services/config/Constant';

interface RoomCardProps {
  room: RoomInUser;
  onPress: (room: RoomInUser) => void;
  onFavoriteToggle: (roomId: string) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, onPress, onFavoriteToggle }) => {
  // ===== FORMAT HELPERS =====
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const formatArea = (area: number) => {
    return `${area}m²`;
  };

  // ===== GET IMAGE URL =====
  const getImageUrl = () => {
    if (room.images && room.images.length > 0) {
      const imageUrl = room.images[0].url;
      // Nếu URL đã có http/https, dùng trực tiếp
      if (imageUrl.startsWith('http')) {
        return { uri: imageUrl };
      }
      // Nếu chưa có, thêm Cloudinary base URL
      return { uri: `${URL_IMAGE}${imageUrl}` };
    }
    if (room.mainImage) {
      const mainImageUrl = room.mainImage;
      if (mainImageUrl.startsWith('http')) {
        return { uri: mainImageUrl };
      }
      return { uri: `${URL_IMAGE}${mainImageUrl}` };
    }
    // Fallback to default image
    return require('../../../../../assets/images/default/room.png');
  };

  // ===== FORMAT ADDRESS =====
  const getAddress = () => {
    if (!room.address) return 'Địa chỉ chưa cập nhật';
    const { street, ward } = room.address;
    const district = ward.district.name;
    const province = ward.district.province.name;
    return `${street}, ${ward.name}, ${district}, ${province}`;
  };

  // ===== HANDLE FAVORITE =====
  const handleFavoritePress = () => {
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
      style={[styles.card, room.isVip && styles.cardVip]}
      onPress={() => onPress(room)}
      activeOpacity={0.7}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={getImageUrl()} style={styles.roomImage} resizeMode="cover" />

        {/* VIP Badge */}
        {room.isVip && (
          <View style={styles.vipBadge}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.vipText}>VIP</Text>
          </View>
        )}

        {/* Favorite Button */}
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
          <Ionicons name="heart" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Title */}
        <Text style={styles.cardTitle} numberOfLines={2}>
          {room.title}
        </Text>

        {/* Details */}
        <View style={styles.cardDetails}>
          {/* Address */}
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color={Colors.textSecondary} style={styles.detailIcon} />
            <Text style={styles.detailText} numberOfLines={1}>
              {getAddress()}
            </Text>
          </View>

          {/* Area */}
          <View style={styles.detailRow}>
            <Ionicons name="resize-outline" size={16} color={Colors.textSecondary} style={styles.detailIcon} />
            <Text style={styles.detailText}>Diện tích: {formatArea(room.area)}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Giá thuê:</Text>
            <Text style={styles.priceValue}>{formatPrice(room.priceMonth)} VNĐ</Text>
          </View>
        </View>

        {/* View Detail Button */}
        <TouchableOpacity style={styles.viewButton} onPress={() => onPress(room)}>
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default RoomCard;
