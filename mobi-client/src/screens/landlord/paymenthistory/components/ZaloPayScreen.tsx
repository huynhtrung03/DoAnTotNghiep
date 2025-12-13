import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  AppState,
  AppStateStatus,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../../../../styles/colors';
import ZaloPayService, { ZaloPayErrorCode } from '../../../../services/ZaloPayService';
import NotificationService from '../../../../services/NotificationServiceMobi';
import { ZaloPayApiService } from '../../../../services/api/ZaloPayApiService';

interface ZaloPayScreenProps {
  onSuccess?: () => void;
}

interface OrderResponse {
  zptranstoken?: string;
  zpTransToken?: string;
  transactionId: string;
}

enum PaymentState {
  IDLE = 'idle',
  CREATING_ORDER = 'creating_order',
  OPENING_ZALOPAY = 'opening_zalopay',
  WAITING_PAYMENT = 'waiting_payment',
  VERIFYING = 'verifying',
  SUCCESS = 'success',
  FAILED = 'failed',
}

const ZaloPayScreen: React.FC<ZaloPayScreenProps> = ({ onSuccess }) => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState<string>('50000');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [zaloPayInstalled, setZaloPayInstalled] = useState(true);
  const [paymentState, setPaymentState] = useState<PaymentState>(PaymentState.IDLE);
  
  // Refs to track payment
  const transactionIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const hasCallbackRef = useRef<boolean>(false);
  const isVerifiedRef = useRef<boolean>(false);
  const appState = useRef(AppState.currentState);
  const checkingRef = useRef<boolean>(false);
  const autoCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkZaloPay();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCheckTimeoutRef.current) {
        clearTimeout(autoCheckTimeoutRef.current);
      }
    };
  }, []);

  // 🔥 KEY FIX: Lắng nghe AppState để bắt sự kiện app quay lại từ background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [paymentState]);

  const resetState = () => {
    setPaymentState(PaymentState.IDLE);
    hasCallbackRef.current = false;
    isVerifiedRef.current = false;
    transactionIdRef.current = null;
    userIdRef.current = null;
    checkingRef.current = false;
    if (autoCheckTimeoutRef.current) {
      clearTimeout(autoCheckTimeoutRef.current);
      autoCheckTimeoutRef.current = null;
    }
  };

  const checkZaloPay = async () => {
    try {
      const installed = await ZaloPayService.isZaloPayInstalled();
      setZaloPayInstalled(installed);
      if (!installed) {
        console.warn('⚠️ ZaloPay app not installed');
      }
    } catch (error) {
      console.error('Error checking ZaloPay:', error);
      setZaloPayInstalled(false);
    }
  };

  // 🔥 KEY FIX: Xử lý sự kiện AppState - Khi user quay lại app từ background
  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    console.log('📱 [ZaloPayModal] AppState changed:', appState.current, '->', nextAppState);

    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('📱 [ZaloPayModal] App has come to the foreground!');

      // Nếu đang ở trạng thái chờ thanh toán, tự động kiểm tra
      if (
        (paymentState === PaymentState.WAITING_PAYMENT ||
          paymentState === PaymentState.OPENING_ZALOPAY) &&
        !isVerifiedRef.current
      ) {
        console.log('🔍 [ZaloPayModal] Auto-checking payment status on app resume');
        checkPaymentStatusWhenAppResumes();
      }
    }

    appState.current = nextAppState;
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K₫';
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  /**
   * 🔥 KEY FIX: Query backend to verify payment status
   */
  const queryPaymentStatus = async (transactionId: string, userId: string): Promise<boolean> => {
    if (!transactionId) {
       console.log('⚠️ [ZaloPayModal] Querying with empty transactionId, skipping');
       return false;
    }
    console.log('🔍 [ZaloPayModal] Querying payment status:', transactionId);
    
    try {
      const result = await ZaloPayApiService.queryOrderStatus(transactionId);
      console.log('📊 [ZaloPayModal] Query result:', result);

      // returncode = 1: Success
      if (result.returncode === 1) {
        console.log('✅ [ZaloPayModal] Payment verified as successful');
        return true;
      }
      
      // returncode = -1: Failed
      if (result.returncode === -1) {
        console.log('❌ [ZaloPayModal] Payment verified as failed');
        return false;
      }

      // Still processing, need to retry
      console.log('⏳ [ZaloPayModal] Payment still processing');
      return false;
    } catch (error) {
      console.error('❌ [ZaloPayModal] Error querying status:', error);
      return false;
    }
  };

  /**
   * 🔥 KEY FIX: Confirm payment with backend to credit wallet
   */
  /**
   * 🔥 KEY FIX: Confirm payment with backend to credit wallet
   */
  const confirmPaymentWithBackend = async (
    transactionId: string, 
    userId: string,
    returnCode: string
  ): Promise<any> => {
    console.log('🔐 [ZaloPayModal] Confirming payment with backend:', {
      transactionId,
      userId,
      returnCode
    });

    try {
      const response = await ZaloPayApiService.confirmPayment(
        transactionId,
        userId,
        returnCode
      );

      console.log('✅ [ZaloPayModal] Confirm response:', response);

      if (response.success) {
        console.log('💰 [ZaloPayModal] Payment confirmed, wallet credited');
        return response; // Return full response
      } else {
        console.warn('⚠️ [ZaloPayModal] Confirm not successful, will query');
        // Fallback to query
        const queryRes = await queryPaymentStatus(transactionId, userId);
        return queryRes ? { success: true } : false;
      }
    } catch (error) {
      console.error('❌ [ZaloPayModal] Error confirming payment:', error);
      // Fallback to query
      const queryRes = await queryPaymentStatus(transactionId, userId);
      return queryRes ? { success: true } : false;
    }
  };

  /**
   * 🔥 KEY FIX: Handle callback from ZaloPay with proper verification
   */
  const handleZaloPayCallback = async (result: any) => {
    const callbackTime = new Date().toISOString();
    console.log(`[${callbackTime}] 📨 [ZaloPayModal] Callback received:`, result);
    console.log(`[${callbackTime}] 📊 [ZaloPayModal] returnCode:`, result?.returnCode);

    hasCallbackRef.current = true;

    if (!result) {
      console.error('❌ [ZaloPayModal] Callback result is null');
      handlePaymentFailed('Không nhận được kết quả từ ZaloPay');
      return;
    }

    const transactionId = transactionIdRef.current;
    const userId = userIdRef.current;

    if (!transactionId || !userId) {
      console.error('❌ [ZaloPayModal] Missing transactionId or userId');
      handlePaymentFailed('Thiếu thông tin giao dịch');
      return;
    }

    const returnCodeStr = String(result.returnCode);

    // Handle different return codes
    if (ZaloPayService.isPaymentSuccess(result.returnCode)) {
      console.log('✅ [ZaloPayModal] Callback indicates success, verifying...');
      setPaymentState(PaymentState.VERIFYING);

      // 🔥 KEY: Verify with backend and credit wallet
      const confirmedData = await confirmPaymentWithBackend(
        transactionId,
        userId,
        returnCodeStr
      );

      if (confirmedData) {
        handlePaymentSuccess(transactionId, confirmedData);
      } else {
        handlePaymentFailed('Không thể xác minh thanh toán');
      }
    } else if (result.returnCode === ZaloPayErrorCode.PAYMENT_CANCELED) {
      console.log('🚫 [ZaloPayModal] Payment canceled');
      handlePaymentCanceled();
    } else if (result.returnCode === ZaloPayErrorCode.APP_NOT_INSTALLED) {
      console.log('⚠️ [ZaloPayModal] App not installed');
      handleAppNotInstalled();
    } else {
      console.log('❌ [ZaloPayModal] Payment failed with code:', result.returnCode);
      handlePaymentFailed(
        ZaloPayService.getStatusMessage(result.returnCode)
      );
    }
  };

  /**
   * 🔥 KEY FIX: Kiểm tra thanh toán khi app quay lại (với Polling)
   */
  const checkPaymentStatusWhenAppResumes = async () => {
    if (
      !transactionIdRef.current ||
      !userIdRef.current ||
      isVerifiedRef.current ||
      checkingRef.current
    ) {
      console.warn('⚠️ [ZaloPayModal] Already checking or verification complete');
      return;
    }

    checkingRef.current = true;
    setPaymentState(PaymentState.VERIFYING);

    let attempts = 0;
    const maxAttempts = 5;

    const checkLoop = async () => {
      // Check if transactionId still exists (in case of reset)
      if (!transactionIdRef.current) {
         console.log('⏹️ [ZaloPayModal] checkLoop stop: transactionId is null');
         checkingRef.current = false;
         return;
      }

      if (attempts >= maxAttempts || isVerifiedRef.current) {
        if (!isVerifiedRef.current) {
          console.log('⚠️ [ZaloPayModal] Checked 5 times without success, waiting for user action or late callback');
          setPaymentState(PaymentState.WAITING_PAYMENT);
        }
        checkingRef.current = false;
        return;
      }

      attempts++;
      console.log(
        `🔄 [ZaloPayModal] Auto-check attempt ${attempts}/${maxAttempts}`
      );

      const verified = await queryPaymentStatus(
        transactionIdRef.current!,
        userIdRef.current!
      );

      if (verified) {
        console.log('✅ [ZaloPayModal] Payment verified, confirming with backend...');
        const confirmedData = await confirmPaymentWithBackend(
          transactionIdRef.current!,
          userIdRef.current!,
          '1'
        );

        if (confirmedData) {
          handlePaymentSuccess(transactionIdRef.current!, confirmedData);
        } else {
          console.warn('⚠️ [ZaloPayModal] Confirm failed, retry in 3s');
          autoCheckTimeoutRef.current = setTimeout(checkLoop, 3000);
        }
      } else {
        console.log(`⏳ [ZaloPayModal] Not verified yet, retry in 3s...`);
        autoCheckTimeoutRef.current = setTimeout(checkLoop, 3000);
      }
    };

    checkLoop();
  };

  const handlePaymentSuccess = (transactionId: string, data?: any) => {
    console.log('🎉 [ZaloPayModal] Payment SUCCESS', data);
    isVerifiedRef.current = true;
    setPaymentState(PaymentState.SUCCESS);
    setLoading(false);

    const amountNumber = Number(amount);
    NotificationService.notifyPaymentSuccess(amountNumber, transactionId);

    // Call callback to update parent state (e.g. balance)
    if (onSuccess) {
      onSuccess();
    }

    // Prepare data
    // Use data from backend response if available
    let finalAmount = formatCurrency(amountNumber);
    let finalTime = new Date().toLocaleString('vi-VN');
    let finalService = description || 'Nạp tiền vào ví điện tử';
    
    // If backend returns transaction object (check your API response structure)
    if (data?.transaction) {
       // example: data.transaction.createdAt, data.transaction.description
       if (data.transaction.createdAt) {
          finalTime = new Date(data.transaction.createdAt).toLocaleString('vi-VN');
       }
       if (data.transaction.description) {
         finalService = data.transaction.description;
       }
    }

    // Navigate to PaymentSuccess screen
    // @ts-ignore
    navigation.navigate('PaymentSuccess', {
      amount: finalAmount,
      transactionId: transactionId,
      time: finalTime,
      paymentMethod: 'ZaloPay',
      serviceName: finalService,
    });

    // Reset state to ensure clean state if user somehow navigates back
    resetState();
  };

  const handlePaymentFailed = (message: string) => {
    console.log('❌ [ZaloPayModal] Payment FAILED:', message);
    isVerifiedRef.current = true;
    setPaymentState(PaymentState.FAILED);
    setLoading(false);

    NotificationService.notifyPaymentError(message);

    // Navigate to PaymentFailure screen
    // @ts-ignore
    navigation.navigate('PaymentFailure', {
      reason: 'Lỗi thanh toán',
      message: message,
      transactionId: transactionIdRef.current || '---',
      canRetry: true,
    });
    
    // We do NOT reset state immediately here, so user can Retry from Failure screen if they hit Back
    // But since we are navigating away, maybe we should? 
    // Actually, PaymentFailure screen says "Retry" which calls navigation.goBack()
    // So if we reset state, when they come back, they might be in IDLE state.
    // Let's reset to IDLE so they can start over.
    resetState();
  };

  const handlePaymentCanceled = () => {
    console.log('🚫 [ZaloPayModal] Payment CANCELED');
    isVerifiedRef.current = true;
    setPaymentState(PaymentState.FAILED);
    setLoading(false);

    // Navigate to PaymentFailure screen
    // @ts-ignore
    navigation.navigate('PaymentFailure', {
      reason: 'Giao dịch bị hủy',
      message: 'Bạn đã hủy quá trình thanh toán.',
      transactionId: transactionIdRef.current || '---',
      canRetry: true,
    });

    resetState();
  };

  const handleAppNotInstalled = () => {
    setLoading(false);
    Alert.alert(
      'ZaloPay chưa được cài đặt',
      'Vui lòng cài đặt ứng dụng ZaloPay',
      [
        {
          text: 'Cài đặt',
          onPress: () => ZaloPayService.openZaloPayStore(),
        },
        { text: 'Hủy', style: 'cancel' },
      ]
    );
  };

  const handleDeposit = async () => {
    const amountNumber = Number(amount);

    if (amountNumber < 5000) {
      Alert.alert('Lỗi', 'Số tiền nạp tối thiểu là 5,000 VND');
      return;
    }

    if (!amountNumber || amountNumber <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!zaloPayInstalled) {
      Alert.alert(
        'ZaloPay chưa được cài đặt',
        'Vui lòng cài đặt ứng dụng ZaloPay để sử dụng phương thức thanh toán này',
        [
          {
            text: 'Cài đặt',
            onPress: () => ZaloPayService.openZaloPayStore(),
          },
          { text: 'Hủy', style: 'cancel' },
        ]
      );
      return;
    }

    setLoading(true);
    setPaymentState(PaymentState.CREATING_ORDER);

    try {
      // Get userId from JWT token
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Không tìm thấy thông tin đăng nhập');
      }

      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = tokenPayload.id;
      userIdRef.current = userId;

      // Create order
      const orderData = {
        amount: amountNumber,
        description: description || `Nạp ${formatCurrency(amountNumber)} vào ví`,
        userId,
      };

      console.log('💳 [ZaloPayModal] Creating ZaloPay order...');

      const { ZaloPayApiService: Service } = await import(
        '../../../../services/api/ZaloPayApiService'
      );

      const orderResponse: OrderResponse = await Service.createOrder(orderData);
      console.log('✅ [ZaloPayModal] Order created:', orderResponse);

      const zpToken = orderResponse.zptranstoken || orderResponse.zpTransToken;
      if (!zpToken) {
        throw new Error('Không nhận được token thanh toán ZaloPay');
      }

      transactionIdRef.current = orderResponse.transactionId;

      // 🔥 KEY FIX: Không đóng modal, giữ modal mở để handle callback
      setPaymentState(PaymentState.OPENING_ZALOPAY);

      console.log('🚀 [ZaloPayModal] Opening ZaloPay...');

      // Open ZaloPay and register callback
      const expectCallback = await ZaloPayService.payOrder(
        zpToken,
        (result) => handleZaloPayCallback(result)
      );

      if (expectCallback) {
        console.log('⏳ [ZaloPayModal] Waiting for payment...');
        setPaymentState(PaymentState.WAITING_PAYMENT);
      } else {
        console.warn('⚠️ [ZaloPayModal] PayOrder returned false, will rely on auto-check');
        setPaymentState(PaymentState.WAITING_PAYMENT);
      }

    } catch (error: any) {
      console.error('❌ [ZaloPayModal] Error:', error);
      
      const errorMessage = error.message || 'Có lỗi xảy ra khi tạo thanh toán';
      
      setLoading(false);
      setPaymentState(PaymentState.IDLE);

      // Navigate to PaymentFailure screen instead of Alert
      // @ts-ignore
      navigation.navigate('PaymentFailure', {
        reason: 'Lỗi tạo đơn',
        message: errorMessage,
        transactionId: transactionIdRef.current || '---',
        canRetry: true,
      });
    }
  };

  const resetForm = () => {
    setAmount('50000');
    setDescription('');
  };

  const handleClose = () => {
    if (!loading && paymentState !== PaymentState.WAITING_PAYMENT) {
      resetForm();
      resetState();
      navigation.goBack();
    } else {
      Alert.alert(
        'Đang xử lý thanh toán',
        'Vui lòng đợi giao dịch hoàn tất',
        [{ text: 'OK' }]
      );
    }
  };

  const getLoadingMessage = () => {
    switch (paymentState) {
      case PaymentState.CREATING_ORDER:
        return 'Đang tạo đơn hàng...';
      case PaymentState.OPENING_ZALOPAY:
        return 'Đang mở ZaloPay...';
      case PaymentState.WAITING_PAYMENT:
        return 'Vui lòng hoàn tất thanh toán trên ZaloPay';
      case PaymentState.VERIFYING:
        return 'Đang xác minh thanh toán...';
      default:
        return 'Đang xử lý...';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            disabled={loading}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Ionicons
              name="logo-electron"
              size={28}
              color="#2E7D32"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.title}>Nạp tiền ZaloPay</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* ZaloPay Info Banner */}
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#1976D2" />
              <Text style={styles.infoBannerText}>
                Nạp tiền nhanh chóng qua ứng dụng Zalo Pay
              </Text>
            </View>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="large" color="#2E7D32" />
                  <Text style={styles.loadingText}>{getLoadingMessage()}</Text>
                  <Text style={styles.loadingSubtext}>
                    {paymentState === PaymentState.WAITING_PAYMENT
                      ? 'Đang chờ xác nhận từ ZaloPay'
                      : 'Vui lòng đợi trong giây lát'}
                  </Text>
                </View>
              </View>
            )}

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
              <Text style={styles.minAmount}>Số tiền tối thiểu: 5,000 VND</Text>
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

            {/* Payment Method Badge */}
            <View style={styles.paymentMethodSection}>
              <Text style={styles.label}>Phương thức thanh toán</Text>
              <View style={styles.methodBadge}>
                <Ionicons
                  name="logo-electron"
                  size={20}
                  color="#2E7D32"
                  style={{ marginRight: 8 }}
                />
                <View style={styles.methodBadgeContent}>
                  <Text style={styles.methodBadgeTitle}>Zalo Pay</Text>
                  <Text style={styles.methodBadgeDescription}>
                    Ví điện tử Zalo Pay
                  </Text>
                </View>
              </View>
            </View>

            {/* Warning if not installed */}
            {!zaloPayInstalled && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={20} color="#F57C00" />
                <View style={styles.warningContent}>
                  <Text style={styles.warningTitle}>
                    ZaloPay chưa được cài đặt
                  </Text>
                  <Text style={styles.warningText}>
                    Vui lòng cài đặt ứng dụng ZaloPay để tiếp tục
                  </Text>
                </View>
              </View>
            )}

            {/* 🔥 KEY FIX: Nút thủ công kiểm tra khi đang chờ thanh toán */}
            {(paymentState === PaymentState.WAITING_PAYMENT ||
              paymentState === PaymentState.VERIFYING) && (
              <TouchableOpacity
                style={[styles.button, styles.manualCheckButton]}
                onPress={() => checkPaymentStatusWhenAppResumes()}
                disabled={checkingRef.current}
              >
                {checkingRef.current ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.confirmButtonText}>
                      Tôi đã thanh toán xong
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

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
                style={[
                  styles.button,
                  styles.confirmButton,
                  (!zaloPayInstalled || loading) && styles.buttonDisabled,
                ]}
                onPress={handleDeposit}
                disabled={loading || Number(amount) < 5000 || !zaloPayInstalled}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="logo-electron" size={20} color="#FFF" />
                    <Text style={styles.confirmButtonText}>Thanh toán</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              Được bảo mật bởi Zalo Pay - Ứng dụng Zalo
            </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoBannerText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
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
    color: '#2E7D32',
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
  paymentMethodSection: {
    marginBottom: 24,
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  methodBadgeContent: {
    flex: 1,
  },
  methodBadgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  methodBadgeDescription: {
    fontSize: 12,
    color: '#558B2F',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#F57C00',
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
    backgroundColor: '#2E7D32',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  manualCheckButton: {
    backgroundColor: '#1976D2',
    marginBottom: 12,
  },
  footer: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingContent: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  retryInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  retryInfoText: {
    fontSize: 13,
    color: '#1976D2',
    fontWeight: '500',
  },
});

export default ZaloPayScreen;
