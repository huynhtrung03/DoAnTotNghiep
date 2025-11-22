import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFavoriteRooms, removeFavorite, getAllFavoriteIds } from '../../../services/favorites/FavoriteService';
import { RoomInUser, FilterType, FILTER_OPTIONS } from './types';
import { styles } from './styles';
import { RoomCard } from './components';
import Colors from '../../../styles/colors';
import { useFavoriteStore } from '../../../stores/FavoriteStore';

const FavoritedScreen = () => {
  const navigation = useNavigation<any>();
  const { setFavoriteRoomIds } = useFavoriteStore();

  // ===== STATE =====
  const [rooms, setRooms] = useState<RoomInUser[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<RoomInUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 6;

  // Filter
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Reload favorites in store when screen is focused
  useFocusEffect(
    useCallback(() => {
      const reloadFavorites = async () => {
        try {
          const favoriteIds = await getAllFavoriteIds();
          setFavoriteRoomIds(favoriteIds);
          //console.log(`🔄 Reloaded ${favoriteIds.length} favorites in store`);
        } catch (error) {
          console.error('❌ Error reloading favorites:', error);
        }
      };
      reloadFavorites();
    }, [setFavoriteRoomIds])
  );

  // ===== FETCH DATA =====
  const fetchRooms = useCallback(async (page: number = 0, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      //console.log(`📋 Đang lấy danh sách phòng yêu thích - Trang ${page + 1}`);

      const result = await getFavoriteRooms(page, pageSize);

      //console.log(`✅ Đã lấy ${result.content?.length || 0} phòng`);
  


      // Backend trả về "content" không phải "data"
      setRooms(result.content || []);
      setFilteredRooms(result.content || []);
      setCurrentPage(result.page || 0);
      setTotalPages(result.totalPages || 0);
      setTotalItems(result.totalElements || 0);
    } catch (err: any) {
      console.error('❌ Lỗi khi lấy danh sách phòng:', err.message);
      setError(err.message || 'Đã có lỗi xảy ra');
      setRooms([]);
      setFilteredRooms([]);
      setCurrentPage(0);
      setTotalPages(0);
      setTotalItems(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchRooms(0);
  }, [fetchRooms]);

  // ===== FILTER ROOMS =====
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredRooms(rooms);
    } else if (activeFilter === 'vip') {
      setFilteredRooms(rooms.filter((room) => room.isVip === true));
    } else if (activeFilter === 'normal') {
      setFilteredRooms(rooms.filter((room) => !room.isVip));
    }
  }, [activeFilter, rooms]);

  // ===== REFRESH =====
  const onRefresh = useCallback(() => {
    fetchRooms(currentPage, true);
  }, [currentPage, fetchRooms]);

  // ===== PAGINATION =====
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      fetchRooms(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      fetchRooms(currentPage - 1);
    }
  };

  // ===== HANDLERS =====
  const handleRoomPress = (room: RoomInUser) => {
    //console.log('👁️ Xem chi tiết phòng:', room.id);
    // Navigate to RoomDetail screen
    navigation.navigate('RoomDetail', { roomId: room.id });
  };

  const handleFavoriteToggle = async (roomId: string) => {
    try {
      //console.log('💔 Xóa khỏi yêu thích:', roomId);

      const success = await removeFavorite(roomId);

      if (success) {
        // Remove from store
        const { removeFavorite: removeFromStore } = useFavoriteStore.getState();
        removeFromStore(roomId);
        
        // Refresh lại danh sách
        fetchRooms(currentPage);
        
        // Reload favorites in store
        const favoriteIds = await getAllFavoriteIds();
        setFavoriteRoomIds(favoriteIds);
        //console.log(`✅ Removed from favorites and reloaded store`);
      } else {
        Alert.alert('Lỗi', 'Không thể xóa phòng khỏi danh sách yêu thích');
      }
    } catch (error: any) {
      console.error('❌ Lỗi khi xóa favorite:', error);
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra');
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    //console.log('🔍 Lọc theo:', filter);
  };

  const handleRetry = () => {
    setError(null);
    fetchRooms(0);
  };

  // ===== RENDER FILTER BUTTON =====
  const renderFilterButton = (filter: typeof FILTER_OPTIONS[0]) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterButton,
        activeFilter === filter.key && styles.filterButtonActive,
      ]}
      onPress={() => handleFilterChange(filter.key)}
    >
      {filter.icon && <Ionicons name={filter.icon as any} size={18} color={activeFilter === filter.key ? Colors.textWhite : Colors.textSecondary} />}
      <Text
        style={[
          styles.filterLabel,
          activeFilter === filter.key && styles.filterLabelActive,
        ]}
      >
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  // ===== RENDER ITEM =====
  const renderItem = ({ item }: { item: RoomInUser }) => (
    <RoomCard room={item} onPress={handleRoomPress} onFavoriteToggle={handleFavoriteToggle} />
  );

  // ===== RENDER EMPTY =====
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="heart-dislike-outline" size={64} color={Colors.textSecondary} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>
          {activeFilter === 'all'
            ? 'Chưa có phòng yêu thích'
            : `Không có phòng ${activeFilter === 'vip' ? 'VIP' : 'thường'}`}
        </Text>
        <Text style={styles.emptyText}>
          {activeFilter === 'all'
            ? 'Hãy khám phá và thêm các phòng bạn yêu thích!'
            : 'Thử lọc theo loại phòng khác'}
        </Text>
      </View>
    );
  };

  // ===== RENDER LOADING =====
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER ERROR =====
  if (error && rooms.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} style={styles.errorIcon} />
          <Text style={styles.errorTitle}>Lỗi tải dữ liệu</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER =====
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Phòng Yêu Thích</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Ionicons name="list-outline" size={16} color={Colors.primary} />
            <Text style={styles.statText}>{totalItems} phòng</Text>
          </View>
          {rooms.filter((r) => r.isVip).length > 0 && (
            <View style={styles.statBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{rooms.filter((r) => r.isVip).length} VIP</Text>
            </View>
          )}
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScrollView}
          contentContainerStyle={styles.filterButtons}
        >
          {FILTER_OPTIONS.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
            onPress={handlePrevPage}
            disabled={currentPage === 0}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 0 && styles.paginationButtonTextDisabled,
              ]}
            >
              ← Trước
            </Text>
          </TouchableOpacity>

          <View style={styles.paginationInfo}>
            <Text style={styles.paginationText}>
              {currentPage + 1} / {totalPages}
            </Text>
            <Text style={styles.paginationSubtext}>{filteredRooms.length} phòng</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage >= totalPages - 1 && styles.paginationButtonDisabled,
            ]}
            onPress={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage >= totalPages - 1 && styles.paginationButtonTextDisabled,
              ]}
            >
              Sau →
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default FavoritedScreen;
