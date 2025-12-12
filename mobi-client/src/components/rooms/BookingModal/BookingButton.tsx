import { Pressable, Text, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { RoomDetail } from '../../../types/types';
import BookingModal from './BookingModal';

interface BookingButtonProps {
  room: RoomDetail;
  style?: any;
}

export default function BookingButton({ room, style }: BookingButtonProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
  };

  return (
    <>
      <Pressable 
        onPress={() => setShowBookingModal(true)}
        style={[styles.bookingButton, style]}
      >
        <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
        <Text style={styles.bookingButtonText}>Đặt ngay</Text>
      </Pressable>

      <BookingModal
        visible={showBookingModal}
        roomId={room.id}
        roomTitle={room.title}
        priceMonth={room.priceMonth || 0}
        maxPeople={room.maxPeople || 1}
        onClose={() => setShowBookingModal(false)}
        onSuccess={handleBookingSuccess}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bookingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});