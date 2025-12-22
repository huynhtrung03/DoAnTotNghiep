// components/NormalRoomsList.tsx
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { RoomInUser } from '../../../../types/types';
import HorizontalRoomCard from './HorizontalRoomCard';

// Shuffle function để random vị trí (công bằng cho mọi landlord)
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

interface NormalRoomsListProps {
  rooms: RoomInUser[];
  onRoomPress: (room: RoomInUser) => void;
  onFavoriteToggle?: (roomId: string) => void;
  onSeeAllPress?: () => void;
  favoriteIds?: string[];
}

const NormalRoomsList: React.FC<NormalRoomsListProps> = ({
  rooms,
  onRoomPress,
  onFavoriteToggle,
  onSeeAllPress,
  favoriteIds = [],
}) => {
  // Random và chỉ lấy 5 phòng đầu tiên
  const displayRooms = useMemo(() => {
    const shuffled = shuffleArray(rooms);
    return shuffled.slice(0, 5);
  }, [rooms]);

  if (displayRooms.length === 0) {
    return null; // Không hiển thị nếu không có phòng
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Phòng Thường</Text>
        {onSeeAllPress && rooms.length > 5 && (
          <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
            <Text style={styles.seeAll}>Xem tất cả</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Room List */}
      <View style={styles.listContainer}>
        {displayRooms.map((room, index) => (
          <Animated.View 
            key={room.id} 
            entering={FadeIn.delay(index * 50).duration(300)}
          >
            <HorizontalRoomCard
              room={room}
              onPress={onRoomPress}
              isFavorite={favoriteIds.includes(room.id)}
              onFavoriteToggle={onFavoriteToggle}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },

  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },

  listContainer: {
    gap: 0, // HorizontalRoomCard đã có marginBottom
  },
});

export default NormalRoomsList;
