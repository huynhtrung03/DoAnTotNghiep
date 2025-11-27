import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Colors from '../../../../styles/colors';

interface PaymentStatsProps {
  stats: {
    successCount: number;
    failedCount: number;
    totalIn: number;
    totalOut: number;
  };
  totalRecords: number;
}

const PaymentStats: React.FC<PaymentStatsProps> = ({ stats, totalRecords }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K₫';
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const StatCard = ({ 
    icon, 
    value, 
    label, 
    backgroundColor, 
    iconColor
  }: {
    icon: string;
    value: string | number;
    label: string;
    backgroundColor: string;
    iconColor: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color={iconColor} />
      </View>
      <Text style={styles.statValue}>
        {value}
      </Text>
      <Text style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="analytics" size={20} color={Colors.primary} />
        <Text style={styles.title}>Thống kê giao dịch</Text>
      </View>

      <View style={styles.statsContainer}>
        {/* Row 1: Tổng giao dịch và Thành công */}
        <View style={styles.statsRow}>
          <StatCard
            icon="receipt-outline"
            value={totalRecords}
            label="Tổng giao dịch"
            backgroundColor="#F8F9FA"
            iconColor="#6C757D"
          />
          <StatCard
            icon="checkmark-circle-outline"
            value={stats.successCount}
            label="Thành công"
            backgroundColor="#F0F9FF"
            iconColor="#059669"
          />
        </View>

        {/* Row 2: Thất bại và Tổng tiền */}
        <View style={styles.statsRow}>
          <StatCard
            icon="close-circle-outline"
            value={stats.failedCount}
            label="Thất bại"
            backgroundColor="#FEF2F2"
            iconColor="#DC2626"
          />
          <StatCard
            icon="cash-outline"
            value={formatCurrency(stats.totalIn - stats.totalOut)}
            label="Tổng số dư"
            backgroundColor="#F3F4F6"
            iconColor="#374151"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginLeft: 8,
  },
  statsContainer: {
    gap: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '400',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default PaymentStats;