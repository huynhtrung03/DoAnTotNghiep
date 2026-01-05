import React from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ListRenderItem } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomInUser } from '../../../../types/types';
import HorizontalRoomCard from './HorizontalRoomCard';

type SortOption = 'newest' | 'price-asc' | 'price-desc';

interface RoomListSectionProps {
  rooms: RoomInUser[];
  onRoomPress: (room: RoomInUser) => void;
  onFavoriteToggle?: (roomId: string) => void;
  favoriteIds?: string[];
  sortBy?: SortOption;
  onSortChange?: (sort: SortOption) => void;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshControl?: React.ReactElement<any>;
}

const RoomListSection: React.FC<RoomListSectionProps> = ({
  rooms,
  onRoomPress,
  onFavoriteToggle,
  favoriteIds = [],
  sortBy = 'newest',
  onSortChange,
  onEndReached,
  isLoadingMore,
  ListHeaderComponent,
  ListFooterComponent,
  refreshControl,
}) => {
  const renderSortButton = (option: SortOption, label: string, icon: keyof typeof Ionicons.glyphMap) => {
    const isActive = sortBy === option;
    
    return (
      <TouchableOpacity
        key={option}
        style={[styles.sortButton, isActive && styles.sortButtonActive]}
        onPress={() => onSortChange?.(option)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon}
          size={16}
          color={isActive ? '#667EEA' : '#6B7280'}
        />
        <Text style={[styles.sortText, isActive && styles.sortTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem: ListRenderItem<RoomInUser> = ({ item }) => (
    <HorizontalRoomCard
      room={item}
      onPress={onRoomPress}
      isFavorite={favoriteIds.includes(item.id)}
      onFavoriteToggle={onFavoriteToggle}
    />
  );

  const renderHeader = () => (
    <>
      {ListHeaderComponent}
      
      {/* Sticky Sort Bar */}
      <View style={styles.stickyHeader}>
        <Text style={styles.sectionTitle}>Tất cả phòng trọ</Text>
        
        <View style={styles.sortButtons}>
          {renderSortButton('newest', 'Mới nhất', 'time-outline')}
          {renderSortButton('price-asc', 'Giá thấp', 'arrow-up')}
          {renderSortButton('price-desc', 'Giá cao', 'arrow-down')}
        </View>
      </View>
    </>
  );

  return (
    <FlatList
      data={rooms}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={ListFooterComponent}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      removeClippedSubviews={true}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={5}
      nestedScrollEnabled={true} // Enable nested scrolling
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 120, // Space for floating buttons
  },

  stickyHeader: {
    backgroundColor: '#FAFAFA',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },

  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },

  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  sortButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667EEA',
  },

  sortText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  sortTextActive: {
    color: '#667EEA',
  },
});

export default RoomListSection;
