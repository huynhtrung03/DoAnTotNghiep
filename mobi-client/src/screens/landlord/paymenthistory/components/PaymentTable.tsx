import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../../styles/colors';

interface Payment {
  id: string;
  amount: number;
  status: number; // 0: failed, 1: success
  transactionType: number; // 0: out, 1: in
  createdAt: string;
  transactionDate?: string;
  description?: string;
  bankTransactionName?: string;
}

interface PaymentTableProps {
  payments: Payment[];
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K';
    }
    return amount.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      });
    }
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const isIncome = item.transactionType === 1;
    const isSuccess = item.status === 1;
    const displayDate = item.transactionDate || item.createdAt;

    return (
      <TouchableOpacity style={styles.transactionCard} activeOpacity={0.7}>
        {/* Left: Icon */}
        <View style={[
          styles.iconContainer,
          { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' }
        ]}>
          <Ionicons
            name={isIncome ? 'arrow-down' : 'arrow-up'}
            size={20}
            color={isIncome ? '#16A34A' : '#DC2626'}
          />
        </View>

        {/* Middle: Info */}
        <View style={styles.middleContent}>
          <Text style={styles.transactionName} numberOfLines={1}>
            {item.bankTransactionName || item.description || (isIncome ? 'Nạp tiền' : 'Rút tiền')}
          </Text>
          <Text style={styles.transactionTime}>{formatDate(displayDate)}</Text>
        </View>

        {/* Right: Amount & Status */}
        <View style={styles.rightContent}>
          <Text style={[
            styles.amountText,
            { color: isIncome ? '#16A34A' : '#DC2626' }
          ]}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}₫
          </Text>
          <View style={styles.statusIcon}>
            {isSuccess ? (
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            ) : (
              <Ionicons name="close-circle" size={16} color="#EF4444" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="wallet-outline" size={64} color={Colors.textTertiary} />
      <Text style={styles.emptyTitle}>Chưa có giao dịch nào</Text>
      <Text style={styles.emptySubtitle}>Hãy thực hiện nạp tiền ngay!</Text>
    </View>
  );

  return (
    <FlatList
      data={payments}
      renderItem={renderPaymentItem}
      keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={payments.length === 0 ? styles.emptyList : styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  middleContent: {
    flex: 1,
    gap: 4,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  transactionTime: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusIcon: {
    // Just container for icon
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default PaymentTable;