import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../../../styles/colors';
import { BillData, ContractData } from '../../../../../types/types';
import { styles } from './BillPaymentModal.styles';

interface BillPaymentModalProps {
  open: boolean;
  bill: BillData | null;
  contract: ContractData;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const BillPaymentModal: React.FC<BillPaymentModalProps> = ({
  open,
  bill,
  contract,
  loading,
  onConfirm,
  onCancel,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  if (!bill) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const handleConfirm = () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }
    onConfirm();
  };

  const paymentMethods = [
    {
      id: 'vnpay',
      name: 'VNPay',
      description: 'Pay via VNPay gateway',
      icon: 'credit-card',
      color: '#1A1F71',
    },
    {
      id: 'momo',
      name: 'MoMo',
      description: 'Pay via MoMo wallet',
      icon: 'wallet',
      color: '#A30D3A',
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      description: 'Pay via ZaloPay app',
      icon: 'cash',
      color: '#0082BC',
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      description: 'Transfer to landlord account',
      icon: 'bank',
      color: '#1976D2',
    },
  ];

  return (
    <Modal visible={open} transparent animationType="slide">
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} disabled={loading}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Bill Summary */}
          <View style={styles.billSummary}>
            <View>
              <Text style={styles.summaryLabel}>Bill for</Text>
              <Text style={styles.summaryMonth}>{formatDate(bill.month)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Total Amount</Text>
              <Text style={styles.amountValue}>{bill.totalAmount.toLocaleString()} đ</Text>
            </View>
          </View>

          {/* Bill Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <View style={styles.detailsGrid}>
              <DetailItem
                icon="lightning-bolt"
                label="Electricity"
                value={`${bill.electricityFee.toLocaleString()} đ`}
                color="#FFC107"
              />
              <DetailItem
                icon="water"
                label="Water"
                value={`${bill.waterFee.toLocaleString()} đ`}
                color="#2196F3"
              />
              <DetailItem
                icon="home-circle"
                label="Service"
                value={`${bill.serviceFee.toLocaleString()} đ`}
                color="#4CAF50"
              />
              {bill.damageFee && bill.damageFee > 0 && (
                <DetailItem
                  icon="alert-circle"
                  label="Damage"
                  value={`${bill.damageFee.toLocaleString()} đ`}
                  color="#D32F2F"
                />
              )}
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Payment Method</Text>
            <View style={styles.methodsContainer}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedMethod === method.id && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedMethod(method.id)}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.methodIcon,
                      { backgroundColor: `${method.color}15` },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={method.icon as any}
                      size={24}
                      color={method.color}
                    />
                  </View>
                  <View style={styles.methodContent}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    <Text style={styles.methodDescription}>
                      {method.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.methodCheckbox,
                      selectedMethod === method.id && styles.methodCheckboxSelected,
                    ]}
                  >
                    {selectedMethod === method.id && (
                      <MaterialCommunityIcons
                        name="check"
                        size={14}
                        color="#FFF"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Instructions */}
          {selectedMethod && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Instructions</Text>
              <PaymentInstructions method={selectedMethod} />
            </View>
          )}

          {/* Agreement */}
          <View style={styles.section}>
            <View style={styles.agreementCard}>
              <MaterialCommunityIcons
                name="information"
                size={16}
                color={Colors.primary}
              />
              <Text style={styles.agreementText}>
                By confirming payment, you agree that the bill amount will be
                charged to your selected payment method.
              </Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonSecondaryText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
            onPress={handleConfirm}
            disabled={loading || !selectedMethod}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="credit-card"
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.buttonPrimaryText}>Confirm Payment</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Detail Item Component
 */
interface DetailItemProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value, color }) => (
  <View style={styles.detailItem}>
    <View style={[styles.detailIcon, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon as any} size={16} color={color} />
    </View>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

/**
 * Payment Instructions Component
 */
interface PaymentInstructionsProps {
  method: string;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({ method }) => {
  const instructions: Record<string, string[]> = {
    vnpay: [
      '1. You will be redirected to VNPay payment gateway',
      '2. Enter your card or account details',
      '3. Confirm the payment amount',
      '4. Return to app for confirmation',
    ],
    momo: [
      '1. Open MoMo app on your phone',
      '2. Click on "Payment" or "Send Money"',
      '3. Enter the amount and recipient details',
      '4. Use MoMo QR code to complete payment',
    ],
    zalopay: [
      '1. Open ZaloPay app on your phone',
      '2. Navigate to "Send Money" section',
      '3. Enter payment details',
      '4. Confirm and complete the payment',
    ],
    bank: [
      '1. Open your bank app or internet banking',
      '2. Select "Transfer Money" option',
      '3. Enter landlord\'s bank account details',
      '4. Confirm the amount and complete transfer',
    ],
  };

  const steps = instructions[method] || [];

  return (
    <View style={styles.instructionsContainer}>
      {steps.map((step, index) => (
        <View key={index} style={styles.instructionStep}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

export default BillPaymentModal;
