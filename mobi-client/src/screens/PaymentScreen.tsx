import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useZaloPayPayment, PaymentStatus } from '../hooks/useZaloPayPayment';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentScreen() {
  const {
    status,
    loading,
    error,
    transactionId,
    startPayment,
    reset,
    openStore,
    isSuccess,
    isFailed,
    isCanceled,
    isAppNotInstalled,
  } = useZaloPayPayment();

  /**
   * Xử lý khi thanh toán thành công
   */
  useEffect(() => {
    if (isSuccess) {
      const successTime = new Date().toISOString();
      console.log(`[${successTime}] 🎉 [PaymentScreen] Payment SUCCESS detected`);
      console.log(`[${successTime}] 🎉 [PaymentScreen] Transaction ID:`, transactionId);
      console.log(`[${successTime}] 🎉 [PaymentScreen] Status:`, status);

      Alert.alert(
        '🎉 Thanh toán thành công',
        `Mã giao dịch: ${transactionId}`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log(`[${new Date().toISOString()}] ✅ [PaymentScreen] User clicked OK, resetting payment`);
              reset();
              // TODO: Navigate về màn hình wallet hoặc reload balance
            },
          },
        ]
      );
    }
  }, [isSuccess, transactionId]);

  /**
   * Xử lý khi thanh toán thất bại
   */
  useEffect(() => {
    if (isFailed) {
      const failTime = new Date().toISOString();
      console.log(`[${failTime}] ❌ [PaymentScreen] Payment FAILED detected`);
      console.log(`[${failTime}] ❌ [PaymentScreen] Error:`, error);
      console.log(`[${failTime}] ❌ [PaymentScreen] Status:`, status);

      Alert.alert('❌ Thanh toán thất bại', error || 'Vui lòng thử lại', [
        { text: 'Thử lại', onPress: () => {
          console.log(`[${new Date().toISOString()}] 🔄 [PaymentScreen] User clicked retry`);
          reset();
        }},
        { text: 'Hủy', style: 'cancel', onPress: () => {
          console.log(`[${new Date().toISOString()}] 🚫 [PaymentScreen] User clicked cancel`);
        }},
      ]);
    }
  }, [isFailed, error]);

  /**
   * Xử lý khi user hủy thanh toán
   */
  useEffect(() => {
    if (isCanceled) {
      const cancelTime = new Date().toISOString();
      console.log(`[${cancelTime}] ⚠️ [PaymentScreen] Payment CANCELED detected`);
      console.log(`[${cancelTime}] ⚠️ [PaymentScreen] Status:`, status);

      Alert.alert('⚠️ Đã hủy thanh toán', 'Bạn có muốn thử lại không?', [
        { text: 'Thử lại', onPress: () => {
          console.log(`[${new Date().toISOString()}] 🔄 [PaymentScreen] User clicked retry after cancel`);
          reset();
        }},
        { text: 'Đóng', style: 'cancel', onPress: () => {
          console.log(`[${new Date().toISOString()}] 🚫 [PaymentScreen] User clicked close after cancel`);
          reset();
        }},
      ]);
    }
  }, [isCanceled]);

  /**
   * Xử lý khi chưa cài ZaloPay
   */
  useEffect(() => {
    if (isAppNotInstalled) {
      const noAppTime = new Date().toISOString();
      console.log(`[${noAppTime}] 📱 [PaymentScreen] ZaloPay APP NOT INSTALLED detected`);
      console.log(`[${noAppTime}] 📱 [PaymentScreen] Status:`, status);

      Alert.alert(
        '📱 Chưa cài đặt ZaloPay',
        'Bạn cần cài đặt ứng dụng ZaloPay để thanh toán',
        [
          { text: 'Cài đặt ngay', onPress: () => {
            console.log(`[${new Date().toISOString()}] 📥 [PaymentScreen] User clicked install ZaloPay`);
            openStore();
          }},
          { text: 'Để sau', style: 'cancel', onPress: () => {
            console.log(`[${new Date().toISOString()}] ⏰ [PaymentScreen] User clicked later for ZaloPay install`);
            reset();
          }},
        ]
      );
    }
  }, [isAppNotInstalled]);

  /**
   * Xử lý nút nạp tiền
   */
  const handleTopUp = async (amount: number) => {
    const startTime = new Date().toISOString();
    console.log(`[${startTime}] 💰 [PaymentScreen] handleTopUp called with amount:`, amount);

    try {
      const userDataString = await AsyncStorage.getItem('userData');
      console.log(`[${new Date().toISOString()}] 💾 [PaymentScreen] Retrieved userData from storage`);

      if (!userDataString) {
        console.error(`[${new Date().toISOString()}] ❌ [PaymentScreen] No userData found in storage`);
        Alert.alert('Lỗi', 'Vui lòng đăng nhập');
        return;
      }

      const userData = JSON.parse(userDataString);
      const userId = userData.id;
      console.log(`[${new Date().toISOString()}] 👤 [PaymentScreen] Parsed userId:`, userId);

      if (!userId) {
        console.error(`[${new Date().toISOString()}] ❌ [PaymentScreen] No userId in userData:`, userData);
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
        return;
      }

      console.log(`[${new Date().toISOString()}] 🚀 [PaymentScreen] Starting payment with userId:`, userId, 'amount:', amount);
      await startPayment({
        amount,
        userId,
        description: `Nạp ${amount.toLocaleString('vi-VN')} VND vào ví`,
      });

      console.log(`[${new Date().toISOString()}] ✅ [PaymentScreen] startPayment completed successfully`);
    } catch (err) {
      const errorTime = new Date().toISOString();
      console.error(`[${errorTime}] ❌ [PaymentScreen] Error in handleTopUp:`, err);
      console.error(`[${errorTime}] ❌ [PaymentScreen] Error message:`, err instanceof Error ? err.message : 'Unknown error');
      console.error(`[${errorTime}] ❌ [PaymentScreen] Error stack:`, err instanceof Error ? err.stack : undefined);

      Alert.alert('Lỗi', 'Có lỗi xảy ra, vui lòng thử lại');
    }
  };

  /**
   * Render trạng thái
   */
  const renderStatus = () => {
    switch (status) {
      case PaymentStatus.CREATING_ORDER:
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Đang tạo đơn hàng...</Text>
          </View>
        );

      case PaymentStatus.OPENING_ZALOPAY:
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Đang mở ZaloPay...</Text>
          </View>
        );

      case PaymentStatus.PROCESSING:
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Đang xử lý thanh toán...</Text>
            <Text style={styles.statusSubtext}>
              Vui lòng hoàn tất thanh toán trên ZaloPay
            </Text>
          </View>
        );

      case PaymentStatus.QUERYING_STATUS:
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Đang kiểm tra trạng thái...</Text>
          </View>
        );

      case PaymentStatus.VERIFYING:
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Đang xác nhận thanh toán...</Text>
            <Text style={styles.statusSubtext}>
              Vui lòng đợi trong giây lát
            </Text>
          </View>
        );

      case PaymentStatus.PAYMENT_PROCESSING:
        return (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.statusText}>Đang xác minh thanh toán...</Text>
            <Text style={styles.statusSubtext}>
              Vui lòng đợi, hệ thống đang kiểm tra
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nạp tiền vào ví</Text>

      {/* Các mức nạp tiền */}
      <View style={styles.amountContainer}>
        {[50000, 100000, 200000, 500000].map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.amountButton}
            onPress={() => handleTopUp(amount)}
            disabled={loading}
          >
            <Text style={styles.amountText}>
              {amount.toLocaleString('vi-VN')} đ
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Hiển thị trạng thái */}
      {renderStatus()}

      {/* Nút reset nếu cần */}
      {(isFailed || isCanceled) && (
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <Text style={styles.resetButtonText}>Thử lại</Text>
        </TouchableOpacity>
      )}

      {/* Lưu ý */}
      <View style={styles.noteContainer}>
        <Text style={styles.noteTitle}>📌 Lưu ý:</Text>
        <Text style={styles.noteText}>
          • Bạn cần cài đặt ứng dụng ZaloPay để thanh toán{'\n'}
          • Số tiền sẽ được cập nhật sau khi thanh toán thành công{'\n'}
          • Giao dịch an toàn và bảo mật 100%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  amountButton: {
    width: '48%',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  amountText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});