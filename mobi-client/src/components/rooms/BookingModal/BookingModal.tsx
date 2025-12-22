import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBooking } from '../../../services/BookingService';
import BookingNotification from '../../../services/notification/BookingNotification';
import styles from './BookingModal.styles';

interface BookingModalProps {
  visible: boolean;
  roomId: string;
  roomTitle: string;
  priceMonth: number;
  maxPeople: number;
  onClose: () => void;
  onSuccess: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  roomId,
  roomTitle,
  priceMonth,
  maxPeople,
  onClose,
  onSuccess,
}) => {
  const navigation = useNavigation();
  const [rentalMonths, setRentalMonths] = useState(1);
  const [tenantCount, setTenantCount] = useState(1);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);


  // Helper to get ISO string at midnight (00:00:00.000Z)
  const getISODateAtMidnight = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const startDate = new Date(); // Ngày bắt đầu luôn là hôm nay
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + rentalMonths);

  const calculateTotal = () => {
    return rentalMonths * priceMonth;
  };

  const calculateDeposit = () => {
    return priceMonth; // 1 tháng tiền cọc
  };

  const handleSubmit = async () => {
    // Validation
    if (tenantCount < 1) {
      Alert.alert('Lỗi', 'Vui lòng nhập số người hợp lệ');
      return;
    }

    if (tenantCount > maxPeople) {
      Alert.alert('Lỗi', `Số người tối đa là ${maxPeople}`);
      return;
    }

    setLoading(true);
    try {
      // Get user ID from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.id;

      //  STEP 1: Validate userId BEFORE proceeding
      console.log(" Validating userId:", { userId, userData });
      
      if (!userId) {
        throw new Error('Vui lòng đăng nhập để đặt phòng');
      }

      if (typeof userId === 'string' && userId.trim() === '') {
        throw new Error('User ID không hợp lệ. Vui lòng đăng nhập lại');
      }

      console.log(" userId validation passed:", userId);

      const bookingData = {
        roomId: roomId,
        rentalDate: getISODateAtMidnight(startDate),
        rentalExpires: getISODateAtMidnight(endDate),
        tenantCount: tenantCount,
      };

      console.log('Booking data to be sent:', bookingData);

      //  STEP 2: Create booking
      const result = await createBooking(bookingData, userId.toString());
      console.log(' Booking created successfully:', result);

      //  STEP 3: Send notification in background (không block UI)
      // Nếu notification lỗi, KHÔNG làm fail toàn bộ booking
      console.log(" Sending notification to landlord...");
      BookingNotification.sendLandlordNotification(
        roomId,
        userId,
        `You have a new booking from a tenant for room: "${roomTitle}". Tenant count: ${tenantCount}, Duration: ${rentalMonths} months.`
      ).catch((notificationError) => {
        console.warn("️ Notification failed (non-critical):", notificationError);
        // Không throw error - booking đã thành công, chỉ notification lỗi
      });

      //  STEP 4: Show Local Notification (Firebase/Expo style)
      // Sử dụng BookingNotification service mới
      console.log(" Showing local notification...");
      BookingNotification.notifyBookingSuccess(roomTitle);

      // Đóng modal booking trước
      handleClose();

      // Hiển thị modal xác nhận sau khi đóng modal booking
      setTimeout(() => {
        setShowConfirmModal(true);
      }, 300);

    } catch (error: any) {
      console.error('BookingForm - Error occurred:', error);

      let errorMessage = 'Failed to create booking';

      if (error instanceof Error) {
        console.error('BookingForm - Error message:', error.message);

        try {
          const errorData = JSON.parse(error.message);
          if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          errorMessage = error.message;
        }
      }

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRentalMonths(1);
    setTenantCount(1);
    setNote('');
    onClose();
  };

  const handleConfirmModalClose = () => {
    setShowConfirmModal(false);
  };

  const handleViewRentalHistory = () => {
    setShowConfirmModal(false);
    // Navigate to History tab
    navigation.navigate('History' as never);
  };

  const handleStayHere = () => {
    setShowConfirmModal(false);
    onSuccess?.();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="calendar" size={24} color="#1976D2" />
              <Text style={styles.title}>Đặt phòng</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Room Info Card */}
              <View style={styles.roomInfoCard}>
                <Text style={styles.roomTitle}>{roomTitle}</Text>
                <Text style={styles.roomPrice}>
                  {priceMonth?.toLocaleString('vi-VN')} VNĐ/tháng
                </Text>
              </View>

              {/* Rental Period Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-outline" size={20} color="#1976D2" />
                  <Text style={styles.sectionTitle}>Thời gian thuê</Text>
                </View>

                <View style={styles.periodCard}>
                  <View style={styles.periodRow}>
                    <Text style={styles.periodLabel}>Ngày bắt đầu:</Text>
                    <Text style={styles.periodValue}>
                      {startDate.toLocaleDateString('vi-VN')} (Hôm nay)
                    </Text>
                  </View>

                  <View style={styles.periodRow}>
                    <Text style={styles.periodLabel}>Ngày kết thúc:</Text>
                    <Text style={styles.periodValue}>
                      {endDate.toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Rental Duration Select */}
              <View style={styles.section}>
                <Text style={styles.label}>Thời gian thuê (Tháng) *</Text>
                <View style={styles.selectContainer}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                    <TouchableOpacity
                      key={month}
                      style={[
                        styles.selectOption,
                        rentalMonths === month && styles.selectOptionSelected,
                      ]}
                      onPress={() => setRentalMonths(month)}
                    >
                      <Text
                        style={[
                          styles.selectOptionText,
                          rentalMonths === month && styles.selectOptionTextSelected,
                        ]}
                      >
                        {month} {'Tháng'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Total Cost Preview */}
              {rentalMonths > 0 && (
                <View style={styles.costCard}>
                  <View style={styles.costHeader}>
                    <Ionicons name="calculator" size={20} color="#10B981" />
                    <Text style={styles.costTitle}>Tổng chi phí</Text>
                  </View>

                  <View style={styles.costRow}>
                    <Text style={styles.costLabel}>{rentalMonths} tháng ×</Text>
                    <Text style={styles.costValue}>
                      {priceMonth.toLocaleString('vi-VN')} VNĐ/tháng
                    </Text>
                  </View>

                  <View style={styles.costDivider} />

                  <View style={styles.totalCostRow}>
                    <Text style={styles.totalCostLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalCostValue}>
                      {calculateTotal().toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>

                  <View style={styles.depositRow}>
                    <Text style={styles.depositLabel}>Tiền cọc (1 tháng):</Text>
                    <Text style={styles.depositValue}>
                      {calculateDeposit().toLocaleString('vi-VN')} VNĐ
                    </Text>
                  </View>
                </View>
              )}

              {/* Number of Tenants */}
              <View style={styles.section}>
                <Text style={styles.label}>Số lượng người ở *</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nhập số lượng người"
                      placeholderTextColor="#BDBDBD"
                    value={tenantCount.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text);
                      if (!isNaN(num) && num >= 1) {
                        setTenantCount(num);
                      }
                    }}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                  <Text style={styles.inputSuffix}>người</Text>
                </View>
                <Text style={styles.hint}>Tối đa: {maxPeople} người</Text>
              </View>

              {/* Note */}
              <View style={styles.section}>
                <Text style={styles.label}>Ghi chú (Tùy chọn)</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Thêm ghi chú cho chủ nhà..."
                  placeholderTextColor="#BDBDBD"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.submitButtonText}>Đang xử lý...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>Xác nhận đặt phòng</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleConfirmModalClose}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            <View style={styles.confirmModalHeader}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.confirmModalTitle}>Đặt phòng thành công!</Text>
            </View>

            <Text style={styles.confirmModalMessage}>
              Bạn có muốn xem lịch sử thuê phòng hoặc ở lại trang này không?
            </Text>

            <View style={styles.confirmModalButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.stayButton]}
                onPress={handleStayHere}
              >
                <Text style={styles.stayButtonText}>Ở lại đây</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, styles.historyButton]}
                onPress={handleViewRentalHistory}
              >
                <Ionicons name="list" size={20} color="#FFF" />
                <Text style={styles.historyButtonText}>Xem lịch sử thuê</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default BookingModal;
