// screens/main/HomeScreen/home.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import debounce from 'lodash.debounce';

// Import types and services
import { RoomInUser, PaginatedResponse } from '../../../types/types';
import { 
  getRoomNormalUser, 
  getRoomVipUser,
  getRoomsInMap,
  filterRooms 
} from '../../../services/RoomService';
import { getPublicStatistics, PublicStatistics } from '../../../services/StatisticsService';
import { getAllFavoriteIds, addFavorite as addFavoriteAPI, removeFavorite as removeFavoriteAPI } from '../../../services/FavoriteService';
import { getNotificationsForUser } from '../../../services/NotificationService';
import { useFavoriteStore } from '../../../stores/FavoriteStore';
import { useSearchLocation } from '../../../hooks/useSearchLocation';

// Import components
import {
  HomeHeader,
  FloatingSearchBar,
  QuickCategoryBar,
  FeaturedCarousel,
  NormalRoomsList,
  RoomListSection,
  FilterModal,
  FilteredRoomsList,
  EmptyState,
  Category,
  FilterType,
  FilterOptions,
} from './components';

import CompareFloatingButton from '../../../components/compare/CompareFloatingButton';

// Categories data
const CATEGORIES: Category[] = [
  { id: 'all', label: 'Tất cả', icon: 'grid-outline' },
  { id: 'nearby', label: 'Gần tôi', icon: 'navigate-outline' },
  { id: 'popular', label: 'Phổ biến', icon: 'flame-outline' },
  { id: 'cheap', label: 'Giá rẻ', icon: 'cash-outline' },
  { id: 'apartment', label: 'Chung cư', icon: 'business-outline' },
  { id: 'house', label: 'Nhà nguyên căn', icon: 'home-outline' },
];

type SortOption = 'newest' | 'price-asc' | 'price-desc';

