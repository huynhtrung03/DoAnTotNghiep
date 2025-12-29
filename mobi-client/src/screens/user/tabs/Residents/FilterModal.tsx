import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  Pressable,
  Text,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { filterModalStyles, Spacing, ResidentColors } from './styles';

export interface FilterOptions {
  relationships: string[];
  statuses: string[];
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  availableRelationships?: string[];
  availableStatuses?: string[];
}

const DEFAULT_RELATIONSHIPS = [
  'Bản thân',
  'Vợ/Chồng',
  'Con',
  'Bố/Mẹ',
  'Anh/Em',
  'Bạn bè',
  'Khác',
];

const DEFAULT_STATUSES = [
  { label: 'Chờ xác nhận', value: 'PENDING' },
  { label: 'Đang hoạt động', value: 'ACTIVE' },
  { label: 'Không hoạt động', value: 'INACTIVE' },
  { label: 'Bị từ chối', value: 'REJECTED' },
];

/**
 * FilterModal - Bottom sheet modal for filtering residents
 * Features:
 * - Multi-select relationship chips (radio-like)
 * - Multi-select status chips (radio-like)
 * - Apply and Clear buttons
 */
export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  availableRelationships = DEFAULT_RELATIONSHIPS,
  availableStatuses = DEFAULT_STATUSES.map((s) => s.value),
}) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(currentFilters);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters, visible]);

  // Animation for chip press
  const animateChipPress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleRelationship = (relationship: string) => {
    setLocalFilters((prev) => {
      const relationships = prev.relationships.includes(relationship)
        ? prev.relationships.filter((r) => r !== relationship)
        : [...prev.relationships, relationship];
      return { ...prev, relationships };
    });
  };

  const toggleStatus = (status: string) => {
    setLocalFilters((prev) => {
      const statuses = prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status];
      return { ...prev, statuses };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    setLocalFilters({ relationships: [], statuses: [] });
  };

  const handleReset = () => {
    handleClear();
    onApply({ relationships: [], statuses: [] });
    onClose();
  };

  const getStatusLabel = (status: string): string => {
    const statusObj = DEFAULT_STATUSES.find((s) => s.value === status);
    return statusObj?.label || status;
  };

  const getActiveFilterCount = () => {
    return localFilters.relationships.length + localFilters.statuses.length;
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'ACTIVE': return 'checkmark-circle';
      case 'PENDING': return 'time';
      case 'INACTIVE': return 'pause-circle';
      case 'REJECTED': return 'close-circle';
      default: return 'help-circle';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        ]}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />

        <View
          style={filterModalStyles.container}
        >
          {/* Handle Bar */}
          <View style={filterModalStyles.handleBar} />

          {/* Header */}
          <View style={filterModalStyles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#EEF2FF',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Ionicons name="funnel" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text style={filterModalStyles.headerTitle}>
                    Bộ lọc
                  </Text>
                  <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                    Tùy chỉnh hiển thị cư dân
                  </Text>
                </View>
              </View>
              {getActiveFilterCount() > 0 && (
                <View style={{
                  minWidth: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#3B82F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 8,
                }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                    {getActiveFilterCount()}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Scroll Content */}
          <ScrollView
            contentContainerStyle={filterModalStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Relationship Filter */}
            <View style={filterModalStyles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
                <Ionicons name="people" size={18} color="#6B7280" />
                <Text style={filterModalStyles.sectionTitle}>
                  MỐI QUAN HỆ
                </Text>
                {localFilters.relationships.length > 0 && (
                  <View style={{
                    backgroundColor: '#DBEAFE',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#1E40AF' }}>
                      {localFilters.relationships.length}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: Spacing.md }}>
                Chọn một hoặc nhiều mối quan hệ để lọc
              </Text>
              <View style={filterModalStyles.chipsContainer}>
                {availableRelationships.map((relationship) => {
                  const isSelected = localFilters.relationships.includes(relationship);
                  return (
                    <Pressable
                      key={relationship}
                      style={[
                        filterModalStyles.chip,
                        isSelected && filterModalStyles.chipSelected,
                        {
                          shadowColor: isSelected ? '#3B82F6' : '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.2 : 0.05,
                          shadowRadius: 4,
                          elevation: isSelected ? 3 : 1,
                        },
                      ]}
                      onPress={() => {
                        animateChipPress();
                        toggleRelationship(relationship);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                        )}
                        <Text
                          style={[
                            filterModalStyles.chipText,
                            isSelected && filterModalStyles.chipTextSelected,
                          ]}
                        >
                          {relationship}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Status Filter */}
            <View style={filterModalStyles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm }}>
                <Ionicons name="pricetag" size={18} color="#6B7280" />
                <Text style={filterModalStyles.sectionTitle}>
                  TRẠNG THÁI
                </Text>
                {localFilters.statuses.length > 0 && (
                  <View style={{
                    backgroundColor: '#DBEAFE',
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#1E40AF' }}>
                      {localFilters.statuses.length}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: Spacing.md }}>
                Lọc theo trạng thái hoạt động của cư dân
              </Text>
              <View style={filterModalStyles.chipsContainer}>
                {availableStatuses.map((status) => {
                  const isSelected = localFilters.statuses.includes(status);
                  const statusColor = (() => {
                    switch (status) {
                      case 'ACTIVE': return ResidentColors.active;
                      case 'PENDING': return ResidentColors.pending;
                      case 'INACTIVE': return ResidentColors.inactive;
                      case 'REJECTED': return ResidentColors.rejected;
                      default: return ResidentColors.inactive;
                    }
                  })();
                  return (
                    <Pressable
                      key={status}
                      style={[
                        filterModalStyles.chip,
                        isSelected ? {
                          backgroundColor: statusColor.bg,
                          borderColor: statusColor.border,
                        } : {},
                        {
                          shadowColor: isSelected ? statusColor.border : '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: isSelected ? 0.2 : 0.05,
                          shadowRadius: 4,
                          elevation: isSelected ? 3 : 1,
                        },
                      ]}
                      onPress={() => {
                        animateChipPress();
                        toggleStatus(status);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Ionicons 
                          name={getStatusIcon(status) as any} 
                          size={14} 
                          color={isSelected ? statusColor.text : '#6B7280'} 
                        />
                        <Text
                          style={[
                            filterModalStyles.chipText,
                            isSelected && { color: statusColor.text, fontWeight: '600' },
                          ]}
                        >
                          {getStatusLabel(status)}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={filterModalStyles.footer}>
            <Pressable
              style={[
                filterModalStyles.button,
                filterModalStyles.buttonClear,
              ]}
              onPress={handleReset}
              android_ripple={{ color: '#E5E7EB' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="refresh" size={18} color="#6B7280" />
                <Text style={filterModalStyles.buttonClearText}>
                  Đặt lại
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={[
                filterModalStyles.button,
                filterModalStyles.buttonApply,
                {
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                },
              ]}
              onPress={handleApply}
              android_ripple={{ color: '#2563EB' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={filterModalStyles.buttonApplyText}>
                  Áp dụng
                  {getActiveFilterCount() > 0 && ` (${getActiveFilterCount()})`}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
