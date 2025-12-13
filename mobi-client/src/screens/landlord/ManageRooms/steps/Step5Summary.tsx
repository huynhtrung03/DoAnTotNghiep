import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native';
import { Colors } from '../../../../colors/colors';
import TextInputWithLabel from '../components/TextInputWithLabel';
import { RoomFormData } from '../AddRoom';

interface Step5Props {
  formData: RoomFormData;
  onUpdate: (updates: Partial<RoomFormData>) => void;
}

const Step5Summary: React.FC<Step5Props> = ({ formData, onUpdate }) => {
  const calculateTotalArea = () => {
    if (formData.width && formData.height) {
      return (formData.width * formData.height).toFixed(2);
    }
    return '0';
  };

  const summaryItems = [
    {
      label: 'Tên phòng',
      value: formData.title,
    },
    {
      label: 'Vị trí',
      value: `${formData.wardName}, ${formData.districtName}, ${formData.provinceName}`,
    },
    {
      label: 'Diện tích',
      value: `${calculateTotalArea()} m²`,
    },
    {
      label: 'Giá thuê/tháng',
      value: `${(formData.monthlyPrice || 0).toLocaleString('vi-VN')}₫`,
    },
    {
      label: 'Tiền cọc',
      value: `${(formData.deposit || 0).toLocaleString('vi-VN')}₫`,
    },
    {
      label: 'Số người tối đa',
      value: `${formData.maxTenants} người`,
    },
    {
      label: 'Gói tin đăng',
      value: formData.typePostId ? 'Đã chọn' : 'Chưa chọn',
    },
    {
      label: 'Thời gian đăng',
      value: formData.startDate && formData.endDate
        ? `${formData.startDate.toLocaleDateString('vi-VN')} - ${formData.endDate.toLocaleDateString('vi-VN')}`
        : 'Chưa chọn',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tóm tắt thông tin phòng</Text>

        <View style={styles.summaryBox}>
          {summaryItems.map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <Text style={styles.summaryValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Description Section */}
      <View style={styles.section}>
        <TextInputWithLabel
          label="Mô tả chi tiết"
          placeholder="Nhập mô tả về phòng (vị trí, điều kiện, lịch sử, v.v...)"
          value={formData.description}
          onChangeText={(description) => onUpdate({ description })}
          multiline
          numberOfLines={6}
          maxLength={500}
        />
        <Text style={styles.charCounter}>
          {formData.description.length}/500
        </Text>
      </View>

      {/* Tips Section */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Mẹo để thu hút khách</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>
            • Mô tả chi tiết về điều kiện phòng và tiện ích
          </Text>
          <Text style={styles.tipItem}>
            • Nêu rõ các quy định và hạn chế (nếu có)
          </Text>
          <Text style={styles.tipItem}>
            • Cung cấp thông tin về giao thông, tiện ích xung quanh
          </Text>
          <Text style={styles.tipItem}>
            • Hình ảnh rõ nét giúp tăng lượt xem
          </Text>
        </View>
      </View>
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
    marginBottom: 16,
  },
  summaryBox: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  summaryItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  summaryItemLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
  },
  charCounter: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  tipsSection: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: `${Colors.warning}15`,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    marginBottom: 28,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

export default Step5Summary;
