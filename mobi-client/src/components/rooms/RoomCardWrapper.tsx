// components/rooms/RoomCardWrapper.tsx
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RoomInUser } from '../../types/types';

export default function RoomCardWrapper({ children, room }: { children: React.ReactNode; room: RoomInUser }) {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    // Điều hướng đến màn hình chi tiết với ID của phòng
    navigation.navigate('Detail', { roomId: room.id });
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      {children}
    </TouchableOpacity>
  );
}
