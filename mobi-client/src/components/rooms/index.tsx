import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { RoomInUser } from '../../types/types';
import RoomCard from './RoomCard';
import { getRoomNormalUser, getRoomVipUser } from '../../services/RoomService';

interface PaginatedResponse<T> {
  data: T[];
  totalRecords: number;
  totalPages: number;
  page: number;
}

export default function RoomsList() {
  const [vipRooms, setVipRooms] = useState<PaginatedResponse<RoomInUser> | null>(null);
  const [normalRooms, setNormalRooms] = useState<PaginatedResponse<RoomInUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vipPage, setVipPage] = useState(0);
  const [normalPage, setNormalPage] = useState(0);

  const loadRooms = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setVipPage(0);
        setNormalPage(0);
      }

      // Load VIP rooms
      const vipResponse = await getRoomVipUser(0, 4);
      setVipRooms(vipResponse);

      // Load normal rooms
      const normalResponse = await getRoomNormalUser(0, 6);
      setNormalRooms(normalResponse);

    } catch (error) {
      console.error('Error loading rooms:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreVipRooms = async () => {
    if (!vipRooms || vipPage + 1 >= vipRooms.totalPages) return;
    
    try {
      const nextPage = vipPage + 1;
      const response = await getRoomVipUser(nextPage, 4);
      
      setVipRooms(prev => prev ? {
        ...response,
        data: [...prev.data, ...response.data]
      } : response);
      setVipPage(nextPage);
    } catch (error) {
      console.error('Error loading more VIP rooms:', error);
    }
  };

  const loadMoreNormalRooms = async () => {
    if (!normalRooms || normalPage + 1 >= normalRooms.totalPages) return;
    
    try {
      const nextPage = normalPage + 1;
      const response = await getRoomNormalUser(nextPage, 6);
      
      setNormalRooms(prev => prev ? {
        ...response,
        data: [...prev.data, ...response.data]
      } : response);
      setNormalPage(nextPage);
    } catch (error) {
      console.error('Error loading more normal rooms:', error);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const onRefresh = () => {
    loadRooms(true);
  };

  const renderVipRoom = ({ item }: { item: RoomInUser }) => (
    <RoomCard room={item} />
  );

  const renderNormalRoom = ({ item }: { item: RoomInUser }) => (
    <RoomCard room={item} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading rooms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* VIP Rooms Section */}
      {vipRooms && vipRooms.data.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌟 Premium Listings</Text>
            <Text style={styles.sectionSubtitle}>
              Hand-picked premium rooms for the discerning renter
            </Text>
          </View>
          
          <FlatList
            data={vipRooms.data}
            renderItem={renderVipRoom}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            onEndReached={loadMoreVipRooms}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}

      {/* Normal Rooms Section */}
      {normalRooms && normalRooms.data.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏠 Featured Properties</Text>
            <Text style={styles.sectionSubtitle}>
              Discover our most popular and highly-rated rental properties
            </Text>
          </View>
          
          <FlatList
            data={normalRooms.data}
            renderItem={renderNormalRoom}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridList}
            columnWrapperStyle={styles.row}
            onEndReached={loadMoreNormalRooms}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        </View>
      )}

      {/* Empty State */}
      {(!vipRooms?.data.length && !normalRooms?.data.length) && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No rooms available</Text>
          <Text style={styles.emptySubtitle}>
            Please try again later or contact support
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  gridList: {
    paddingHorizontal: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
