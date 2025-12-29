// components/FilterModal.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type FilterType = 'nearby' | 'popular' | 'cheap' | 'premium' | null;

export interface FilterOptions {
  priceRange?: string;
  roomType?: string[];
  amenities?: string[];
  distance?: string;
  sortBy?: string;
  timeRange?: string;
}

interface FilterModalProps {
  visible: boolean;
  filterType: FilterType;
  selectedFilters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClose: () => void;
  onApply: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  filterType,
  selectedFilters,
  onFiltersChange,
  onClose,
  onApply,
}) => {
  const getFilterTitle = () => {
    switch (filterType) {
      case 'nearby': return 'Phòng gần tôi';
      case 'popular': return 'Phòng phổ biến';
      case 'cheap': return 'Phòng giá rẻ';
      case 'premium': return 'Phòng cao cấp';
      default: return 'Bộ lọc';
    }
  };

  const getFilterOptions = () => {
    switch (filterType) {
      case 'nearby':
        return {
          distances: ['1', '3', '5', '10'],
          sortOptions: ['Khoảng cách', 'Giá tăng dần', 'Lượt xem'],
        };
      case 'popular':
        return {
          timeRanges: ['Hôm nay', 'Tuần này', 'Tháng này', 'Năm này'],
          sortOptions: ['Lượt xem', 'Đặt phòng', 'Đánh giá'],
        };
      case 'cheap':
        return {
          priceRanges: ['<1tr', '1-2tr', '2-3tr', '3-5tr'],
          sortOptions: ['Giá tăng dần', 'Diện tích', 'Mới nhất'],
        };
      case 'premium':
        return {
          amenities: ['Wifi', 'Bãi đậu xe', 'Bảo vệ', 'Điều hòa', 'Bếp'],
          priceRanges: ['5-10tr', '10-20tr', '20tr+'],
          sortOptions: ['Giá giảm dần', 'Đánh giá', 'Mới nhất'],
        };
      default:
        return {};
    }
  };

  const options = getFilterOptions();

  const toggleSelection = (category: string, value: string) => {
    const current = (selectedFilters as any)[category] || [];
    const updated = current.includes(value)
      ? current.filter((item: string) => item !== value)
      : [...current, value];
    onFiltersChange({ ...selectedFilters, [category]: updated });
  };

  const selectSingle = (category: string, value: string) => {
    onFiltersChange({ ...selectedFilters, [category]: value });
  };

  const renderOptionGroup = (
    title: string,
    items: string[],
    category: string,
    multiSelect = true
  ) => (
    <View style={styles.filterGroup}>
      <Text style={styles.filterGroupTitle}>{title}</Text>
      <View style={styles.filterOptions}>
        {items.map((item) => {
          const isSelected = multiSelect
            ? ((selectedFilters as any)[category] || []).includes(item)
            : (selectedFilters as any)[category] === item;

          return (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterOption,
                isSelected && styles.filterOptionSelected,
              ]}
              onPress={() =>
                multiSelect
                  ? toggleSelection(category, item)
                  : selectSingle(category, item)
              }
            >
              <Text
                style={[
                  styles.filterOptionText,
                  isSelected && styles.filterOptionTextSelected,
                ]}
              >
                {item}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="#667EEA" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{getFilterTitle()}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalBody}
            showsVerticalScrollIndicator={false}
          >
            {filterType === 'nearby' &&
              options.distances &&
              options.sortOptions && (
                <>
                  {renderOptionGroup(
                    'Khoảng cách (km)',
                    options.distances,
                    'distance',
                    false
                  )}
                  {renderOptionGroup(
                    'Sắp xếp theo',
                    options.sortOptions,
                    'sortBy',
                    false
                  )}
                </>
              )}

            {filterType === 'popular' &&
              options.timeRanges &&
              options.sortOptions && (
                <>
                  {renderOptionGroup(
                    'Thời gian',
                    options.timeRanges,
                    'timeRange',
                    false
                  )}
                  {renderOptionGroup(
                    'Sắp xếp theo',
                    options.sortOptions,
                    'sortBy',
                    false
                  )}
                </>
              )}

            {filterType === 'cheap' &&
              options.priceRanges &&
              options.sortOptions && (
                <>
                  {renderOptionGroup(
                    'Khoảng giá',
                    options.priceRanges,
                    'priceRange',
                    false
                  )}
                  {renderOptionGroup(
                    'Sắp xếp theo',
                    options.sortOptions,
                    'sortBy',
                    false
                  )}
                </>
              )}

            {filterType === 'premium' &&
              options.amenities &&
              options.priceRanges &&
              options.sortOptions && (
                <>
                  {renderOptionGroup('Tiện nghi', options.amenities, 'amenities')}
                  {renderOptionGroup(
                    'Khoảng giá',
                    options.priceRanges,
                    'priceRange',
                    false
                  )}
                  {renderOptionGroup(
                    'Sắp xếp theo',
                    options.sortOptions,
                    'sortBy',
                    false
                  )}
                </>
              )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onApply}>
              <Text style={styles.applyButtonText}>Áp dụng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },

  closeButton: {
    padding: 4,
  },

  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  filterGroup: {
    marginBottom: 24,
  },

  filterGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },

  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  filterOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667EEA',
  },

  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  filterOptionTextSelected: {
    color: '#667EEA',
  },

  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },

  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#667EEA',
    alignItems: 'center',
  },

  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FilterModal;
