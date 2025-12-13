import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../../styles/colors';
import { RoomFormData } from '../AddRoom';
import { TypePost } from '../../../../types/types';
import { getPostTypes } from '../../../../services/TypePostService';

interface Step4Props {
  formData: RoomFormData;
  onUpdate: (updates: Partial<RoomFormData>) => void;
}

const Step4Package: React.FC<Step4Props> = ({ formData, onUpdate }) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(formData.startDate || new Date());
  const [tempEndDate, setTempEndDate] = useState(formData.endDate || new Date());
  const [typePosts, setTypePosts] = useState<TypePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load TypePost data from API on mount
  useEffect(() => {
    loadTypePosts();
  }, []);

  const loadTypePosts = async () => {
    try {
      setLoading(true);
      console.log('📋 [Step4Package] Loading post types...');
      const data = await getPostTypes();
      console.log('✅ [Step4Package] Post types loaded:', data);
      setTypePosts(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ [Step4Package] Failed to load post types:', err);
      setError('Không thể tải danh sách gói tin. Vui lòng thử lại.');
      setTypePosts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateExpectedCost = () => {
    if (formData.typePostId && formData.startDate && formData.endDate) {
      const typePost = typePosts.find((tp) => tp.id === formData.typePostId);
      if (typePost) {
        const days = Math.ceil(
          (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const cost = typePost.pricePerDay * Math.max(days, 1);
        onUpdate({ expectedCost: cost });
      }
    }
  };

  useEffect(() => {
    calculateExpectedCost();
  }, [formData.typePostId, formData.startDate, formData.endDate, typePosts]);

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      console.log('📅 [Step4Package] Start date selected:', selectedDate);
      setTempStartDate(selectedDate);
      // Cập nhật formData ngay
      onUpdate({ startDate: selectedDate });
    }
    setShowStartDatePicker(false);
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      // Validate: end date phải >= start date
      if (formData.startDate && selectedDate < formData.startDate) {
        console.warn('⚠️ [Step4Package] End date cannot be before start date');
        return;
      }
      console.log('📅 [Step4Package] End date selected:', selectedDate);
      setTempEndDate(selectedDate);
      onUpdate({ endDate: selectedDate });
    }
    setShowEndDatePicker(false);
  };

  const handleConfirmStartDate = () => {
    onUpdate({ startDate: tempStartDate });
    setShowStartDatePicker(false);
  };

  const handleSelectPackage = (typePostId: string) => {
    console.log('📦 [Step4Package] Package selected:', typePostId);
    onUpdate({ typePostId });
  };

  const selectedPackage = typePosts.find((tp) => tp.id === formData.typePostId);
  const daysDiff = formData.startDate && formData.endDate
    ? Math.ceil(
        (formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Show loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải danh sách gói tin...</Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadTypePosts}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderPackageCard = ({ item }: { item: TypePost }) => {
    const isSelected = formData.typePostId === item.id;
    return (
      <TouchableOpacity
        style={[
          styles.packageCard,
          isSelected && styles.packageCardSelected,
        ]}
        onPress={() => handleSelectPackage(item.id)}
      >
        <View style={styles.packageCardHeader}>
          <Text style={[
            styles.packageCardTitle,
            isSelected && styles.packageCardTitleSelected,
          ]}>
            {item.name}
          </Text>
          {isSelected && (
            <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
          )}
        </View>

        <Text style={styles.packageCardDescription}>{item.description}</Text>

        <Text style={styles.packageCardPrice}>
          {item.pricePerDay.toLocaleString('vi-VN')}đ/ngày
        </Text>
      </TouchableOpacity>
    );
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Package Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chọn gói tin đăng</Text>
        <Text style={styles.sectionDescription}>
          Lựa chọn gói phù hợp để phòng của bạn được nhiều người biết đến
        </Text>

        <FlatList
          scrollEnabled={false}
          data={typePosts}
          keyExtractor={(item) => item.id}
          renderItem={renderPackageCard}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </View>

      {/* Date Selection */}
      {formData.typePostId && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thời gian đăng</Text>

          {/* Start Date */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <MaterialIcons name="event" size={20} color={Colors.primary} />
              <View style={styles.dateButtonTextContainer}>
                <Text style={styles.dateButtonLabel}>Ngày bắt đầu</Text>
                <Text style={styles.dateButtonValue}>
                  {formatDate(formData.startDate) || 'Chọn ngày'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* End Date */}
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <MaterialIcons name="event" size={20} color={Colors.primary} />
              <View style={styles.dateButtonTextContainer}>
                <Text style={styles.dateButtonLabel}>Ngày kết thúc</Text>
                <Text style={styles.dateButtonValue}>
                  {formatDate(formData.endDate) || 'Chọn ngày'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Date Info */}
          {formData.startDate && formData.endDate && daysDiff > 0 && (
            <View style={styles.dateInfoBox}>
              <MaterialIcons name="info" size={20} color={Colors.info} />
              <Text style={styles.dateInfoText}>
                Thời gian đăng: {daysDiff} ngày
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Expected Cost Summary */}
      {formData.typePostId && formData.startDate && formData.endDate && (
        <View style={styles.costSummarySection}>
          <View style={styles.costSummaryBox}>
            <Text style={styles.costSummaryLabel}>Tổng tiền dự kiến</Text>
            <Text style={styles.costSummaryAmount}>
              {(formData.expectedCost || 0).toLocaleString('vi-VN')}₫
            </Text>
            <Text style={styles.costSummaryDetails}>
              {selectedPackage?.pricePerDay.toLocaleString('vi-VN')}₫/ngày × {daysDiff} ngày
            </Text>
          </View>
        </View>
      )}

      {/* Date Pickers */}
      {showStartDatePicker && (
        <>
          <DateTimePicker
            value={tempStartDate}
            mode="date"
            display="spinner"
            onChange={handleStartDateChange}
            minimumDate={new Date()}
          />
        </>
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={tempEndDate}
          mode="date"
          display="spinner"
          onChange={handleEndDateChange}
          minimumDate={formData.startDate || new Date()}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  packageCard: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  packageCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  packageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  packageCardTitleSelected: {
    color: Colors.primary,
  },
  packageCardDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  packageCardPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.success,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    marginBottom: 12,
  },
  dateButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonTextContainer: {
    flex: 1,
  },
  dateButtonLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: 2,
  },
  dateButtonValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dateInfoBox: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: `${Colors.info}10`,
    borderRadius: 8,
    gap: 10,
    alignItems: 'flex-start',
  },
  dateInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.info,
    fontWeight: '500',
  },
  costSummarySection: {
    marginBottom: 28,
  },
  costSummaryBox: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  costSummaryLabel: {
    fontSize: 13,
    color: `${Colors.textWhite}99`,
    marginBottom: 6,
  },
  costSummaryAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  costSummaryDetails: {
    fontSize: 12,
    color: `${Colors.textWhite}CC`,
  },
  datePickerButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default Step4Package;
