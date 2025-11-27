import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../../../styles/colors';

interface PaymentFilterProps {
  filter: 'all' | 'success' | 'failed';
  setFilter: (filter: 'all' | 'success' | 'failed') => void;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onFilter: () => void;
}

const PaymentFilter: React.FC<PaymentFilterProps> = ({
  filter,
  setFilter,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onFilter,
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const filterOptions = [
    { key: 'all', label: 'Tất cả', icon: 'list-outline' },
    { key: 'success', label: 'Thành công', icon: 'checkmark-circle-outline' },
    { key: 'failed', label: 'Thất bại', icon: 'close-circle-outline' },
  ] as const;

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

  const showStartDatePickerModal = () => {
    setShowStartDatePicker(true);
  };

  const showEndDatePickerModal = () => {
    setShowEndDatePicker(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bộ lọc</Text>

      {/* Status Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>Trạng thái:</Text>
        <View style={styles.filterButtons}>
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                filter === option.key && styles.filterButtonActive,
              ]}
              onPress={() => setFilter(option.key)}
            >
              <Ionicons
                name={option.icon as any}
                size={14}
                color={filter === option.key ? Colors.textWhite : Colors.primary}
              />
              <Text
                style={[
                  styles.filterButtonText,
                  filter === option.key && styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Date Range Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionLabel}>Khoảng thời gian:</Text>
        <View style={styles.dateInputs}>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Từ ngày:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showStartDatePickerModal}
            >
              <Text style={[styles.dateButtonText, { color: startDate ? Colors.textPrimary : Colors.textTertiary }]}>
                {startDate ? formatDate(startDate) : 'Chọn ngày bắt đầu'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.dateInputContainer}>
            <Text style={styles.dateLabel}>Đến ngày:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showEndDatePickerModal}
            >
              <Text style={[styles.dateButtonText, { color: endDate ? Colors.textPrimary : Colors.textTertiary }]}>
                {endDate ? formatDate(endDate) : 'Chọn ngày kết thúc'}
              </Text>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Apply Filter Button */}
      <TouchableOpacity style={styles.applyButton} onPress={onFilter}>
        <Ionicons name="filter-outline" size={18} color={Colors.textWhite} />
        <Text style={styles.applyButtonText}>Áp dụng bộ lọc</Text>
      </TouchableOpacity>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  filterSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.backgroundLight,
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: Colors.textWhite,
  },
  dateInputs: {
    gap: 8,
  },
  dateInputContainer: {
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 3,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: Colors.background,
  },
  dateButtonText: {
    fontSize: 13,
    flex: 1,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 6,
    gap: 8,
  },
  applyButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PaymentFilter;