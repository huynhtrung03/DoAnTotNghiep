import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../../../colors/colors';

interface PaymentFilterProps {
  filter: 'all' | 'success' | 'failed';
  setFilter: (filter: 'all' | 'success' | 'failed') => void;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onFilter: () => void;
  activeFilterCount?: number;
}

const PaymentFilter: React.FC<PaymentFilterProps> = ({
  filter,
  setFilter,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onFilter,
  activeFilterCount = 0,
}) => {
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setStartDate(formattedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndDatePicker(false);
    }
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setEndDate(formattedDate);
    }
  };

  const handleApplyFilter = () => {
    onFilter();
    setShowFilterSheet(false);
  };

  const handleClearFilters = () => {
    setFilter('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = startDate || endDate || filter !== 'all';

  return (
    <>
      {/* Filter Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterSheet(true)}
        >
          <Ionicons name="options-outline" size={20} color={Colors.primary} />
          <Text style={styles.filterButtonText}>Bộ lọc</Text>
          {hasActiveFilters && <View style={styles.filterBadge} />}
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={showFilterSheet}
        transparent
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFilterSheet(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.bottomSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Bộ lọc giao dịch</Text>
                <TouchableOpacity onPress={() => setShowFilterSheet(false)}>
                  <Ionicons name="close" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Trạng thái</Text>
                <View style={styles.chipContainer}>
                  <TouchableOpacity
                    style={[styles.chip, filter === 'all' && styles.chipActive]}
                    onPress={() => setFilter('all')}
                  >
                    <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>
                      Tất cả
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, filter === 'success' && styles.chipActive]}
                    onPress={() => setFilter('success')}
                  >
                    <Text style={[styles.chipText, filter === 'success' && styles.chipTextActive]}>
                      Thành công
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, filter === 'failed' && styles.chipActive]}
                    onPress={() => setFilter('failed')}
                  >
                    <Text style={[styles.chipText, filter === 'failed' && styles.chipTextActive]}>
                      Thất bại
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Range */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>Khoảng thời gian</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={[styles.dateInputText, { color: startDate ? Colors.textPrimary : Colors.textTertiary }]}>
                    {startDate ? formatDate(startDate) : 'Từ ngày'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={[styles.dateInputText, { color: endDate ? Colors.textPrimary : Colors.textTertiary }]}>
                    {endDate ? formatDate(endDate) : 'Đến ngày'}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              {/* Actions */}
              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearFilters}
                >
                  <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={handleApplyFilter}
                >
                  <Text style={styles.applyButtonText}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
          maximumDate={new Date()}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleEndDateChange}
          maximumDate={new Date()}
          minimumDate={startDate ? new Date(startDate) : undefined}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  filterBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: Colors.background,
  },
  dateInputText: {
    fontSize: 14,
    flex: 1,
  },
  sheetActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default PaymentFilter;