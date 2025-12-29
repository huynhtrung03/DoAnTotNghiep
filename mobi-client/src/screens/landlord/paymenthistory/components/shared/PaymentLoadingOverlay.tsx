import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '../../../../../colors/colors';
import { PaymentState } from '../hooks/useZaloPayment';

interface PaymentLoadingOverlayProps {
  visible: boolean;
  paymentState: PaymentState;
}

const getLoadingMessage = (state: PaymentState): string => {
  switch (state) {
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

const getLoadingSubtext = (state: PaymentState): string => {
  return state === PaymentState.WAITING_PAYMENT
    ? 'Đang chờ xác nhận từ ZaloPay'
    : 'Vui lòng đợi trong giây lát';
};

/**
 * Reusable loading overlay component for payment flow
 */
export const PaymentLoadingOverlay: React.FC<PaymentLoadingOverlayProps> = ({
  visible,
  paymentState,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.loadingOverlay}>
      <View style={styles.loadingContent}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>{getLoadingMessage(paymentState)}</Text>
        <Text style={styles.loadingSubtext}>{getLoadingSubtext(paymentState)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    minWidth: 200,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
