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
  description?: string;
}

interface PaymentTableProps {
  payments: Payment[];
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments }) => {
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusInfo = (status: number) => {
    return status === 1
      ? { text: 'Thành công', color: Colors.success, icon: 'checkmark-circle-outline' }
      : { text: 'Thất bại', color: Colors.error, icon: 'close-circle-outline' };
  };

  const getTransactionTypeInfo = (type: number) => {
    return type === 1
      ? { text: 'Tiền vào', color: Colors.success, icon: 'arrow-down-outline' }
      : { text: 'Tiền ra', color: Colors.error, icon: 'arrow-up-outline' };
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const statusInfo = getStatusInfo(item.status);
    const typeInfo = getTransactionTypeInfo(item.transactionType);

    return (
      <View style={styles.paymentRow}>
        {/* Transaction Type */}
        <View style={styles.cell}>
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.color + '20' }]}>
            <Ionicons name={typeInfo.icon as any} size={16} color={typeInfo.color} />
            <Text style={[styles.typeText, { color: typeInfo.color }]}>
              {typeInfo.text}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.cell}>
          <Text style={[styles.amount, { color: typeInfo.color }]}>
            {item.transactionType === 1 ? '+' : '-'}{formatCurrency(item.amount)}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.cell}>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.cell}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
        </View>

        {/* Description */}
        <View style={styles.cell}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description || 'Không có mô tả'}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerText}>Loại</Text>
      <Text style={styles.headerText}>Số tiền</Text>
      <Text style={styles.headerText}>Trạng thái</Text>
      <Text style={styles.headerText}>Thời gian</Text>
      <Text style={styles.headerText}>Mô tả</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={48} color={Colors.textTertiary} />
      <Text style={styles.emptyText}>Không có giao dịch nào</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Danh sách giao dịch</Text>

      {renderHeader()}

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={payments.length === 0 ? styles.emptyList : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 8,
    marginBottom: 8,
  },
  headerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  amount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 2,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default PaymentTable;