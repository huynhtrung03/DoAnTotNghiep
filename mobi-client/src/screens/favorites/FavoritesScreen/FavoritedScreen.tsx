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
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getFavoriteRooms, removeFavorite, getAllFavoriteIds } from '../../../services/FavoriteService';
import { RoomInUser, FilterType, FILTER_OPTIONS } from './types';
import { RoomCard } from './components';
import Colors from '../../../colors/colors';
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
        } catch (error) {
          console.error(' Error reloading favorites:', error);
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

      const result = await getFavoriteRooms(page, pageSize);

      setRooms(result.content || []);
      setFilteredRooms(result.content || []);
      setCurrentPage(result.page || 0);
      setTotalPages(result.totalPages || 0);
      setTotalItems(result.totalElements || 0);
    } catch (err: any) {
      console.error(' Lỗi khi lấy danh sách phòng:', err.message);
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
    navigation.navigate('RoomDetail', { roomId: room.id });
  };

  const handleFavoriteToggle = async (roomId: string) => {
    try {
      const success = await removeFavorite(roomId);

      if (success) {
        const { removeFavorite: removeFromStore } = useFavoriteStore.getState();
        removeFromStore(roomId);
        
        fetchRooms(currentPage);
        
        const favoriteIds = await getAllFavoriteIds();
        setFavoriteRoomIds(favoriteIds);
      } else {
        Alert.alert('Lỗi', 'Không thể xóa phòng khỏi danh sách yêu thích');
      }
    } catch (error: any) {
      console.error(' Lỗi khi xóa favorite:', error);
      Alert.alert('Lỗi', error.message || 'Đã có lỗi xảy ra');
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
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
        minimalStyles.filterChip,
        activeFilter === filter.key && minimalStyles.filterChipActive,
      ]}
      onPress={() => handleFilterChange(filter.key)}
      activeOpacity={0.7}
    >
      <Text
        style={[
          minimalStyles.filterChipText,
          activeFilter === filter.key && minimalStyles.filterChipTextActive,
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
      <View style={minimalStyles.emptyContainer}>
        <Ionicons name="heart-dislike-outline" size={80} color="#E5E7EB" />
        <Text style={minimalStyles.emptyTitle}>Danh sách trống</Text>
        <Text style={minimalStyles.emptyText}>
          {activeFilter === 'all'
            ? 'Chưa có phòng yêu thích nào'
            : `Không có phòng ${activeFilter === 'vip' ? 'VIP' : 'thường'}`}
        </Text>
        <TouchableOpacity 
          style={minimalStyles.emptyButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={minimalStyles.emptyButtonText}>Tìm phòng ngay</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  // ===== RENDER LOADING =====
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={minimalStyles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={minimalStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#10B981" />
          <Text style={minimalStyles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER ERROR =====
  if (error && rooms.length === 0) {
    return (
      <SafeAreaView style={minimalStyles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={minimalStyles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={minimalStyles.errorTitle}>Lỗi tải dữ liệu</Text>
          <Text style={minimalStyles.errorText}>{error}</Text>
          <TouchableOpacity style={minimalStyles.retryButton} onPress={handleRetry}>
            <Text style={minimalStyles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER =====
  return (
    <SafeAreaView style={minimalStyles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header - Compact */}
      <View style={minimalStyles.header}>
        <Text style={minimalStyles.headerTitle}>Đã lưu ({totalItems})</Text>
      </View>

      {/* Filter Bar - Minimal */}
      <View style={minimalStyles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={minimalStyles.filterScrollContent}
        >
          {FILTER_OPTIONS.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={minimalStyles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10B981']} />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Pagination - Floating Minimal */}
      {totalPages > 1 && (
        <View style={minimalStyles.paginationFloating}>
          <TouchableOpacity
            style={[
              minimalStyles.paginationArrow,
              currentPage === 0 && minimalStyles.paginationArrowDisabled
            ]}
            onPress={handlePrevPage}
            disabled={currentPage === 0}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={currentPage === 0 ? '#D1D5DB' : '#1F2937'} 
            />
          </TouchableOpacity>

          <Text style={minimalStyles.paginationText}>
            {currentPage + 1} / {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              minimalStyles.paginationArrow,
              currentPage >= totalPages - 1 && minimalStyles.paginationArrowDisabled
            ]}
            onPress={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={currentPage >= totalPages - 1 ? '#D1D5DB' : '#1F2937'} 
            />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

// ===== MINIMAL STYLES =====
const minimalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Pure white
  },

  // Header - Compact
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },

  // Filter - Minimal
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterChipActive: {
    backgroundColor: '#1F2937',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },

  // List
  listContent: {
    paddingTop: 16,
    paddingBottom: 100, // Space for pagination
  },

  // Empty State - Minimal
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Pagination - Floating Minimal
  paginationFloating: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  paginationArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  paginationArrowDisabled: {
    backgroundColor: '#F9FAFB',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    minWidth: 60,
    textAlign: 'center',
  },
});

export default FavoritedScreen;
