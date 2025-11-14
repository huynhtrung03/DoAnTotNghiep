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
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBooking } from '../../../services/rooms/BookingService';
import { createBookingNotification } from '../../../services/statistics/NotificationService';
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 1 month from now
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [numberOfTenants, setNumberOfTenants] = useState('1');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateMonths = () => {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 30);
  };

  const calculateTotal = () => {
    const months = calculateMonths();
    return months * priceMonth;
  };

  const calculateDeposit = () => {
    return priceMonth; // 1 tháng tiền cọc
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
      // Tự động set end date = start date + 1 tháng nếu end date < start date
      if (selectedDate >= endDate) {
        const newEndDate = new Date(selectedDate);
        newEndDate.setMonth(newEndDate.getMonth() + 1);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    // Validation
    const tenants = parseInt(numberOfTenants);
    if (isNaN(tenants) || tenants < 1) {
      Alert.alert('Lỗi', 'Vui lòng nhập số người hợp lệ');
      return;
    }

    if (tenants > maxPeople) {
      Alert.alert('Lỗi', `Số người tối đa là ${maxPeople}`);
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    setLoading(true);
    try {
      // Get user ID from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.id;

      if (!userId) {
        throw new Error('Vui lòng đăng nhập để đặt phòng');
      }

      const bookingData = {
        roomId: roomId,
        userId: userId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: calculateTotal(),
        depositAmount: calculateDeposit(),
        numberOfTenants: tenants,
        note: note.trim() || undefined,
      };

      // Create booking
      const result = await createBooking(bookingData);

      // Send notification to landlord
      await createBookingNotification(
        roomId,
        userId,
        `Có booking mới cho phòng "${roomTitle}". Số người: ${tenants}, Thời gian: ${calculateMonths()} tháng.`
      );

      Alert.alert(
        'Thành công! 🎉',
        'Đặt phòng thành công! Vui lòng chờ chủ nhà xác nhận và thanh toán tiền cọc.',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              onSuccess();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Booking error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể đặt phòng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setNumberOfTenants('1');
    setNote('');
    onClose();
  };

  return (
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
            <Text style={styles.title}>Đặt phòng</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Room Info */}
            <View style={styles.roomInfoCard}>
              <Ionicons name="home" size={24} color="#1976D2" />
              <View style={styles.roomInfoText}>
                <Text style={styles.roomTitle} numberOfLines={1}>
                  {roomTitle}
                </Text>
                <Text style={styles.roomPrice}>
                  {priceMonth.toLocaleString()} ₫/tháng
                </Text>
              </View>
            </View>

            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Ionicons name="calendar-outline" size={16} color="#1976D2" />{' '}
                Thời gian thuê *
              </Text>

              {/* Start Date */}
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartPicker(true)}
              >
                <View style={styles.dateButtonContent}>
                  <Text style={styles.dateLabel}>Ngày bắt đầu:</Text>
                  <Text style={styles.dateValue}>
                    {startDate.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <Ionicons name="calendar" size={20} color="#1976D2" />
              </TouchableOpacity>

              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                  minimumDate={new Date()}
                />
              )}

              {/* End Date */}
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndPicker(true)}
              >
                <View style={styles.dateButtonContent}>
                  <Text style={styles.dateLabel}>Ngày kết thúc:</Text>
                  <Text style={styles.dateValue}>
                    {endDate.toLocaleDateString('vi-VN')}
                  </Text>
                </View>
                <Ionicons name="calendar" size={20} color="#1976D2" />
              </TouchableOpacity>

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                  minimumDate={startDate}
                />
              )}

              {/* Duration */}
              <View style={styles.durationCard}>
                <Text style={styles.durationText}>
                  Thời gian: <Text style={styles.durationValue}>{calculateMonths()} tháng</Text>
                </Text>
              </View>
            </View>

            {/* Number of Tenants */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Ionicons name="people-outline" size={16} color="#1976D2" />{' '}
                Số người ở *
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={`Tối đa ${maxPeople} người`}
                  placeholderTextColor="#BDBDBD"
                  value={numberOfTenants}
                  onChangeText={setNumberOfTenants}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.inputSuffix}>người</Text>
              </View>
              <Text style={styles.hint}>Số người tối đa: {maxPeople}</Text>
            </View>

            {/* Note */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Ionicons name="document-text-outline" size={16} color="#1976D2" />{' '}
                Ghi chú (tùy chọn)
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Thêm ghi chú cho chủ nhà..."
                placeholderTextColor="#BDBDBD"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Tổng quan</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Thời gian:</Text>
                <Text style={styles.summaryValue}>{calculateMonths()} tháng</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Giá thuê/tháng:</Text>
                <Text style={styles.summaryValue}>{priceMonth.toLocaleString()} ₫</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tiền cọc:</Text>
                <Text style={[styles.summaryValue, styles.depositValue]}>
                  {calculateDeposit().toLocaleString()} ₫
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng tiền:</Text>
                <Text style={styles.totalValue}>
                  {calculateTotal().toLocaleString()} ₫
                </Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionsTitle}>Lưu ý:</Text>
                <Text style={styles.instructionsText}>
                  • Chủ nhà sẽ xem xét và xác nhận booking{'\n'}
                  • Bạn cần thanh toán tiền cọc sau khi được xác nhận{'\n'}
                  • Tiền cọc = 1 tháng tiền phòng{'\n'}
                  • Kiểm tra kỹ thông tin trước khi xác nhận
                </Text>
              </View>
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
  );
};

export default BookingModal;
