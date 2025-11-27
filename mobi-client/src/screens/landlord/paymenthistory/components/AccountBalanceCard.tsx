import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../../styles/colors';
import DepositModal from './DepositModal';
import PaymentList, { PaymentMethod } from '../../../../components/payment/PaymentList';

interface AccountBalanceCardProps {
  balance: number;
  onDeposit: (paymentMethod: any) => void;
}

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  balance,
  onDeposit,
}) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K₫';
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const handleDepositPress = () => {
    setShowPaymentList(true);
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    if (method.id === 'vnpay') {
      setShowDepositModal(true);
    } else {
      // Handle other payment methods here
      // console.log('Selected payment method:', method);
      // You can add logic for other payment methods
    }
  };

  const handleDepositSuccess = () => {
    // Refresh balance or trigger callback
    if (onDeposit) {
      onDeposit(null); // Pass null since we don't need payment method anymore
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.balanceSection}>
          <View style={styles.balanceHeader}>
            <Ionicons name="wallet-outline" size={24} color={Colors.primary} />
            <Text style={styles.balanceTitle}>Số dư tài khoản</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>

        <TouchableOpacity
          style={styles.depositButton}
          onPress={handleDepositPress}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFF" />
          <Text style={styles.depositButtonText}>Nạp tiền</Text>
        </TouchableOpacity>
      </View>

      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleDepositSuccess}
      />

      <PaymentList
        visible={showPaymentList}
        onClose={() => setShowPaymentList(false)}
        onSelectMethod={handleSelectPaymentMethod}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceSection: {
    flex: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  depositButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  depositButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AccountBalanceCard;