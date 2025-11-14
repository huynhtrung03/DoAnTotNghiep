import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import styles from '../../styles/screens/user/RoomDetailScreen.styles';

export default function RoomDetailScreen({ route }: any) {
  const { roomId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Room Detail</Text>
      <Text style={styles.roomId}>Room ID: {roomId}</Text>
    </View>
  );
}

