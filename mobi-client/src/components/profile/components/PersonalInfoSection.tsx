/**
 * PersonalInfoSection Component
 * 
 * Component hiển thị và chỉnh sửa thông tin cá nhân của user
 * 
 * Features:
 * - Họ và tên (required field)
 * - Email (required field)
 * - Số điện thoại (optional)
 * - Tự động disable khi không ở chế độ edit
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PersonalInfoSectionProps } from '../types';
import { styles } from '../ProfileInformation.styles';

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  fullName,
  email,
  phoneNumber,
  isEditing,
  onChangeFullName,
  onChangeEmail,
  onChangePhoneNumber,
}) => {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="person-outline" size={24} color="#3B82F6" />
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
      </View>

      {/* Họ và tên - Required Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.requiredLabel}>
          Họ và tên <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={fullName}
          onChangeText={onChangeFullName}
          placeholder="Nhập họ và tên"
          editable={isEditing}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Email - Required Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.requiredLabel}>
          Email <Text style={styles.requiredAsterisk}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={email}
          onChangeText={onChangeEmail}
          placeholder="Nhập email"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={isEditing}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Số điện thoại - Optional Field */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Số điện thoại (tùy chọn)</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={phoneNumber}
          onChangeText={onChangePhoneNumber}
          placeholder="Nhập số điện thoại (10-11 chữ số)"
          keyboardType="phone-pad"
          editable={isEditing}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
};

export default PersonalInfoSection;
