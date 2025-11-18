/**
 * BankSection Component
 * 
 * Component hiển thị và chỉnh sửa thông tin ngân hàng
 * 
 * Features:
 * - Hiển thị badge "Đã xác thực" nếu đã có tài khoản ngân hàng
 * - Warning nếu chưa có thông tin ngân hàng
 * - Bank picker để chọn ngân hàng
 * - Tên ngân hàng
 * - Mã BIN (tự động điền khi chọn ngân hàng)
 * - Số tài khoản
 * - Tên chủ tài khoản
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BankSectionProps } from '../types';
import { styles } from '../../../styles/screens/user/ProfileInformation.styles';

const BankSection: React.FC<BankSectionProps> = ({
  hasBankAccount,
  bankName,
  binCode,
  bankNumber,
  accountHolderName,
  isEditing,
  onChangeBankName,
  onChangeBinCode,
  onChangeBankNumber,
  onChangeAccountHolder,
  onOpenBankPicker,
}) => {
  return (
    <View style={styles.section}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <MaterialCommunityIcons name="bank" size={24} color="#8B5CF6" />
        <Text style={styles.sectionTitle}>Thông tin ngân hàng</Text>
      </View>

      {/* Badge "Đã xác thực" - hiển thị nếu đã có bank account */}
      {hasBankAccount && (
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#059669" />
          <Text style={styles.verifiedBadgeText}>Đã xác thực</Text>
        </View>
      )}

      {/* Warning nếu chưa có thông tin ngân hàng */}
      {!bankName && !isEditing && (
        <View style={styles.noBankWarning}>
          <Ionicons name="warning" size={20} color="#D97706" />
          <Text style={styles.noBankWarningText}>
            Bạn chưa có thông tin ngân hàng. Vui lòng cập nhật để nhận thanh toán.
          </Text>
        </View>
      )}

      {/* Tên ngân hàng - có button để mở bank picker hoặc nhập manual */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Tên ngân hàng</Text>
        <View>
          <TextInput
            style={[
              styles.input,
              !isEditing && styles.inputDisabled,
              isEditing && styles.inputWithIcon, // Thêm padding bên phải cho icon
            ]}
            value={bankName}
            onChangeText={onChangeBankName}
            placeholder="Nhập hoặc chọn ngân hàng"
            editable={isEditing} // Cho phép nhập manual khi editing
            placeholderTextColor="#9CA3AF"
          />
          {/* Icon chevron để mở bank picker - chỉ hiển thị khi editing */}
          {isEditing && (
            <TouchableOpacity
              style={styles.inputIcon}
              onPress={onOpenBankPicker}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Mã BIN - tự động điền khi chọn ngân hàng */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Mã BIN (6-8 chữ số)</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={binCode}
          onChangeText={onChangeBinCode}
          placeholder="Mã BIN ngân hàng"
          keyboardType="number-pad"
          editable={isEditing}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Số tài khoản */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Số tài khoản (8-16 chữ số)</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={bankNumber}
          onChangeText={onChangeBankNumber}
          placeholder="Nhập số tài khoản"
          keyboardType="number-pad"
          editable={isEditing}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Tên chủ tài khoản */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Tên chủ tài khoản</Text>
        <TextInput
          style={[styles.input, !isEditing && styles.inputDisabled]}
          value={accountHolderName}
          onChangeText={onChangeAccountHolder}
          placeholder="Nhập tên chủ tài khoản"
          autoCapitalize="characters" // Tự động viết hoa
          editable={isEditing}
          placeholderTextColor="#9CA3AF"
        />
      </View>
    </View>
  );
};

export default BankSection;
