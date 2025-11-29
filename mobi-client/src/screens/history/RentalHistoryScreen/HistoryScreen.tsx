import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { RentalData, BookingResponse } from '../../../types/rental';
import { userFetchBookings } from '../../../services/BookingService';
import RentalHistoryItem from '../../../components/history/RentalHistoryItem';
import PaymentModal from '../../../components/history/PaymentModal';
import RequestModal from '../../../components/history/RequestModal';
import ImageViewModal from '../../../components/history/ImageViewModal';
import styles from '../../../styles/screens/user/HistoryScreen.styles';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [bookings, setBookings] = useState<RentalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');

  const mapBookingToRentalData = (booking: BookingResponse): RentalData => {
    const address = booking.room.address;
    const fullAddress = `${address.street}, ${address.ward.name}, ${address.ward.district.name}, ${address.ward.district.province.name}`;
    
    return {
      key: booking.bookingId,
      name_landlord: booking.room.ownerName,
      phone_landlord: booking.room.ownerPhone || 'Phone not updated',
      room: booking.room.title,
      idRoom: booking.room.roomId,
      address: fullAddress,
      rentalDate: booking.rentalDate
        ? new Date(booking.rentalDate).toISOString().slice(0, 10)
        : '',
      expires: booking.rentalExpires
        ? new Date(booking.rentalExpires).toISOString().slice(0, 10)
        : '',
      tenants: booking.tenantCount,
      price: booking.room.priceMonth
        ? `${booking.room.priceMonth.toLocaleString()}₫`
        : '',
      status: booking.status,
      isRemoved: booking.isRemoved,
      imageProof: booking.imageProof || '',
    };
  };

  const fetchBookings = async (pageNum: number, append = false) => {
    if (loading || (!append && refreshing)) return;

    if (append) {
      if (!hasMore || pageNum >= totalPages) return;
    }

    try {
      if (append) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      //console.log(' HistoryScreen - Fetching bookings, page:', pageNum, 'append:', append);
      
      const response = await userFetchBookings(pageNum, 10);
      
      //console.log(' HistoryScreen - Response:', JSON.stringify(response, null, 2));
      
      const fetchedBookings = response.bookings || response;
      const total = response.totalPages || 1;

      //console.log(' HistoryScreen - Fetched bookings count:', fetchedBookings.length);
      //console.log(' HistoryScreen - Total pages:', total);

      const mappedBookings = fetchedBookings.map(mapBookingToRentalData);

      if (append) {
        setBookings((prev) => [...prev, ...mappedBookings]);
      } else {
        setBookings(mappedBookings);
      }

      setTotalPages(total);
      setHasMore(pageNum + 1 < total);
    } catch (error) {
      console.error(' HistoryScreen - Failed to fetch bookings:', error);
      console.error(' Error details:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Check token on mount
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('userData');
      //console.log(' Auth Check - Token exists:', !!token);
      //console.log(' Auth Check - Token preview:', token ? `${token.substring(0, 30)}...` : 'NULL');
      //console.log(' Auth Check - UserData:', userData);
    };
    
    checkAuth();
    fetchBookings(0, false);
  }, []);

  const handleRefresh = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchBookings(0, false);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBookings(nextPage, true);
    }
  }, [hasMore, loading, page]);

  const handlePressRequest = (roomId: string) => {
    setSelectedRoomId(roomId);
    setRequestModalVisible(true);
  };

  const handlePressPayment = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setPaymentModalVisible(true);
  };

  const handlePressImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setImageModalVisible(true);
  };

  const handlePressRoomDetail = (roomId: string) => {
    // Navigate to HistoryRoomDetail screen
    navigation.navigate('HistoryRoomDetail', { roomId });
  };

  const handleModalSuccess = () => {
    handleRefresh();
  };

  const renderItem = ({ item }: { item: RentalData }) => (
    <RentalHistoryItem
      item={item}
      onPressRequest={handlePressRequest}
      onPressPayment={handlePressPayment}
      onPressImage={handlePressImage}
      onPressRoomDetail={handlePressRoomDetail}
    />
  );

  const renderEmpty = () => {
    if (loading || refreshing) return null;

    return (
      <View style={styles.emptyState}>
        <Ionicons name="document-text-outline" size={80} color="#BDBDBD" />
        <Text style={styles.emptyTitle}>Không có lịch sử thuê phòng</Text>
        <Text style={styles.emptySubtitle}>
          Lịch sử thuê phòng của bạn sẽ xuất hiện ở đây khi bạn bắt đầu thuê phòng
        </Text>
        <TouchableOpacity style={styles.browseButton}>
          <Ionicons name="search-outline" size={20} color="#FFF" />
          <Text style={styles.browseButtonText}>Tìm phòng</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1976D2" />
        <Text style={styles.footerLoaderText}>Đang tải thêm...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử thuê phòng</Text>
        <Text style={styles.headerSubtitle}>
          {bookings.length} {bookings.length === 1 ? 'phòng đã thuê' : 'phòng đã thuê'}
        </Text>
      </View>

      {/* List */}
      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={[
          styles.listContent,
          bookings.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1976D2']}
            tintColor="#1976D2"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* Modals */}
      <PaymentModal
        visible={paymentModalVisible}
        bookingId={selectedBookingId}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={handleModalSuccess}
      />

      <RequestModal
        visible={requestModalVisible}
        roomId={selectedRoomId}
        onClose={() => setRequestModalVisible(false)}
        onSuccess={handleModalSuccess}
      />

      <ImageViewModal
        visible={imageModalVisible}
        imageUrl={selectedImageUrl}
        onClose={() => setImageModalVisible(false)}
      />
    </SafeAreaView>
  );
}

