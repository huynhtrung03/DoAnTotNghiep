import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCompareStore } from '../../stores/CompareStore';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../styles/colors';
import { formatPrice } from '../../utils/format';
import { URL_IMAGE } from '../../services/Constant';
import BookingButton from '../../components/rooms/BookingModal/BookingButton';


export default function CompareRoomsScreen() {
  const { items, clearItems } = useCompareStore();
  const navigation = useNavigation<any>(); // Thêm <any> để tránh lỗi type

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClearAll = () => {
    clearItems();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>So sánh phòng</Text>
        <Pressable onPress={handleClearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Xóa tất cả</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {items.length === 2 ? (
          <View style={styles.compareContainer}>
            {/* So sánh 2 phòng */}
            {/* <View style={styles.roomsRow}>
              {items.map((item, index) => (
                <View key={item.room.id} style={styles.roomColumn}>
                  <Image 
                    source={{ uri: item.room.images?.[0]?.url || 'https://via.placeholder.com/200x150' }} 
                    style={styles.roomImage}
                  />
                  <Text style={styles.roomTitle} numberOfLines={2}>
                    {item.room.title}
                  </Text>
                </View>
              ))}
            </View> */}
            <View style={styles.roomsRow}>
  {items.map((item, index) => (
    <View key={item.room.id} style={styles.roomColumn}>
      <Image 
        source={{ 
          uri: item.room.images?.[0]?.url 
            ? `${URL_IMAGE}${item.room.images[0].url.startsWith('/') ? item.room.images[0].url.slice(1) : item.room.images[0].url}`
            : 'https://via.placeholder.com/200x150' 
        }} 
        style={styles.roomImage}
      />
      <Text style={styles.roomTitle} numberOfLines={2}>
        {item.room.title}
      </Text>
    </View>
  ))}
</View>

            {/* Bảng so sánh */}

<View style={styles.compareTable}>
  {/* <View style={styles.bookingSection}>
    <Text style={styles.bookingSectionTitle}>Đặt phòng ngay</Text>
    <View style={styles.bookingButtons}>
      {items.map((item, index) => (
        <Pressable 
          key={`booking-${item.room.id}`}
          style={styles.bookingButton}
          onPress={() => {
            // Navigate to booking với roomId
            navigation.navigate('BookingScreen', { roomId: item.room.id });
          }}
        >
          <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
          <Text style={styles.bookingButtonText}>Đặt ngay</Text>
        </Pressable>
      ))}
    </View>
  </View> */}
  <View style={styles.bookingSection}>
  {/* <Text style={styles.bookingSectionTitle}>Đặt phòng ngay</Text> */}
  <View style={styles.bookingButtons}>
    {items.map((item, index) => (
      <BookingButton 
        key={`booking-${item.room.id}`}
        room={item.room}
      />
    ))}
  </View>
</View>
  <CompareRow 
    label="Giá thuê"
    values={[
      formatPrice(items[0].room.priceMonth || 0),
      formatPrice(items[1].room.priceMonth || 0)
    ]}
    highlight={(items[0].room.priceMonth || 0) !== (items[1].room.priceMonth || 0)}
  />
  <CompareRow 
    label="Diện tích"
    values={[
      `${items[0].room.area || 0} m²`,
      `${items[1].room.area || 0} m²`
    ]}
    highlight={(items[0].room.area || 0) !== (items[1].room.area || 0)}
  />
  <CompareRow 
    label="Kích thước"
    values={[
      `Dài: ${items[0].room.roomLength ?? '-'}m, Rộng: ${items[0].room.roomWidth ?? '-'}m`,
      `Dài: ${items[1].room.roomLength ?? '-'}m, Rộng: ${items[1].room.roomWidth ?? '-'}m`
    ]}
    highlight={
      (items[0].room.roomLength !== items[1].room.roomLength) ||
      (items[0].room.roomWidth !== items[1].room.roomWidth)
    }
  />
  <CompareRow 
    label="Số người tối đa"
    values={[
      `${items[0].room.maxPeople ?? '-'}`,
      `${items[1].room.maxPeople ?? '-'}`
    ]}
    highlight={items[0].room.maxPeople !== items[1].room.maxPeople}
  />
  <CompareRow 
    label="Giá điện"
    values={[
      items[0].room.elecPrice ? `${items[0].room.elecPrice.toLocaleString('vi-VN')}đ/kWh` : 'Theo hóa đơn',
      items[1].room.elecPrice ? `${items[1].room.elecPrice.toLocaleString('vi-VN')}đ/kWh` : 'Theo hóa đơn'
    ]}
    highlight={items[0].room.elecPrice !== items[1].room.elecPrice}
  />
  <CompareRow 
    label="Giá nước"
    values={[
      items[0].room.waterPrice ? `${items[0].room.waterPrice.toLocaleString('vi-VN')}đ/m³` : 'Theo hóa đơn',
      items[1].room.waterPrice ? `${items[1].room.waterPrice.toLocaleString('vi-VN')}đ/m³` : 'Theo hóa đơn'
    ]}
    highlight={items[0].room.waterPrice !== items[1].room.waterPrice}
  />
  <CompareRow 
    label="Địa chỉ"
    values={[
      [
        items[0].room.address?.street,
        items[0].room.address?.ward?.name,
        items[0].room.address?.ward?.district?.name,
        items[0].room.address?.ward?.district?.province?.name,
      ].filter(Boolean).join(', '),
      [
        items[1].room.address?.street,
        items[1].room.address?.ward?.name,
        items[1].room.address?.ward?.district?.name,
        items[1].room.address?.ward?.district?.province?.name,
      ].filter(Boolean).join(', ')
    ]}
    highlight={
      [
        items[0].room.address?.street,
        items[0].room.address?.ward?.name,
        items[0].room.address?.ward?.district?.name,
        items[0].room.address?.ward?.district?.province?.name,
      ].filter(Boolean).join(', ') !==
      [
        items[1].room.address?.street,
        items[1].room.address?.ward?.name,
        items[1].room.address?.ward?.district?.name,
        items[1].room.address?.ward?.district?.province?.name,
      ].filter(Boolean).join(', ')
    }
  />
  <CompareRow 
    label="Mô tả"
    values={[
      items[0].room.description || 'Không có',
      items[1].room.description || 'Không có'
    ]}
    highlight={items[0].room.description !== items[1].room.description}
  />
</View>

<View style={{ marginBottom: 24}}>
  <Text style={{fontWeight: 'bold', fontSize: 16, marginBottom: 8}}>Tiện nghi & Dịch vụ</Text>
  {Array.from(new Set([
    ...(items[0].room.convenients?.map(c => c.name) || []),
    ...(items[1].room.convenients?.map(c => c.name) || [])
  ])).map((name, idx) => (
    <View key={idx} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
      <Text style={{flex: 1, color: '#374151'}}>{name}</Text>
      <Ionicons
        name={items[0].room.convenients?.some(c => c.name === name) ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={items[0].room.convenients?.some(c => c.name === name) ? '#10B981' : '#F87171'}
        style={{marginHorizontal: 8}}
      />
      <Ionicons
        name={items[1].room.convenients?.some(c => c.name === name) ? 'checkmark-circle' : 'close-circle'}
        size={18}
        color={items[1].room.convenients?.some(c => c.name === name) ? '#10B981' : '#F87171'}
      />
    </View>
  ))}
</View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {items.map((item, index) => (
                <Pressable 
                  key={item.room.id} 
                  style={styles.actionButton}
                  onPress={() => {
                    // Navigate to room detail
                    navigation.navigate('RoomDetail', { roomId: item.room.id });
                  }}
                >
                  <Text style={styles.actionButtonText}>Xem chi tiết</Text>
                  <Ionicons name="arrow-forward" size={16} color={Colors.textWhite} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="home-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyTitle}>Chưa đủ phòng để so sánh</Text>
            <Text style={styles.emptySubtitle}>
              Vui lòng chọn 2 phòng để bắt đầu so sánh
            </Text>
            <Pressable onPress={handleBack} style={styles.backToHomeButton}>
              <Text style={styles.backToHomeButtonText}>Quay lại trang chủ</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CompareRow = ({ 
  label, 
  values, 
  highlight = false 
}: { 
  label: string; 
  values: string[];
  highlight?: boolean;
}) => (
  <View style={[styles.compareRow, highlight && styles.compareRowHighlight]}>
    <Text style={styles.compareLabel}>{label}</Text>
    <View style={styles.compareValues}>
      {values.map((value, index) => (
        <View key={index} style={styles.compareValueContainer}>
          <Text style={[
            styles.compareValue,
            highlight && styles.compareValueHighlight
          ]}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  bookingSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bookingSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  bookingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  bookingButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9800', // Màu cam cho nút đặt phòng
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  bookingButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  compareContainer: {
    flex: 1,
  },
  roomsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  roomColumn: {
    flex: 1,
    alignItems: 'center',
  },
  roomImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  compareTable: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  compareRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  compareRowHighlight: {
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  compareLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  compareValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  compareValueContainer: {
    flex: 1,
  },
  compareValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  compareValueHighlight: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backToHomeButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToHomeButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});