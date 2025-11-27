import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../../styles/colors';

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

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <View style={styles.container}>
      <View style={styles.paginationInfo}>
        <Text style={styles.infoText}>
          Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalRecords)} của {totalRecords} giao dịch
        </Text>
      </View>

      <View style={styles.paginationControls}>
        {/* Previous Button */}
        <TouchableOpacity
          style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
          onPress={() => currentPage > 1 && onChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Ionicons
            name="chevron-back-outline"
            size={16}
            color={currentPage === 1 ? Colors.textTertiary : Colors.primary}
          />
          <Text style={[styles.pageButtonText, currentPage === 1 && styles.pageButtonTextDisabled]}>
            Trước
          </Text>
        </TouchableOpacity>

        {/* Page Numbers */}
        <View style={styles.pageNumbers}>
          {visiblePages.map((page, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.pageNumber,
                typeof page === 'number' && page === currentPage && styles.pageNumberActive,
              ]}
              onPress={() => typeof page === 'number' && onChange(page)}
              disabled={page === '...'}
            >
              <Text
                style={[
                  styles.pageNumberText,
                  typeof page === 'number' && page === currentPage && styles.pageNumberTextActive,
                  page === '...' && styles.pageNumberDots,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
          onPress={() => currentPage < totalPages && onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={[styles.pageButtonText, currentPage === totalPages && styles.pageButtonTextDisabled]}>
            Sau
          </Text>
          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color={currentPage === totalPages ? Colors.textTertiary : Colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  paginationInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
    gap: 4,
  },
  pageButtonDisabled: {
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  pageButtonText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  pageButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageNumber: {
    minWidth: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  pageNumberActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  pageNumberText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  pageNumberTextActive: {
    color: Colors.textWhite,
    fontWeight: 'bold',
  },
  pageNumberDots: {
    color: Colors.textTertiary,
  },
});

export default PaymentPagination;