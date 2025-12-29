import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../../colors/colors';
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
  const navigation = useNavigation();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const handleDepositPress = () => {
    setShowPaymentList(true);
  };

  const handleZaloPayPress = () => {
    setShowPaymentList(false);
    // @ts-ignore - Navigate to ZaloPayScreen
    navigation.navigate('ZaloPayScreen', {
      onSuccess: () => {
        // Refresh balance after successful payment
        if (onDeposit) {
          onDeposit(null);
        }
      }
    });
  };

  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    if (method.id === 'vnpay') {
      setShowDepositModal(true);
    }
  };

  const handleDepositSuccess = () => {
    // Refresh balance or trigger callback
    if (onDeposit) {
      onDeposit(null);
    }
  };

  return (
    <>
      <LinearGradient
        colors={[Colors.primary, '#16A34A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.balanceLabel}>Số dư tài khoản</Text>
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setHideBalance(!hideBalance)}
          >
            <Ionicons 
              name={hideBalance ? 'eye-off' : 'eye'} 
              size={20} 
              color="#FFF" 
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.balanceAmount}>
          {hideBalance ? '• • • • •' : formatCurrency(balance)}
        </Text>

        <TouchableOpacity
          style={styles.depositButton}
          onPress={handleDepositPress}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={20} color={Colors.primary} />
          <Text style={styles.depositButtonText}>Nạp tiền</Text>
        </TouchableOpacity>
      </LinearGradient>

      <DepositModal
        visible={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleDepositSuccess}
      />

      <PaymentList
        visible={showPaymentList}
        onClose={() => setShowPaymentList(false)}
        onSelectMethod={handleSelectPaymentMethod}
        onZaloPayPress={handleZaloPayPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  gradientCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  eyeButton: {
    padding: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 20,
    letterSpacing: 1,
  },
  depositButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  depositButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AccountBalanceCard;