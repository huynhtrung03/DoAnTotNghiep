import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../../colors/colors';

interface PaymentPaginationProps {
  currentPage: number;
  totalRecords: number;
  pageSize: number;
  onChange: (page: number) => void;
}

const PaymentPagination: React.FC<PaymentPaginationProps> = ({
  currentPage,
  totalRecords,
  pageSize,
  onChange,
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} / {totalRecords}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, !hasPrev && styles.buttonDisabled]}
          onPress={() => hasPrev && onChange(currentPage - 1)}
          disabled={!hasPrev}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={hasPrev ? Colors.primary : Colors.textTertiary}
          />
          <Text style={[styles.buttonText, !hasPrev && styles.buttonTextDisabled]}>
            Trước
          </Text>
        </TouchableOpacity>

        <View style={styles.pageInfo}>
          <Text style={styles.pageText}>
            Trang <Text style={styles.pageNumber}>{currentPage}</Text> / {totalPages}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.button, !hasNext && styles.buttonDisabled]}
          onPress={() => hasNext && onChange(currentPage + 1)}
          disabled={!hasNext}
        >
          <Text style={[styles.buttonText, !hasNext && styles.buttonTextDisabled]}>
            Tiếp
          </Text>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={hasNext ? Colors.primary : Colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 6,
    minWidth: 100,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  buttonTextDisabled: {
    color: Colors.textTertiary,
  },
  pageInfo: {
    flex: 1,
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  pageNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default PaymentPagination;