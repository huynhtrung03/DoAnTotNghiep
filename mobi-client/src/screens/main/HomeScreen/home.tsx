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
  Modal,
  ScrollView,
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
import { getRoomNormalUser, getRoomVipUser, getRoomsInMap, filterRooms } from '../../../services/rooms/RoomService';
import { getPublicStatistics, PublicStatistics } from '../../../services/statistics/StatisticsService';
import { getAllFavoriteIds } from '../../../services/favorites/FavoriteService';
import { getNotificationsForUser } from '../../../services/statistics/NotificationService';
import RoomCard from '../../../components/rooms/RoomCard/RoomCard';
import styles from '../../../styles/screens/user/HomeScreen.styles';
import Colors from '../../../styles/colors';
import { useFavoriteStore } from '../../../stores/FavoriteStore';
import { useSearchLocation } from '../../../hooks/useSearchLocation';

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

// --- Filtered Rooms List Component ---
const FilteredRoomsList = ({ rooms, onClose, title }: { rooms: RoomInUser[]; onClose: () => void; title?: string }) => (
  <View style={styles.filteredResultsContainer}>
    <View style={styles.filteredResultsHeader}>
      <View style={styles.filteredResultsTitleContainer}>
        <Ionicons name="location" size={20} color={Colors.primary} />
        <Text style={styles.filteredResultsTitle}>
          {title || 'Phòng gần bạn'} ({rooms.length})
        </Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeFilteredButton}>
        <Ionicons name="close" size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    </View>

    <FlatList
      data={rooms}
      renderItem={({ item: room }) => (
        <Animated.View entering={FadeIn.duration(400)}>
          <RoomCard room={room} />
        </Animated.View>
      )}
      keyExtractor={(room) => `filtered-${room.id}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.filteredRoomsList}
    />
  </View>
);

// --- Filter Modal Component ---
const FilterModal = ({
  visible,
  filterType,
  selectedFilters,
  onFiltersChange,
  onClose,
  onApply,
}: {
  visible: boolean;
  filterType: 'nearby' | 'popular' | 'cheap' | 'premium' | null;
  selectedFilters: any;
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
  onApply: () => void;
}) => {
  const getFilterTitle = () => {
    switch (filterType) {
      case 'nearby': return 'Phòng gần tôi';
      case 'popular': return 'Phòng phổ biến';
      case 'cheap': return 'Phòng giá rẻ';
      case 'premium': return 'Phòng cao cấp';
      default: return 'Bộ lọc';
    }
  };

  const getFilterOptions = () => {
    switch (filterType) {
      case 'nearby':
        return {
          distances: ['1km', '3km', '5km', '10km'],
          sortOptions: ['Khoảng cách', 'Giá tăng dần', 'Lượt xem'],
        };
      case 'popular':
        return {
          timeRanges: ['Hôm nay', 'Tuần này', 'Tháng này', 'Năm này'],
          sortOptions: ['Lượt xem', 'Đặt phòng', 'Đánh giá'],
        };
      case 'cheap':
        return {
          priceRanges: ['<1tr', '1-2tr', '2-3tr', '3-5tr'],
          sortOptions: ['Giá tăng dần', 'Diện tích', 'Mới nhất'],
        };
      case 'premium':
        return {
          amenities: ['Wifi', 'Bãi đậu xe', 'Bảo vệ', 'Điều hòa', 'Bếp'],
          priceRanges: ['5-10tr', '10-20tr', '20tr+'],
          sortOptions: ['Giá giảm dần', 'Đánh giá', 'Mới nhất'],
        };
      default:
        return {};
    }
  };

  const options = getFilterOptions();

  const toggleSelection = (category: string, value: string) => {
    const current = selectedFilters[category] || [];
    const updated = current.includes(value)
      ? current.filter((item: string) => item !== value)
      : [...current, value];
    onFiltersChange({ ...selectedFilters, [category]: updated });
  };

  const selectSingle = (category: string, value: string) => {
    onFiltersChange({ ...selectedFilters, [category]: value });
  };

  const renderOptionGroup = (title: string, items: string[], category: string, multiSelect = true) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterGroupTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {items.map((item) => {
          const isSelected = multiSelect
            ? (selectedFilters[category] || []).includes(item)
            : selectedFilters[category] === item;

          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterOption,
                isSelected && styles.filterOptionSelected
              ]}
              onPress={() => multiSelect ? toggleSelection(category, item) : selectSingle(category, item)}
            >
              <Text style={[
                styles.filterOptionText,
                isSelected && styles.filterOptionTextSelected
              ]}>
                {item}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color={Colors.primary} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getFilterTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {filterType === 'nearby' && options.distances && options.sortOptions && (
              <>
                {renderOptionGroup('Khoảng cách (km)', options.distances, 'distance', false)}
                {renderOptionGroup('Sắp xếp theo', options.sortOptions, 'sortBy', false)}
              </>
            )}

            {filterType === 'popular' && options.timeRanges && options.sortOptions && (
              <>
                {renderOptionGroup('Thời gian', options.timeRanges, 'timeRange', false)}
                {renderOptionGroup('Sắp xếp theo', options.sortOptions, 'sortBy', false)}
              </>
            )}

            {filterType === 'cheap' && options.priceRanges && options.sortOptions && (
              <>
                {renderOptionGroup('Khoảng giá', options.priceRanges, 'priceRange', false)}
                {renderOptionGroup('Sắp xếp theo', options.sortOptions, 'sortBy', false)}
              </>
            )}

            {filterType === 'premium' && options.amenities && options.priceRanges && options.sortOptions && (
              <>
                {renderOptionGroup('Tiện nghi', options.amenities, 'amenities')}
                {renderOptionGroup('Khoảng giá', options.priceRanges, 'priceRange')}
                {renderOptionGroup('Sắp xếp theo', options.sortOptions, 'sortBy', false)}
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onApply}
            >
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// --- Màn hình chính ---
export default function UserHomeScreen() {
  const navigation = useNavigation<any>();
  const { setFavoriteRoomIds } = useFavoriteStore();

  // ✅ Sử dụng custom hook để lấy userLocation
  const { userLocation } = useSearchLocation();

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
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal và bộ lọc states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilterType, setCurrentFilterType] = useState<'nearby' | 'popular' | 'cheap' | 'premium' | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    priceRange: '' as string,
    roomType: [] as string[],
    amenities: [] as string[],
    distance: '5' as string,
    sortBy: 'newest' as string,
    timeRange: 'Tháng này' as string,
  });

  // Nearby search results
  const [nearbyRooms, setNearbyRooms] = useState<RoomInUser[] | null>(null);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [showNearbyResults, setShowNearbyResults] = useState(false);

  // Popular rooms results
  const [popularRooms, setPopularRooms] = useState<RoomInUser[] | null>(null);
  const [popularLoading, setPopularLoading] = useState(false);
  const [showPopularResults, setShowPopularResults] = useState(false);

  // Cheap rooms results
  const [cheapRooms, setCheapRooms] = useState<RoomInUser[] | null>(null);
  const [cheapLoading, setCheapLoading] = useState(false);
  const [showCheapResults, setShowCheapResults] = useState(false);

  // Reload favorites when screen is focused
  useFocusEffect(
    useCallback(() => {
      const reloadFavorites = async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          if (token) {
            const favoriteIds = await getAllFavoriteIds();
            setFavoriteRoomIds(favoriteIds);
            //console.log(`🔄 HomeScreen: Reloaded ${favoriteIds.length} favorites`);
          }
        } catch (error) {
          console.error('❌ Error reloading favorites in HomeScreen:', error);
        }
      };
      reloadFavorites();
      loadUnreadCount(); // Load unread notifications when screen is focused
    }, [setFavoriteRoomIds])
  );

  // Load user profile avatar
  const loadUserProfile = async () => {
    try {
      const userProfileStr = await AsyncStorage.getItem('userProfile');
      //console.log('🔍 userProfileStr:', userProfileStr);
      
      if (userProfileStr) {
        const userProfile = JSON.parse(userProfileStr);
        //console.log('🔍 userProfile:', userProfile);
        //console.log('🔍 userProfile.avatar:', userProfile.avatar);
        
        if (userProfile.avatar) {
          let avatarUrl = userProfile.avatar;
          // Nếu avatar không có http/https, thêm Cloudinary base URL
          if (!avatarUrl.startsWith('http')) {
            avatarUrl = `https://res.cloudinary.com${avatarUrl}`;
          }
          //console.log('✅ Final avatarUrl:', avatarUrl);
          setUserAvatar(avatarUrl);
        } else {
          //console.log('❌ No avatar in userProfile');
        }
      } else {
        //console.log('❌ No userProfile in AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    }
  };

  // Load unread notifications count
  const loadUnreadCount = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const notifications = await getNotificationsForUser(userData.id);
        const unread = notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('❌ Error loading unread count:', error);
    }
  };

  // Load public statistics
  const loadStatistics = async () => {
    try {
      const stats = await getPublicStatistics();
      //console.log('📊 Public statistics loaded:', stats);
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
    loadUnreadCount();
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
              onPress={() => openFilterModal('nearby')}
            />
            <QuickActionButton 
              icon="fire" 
              label="Phổ biến"
              gradient={Colors.gradients.pink}
              onPress={() => openFilterModal('popular')}
            />
            <QuickActionButton 
              icon="cash" 
              label="Giá rẻ"
              gradient={Colors.gradients.blue}
              onPress={() => openFilterModal('cheap')}
            />
            <QuickActionButton 
              icon="star" 
              label="Cao cấp"
              gradient={Colors.gradients.orange}
              onPress={() => openFilterModal('premium')}
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
          <ActivityIndicator size="large" color={Colors.primary} />
        </Animated.View>
      </View>
    );
  }

  // --- Các hàm xử lý sự kiện ---
  const handleNotifications = () => navigation.navigate('Notifications');
  const handleUserProfile = () => navigation.navigate('User');

  // Filter modal handlers
  const openFilterModal = (filterType: 'nearby' | 'popular' | 'cheap' | 'premium') => {
    // Reset previous results when opening new filter
    setShowNearbyResults(false);
    setShowPopularResults(false);
    setShowCheapResults(false);
    setNearbyRooms(null);
    setPopularRooms(null);
    setCheapRooms(null);
    
    setCurrentFilterType(filterType);
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
    setCurrentFilterType(null);
    // Reset loading states when closing modal
    setNearbyLoading(false);
    setPopularLoading(false);
    setCheapLoading(false);
  };

  const applyFilters = async () => {
    if (currentFilterType === 'nearby') {
      // Handle nearby search directly on Home screen
      await searchNearbyRooms();
    } else if (currentFilterType === 'popular') {
      // Handle popular rooms search directly on Home screen
      await searchPopularRooms();
    } else if (currentFilterType === 'cheap') {
      // Handle cheap rooms search directly on Home screen
      await searchCheapRooms();
    } else {
      // Navigate to Search screen with applied filters for other types
      navigation.navigate('Search', {
        appliedFilters: selectedFilters,
        filterType: currentFilterType,
      });
    }
    closeFilterModal();
  };

  const searchNearbyRooms = async () => {
    if (!userLocation) {
      Alert.alert('Lỗi', 'Không thể xác định vị trí của bạn. Vui lòng bật GPS.');
      return;
    }

    setNearbyLoading(true);
    try {
      // Log các thông tin được chọn từ popup
      //console.log('🔍 Nearby Search Filters:', {
      //   distance: selectedFilters.distance,
      //   sortBy: selectedFilters.sortBy,
      //   userLocation: {
      //     latitude: userLocation.latitude,
      //     longitude: userLocation.longitude
      //   }
      // }
    // );

      const radius = parseInt(selectedFilters.distance) * 1000; // Convert km to meters
      //console.log(`📍 Searching rooms within ${selectedFilters.distance}km (${radius}m) radius`);

      const rooms = await getRoomsInMap(
        userLocation.latitude,
        userLocation.longitude,
        radius
      );

      if (rooms) {
    

        // Sắp xếp danh sách phòng dựa trên thông tin được chọn trong popup
        let sortedRooms = [...rooms];
        
        //console.log(`🔄 Applying sort: "${selectedFilters.sortBy}" to ${rooms.length} rooms`);
        
        switch (selectedFilters.sortBy) {
          case 'Khoảng cách':
            // API đã sắp xếp theo khoảng cách, giữ nguyên thứ tự
            //console.log('📊 Sort by distance: Keeping API order (already sorted by proximity)');
            break;
            
          case 'Giá tăng dần':
            sortedRooms.sort((a, b) => {
              const priceA = a.priceMonth || 0;
              const priceB = b.priceMonth || 0;
              return priceA - priceB;
            });
            //console.log(`📊 Sort by price ascending: ${sortedRooms.slice(0, 3).map(r => `${r.priceMonth}tr`).join(', ')}...`);
            break;
            
          case 'Lượt xem':
            sortedRooms.sort((a, b) => {
              const viewsA = a.viewCount || 0;
              const viewsB = b.viewCount || 0;
              return viewsB - viewsA; // Descending order
            });
            //console.log(`📊 Sort by view count descending: ${sortedRooms.slice(0, 3).map(r => `${r.viewCount || 0} views`).join(', ')}...`);
            break;
            
          default:
            //console.log('📊 No sorting applied - using default order');
        }

        // Log kết quả sau khi sắp xếp
        //console.log(`✅ Final sorted results (${sortedRooms.length} rooms):`, {
        //  s

        setNearbyRooms(sortedRooms);
        setShowNearbyResults(true);
        //console.log(`✅ Displayed ${sortedRooms.length} sorted nearby rooms`);
      } else {
        //console.log('❌ No rooms found nearby');
        Alert.alert('Thông báo', 'Không tìm thấy phòng nào gần vị trí của bạn.');
      }
    } catch (error) {
      console.error('❌ Error searching nearby rooms:', error);
      Alert.alert('Lỗi', 'Không thể tìm phòng gần đây. Vui lòng thử lại.');
    } finally {
      setNearbyLoading(false);
    }
  };

  const searchPopularRooms = async () => {
    setPopularLoading(true);
    try {
      // Build filter object - không filter thời gian ở server, sẽ filter client-side
      const filters: Record<string, any> = {};
      const now = new Date();

      // Log các thông tin được chọn từ popup
      //console.log('🔥 Popular Rooms Filters:', {
      //   timeRange: selectedFilters.timeRange,
      //   sortBy: selectedFilters.sortBy,
      //   currentDate: now.toISOString().split('T')[0]
      // });

      //console.log('📅 Applied time filter object:', filters);

      // Gọi API filter-rooms để lấy tất cả phòng
      const response = await filterRooms(0, 100, filters); // Lấy nhiều phòng để có đủ dữ liệu lọc

      if (response && response.data) {
        //console.log(`✅ Found ${response.data.length} rooms from filter API`);

        // Filter client-side dựa trên postStartDate và timeRange được chọn
        let filteredRooms = [...response.data];

        //console.log(`🔄 Applying client-side time filter: "${selectedFilters.timeRange}" to ${filteredRooms.length} rooms`);

        // Tính toán khoảng thời gian dựa trên timeRange
        let timeThreshold: Date | null = null;

        switch (selectedFilters.timeRange) {
          case 'Hôm nay':
            timeThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            //console.log(`📅 Filtering rooms created from: ${timeThreshold.toISOString().split('T')[0]} (today)`);
            break;
          case 'Tuần này':
            timeThreshold = new Date(now);
            timeThreshold.setDate(now.getDate() - now.getDay()); // Chủ nhật tuần này
            //console.log(`📅 Filtering rooms created from: ${timeThreshold.toISOString().split('T')[0]} (start of this week)`);
            break;
          case 'Tháng này':
            timeThreshold = new Date(now.getFullYear(), now.getMonth(), 1); // Ngày 1 tháng này
            //console.log(`📅 Filtering rooms created from: ${timeThreshold.toISOString().split('T')[0]} (start of this month)`);
            break;
          case 'Năm này':
            timeThreshold = new Date(now.getFullYear(), 0, 1); // Ngày 1 tháng 1 năm này
            //console.log(`📅 Filtering rooms created from: ${timeThreshold.toISOString().split('T')[0]} (start of this year)`);
            break;
          default:
            //console.log(`📅 No time filtering applied for: ${selectedFilters.timeRange}`);
            break;
        }

        // Áp dụng filter thời gian nếu có timeThreshold
        if (timeThreshold) {
          const beforeFilter = filteredRooms.length;
          filteredRooms = filteredRooms.filter(room => {
            const postStartDate = (room as any).postStartDate;
            if (!postStartDate) return false;
            
            // Parse postStartDate (ISO string) thành Date object
            const roomDate = new Date(postStartDate);
            return roomDate >= timeThreshold!;
          });
          
          //console.log(`✅ After time filtering: ${filteredRooms.length} rooms (filtered from ${beforeFilter})`);
        }

        // Sau đó sắp xếp dựa trên sortBy
        //console.log(`🔄 Applying sort: "${selectedFilters.sortBy}" to ${filteredRooms.length} rooms`);

        switch (selectedFilters.sortBy) {
          case 'Lượt xem':
            filteredRooms.sort((a, b) => {
              const viewsA = a.viewCount || 0;
              const viewsB = b.viewCount || 0;
              return viewsB - viewsA; // Descending order
            });
            //console.log(`📊 Sort by view count: ${filteredRooms.slice(0, 3).map(r => `${r.viewCount || 0} views`).join(', ')}...`);
            break;

          case 'Đặt phòng':
            // Giả sử có bookingCount, nếu không có thì dùng viewCount làm alternative
            filteredRooms.sort((a, b) => {
              const bookingsA = (a as any).bookingCount || a.viewCount || 0;
              const bookingsB = (b as any).bookingCount || b.viewCount || 0;
              return bookingsB - bookingsA; // Descending order
            });
            //console.log(`📊 Sort by bookings: ${filteredRooms.slice(0, 3).map(r => `${(r as any).bookingCount || r.viewCount || 0} bookings`).join(', ')}...`);
            break;

          case 'Đánh giá':
            // Sắp xếp theo rating nếu có, hoặc viewCount làm alternative
            filteredRooms.sort((a, b) => {
              const ratingA = (a as any).rating || a.viewCount || 0;
              const ratingB = (b as any).rating || b.viewCount || 0;
              return ratingB - ratingA; // Descending order
            });
            //console.log(`📊 Sort by rating: ${filteredRooms.slice(0, 3).map(r => `${(r as any).rating || r.viewCount || 0} rating`).join(', ')}...`);
            break;

          default:
            //console.log('📊 No sorting applied - using default order');
        }

        // Lấy top 20 phòng phổ biến nhất
        const topRooms = filteredRooms.slice(0, 20);

        //console.log(`✅ After client-side filtering and sorting: ${topRooms.length} top rooms (from ${filteredRooms.length} time-filtered rooms)`);

        //console.log(`✅ Final popular results (${topRooms.length} rooms):`, {
        //   timeRange: selectedFilters.timeRange,
        //   sortBy: selectedFilters.sortBy,
        //   firstRoom: topRooms[0] ? {
        //     id: topRooms[0].id,
        //     title: topRooms[0].title,
        //     views: topRooms[0].viewCount,
        //     postStartDate: (topRooms[0] as any).postStartDate
        //   } : null,
        //   totalRooms: topRooms.length
        // });

        setPopularRooms(topRooms);
        setShowPopularResults(true);
        //console.log(`✅ Displayed ${topRooms.length} popular rooms`);
      } else {
        //console.log('❌ No rooms found for popular filter');
        Alert.alert('Thông báo', 'Không tìm thấy phòng phổ biến nào.');
      }
    } catch (error) {
      console.error('❌ Error searching popular rooms:', error);
      Alert.alert('Lỗi', 'Không thể tìm phòng phổ biến. Vui lòng thử lại.');
    } finally {
      setPopularLoading(false);
    }
  };

  const searchCheapRooms = async () => {
    setCheapLoading(true);
    try {
    //   // Log các thông tin được chọn từ popup
    //   //console.log('💰 Cheap Rooms Filters:', {
    //     priceRange: selectedFilters.priceRange,
    //     sortBy: selectedFilters.sortBy,
    //   });

      // Gọi API filter-rooms để lấy tất cả phòng
      const response = await filterRooms(0, 100, {}); // Lấy nhiều phòng để có đủ dữ liệu lọc

      if (response && response.data) {
        //console.log(`✅ Found ${response.data.length} rooms from filter API`);

        // Filter client-side dựa trên priceRange được chọn
        let filteredRooms = [...response.data];

        //console.log(`🔄 Applying client-side price filter: "${selectedFilters.priceRange}" to ${filteredRooms.length} rooms`);

        // Áp dụng filter giá dựa trên priceRange
        if (selectedFilters.priceRange) {
          const beforeFilter = filteredRooms.length;
          filteredRooms = filteredRooms.filter(room => {
            const price = room.priceMonth || 0;
            let matches = false;

            const range = selectedFilters.priceRange;
            switch (range) {
              case '<1tr':
                if (price < 1000000) matches = true;
                break;
              case '1-2tr':
                if (price >= 1000000 && price < 2000000) matches = true;
                break;
              case '2-3tr':
                if (price >= 2000000 && price < 3000000) matches = true;
                break;
              case '3-5tr':
                if (price >= 3000000 && price < 5000000) matches = true;
                break;
              default:
                break;
            }

            return matches;
          });

          //console.log(`✅ After price filtering: ${filteredRooms.length} rooms (filtered from ${beforeFilter})`);
        }

        // Sau đó sắp xếp dựa trên sortBy
        //console.log(`🔄 Applying sort: "${selectedFilters.sortBy}" to ${filteredRooms.length} rooms`);

        switch (selectedFilters.sortBy) {
          case 'Giá tăng dần':
            filteredRooms.sort((a, b) => {
              const priceA = a.priceMonth || 0;
              const priceB = b.priceMonth || 0;
              return priceA - priceB;
            });
            //console.log(`📊 Sort by price ascending: ${filteredRooms.slice(0, 3).map(r => `${r.priceMonth}tr`).join(', ')}...`);
            break;

          case 'Giá giảm dần':
            filteredRooms.sort((a, b) => {
              const priceA = a.priceMonth || 0;
              const priceB = b.priceMonth || 0;
              return priceB - priceA;
            });
            //console.log(`📊 Sort by price descending: ${filteredRooms.slice(0, 3).map(r => `${r.priceMonth}tr`).join(', ')}...`);
            break;

          case 'Lượt xem':
            filteredRooms.sort((a, b) => {
              const viewsA = a.viewCount || 0;
              const viewsB = b.viewCount || 0;
              return viewsB - viewsA; // Descending order
            });
            //console.log(`📊 Sort by view count: ${filteredRooms.slice(0, 3).map(r => `${r.viewCount || 0} views`).join(', ')}...`);
            break;

          default:
            //console.log('📊 No sorting applied - using default order');
        }

        // Lấy top 20 phòng giá rẻ nhất
        const topRooms = filteredRooms.slice(0, 20);

        //console.log(`✅ After client-side filtering and sorting: ${topRooms.length} top cheap rooms`);

        //console.log(`✅ Final cheap results (${topRooms.length} rooms):`, {
        //   priceRange: selectedFilters.priceRange,
        //   sortBy: selectedFilters.sortBy,
        //   firstRoom: topRooms[0] ? {
        //     id: topRooms[0].id,
        //     title: topRooms[0].title,
        //     price: topRooms[0].priceMonth,
        //     views: topRooms[0].viewCount
        //   } : null,
        //   totalRooms: topRooms.length
        // });

        setCheapRooms(topRooms);
        setShowCheapResults(true);
        //console.log(`✅ Displayed ${topRooms.length} cheap rooms`);
      } else {
          //console.log('❌ No rooms found for cheap filter');
          Alert.alert('Thông báo', 'Không tìm thấy phòng giá rẻ nào.');
        }
    } catch (error) {
      console.error('❌ Error searching cheap rooms:', error);
      Alert.alert('Lỗi', 'Không thể tìm phòng giá rẻ. Vui lòng thử lại.');
    } finally {
      setCheapLoading(false);
    }
  };

  const updateFilters = (newFilters: any) => {
    setSelectedFilters(newFilters);
  };

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
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount.toString()}
                  </Text>
                </View>
              )}
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
      
      {/* Nearby Search Results */}
      {showNearbyResults && nearbyRooms && nearbyRooms.length > 0 && (
        <FilteredRoomsList 
          rooms={nearbyRooms} 
          onClose={() => {
            setShowNearbyResults(false);
            setNearbyRooms(null);
          }}
          title="Phòng gần bạn"
        />
      )}

      {/* Popular Rooms Results */}
      {showPopularResults && popularRooms && popularRooms.length > 0 && (
        <FilteredRoomsList 
          rooms={popularRooms} 
          onClose={() => {
            setShowPopularResults(false);
            setPopularRooms(null);
          }}
          title="Phòng phổ biến"
        />
      )}

      {/* Cheap Rooms Results */}
      {showCheapResults && cheapRooms && cheapRooms.length > 0 && (
        <FilteredRoomsList 
          rooms={cheapRooms} 
          onClose={() => {
            setShowCheapResults(false);
            setCheapRooms(null);
          }}
          title="Phòng giá rẻ"
        />
      )}

      {/* Loading overlay for nearby search */}
      {nearbyLoading && (
        <View style={styles.nearbyLoadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.modernLoadingText}>Đang tìm phòng gần bạn...</Text>
          </View>
        </View>
      )}

      {/* Loading overlay for popular search */}
      {popularLoading && (
        <View style={styles.nearbyLoadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.modernLoadingText}>Đang tìm phòng phổ biến...</Text>
          </View>
        </View>
      )}

      {/* Loading overlay for cheap search */}
      {cheapLoading && (
        <View style={styles.nearbyLoadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.modernLoadingText}>Đang tìm phòng giá rẻ...</Text>
          </View>
        </View>
      )}
      
      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        filterType={currentFilterType}
        selectedFilters={selectedFilters}
        onFiltersChange={updateFilters}
        onClose={closeFilterModal}
        onApply={applyFilters}
      />
    </SafeAreaView>
  );
}
