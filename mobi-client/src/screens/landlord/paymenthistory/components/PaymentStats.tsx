import React, { memo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../../colors/colors';

interface PaymentStatsProps {
  stats: {
    successCount: number;
    failedCount: number;
    totalIn: number;
    totalOut: number;
  };
  totalRecords: number;
}

interface StatChipProps {
  icon: string;
  value: string | number;
  label: string;
  accentColor: string;
}

const StatChip = memo(({ icon, value, label, accentColor }: StatChipProps) => (
  <View style={styles.statChip}>
    <View style={[styles.iconCircle, { backgroundColor: accentColor + '15' }]}>
      <Ionicons name={icon as any} size={18} color={accentColor} />
    </View>
    <View style={styles.statInfo}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  </View>
));

const PaymentStats: React.FC<PaymentStatsProps> = ({ stats, totalRecords }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K₫';
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const successRate = totalRecords > 0 ? ((stats.successCount / totalRecords) * 100).toFixed(1) : '0';

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.chipWrapper}>
          <StatChip
            icon="arrow-down-circle"
            value={formatCurrency(stats.totalIn)}
            label="Tiền vào"
            accentColor="#10B981"
          />
        </View>
        <View style={styles.chipWrapper}>
          <StatChip
            icon="arrow-up-circle"
            value={formatCurrency(stats.totalOut)}
            label="Tiền ra"
            accentColor="#EF4444"
          />
        </View>
        <View>
          <StatChip
            icon="trending-up"
            value={`${successRate}%`}
            label="Tỷ lệ thành công"
            accentColor="#3B82F6"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chipWrapper: {
    marginRight: 12,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statInfo: {
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
});

export default PaymentStats;