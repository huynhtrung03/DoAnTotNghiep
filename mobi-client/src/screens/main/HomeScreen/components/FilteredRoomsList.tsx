// components/FilteredRoomsList.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { RoomInUser } from '../../../../types/types';
import RoomCard from '../../../../components/rooms/RoomCard/RoomCard';
import EmptyState from './EmptyState';

const { height } = Dimensions.get('window');

interface FilteredRoomsListProps {
  rooms: RoomInUser[];
  onClose: () => void;
  title?: string;
  onRefresh?: () => Promise<void>;
}

const FilteredRoomsList: React.FC<FilteredRoomsListProps> = ({
  rooms,
  onClose,
  title = 'Kết quả tìm kiếm',
  onRefresh,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Error refreshing:', error);
      } finally {
        setRefreshing(false);
      }
    }
  };
  return (
    <Animated.View entering={FadeIn.duration(300)} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="filter" size={20} color="#667EEA" />
          <Text style={styles.title}>
            {title} ({rooms.length})
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#6B7280" />
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
        contentContainerStyle={rooms.length === 0 ? styles.emptyListContent : styles.listContent}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#667EEA']}
              tintColor='#667EEA'
            />
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            icon="search-outline"
            title="Không tìm thấy phòng"
            message="Không có phòng nào phù hợp với tiêu chí tìm kiếm của bạn"
            actionLabel="Đóng"
            onActionPress={onClose}
          />
        }
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 5000, // Above floating buttons, below loading overlay
    elevation: 5000, // For Android
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },

  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  closeButton: {
    padding: 4,
  },

  listContent: {
    padding: 20,
    paddingBottom: 100,
  },

  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FilteredRoomsList;
