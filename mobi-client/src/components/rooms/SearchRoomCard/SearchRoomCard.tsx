// components/rooms/SearchRoomCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const formatVNDPrice = (price: number) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}tr`;
  }
  return new Intl.NumberFormat('vi-VN').format(price);
};

interface SearchRoomCardProps {
  room: any; // Flexible type for search results
}

export default function SearchRoomCard({ room }: SearchRoomCardProps) {
  const navigation = useNavigation<any>();

  console.log(' SearchRoomCard data:', room);

  // Flexible data extraction with URL_IMAGE support
  let mainMediaUri = room.imageUrl || room.image || room.images?.[0]?.url || '';
  
  // Add Cloudinary base URL if needed
  if (mainMediaUri && !mainMediaUri.startsWith('http')) {
    mainMediaUri = `https://res.cloudinary.com${mainMediaUri}`;
  }
  
  if (!mainMediaUri) {
    mainMediaUri = 'https://via.placeholder.com/400x300.png?text=No+Image';
  }

  const isVIP = room.isVip || room.postType?.toLowerCase().includes('vip');
  const imageCount = room.images?.length || 0;
  
  // Safe address extraction - support both fullAddress string and nested object
  let province = 'N/A';
  let district = 'N/A';
  
  if (room.fullAddress) {
    // Parse fullAddress string: "Ngu Hanh Son, Da Nang, Phường Hoà Quý, Quận Ngũ Hành Sơn, Thành phố Đà Nẵng"
    const parts = room.fullAddress.split(',').map((p: string) => p.trim());
    if (parts.length >= 2) {
      province = parts[parts.length - 1]; // "Thành phố Đà Nẵng"
      district = parts[0]; // "Ngu Hanh Son"
    }
  } else {
    // Fallback to nested structure
    province = room.province || room.address?.ward?.district?.province?.name || room.address?.province || 'N/A';
    district = room.district || room.address?.ward?.district?.name || room.address?.district || 'N/A';
  }
  
  const price = room.priceMonth || room.price || room.roomPrice || 0;
  const area = room.area || 0;
  const conveniences = room.conveniences || [];
  const viewCount = room.viewCount;

  const handleCardPress = () => {
    if (room.id || room.roomId) {
      navigation.navigate('RoomDetail', { roomId: room.id || room.roomId });
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={handleCardPress}
    >
      {/* Image Container with Gradient Overlay */}
      <View style={styles.imageContainer}>
        <ImageBackground 
          source={{ uri: mainMediaUri }} 
          style={styles.image} 
          resizeMode="cover"
        >
          {/* Dark gradient overlay */}
          <View style={styles.gradientOverlay}>
            {/* Top badges and heart */}
            <View style={styles.topRow}>
              <View style={styles.badgesContainer}>
                {isVIP && (
                  <View style={styles.vipBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.vipText}>VIP</Text>
                  </View>
                )}
                {imageCount > 1 && (
                  <View style={styles.imageCountBadge}>
                    <Ionicons name="images" size={12} color="white" />
                    <Text style={styles.imageCountText}>{imageCount}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.heartButton} activeOpacity={0.8}>
                <Ionicons name="heart-outline" size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Bottom location badge */}
            <View style={styles.imageBottomInfo}>
              <View style={styles.locationBadge}>
                <Ionicons name="location" size={14} color="white" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {province}
                </Text>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {room.title || 'Phòng trọ'}
        </Text>

        {/* Address with icon */}
        <View style={styles.addressRow}>
          <MaterialCommunityIcons name="map-marker-outline" size={16} color="#9CA3AF" />
          <Text style={styles.address} numberOfLines={1}>
            {district}
          </Text>
        </View>

        {/* Room specs */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <MaterialCommunityIcons name="ruler-square" size={16} color="#6366F1" />
            <Text style={styles.specText}>{area}m²</Text>
          </View>
          
          {conveniences && conveniences.length > 0 && (
            <>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <MaterialCommunityIcons name="checkbox-marked-circle" size={16} color="#10B981" />
                <Text style={styles.specText}>{conveniences.length} tiện nghi</Text>
              </View>
            </>
          )}
          
          {viewCount !== undefined && (
            <>
              <View style={styles.specDivider} />
              <View style={styles.specItem}>
                <Ionicons name="eye-outline" size={16} color="#F59E0B" />
                <Text style={styles.specText}>{viewCount}</Text>
              </View>
            </>
          )}
        </View>

        {/* Price section */}
        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceAmount}>{formatVNDPrice(price)}</Text>
            <Text style={styles.priceUnit}>/tháng</Text>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>Xem chi tiết</Text>
            <Ionicons name="arrow-forward" size={16} color="#3B82F6" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  
  // Image section
  imageContainer: {
    height: 220,
    backgroundColor: '#E5E7EB',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  
  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  vipText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  imageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  imageCountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  heartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Bottom info
  imageBottomInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    maxWidth: '70%',
  },
  locationText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Content section
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  
  // Specs row
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  specDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 10,
  },
  
  // Price section
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  priceUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  viewButtonText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
});
