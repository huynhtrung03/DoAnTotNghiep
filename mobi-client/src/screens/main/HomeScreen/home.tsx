// screens/home/home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
  Pressable,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  SlideInUp,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import các component và service cần thiết
import { RoomInUser, PaginatedResponse } from '../../../types/types';
import { getRoomNormalUser, getRoomVipUser } from '../../../services/rooms/RoomService';
import { getPublicStatistics, PublicStatistics } from '../../../services/statistics/StatisticsService';
import { getAllFavoriteIds } from '../../../services/favorites/FavoriteService';
import RoomCard from '../../../components/rooms/RoomCard/RoomCard';
import styles from '../../../styles/screens/user/HomeScreen.styles';
import Colors from '../../../styles/colors';
import { useFavoriteStore } from '../../../stores/FavoriteStore';

const { width } = Dimensions.get('window');

// --- Quick Action Button Component ---
const QuickActionButton = ({ 
  icon, 
  label, 
  gradient, 
  onPress 
}: { 
  icon: string; 
  label: string; 
  gradient: [string, string, ...string[]]; 
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View style={[styles.quickActionButton, animatedStyle]}>
        <LinearGradient
          colors={gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quickActionGradient}
        >
          <MaterialCommunityIcons name={icon as any} size={28} color="#FFFFFF" />
        </LinearGradient>
        <Text style={styles.quickActionLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

// --- Stats Card Component ---
const StatsCard = ({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: string; 
  value: string; 
  label: string; 
  color: string;
}) => (
  <Animated.View entering={FadeIn.duration(600)} style={styles.statsCard}>
    <View style={[styles.statsIconContainer, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <View style={styles.statsContent}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  </Animated.View>
);

// --- Section Header Component ---
const SectionHeader = ({ 
  title, 
  subtitle, 
  onViewAll,
  icon 
}: { 
  title: string; 
  subtitle?: string; 
  onViewAll?: () => void;
  icon?: string;
}) => (
  <Animated.View entering={SlideInUp.duration(600).delay(200)} style={styles.sectionHeader}>
    <View style={styles.sectionTitleContainer}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll} style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>Xem tất cả</Text>
        <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
      </TouchableOpacity>
    )}
  </Animated.View>
);

// --- Loading Spinner Component ---
const AnimatedSpinner = () => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1
    );
  }, []);

  return (
    <Animated.View style={animatedStyle}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </Animated.View>
  );
};

