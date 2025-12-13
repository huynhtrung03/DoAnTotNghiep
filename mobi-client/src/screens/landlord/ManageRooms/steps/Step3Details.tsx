import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../../colors/colors';
import NumberInputWithFormat from '../components/NumberInputWithFormat';
import QuantityInput from '../components/QuantityInput';
import { RoomFormData } from '../AddRoom';
import { Convenient } from '../../../../types/types';

// Mock convenients data
const mockConvenients: Convenient[] = [
  { id: '1', name: 'WiFi' },
  { id: '2', name: 'Máy lạnh' },
  { id: '3', name: 'TV' },
  { id: '4', name: 'Tủ lạnh' },
  { id: '5', name: 'Nồi cơm' },
  { id: '6', name: 'Buồng tắm' },
  { id: '7', name: 'Bếp' },
  { id: '8', name: 'Máy giặt' },
  { id: '9', name: 'Ban công' },
  { id: '10', name: 'Cửa sổ' },
];

const GRID_COLS = 3;
const { width } = Dimensions.get('window');
const CHIP_WIDTH = (width - 32 - (GRID_COLS - 1) * 8) / GRID_COLS;

interface Step3Props {
  formData: RoomFormData;
  onUpdate: (updates: Partial<RoomFormData>) => void;
}

const Step3Details: React.FC<Step3Props> = ({ formData, onUpdate }) => {
  const toggleConvenient = (convenientId: string) => {
    const updated = formData.convenients.includes(convenientId)
      ? formData.convenients.filter((id) => id !== convenientId)
      : [...formData.convenients, convenientId];
    onUpdate({ convenients: updated });
  };

  const getConvenientIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'WiFi': 'wifi',
      'Máy lạnh': 'ac-unit',
      'TV': 'tv',
      'Tủ lạnh': 'kitchen',
      'Nồi cơm': 'restaurant',
      'Buồng tắm': 'bathtub',
      'Bếp': 'local-fire-department',
      'Máy giặt': 'local-laundry-service',
      'Ban công': 'balcony',
      'Cửa sổ': 'window',
    };
    return iconMap[name] || 'check-circle';
  };

  const renderConvenientChip = ({ item }: { item: Convenient }) => {
    const isSelected = formData.convenients.includes(item.id);
    return (
      <TouchableOpacity
        style={[
          styles.convenientChip,
          isSelected && styles.convenientChipSelected,
        ]}
        onPress={() => toggleConvenient(item.id)}
      >
        <MaterialIcons
          name={getConvenientIcon(item.name) as any}
          size={24}
          color={isSelected ? Colors.primary : Colors.textSecondary}
        />
        <Text
          style={[
            styles.convenientChipText,
            isSelected && styles.convenientChipTextSelected,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Dimensions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông số phòng</Text>

        {/* Width & Height in 2 columns */}
        <View style={styles.row}>
          <View style={styles.col}>
            <NumberInputWithFormat
              label="Chiều dài (m)"
              placeholder="0"
              value={formData.width}
              onChangeValue={(value) => onUpdate({ width: value })}
              suffix="m"
            />
          </View>
          <View style={styles.col}>
            <NumberInputWithFormat
              label="Chiều rộng (m)"
              placeholder="0"
              value={formData.height}
              onChangeValue={(value) => onUpdate({ height: value })}
              suffix="m"
            />
          </View>
        </View>
      </View>

      {/* Pricing Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Giá tiền</Text>

        <NumberInputWithFormat
          label="Giá phòng (đ/tháng)"
          placeholder="0"
          value={formData.monthlyPrice}
          onChangeValue={(value) => onUpdate({ monthlyPrice: value })}
          isCurrency
        />

        <NumberInputWithFormat
          label="Tiền cọc (đ)"
          placeholder="0"
          value={formData.deposit}
          onChangeValue={(value) => onUpdate({ deposit: value })}
          isCurrency
        />

        <NumberInputWithFormat
          label="Giá điện (đ/kWh)"
          placeholder="0"
          value={formData.electricPrice}
          onChangeValue={(value) => onUpdate({ electricPrice: value })}
          isCurrency
        />

        <NumberInputWithFormat
          label="Giá nước (đ/m³)"
          placeholder="0"
          value={formData.waterPrice}
          onChangeValue={(value) => onUpdate({ waterPrice: value })}
          isCurrency
        />
      </View>

      {/* Tenant Capacity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Số lượng</Text>

        <View style={styles.quantityInputContainer}>
          <Text style={styles.quantityLabel}>Số người tối đa</Text>
          <QuantityInput
            value={formData.maxTenants}
            onChangeValue={(value) => onUpdate({ maxTenants: value })}
            min={1}
            max={10}
          />
        </View>
      </View>

      {/* Convenients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Tiện ích ({formData.convenients.length})
        </Text>
        <Text style={styles.sectionDescription}>
          Chọn các tiện ích có sẵn trong phòng
        </Text>

        <FlatList
          scrollEnabled={false}
          data={mockConvenients}
          keyExtractor={(item) => item.id}
          renderItem={renderConvenientChip}
          numColumns={GRID_COLS}
          columnWrapperStyle={styles.convenientGrid}
        />
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  quantityInputContainer: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  convenientGrid: {
    gap: 8,
    marginBottom: 8,
  },
  convenientChip: {
    width: CHIP_WIDTH,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  convenientChipSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}10`,
  },
  convenientChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  convenientChipTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default Step3Details;