// Shuffle function để random (công bằng cho tất cả) - moved outside to be stable
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { favoriteRoomIds, setFavoriteRoomIds, addFavorite, removeFavorite } = useFavoriteStore();
  
  // Location hook
  const { currentCity, userLocation } = useSearchLocation();

  // User info
  const [isGuest, setIsGuest] = useState(true); // Guest mode by default
  const [userName, setUserName] = useState<string>('Bạn');
  const [userAvatar, setUserAvatar] = useState<string | undefined>();
  const [currentLocation, setCurrentLocation] = useState<string>('Đang xác định vị trí...');
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Data states
  const [vipRooms, setVipRooms] = useState<RoomInUser[]>([]);
  const [normalRooms, setNormalRooms] = useState<RoomInUser[]>([]);
  const [statistics, setStatistics] = useState<PublicStatistics | null>(null);

  // UI states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false); // Track load errors
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filter Modal states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [currentFilterType, setCurrentFilterType] = useState<FilterType>(null);
  const [selectedFilters, setSelectedFilters] = useState<FilterOptions>({
    priceRange: '',
    roomType: [],
    amenities: [],
    distance: '5',
    sortBy: 'Khoảng cách',
    timeRange: 'Tháng này',
  });

  // Filtered results states
  const [filteredRooms, setFilteredRooms] = useState<RoomInUser[] | null>(null);
  const [showFilteredResults, setShowFilteredResults] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filteredTitle, setFilteredTitle] = useState('Kết quả tìm kiếm');
  const [searchSuggestions, setSearchSuggestions] = useState<RoomInUser[]>([]);

  // ===== MERGE ALL ROOMS (VIP + Normal) WITH SORT =====
  // Moved up to be accessible by search handlers
  const allRooms = useMemo(() => {
    // Mark VIP rooms với isVip flag (trước khi merge)
    const markedVipRooms = vipRooms.map(room => ({ ...room, isVip: true }));
    
    // Apply sort logic
    if (sortBy === 'price-asc' || sortBy === 'price-desc') {
      // 📊 SORT MODE: Merge tất cả rồi sort chung theo giá (không phân biệt VIP/Normal)
      const allMerged = [...markedVipRooms, ...normalRooms];
      
      return allMerged.sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceMonth - b.priceMonth;
        return b.priceMonth - a.priceMonth;
      });
    } else {
      // 🎲 RANDOM MODE ('newest'): Random riêng, VIP ưu tiên đầu
      const shuffledVipRooms = shuffleArray(markedVipRooms);
      const shuffledNormalRooms = shuffleArray(normalRooms);
      
      return [...shuffledVipRooms, ...shuffledNormalRooms];
    }
  }, [vipRooms, normalRooms, sortBy]);

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  // ===== LOAD USER INFO =====
  const loadUserInfo = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userProfile'); // Fix: key là 'userProfile'
      console.log('📦 Raw userData from AsyncStorage:', userDataStr);
      
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        console.log('👤 Parsed userData:', userData);
        console.log('🖼️ Raw avatar value:', userData.avatar);
        
        setUserName(userData.fullName || userData.username || 'Bạn');
        
        // Fix avatar URL - thêm Cloudinary base URL nếu chỉ có path
        let avatarUrl = userData.avatar || undefined;
        if (avatarUrl && !avatarUrl.startsWith('http')) {
          avatarUrl = `https://res.cloudinary.com${avatarUrl}`;
        }
        console.log('✅ Final avatar URL:', avatarUrl);
        setUserAvatar(avatarUrl);
        
        setIsGuest(false); // User is logged in
      } else {
        console.log('⚠️ No userData found - guest mode');
        setIsGuest(true); // No user data = guest
      }
    } catch (error) {
      console.error('❌ Error loading user info:', error);
      setIsGuest(true); // Error loading = treat as guest
    }
  };

  // ===== LOAD FAVORITES =====
  const loadFavorites = async () => {
    try {
      const favoriteIds = await getAllFavoriteIds();
      setFavoriteRoomIds(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // ===== LOAD STATISTICS =====
  const loadStatistics = async () => {
    try {
      const stats = await getPublicStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  // ===== LOAD NOTIFICATIONS =====
  const loadNotifications = async () => {
    try {
      console.log('🔔 Loading notifications...');
      
      // Try both keys - userData (from login) and userProfile (from profile load)
      let userDataStr = await AsyncStorage.getItem('userData');
      let keyUsed = 'userData';
      
      if (!userDataStr) {
        userDataStr = await AsyncStorage.getItem('userProfile');
        keyUsed = 'userProfile';
      }
      
      console.log(`📦 User data for notifications: ${userDataStr ? `Found (key: ${keyUsed})` : 'Not found'}`);
      
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const userId = userData.id || userData._id;
        console.log('� User ID for notifications:', userId);
        
        // Try fetching with the ID as is first
        let notifications = await getNotificationsForUser(userId);
        
        // If empty and ID looks like a number, try casting to number (Firebase is strict on types)
        if ((!notifications || notifications.length === 0) && !isNaN(Number(userId))) {
            console.log('� Retrying fetch with Number(userId)...');
            const numNotifications = await getNotificationsForUser(Number(userId));
            if (numNotifications && numNotifications.length > 0) {
            notifications = numNotifications;
            }
        }
        
        const unread = notifications?.filter((n: any) => !n.isRead).length || 0;
        console.log('🔴 Unread count:', unread);
        
        setUnreadNotifications(unread);
      } else {
        console.log('⚠️ No user data found - skipping notifications');
      }
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
    }
  };

  // ===== LOAD VIP ROOMS =====
  const loadVipRooms = async () => {
    try {
      const response = await getRoomVipUser(0, 10);
      if (response) {
        setVipRooms(response.data || []);
        console.log('🌟 VIP Rooms loaded:', response.data?.length);
        console.log('🌟 First VIP Room FULL:', JSON.stringify(response.data?.[0], null, 2));
      }
    } catch (error) {
      console.error('Error loading VIP rooms:', error);
    }
  };

  // ===== LOAD NORMAL ROOMS =====
  const loadNormalRooms = async (page: number = 0, append: boolean = false) => {
    try {
      const response = await getRoomNormalUser(page, 10);
      
      if (response) {
        if (append) {
          setNormalRooms(prev => [...prev, ...(response.data || [])]);
        } else {
          setNormalRooms(response.data || []);
        }
        
        setHasMore(response.page < response.totalPages - 1);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading normal rooms:', error);
    }
  };

  // ===== INITIAL LOAD =====
  const loadAllData = async (isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setLoadError(false);
      } else {
        setLoading(true);
        setLoadError(false);
      }

      await Promise.all([
        loadUserInfo(),
        loadFavorites(),
        loadStatistics(),
        loadNotifications(),
        loadVipRooms(),
        loadNormalRooms(0, false),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadError(true);
      if (!isRefresh) {
        // Show error for initial load, silent for refresh
        Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ===== ADVANCED SEARCH FUNCTIONS =====
  
  // Search nearby rooms
  const searchNearbyRooms = async () => {
    if (!userLocation) {
      Alert.alert('Lỗi', 'Không thể xác định vị trí của bạn. Vui lòng bật GPS.');
      return;
    }

    setFilterLoading(true);
    try {
      const radius = parseInt(selectedFilters.distance || '5') * 1000; // Convert km to meters
      const rooms = await getRoomsInMap(
        userLocation.latitude,
        userLocation.longitude,
        radius
      );

      if (rooms && rooms.length > 0) {
        // Sort based on selected option
        let sortedRooms = [...rooms];
        
        switch (selectedFilters.sortBy) {
          case 'Khoảng cách':
            // Already sorted by API
            break;
          case 'Giá tăng dần':
            sortedRooms.sort((a, b) => (a.priceMonth || 0) - (b.priceMonth || 0));
            break;
          case 'Lượt xem':
            sortedRooms.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
            break;
        }

        setFilteredRooms(sortedRooms);
        setFilteredTitle(`Phòng gần bạn (${selectedFilters.distance}km)`);
        setShowFilteredResults(true);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy phòng nào gần vị trí của bạn.');
      }
    } catch (error) {
      console.error('Error searching nearby rooms:', error);
      Alert.alert('Lỗi', 'Không thể tìm phòng gần đây. Vui lòng thử lại.');
    } finally {
      setFilterLoading(false);
    }
  };

  // Search popular rooms
  const searchPopularRooms = async () => {
    setFilterLoading(true);
    try {
      const response = await filterRooms(0, 100, {});

      if (response && response.data) {
        let filteredData = [...response.data];

        // Filter by time range
        const now = new Date();
        let timeThreshold: Date | null = null;

        switch (selectedFilters.timeRange) {
          case 'Hôm nay':
            timeThreshold = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'Tuần này':
            timeThreshold = new Date(now);
            timeThreshold.setDate(now.getDate() - now.getDay());
            break;
          case 'Tháng này':
            timeThreshold = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'Năm này':
            timeThreshold = new Date(now.getFullYear(), 0, 1);
            break;
        }

        if (timeThreshold) {
          filteredData = filteredData.filter(room => {
            const postStartDate = (room as any).postStartDate;
            if (!postStartDate) return false;
            const roomDate = new Date(postStartDate);
            return roomDate >= timeThreshold!;
          });
        }

        // Sort based on selected option
        switch (selectedFilters.sortBy) {
          case 'Lượt xem':
            filteredData.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
            break;
          case 'Đặt phòng':
            filteredData.sort((a, b) => {
              const bookingsA = (a as any).bookingCount || a.viewCount || 0;
              const bookingsB = (b as any).bookingCount || b.viewCount || 0;
              return bookingsB - bookingsA;
            });
            break;
          case 'Đánh giá':
            filteredData.sort((a, b) => {
              const ratingA = (a as any).rating || a.viewCount || 0;
              const ratingB = (b as any).rating || b.viewCount || 0;
              return ratingB - ratingA;
            });
            break;
        }

        const topRooms = filteredData.slice(0, 20);
        setFilteredRooms(topRooms);
        setFilteredTitle(`Phòng phổ biến (${selectedFilters.timeRange})`);
        setShowFilteredResults(true);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy phòng phổ biến nào.');
      }
    } catch (error) {
      console.error('Error searching popular rooms:', error);
      Alert.alert('Lỗi', 'Không thể tìm phòng phổ biến. Vui lòng thử lại.');
    } finally {
      setFilterLoading(false);
    }
  };

  // Search cheap rooms
  const searchCheapRooms = async () => {
    setFilterLoading(true);
    try {
      const response = await filterRooms(0, 100, {});

      if (response && response.data) {
        let filteredData = [...response.data];

        // Filter by price range
        if (selectedFilters.priceRange) {
          filteredData = filteredData.filter(room => {
            const price = room.priceMonth || 0;
            const range = selectedFilters.priceRange;
            
            switch (range) {
              case '<1tr':
                return price < 1000000;
              case '1-2tr':
                return price >= 1000000 && price < 2000000;
              case '2-3tr':
                return price >= 2000000 && price < 3000000;
              case '3-5tr':
                return price >= 3000000 && price < 5000000;
              default:
                return true;
            }
          });
        }

        // Sort based on selected option
        switch (selectedFilters.sortBy) {
          case 'Giá tăng dần':
            filteredData.sort((a, b) => (a.priceMonth || 0) - (b.priceMonth || 0));
            break;
          case 'Giá giảm dần':
            filteredData.sort((a, b) => (b.priceMonth || 0) - (a.priceMonth || 0));
            break;
          case 'Lượt xem':
            filteredData.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
            break;
        }

        const topRooms = filteredData.slice(0, 20);
        setFilteredRooms(topRooms);
        setFilteredTitle(`Phòng giá rẻ (${selectedFilters.priceRange || 'Tất cả'})`);
        setShowFilteredResults(true);
      } else {
        Alert.alert('Thông báo', 'Không tìm thấy phòng giá rẻ nào.');
      }
    } catch (error) {
      console.error('Error searching cheap rooms:', error);
      Alert.alert('Lỗi', 'Không thể tìm phòng giá rẻ. Vui lòng thử lại.');
    } finally {
      setFilterLoading(false);
    }
  };

  // ===== SEARCH HANDLERS =====
  // Debounced search for suggestions
  const debouncedSearch = useMemo(
    () =>
      debounce((text: string) => {
        if (text.length > 1) {
          const query = text.toLowerCase().trim();
          const suggestions = allRooms.filter(room => {
             const titleMatch = room.title?.toLowerCase().includes(query);
             const addressMatch = room.address?.street?.toLowerCase().includes(query) || 
                                  room.address?.ward?.name?.toLowerCase().includes(query) ||
                                  room.address?.ward?.district?.name?.toLowerCase().includes(query);
             return titleMatch || addressMatch;
          }).slice(0, 5);
          
          setSearchSuggestions(suggestions);
        } else {
          setSearchSuggestions([]);
        }
      }, 300),
    [allRooms]
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  // ===== SEARCH BY TEXT HANDLER =====
  const handleSearchSubmit = async () => {
    if (!searchQuery.trim()) return;

    setFilterLoading(true);
    try {
      // Fetch a larger set of rooms to filter locally
      // Note: Ideally backend should support search parameter
      // Using a larger page size to search across more items
      const response = await filterRooms(0, 100, {});

      if (response && response.data) {
        const query = searchQuery.toLowerCase().trim();
        
        const filteredData = response.data.filter(room => {
          // Check title
          if (room.title?.toLowerCase().includes(query)) return true;
          
          // Check address fields
          if (room.address) {
            const street = room.address.street?.toLowerCase() || '';
            const ward = room.address.ward?.name?.toLowerCase() || '';
            const district = room.address.ward?.district?.name?.toLowerCase() || '';
            const province = room.address.ward?.district?.province?.name?.toLowerCase() || '';
            
            if (street.includes(query)) return true;
            if (ward.includes(query)) return true;
            if (district.includes(query)) return true;
            if (province.includes(query)) return true;

            // Check full address string combo
            const fullAddress = `${street} ${ward} ${district} ${province}`;
            if (fullAddress.includes(query)) return true;
          }
          
          return false;
        });

        if (filteredData.length > 0) {
          setFilteredRooms(filteredData);
          setFilteredTitle(`Kết quả cho "${searchQuery}"`);
          setShowFilteredResults(true);
        } else {
          Alert.alert('Thông báo', `Không tìm thấy phòng nào với từ khóa "${searchQuery}"`);
        }
      } else {
        Alert.alert('Lỗi', 'Không thể tìm kiếm. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error searching rooms:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi tìm kiếm.');
    } finally {
      setFilterLoading(false);
    }
  };

  // ===== FILTER MODAL HANDLERS =====
  const openFilterModal = (filterType: FilterType) => {
    setCurrentFilterType(filterType);
    setFilterModalVisible(true);
  };

  const closeFilterModal = () => {
    setFilterModalVisible(false);
    setCurrentFilterType(null);
    setFilterLoading(false);
  };

  const applyFilters = async () => {
    closeFilterModal();
    
    switch (currentFilterType) {
      case 'nearby':
        await searchNearbyRooms();
        break;
      case 'popular':
        await searchPopularRooms();
        break;
      case 'cheap':
        await searchCheapRooms();
        break;
      case 'premium':
        // Navigate to Search screen with filters
        navigation.navigate('Search', {
          appliedFilters: selectedFilters,
          filterType: currentFilterType,
        });
        break;
    }
  };

  const updateFilters = (newFilters: FilterOptions) => {
    setSelectedFilters(newFilters);
  };

  const closeFilteredResults = () => {
    setShowFilteredResults(false);
    setFilteredRooms(null);
  };

  // ===== EFFECTS =====
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (currentCity) {
      setCurrentLocation(currentCity);
    }
  }, [currentCity]);

  useFocusEffect(
    useCallback(() => {
      // Use the improved loadNotifications function directly
      // ensuring consistency with the refresh logic
      loadNotifications();
    }, [])
  );

  // ===== HANDLERS =====
  const handleRefresh = () => {
    loadAllData(true);
  };

  const handleRoomPress = (room: RoomInUser) => {
    navigation.navigate('RoomDetail', { roomId: room.id });
  };

  const handleFavoriteToggle = async (roomId: string) => {
    // Kiểm tra đăng nhập
    if (isGuest) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để thêm phòng vào danh sách yêu thích',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Đăng nhập', 
            onPress: handleLoginPress
          }
        ]
      );
      return;
    }

    const isFavorite = favoriteRoomIds.has(roomId);

    try {
      if (isFavorite) {
        // Xóa khỏi favorite
        const success = await removeFavoriteAPI(roomId);
        
        if (success) {
          removeFavorite(roomId);
          console.log(`✅ Removed from favorites: ${roomId}`);
        } else {
          Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích');
        }
      } else {
        // Thêm vào favorite
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

  const handleSearchFocus = () => {
    // Optional: Can enable some UI state here if needed, but we don't navigate anymore
  };

  const handleFilterPress = () => {
    console.log('Show filters');
  };

  const handleLocationPress = () => {
    console.log('Select location');
  };

  const handleAvatarPress = () => {
    navigation.navigate('User');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleSeeAllVip = () => {
    navigation.navigate('FullRoomVipScreen');
  };

  const handleMapPress = () => {
    navigation.navigate('Search', { openMap: true });
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const handleRetry = () => {
    setLoadError(false);
    loadAllData(false);
  };

  const handleRefreshFiltered = async () => {
    // Re-run the same filter search
    switch (currentFilterType) {
      case 'nearby':
        await searchNearbyRooms();
        break;
      case 'popular':
        await searchPopularRooms();
        break;
      case 'cheap':
        await searchCheapRooms();
        break;
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Open filter modal based on category
    switch (categoryId) {
      case 'nearby':
        openFilterModal('nearby');
        break;
      case 'popular':
        openFilterModal('popular');
        break;
      case 'cheap':
        openFilterModal('cheap');
        break;
      case 'all':
        // Reset to show all rooms
        setShowFilteredResults(false);
        break;
      default:
        // For apartment, house, etc. - navigate to search
        navigation.navigate('Search', { category: categoryId });
        break;
    }
  };



  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadNormalRooms(currentPage + 1, true);
    }
  };


  // ===== RENDER LOADING =====
  if (loading) {
    if (loadError) {
      // Show error state with retry button
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <StatusBar barStyle="light-content" backgroundColor="#667EEA" />
          <HomeHeader
            userName={userName}
            userAvatar={userAvatar}
            currentLocation={currentLocation}
            unreadNotifications={unreadNotifications}
            isGuest={isGuest}
            onLocationPress={handleLocationPress}
            onAvatarPress={handleAvatarPress}
            onNotificationPress={handleNotificationPress}
            onLoginPress={handleLoginPress}
          />
          <View style={styles.loadingContainer}>
            <EmptyState
              icon="cloud-offline"
              title="Không thể tải dữ liệu"
              message="Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra kết nối và thử lại."
              actionLabel="Thử lại"
              onActionPress={handleRetry}
            />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#667EEA" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER MAIN =====
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#667EEA" />

      {/* Header with gradient */}
      <HomeHeader
        userName={userName}
        userAvatar={userAvatar}
        currentLocation={currentCity || 'Đang xác định vị trí...'}
        unreadNotifications={unreadNotifications}
        isGuest={isGuest}
        onLocationPress={handleLocationPress}
        onAvatarPress={handleAvatarPress}
        onNotificationPress={handleNotificationPress}
        onLoginPress={handleLoginPress}
      />

      {/* Floating Search Bar */}
      <FloatingSearchBar
        value={searchQuery}
        onChangeText={handleSearchChange}
        // onFocus={handleSearchFocus} // Disabled navigation on focus
        onSubmit={handleSearchSubmit}
        onFilterPress={handleFilterPress}
        suggestions={searchSuggestions}
        onSuggestionPress={(room) => {
          setSearchQuery('');
          setSearchSuggestions([]);
          handleRoomPress(room);
        }}
      />

      {/* Main Content - Room List with integrated sections */}
      <RoomListSection
        rooms={allRooms}
        onRoomPress={handleRoomPress}
        onFavoriteToggle={handleFavoriteToggle}
        favoriteIds={Array.from(favoriteRoomIds)}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        onEndReached={handleLoadMore}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#667EEA']}
            tintColor="#667EEA"
          />
        }
        ListHeaderComponent={
          <>
            {/* Quick Category Bar */}
            <QuickCategoryBar
              categories={CATEGORIES}
              selectedId={selectedCategory}
              onCategoryPress={handleCategoryPress}
            />

            {/* Featured VIP Carousel */}
            <FeaturedCarousel
              rooms={vipRooms}
              onRoomPress={handleRoomPress}
              onSeeAllPress={handleSeeAllVip}
              onFavoriteToggle={handleFavoriteToggle}
              loading={loading && !refreshing}
            />

            {/* Normal Rooms List - 5 phòng thường đầu tiên */}
            <NormalRoomsList
              rooms={normalRooms}
              onRoomPress={handleRoomPress}
              onFavoriteToggle={handleFavoriteToggle}
              favoriteIds={Array.from(favoriteRoomIds)}
              onSeeAllPress={() => {
                // Scroll to "Tất cả phòng trọ" section (already below)
                console.log('See all normal rooms');
              }}
            />
          </>
        }
      />

      {/* Compare Floating Button */}
      <CompareFloatingButton />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        filterType={currentFilterType}
        selectedFilters={selectedFilters}
        onFiltersChange={updateFilters}
        onClose={closeFilterModal}
        onApply={applyFilters}
      />

      {/* Filtered Results Overlay */}
      {showFilteredResults && filteredRooms && filteredRooms.length > 0 && (
        <FilteredRoomsList
          rooms={filteredRooms}
          onClose={closeFilteredResults}
          title={filteredTitle}
          onRefresh={handleRefreshFiltered}
        />
      )}

      {/* Loading Overlay for Filters */}
      {filterLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#667EEA" />
            <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000, // Highest - above everything when searching
    elevation: 10000, // For Android
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});
