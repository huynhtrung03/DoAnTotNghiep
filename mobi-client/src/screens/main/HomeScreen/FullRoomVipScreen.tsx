import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoomInUser } from '../../../types/types';
import { getRoomVipUser } from '../../../services/RoomService';
import { addFavorite as addFavoriteAPI, removeFavorite as removeFavoriteAPI } from '../../../services/FavoriteService';
import { URL_IMAGE } from '../../../services/Constant';
import { useFavoriteStore } from '../../../stores/FavoriteStore';
import EmptyState from './components/EmptyState';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

const FullRoomVipScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { favoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();

  const [vipRooms, setVipRooms] = useState<RoomInUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Check if user is guest
  useEffect(() => {
    const checkUserStatus = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setIsGuest(!token);
    };
    checkUserStatus();
  }, []);

  const loadVipRooms = async (page: number = 0, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await getRoomVipUser(page, 10);

      if (response) {
        if (isRefresh || page === 0) {
          setVipRooms(response.data || []);
        } else {
          setVipRooms(prev => [...prev, ...(response.data || [])]);
        }

        setHasMore((response.data || []).length >= 10);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading VIP rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadVipRooms(0);
  }, []);

  const handleRefresh = () => {
    loadVipRooms(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadVipRooms(currentPage + 1);
    }
  };

  const handleRoomPress = (room: RoomInUser) => {
    navigation.navigate('RoomDetail', { roomId: room.id });
  };

  const handleFavoriteToggle = async (roomId: string) => {
    // Check login
    if (isGuest) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để thêm phòng vào danh sách yêu thích',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Đăng nhập', 
            onPress: () => navigation.navigate('Auth/Login')
          }
        ]
      );
      return;
    }

    const isFavorite = favoriteRoomIds.has(roomId);

    try {
      if (isFavorite) {
        // Remove from favorites
        const success = await removeFavoriteAPI(roomId);
        
        if (success) {
          removeFavorite(roomId);
          console.log(`✅ Removed from favorites: ${roomId}`);
        } else {
          Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích');
        }
      } else {
        // Add to favorites
        const success = await addFavoriteAPI(roomId);
        
        if (success) {
          addFavorite(roomId);
          console.log(`✅ Added to favorites: ${roomId}`);
        } else {
          Alert.alert('Lỗi', 'Không thể thêm vào danh sách yêu thích');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  const getImageUrl = (room: RoomInUser) => {
    if (room.images && room.images.length > 0) {
      const imageUrl = room.images[0].url;
      return imageUrl.startsWith('http') 
        ? imageUrl 
        : `${URL_IMAGE}${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
    }
    return 'https://via.placeholder.com/400x300.png?text=No+Image';
  };

  const renderVIPCard = ({ item }: { item: RoomInUser }) => {
    const isFavorite = favoriteRoomIds.has(item.id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => handleRoomPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: getImageUrl(item) }}
            style={styles.image}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.gradientOverlay}
          />

          {/* VIP Badge */}
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

          {/* Favorite Button */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              handleFavoriteToggle(item.id);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>

          {/* Price Tag */}
          <View style={styles.priceTag}>
            <Text style={styles.priceText}>
              {item.priceMonth?.toLocaleString() || 'N/A'}đ/th
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="#6B7280" />
            <Text style={styles.location} numberOfLines={1}>
              {item.address?.ward?.district?.name || 'N/A'}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="resize-outline" size={12} color="#10B981" />
              <Text style={styles.statText}>{item.area}m²</Text>
            </View>
            {item.conveniences && item.conveniences.length > 0 && (
              <View style={styles.stat}>
                <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                <Text style={styles.statText}>{item.conveniences.length}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.titleContainer}>
              <View style={styles.starIcon}>
                <Ionicons name="star" size={18} color="#FFFFFF" />
              </View>
              <Text style={styles.headerTitle}>Phòng VIP Premium</Text>
            </View>

            <View style={styles.placeholder} />
          </View>

          <Text style={styles.subtitle}>
            {vipRooms.length} phòng cao cấp dành cho bạn
          </Text>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FFD700" />
        <Text style={styles.footerText}>Đang tải thêm...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <EmptyState
        icon="star-outline"
        title="Chưa có phòng VIP"
        message="Hiện tại chưa có phòng VIP nào. Vui lòng quay lại sau."
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Đang tải phòng VIP...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={vipRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderVIPCard}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FFD700']}
            tintColor="#FFD700"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  headerContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },

  headerGradient: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  starIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  placeholder: {
    width: 40,
  },

  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },

  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 1.1,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },

  vipBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    borderRadius: 8,
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

  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  priceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  info: {
    padding: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 18,
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },

  location: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  statText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },

  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default FullRoomVipScreen;
