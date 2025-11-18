// components/cards/RoomCard.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
// import { Video } from 'expo-av'; // Import Video component
import { RoomInUser } from '../../types/types';
import { URL_IMAGE } from '../../services/Constant';
import RoomCardActions from './RoomCardActions';
// import RoomCardWrapper from './RoomCardWrapper';

const formatVNDPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

export default function RoomCard({ room }: { room: RoomInUser }) {
  const mainMediaUri = room.images?.[0]?.url 
    ? URL_IMAGE + room.images[0].url 
    : 'https://via.placeholder.com/400x300.png?text=No+Image';

  return (
    <View style={styles.card}>
        {/* Media Container */}
        <View style={styles.mediaContainer}>
          <ImageBackground source={{ uri: mainMediaUri }} style={styles.media} resizeMode="cover" />
          <View style={styles.overlay} />
          <View style={styles.heartContainer}>
            <RoomCardActions room={room} showHeartOnly />
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          <Text style={styles.province}>{room.address.ward.district.province.name}</Text>
          <Text style={styles.title} numberOfLines={2}>{room.title}</Text>
          <Text style={styles.address} numberOfLines={1}>
            {room.address.street}, {room.address.ward.name}, {room.address.ward.district.name}
          </Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="ruler-square" size={16} color="#6B7280" />
              <Text style={styles.infoText}>{room.area} m²</Text>
            </View>
          </View>
          
          <View style={styles.separator} />
          
          <View style={styles.footer}>
            <View>
              <Text style={styles.priceLabel}>Giá mỗi tháng</Text>
              <Text style={styles.price}>{formatVNDPrice(room.priceMonth)} VNĐ</Text>
            </View>
            {/* Chúng ta sẽ đặt Actions ở đây thay vì footer của card */}
            {/* <RoomCardActions room={room} /> */}
          </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  mediaContainer: {
    height: 250,
    backgroundColor: '#E5E7EB',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  heartContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  videoControls: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 16,
  },
  province: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
  },
  address: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 6,
    color: '#374151',
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: '#6B7280',
    fontSize: 12,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16A34A', // Green color for price
  },
});