// --- Màn hình chính ---
export default function UserHomeScreen() {
  const navigation = useNavigation<any>();
  const { setFavoriteRoomIds } = useFavoriteStore();

  // --- Logic và State được chuyển từ RoomsList (index.tsx) ---
  const [listData, setListData] = useState<any[]>([]);
  const [vipRooms, setVipRooms] = useState<PaginatedResponse<RoomInUser> | null>(null);
  const [normalRooms, setNormalRooms] = useState<PaginatedResponse<RoomInUser> | null>(null);
  const [statistics, setStatistics] = useState<PublicStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vipPage, setVipPage] = useState(0);
  const [normalPage, setNormalPage] = useState(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Reload favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      const reloadFavorites = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            const favoriteIds = await getAllFavoriteIds();
            setFavoriteRoomIds(favoriteIds);
            console.log(`🔄 HomeScreen: Reloaded ${favoriteIds.length} favorites`);
          }
        } catch (error) {
          console.error('❌ Error reloading favorites in HomeScreen:', error);
        }
      };
      reloadFavorites();
    }, [setFavoriteRoomIds])
  );

  // Load user profile avatar
  const loadUserProfile = async () => {
    try {
      const userProfileStr = await AsyncStorage.getItem('userProfile');
      console.log('🔍 userProfileStr:', userProfileStr);
      
      if (userProfileStr) {
        const userProfile = JSON.parse(userProfileStr);
        console.log('🔍 userProfile:', userProfile);
        console.log('🔍 userProfile.avatar:', userProfile.avatar);
        
        if (userProfile.avatar) {
          let avatarUrl = userProfile.avatar;
          // Nếu avatar không có http/https, thêm Cloudinary base URL
          if (!avatarUrl.startsWith('http')) {
            avatarUrl = `https://res.cloudinary.com${avatarUrl}`;
          }
          console.log('✅ Final avatarUrl:', avatarUrl);
          setUserAvatar(avatarUrl);
        } else {
          console.log('❌ No avatar in userProfile');
        }
      } else {
        console.log('❌ No userProfile in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    }
  };

  // Load public statistics
  const loadStatistics = async () => {
    try {
      const stats = await getPublicStatistics();
      console.log('📊 Public statistics loaded:', stats);
      setStatistics(stats);
    } catch (error) {
      console.error('❌ Error loading statistics:', error);
    }
  };

  // Hàm tải dữ liệu
  const loadRooms = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      if (isRefresh) {
        setVipPage(0);
        setNormalPage(0);
      }
      const vipResponse = await getRoomVipUser(0, 5); // Tải 5 phòng VIP
      const normalResponse = await getRoomNormalUser(0, 6); // Tải 6 phòng thường

      setVipRooms(vipResponse);
      setNormalRooms(normalResponse);

      // Reload statistics on refresh
      if (isRefresh) {
        await loadStatistics();
      }

    } catch (error) {
      console.error('Error loading rooms:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tải thêm phòng thường (infinite scroll)
  const loadMoreNormalRooms = async () => {
    // Kiểm tra điều kiện: không tải nếu không có dữ liệu, hết trang, hoặc đang loading
    if (!normalRooms || normalPage + 1 >= normalRooms.totalPages || loading) return;
    
    try {
      const nextPage = normalPage + 1;
      const response = await getRoomNormalUser(nextPage, 6);
      
      // Kiểm tra nếu API trả về dữ liệu thành công
      if (response) {
        setNormalRooms((previousRooms) => {
          // Nếu có dữ liệu cũ, merge với dữ liệu mới
          if (previousRooms) {
            return {
              ...response, // Giữ lại các field: page, size, totalPages, totalElements, totalRecords
              data: [
                ...previousRooms.data, // Giữ lại các phòng đã tải trước đó
                ...response.data        // Thêm các phòng mới từ API
              ]
            };
          }
          // Nếu không có dữ liệu cũ (trường hợp hiếm), dùng response mới
          return response;
        });
        
        // Cập nhật số trang hiện tại
        setNormalPage(nextPage);
      }
    } catch (error) {
      console.error('Error loading more normal rooms:', error);
    }
  };
  
  // Chạy lần đầu
  useEffect(() => {
    loadRooms();
    loadUserProfile();
    loadStatistics();
  }, []);

  // Xây dựng lại mảng dữ liệu cho FlatList mỗi khi vipRooms hoặc normalRooms thay đổi
  useEffect(() => {
    const data: any[] = [];
    
    // Search bar
    data.push({ type: 'SEARCH_BAR' });
    
    // Quick actions
    data.push({ type: 'QUICK_ACTIONS' });
    
    // Stats
    data.push({ type: 'STATS' });
    
    // VIP rooms
    if (vipRooms && vipRooms.data.length > 0) {
      data.push({ type: 'VIP_HEADER' });
      data.push({ type: 'VIP_LIST', rooms: vipRooms.data });
    }
    
    // Normal rooms
    if (normalRooms && normalRooms.data.length > 0) {
      data.push({ type: 'NORMAL_HEADER' });
      normalRooms.data.forEach(room => data.push({ type: 'NORMAL_ROOM', room }));
    }
    
    setListData(data);
  }, [vipRooms, normalRooms]);

  const onRefresh = useCallback(() => {
    loadRooms(true);
  }, []);

  // --- Hàm render cho FlatList ---
  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'SEARCH_BAR':
        return (
          <Animated.View entering={FadeIn.duration(600)} style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color={Colors.textTertiary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm phòng trọ theo khu vực..."
                placeholderTextColor={Colors.textTertiary}
                onFocus={() => navigation.navigate('Search')}
              />
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="options-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
      
      case 'QUICK_ACTIONS':
        return (
          <Animated.View entering={SlideInUp.duration(600).delay(200)} style={styles.quickActionsContainer}>
            <QuickActionButton 
              icon="map-marker-radius" 
              label="Gần tôi"
              gradient={Colors.gradients.purple}
              onPress={() => Alert.alert("Gần tôi", "Đang phát triển")}
            />
            <QuickActionButton 
              icon="fire" 
              label="Phổ biến"
              gradient={Colors.gradients.pink}
              onPress={() => Alert.alert("Phổ biến", "Đang phát triển")}
            />
            <QuickActionButton 
              icon="cash" 
              label="Giá rẻ"
              gradient={Colors.gradients.blue}
              onPress={() => Alert.alert("Giá rẻ", "Đang phát triển")}
            />
            <QuickActionButton 
              icon="star" 
              label="Cao cấp"
              gradient={Colors.gradients.orange}
              onPress={() => Alert.alert("Cao cấp", "Đang phát triển")}
            />
          </Animated.View>
        );
      
      case 'STATS':
        return (
          <View style={styles.statsContainer}>
            <StatsCard 
              icon="home" 
              value={statistics?.totalRooms?.toString() || normalRooms?.totalElements?.toString() || '0'}
              label="Phòng trống"
              color={Colors.primary}
            />
            <StatsCard 
              icon="star" 
              value={statistics?.vipRooms?.toString() || vipRooms?.totalElements?.toString() || '0'}
              label="Phòng VIP"
              color={Colors.accent}
            />
            <StatsCard 
              icon="people" 
              value={statistics?.totalUsers?.toString() || '0'}
              label="Người dùng"
              color={Colors.secondary}
            />
          </View>
        );
      
      case 'VIP_HEADER':
        return (
          <SectionHeader
            title="Phòng VIP Nổi Bật"
            subtitle="Những lựa chọn cao cấp, đầy đủ tiện nghi"
            onViewAll={() => Alert.alert("Xem tất cả VIP")}
          />
        );
      
      case 'VIP_LIST':
        return (
          <Animated.View entering={SlideInLeft.duration(800).delay(400)}>
            <FlatList
              data={item.rooms}
              renderItem={({ item: roomItem }: { item: RoomInUser }) => (
                <Animated.View 
                  entering={FadeIn.duration(600).delay(600)}
                  style={{ width: width * 0.85 }}
                >
                  <RoomCard room={roomItem} />
                </Animated.View>
              )}
              keyExtractor={(room) => `vip-${room.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </Animated.View>
        );
      
      case 'NORMAL_HEADER':
        return (
          <SectionHeader
            title="Khám Phá Thêm"
            subtitle="Các phòng trọ chất lượng khác"
            onViewAll={() => Alert.alert("Xem tất cả")}
          />
        );
      
      case 'NORMAL_ROOM':
        return (
          <Animated.View entering={SlideInUp.duration(600)}>
            <RoomCard room={item.room} />
          </Animated.View>
        );
      
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View entering={FadeIn.duration(600)}>
          <AnimatedSpinner />
        </Animated.View>
      </View>
    );
  }

  // --- Các hàm xử lý sự kiện ---
  const handleNotifications = () => navigation.navigate('Notifications');
  const handleUserProfile = () => navigation.navigate('User');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.backgroundLight} />
      
      {/* Modern Header */}
      <LinearGradient
        colors={[Colors.backgroundLight, Colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.header}
      >
        <Animated.View entering={FadeIn.duration(800)} style={styles.headerContent}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>Ants Room</Text>
            <Text style={styles.greetingSubtext}>Tìm phòng trọ yêu thích của bạn</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleNotifications} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUserProfile} style={styles.iconButton}>
              {userAvatar ? (
                <Image 
                  source={{ uri: userAvatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={28} color={Colors.iconPrimary} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Main Content */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.type + index}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="home-outline" size={64} color={Colors.borderDark} />
            <Text style={styles.emptyTitle}>Không có phòng nào</Text>
            <Text style={styles.emptySubtitle}>Vui lòng thử lại sau</Text>
          </View>
        }
        onEndReached={loadMoreNormalRooms}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
