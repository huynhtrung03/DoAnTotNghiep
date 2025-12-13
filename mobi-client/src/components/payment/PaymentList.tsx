/**
 * PaymentList Component
 *
 * Popup hiển thị danh sách phương thức thanh toán
 * - Thanh toán bằng QR code
 * - Thanh toán bằng MoMo
 * - Các phương thức khác
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../colors/colors';

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface PaymentListProps {
  visible: boolean;
  onClose: () => void;
  onSelectMethod: (method: PaymentMethod) => void;
  onZaloPayPress?: () => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'vnpay',
    name: 'VNPay',
    icon: 'card-outline',
    description: 'Thanh toán qua VNPay - Cổng thanh toán hàng đầu Việt Nam',
  },
  {
    id: 'qr',
    name: 'Thanh toán QR',
    icon: 'qr-code-outline',
    description: 'Quét mã QR để thanh toán',
  },
  {
    id: 'zalopay',
    name: 'Zalo Pay',
    icon: 'logo-electron',
    description: 'Thanh toán qua ví điện tử Zalo Pay',
  },
  {
    id: 'bank',
    name: 'Chuyển khoản ngân hàng',
    icon: 'business-outline',
    description: 'Chuyển khoản trực tiếp qua ngân hàng',
  },
  {
    id: 'card',
    name: 'Thẻ tín dụng',
    icon: 'card-outline',
    description: 'Thanh toán bằng thẻ Visa/MasterCard',
  },
];

export default function PaymentList({ visible, onClose, onSelectMethod, onZaloPayPress }: PaymentListProps) {

  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => (
    <TouchableOpacity
      style={styles.methodItem}
      onPress={() => {
        if (item.id === 'zalopay') {
          // Handle ZaloPay via callback
          onClose();
          if (onZaloPayPress) {
            onZaloPayPress();
          } else {
            onSelectMethod(item);
          }
        } else {
          onSelectMethod(item);
          onClose();
        }
      }}
      activeOpacity={0.7}
    >
      <View style={styles.methodIcon}>
        <Ionicons name={item.icon as any} size={24} color={Colors.primary} />
      </View>
      <View style={styles.methodContent}>
        <Text style={styles.methodName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.methodDescription}>{item.description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <>
      <Modal
        visible={visible}
        transparent
        onRequestClose={onClose}
      >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Chọn phương thức thanh toán</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Payment Methods List */}
          <FlatList
            data={paymentMethods}
            renderItem={renderPaymentMethod}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '40%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  listContent: {
    padding: 20,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});