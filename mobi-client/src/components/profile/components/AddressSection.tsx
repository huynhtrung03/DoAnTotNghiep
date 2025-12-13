/**
 * AddressSection Component
 * 
 * Component hiển thị địa chỉ của user (read-only)
 * 
 * Features:
 * - Hiển thị địa chỉ đầy đủ (Tỉnh, Quận, Phường, Đường)
 * - Hiển thị message nếu chưa có địa chỉ
 * - Read-only (không cho edit trực tiếp)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddressSectionProps } from '../types';
import { styles } from '../ProfileInformation.styles';

const AddressSection: React.FC<AddressSectionProps> = ({ address }) => {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="location-outline" size={24} color="#EF4444" />
        <Text style={styles.sectionTitle}>Địa chỉ</Text>
      </View>

      {/* Hiển thị địa chỉ hoặc empty state */}
      {address ? (
        <View style={styles.addressContainer}>
          {/* Tỉnh/Thành phố */}
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Tỉnh:</Text>
            <Text style={styles.addressValue}>
              {address.ward.district.province.name}
            </Text>
          </View>

          {/* Quận/Huyện */}
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Quận:</Text>
            <Text style={styles.addressValue}>
              {address.ward.district.name}
            </Text>
          </View>

          {/* Phường/Xã */}
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Phường:</Text>
            <Text style={styles.addressValue}>
              {address.ward.name}
            </Text>
          </View>

          {/* Đường/Số nhà */}
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Đường:</Text>
            <Text style={styles.addressValue}>
              {address.street}
            </Text>
          </View>
        </View>
      ) : (
        // Message khi chưa có địa chỉ
        <Text style={styles.noAddressText}>
          Chưa có thông tin địa chỉ
        </Text>
      )}
    </View>
  );
};

export default AddressSection;
