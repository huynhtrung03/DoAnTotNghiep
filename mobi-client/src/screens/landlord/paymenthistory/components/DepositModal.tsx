import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../../../colors/colors';
import { createPayment } from '../../../../services/PaymentServive';
import NotificationService from '../../../../services/NotificationServiceMobi';

interface DepositModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PaymentResponse {
  zpTransToken?: string;
  paymentUrl?: string;
}

const DepositModal: React.FC<DepositModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState<string>('50000');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K₫';
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const handleDeposit = async () => {
    const amountNumber = Number(amount);
    const startTime = new Date().toISOString();
    console.log(`[${startTime}] 💳 [DepositModal] handleDeposit started with amount:`, amountNumber);

    if (amountNumber < 5000) {
      console.warn(`[${new Date().toISOString()}] ⚠️ [DepositModal] Amount too small: ${amountNumber}`);
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 5,000 VND');
      return;
    }

    if (!amountNumber || amountNumber <= 0) {
      console.warn(`[${new Date().toISOString()}] ⚠️ [DepositModal] Invalid amount: ${amountNumber}`);
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    setLoading(true);
    try {
      // Get userId from JWT token
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        console.error(`[${new Date().toISOString()}] ❌ [DepositModal] No accessToken found`);
        throw new Error('Không tìm thấy thông tin đăng nhập');
      }

      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = tokenPayload.id;
      console.log(`[${new Date().toISOString()}] 👤 [DepositModal] User ID: ${userId}`);

      const paymentData = {
        amount: amountNumber,
        description: description || `Nạp ${formatCurrency(amountNumber)} vào ví`,
        userId,
      };

      console.log(`[${new Date().toISOString()}] 📝 [DepositModal] Payment data:`, paymentData);

      const data = await createPayment(paymentData) as PaymentResponse;
      console.log(`[${new Date().toISOString()}] ✅ [DepositModal] Payment created successfully`);
      console.log(`[${new Date().toISOString()}] 🔗 [DepositModal] Payment URL:`, data.paymentUrl);

      if (!data.paymentUrl) {
        console.error(`[${new Date().toISOString()}] ❌ [DepositModal] No paymentUrl in response`);
        throw new Error('Không nhận được URL thanh toán');
      }

      // Gửi thông báo thanh toán thành công (payload created)
      console.log(`[${new Date().toISOString()}] 🔔 [DepositModal] Sending success notification`);
      NotificationService.notifyPaymentSuccess(amountNumber, `VNPay-${Date.now()}`);

      // Close modal first
      onClose();

      // Navigate to payment WebView using CommonActions to navigate to root stack
      console.log(`[${new Date().toISOString()}] 🚀 [DepositModal] Navigating to PaymentWebView`);
      navigation.dispatch(
        CommonActions.navigate({
          name: 'PaymentWebView',
          params: {
            paymentUrl: data.paymentUrl,
            // Remove onPaymentSuccess function to avoid non-serializable warning
            // Success will be handled by navigation listener in PaymentHistoryScreen
          },
        })
      );
      console.log(`[${new Date().toISOString()}] ✅ [DepositModal] Navigation dispatched successfully`);

      // Call onSuccess callback if provided
      if (onSuccess) {
        console.log(`[${new Date().toISOString()}] 📞 [DepositModal] Calling onSuccess callback`);
        onSuccess();
      }
    } catch (error: any) {
      const errorTime = new Date().toISOString();
      console.error(`[${errorTime}] ❌ [DepositModal] Payment error:`, error);
      console.error(`[${errorTime}] ❌ [DepositModal] Error message:`, error.message);
      console.error(`[${errorTime}] ❌ [DepositModal] Error stack:`, error.stack);

      // Gửi thông báo lỗi
      const errorMsg = error.message || 'Có lỗi xảy ra khi tạo thanh toán';
      console.log(`[${errorTime}] 🔔 [DepositModal] Sending error notification`);
      NotificationService.notifyPaymentError(errorMsg);

      Alert.alert(
        'Lỗi thanh toán',
        errorMsg
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('50000');
    setDescription('');
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Nạp tiền vào tài khoản</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={loading}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Số tiền nạp <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Nhập số tiền"
              editable={!loading}
            />
            <Text style={styles.amountDisplay}>
              {formatCurrency(Number(amount) || 0)}
            </Text>
            <Text style={styles.minAmount}>
              Số tiền tối thiểu: 5,000 VND
            </Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mô tả thanh toán</Text>
            <TextInput
              style={styles.descriptionInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả (tùy chọn)"
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>

          {/* Payment Method Info */}
          <View style={styles.paymentMethod}>
            <Text style={styles.label}>Phương thức thanh toán</Text>
            <View style={styles.methodBadge}>
              <Ionicons name="card-outline" size={20} color="#1976D2" />
              <Text style={styles.methodText}>VNPay</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={handleDeposit}
              disabled={loading || Number(amount) < 5000}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="card-outline" size={20} color="#FFF" />
                  <Text style={styles.confirmButtonText}>Thanh toán</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text style={styles.footer}>
            Được bảo mật bởi VNPay - Cổng thanh toán hàng đầu Việt Nam
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  amountDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  minAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethod: {
    marginBottom: 24,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  methodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default DepositModal;