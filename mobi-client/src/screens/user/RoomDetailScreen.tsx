import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RoomDetailScreen({ route }: any) {
  const { roomId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room Detail</Text>
      <Text style={styles.roomId}>Room ID: {roomId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  roomId: {
    fontSize: 16,
    color: '#6B7280',
  },
});
