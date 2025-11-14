/**
 * BankPickerModal Component
 * 
 * Modal component để chọn ngân hàng từ danh sách VietQR
 * 
 * Features:
 * - Hiển thị danh sách tất cả ngân hàng từ VietQR API
 * - Search bar để tìm kiếm ngân hàng theo tên
 * - Hiển thị logo ngân hàng
 * - Checkbox cho ngân hàng đã chọn
 * - Slide up modal animation
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BankPickerModalProps, Bank } from '../types';
import { styles } from '../../../styles/screens/user/ProfileInformation.styles';

const BankPickerModal: React.FC<BankPickerModalProps> = ({
  visible,
  banks,
  selectedBankBin,
  searchQuery,
  onSearch,
  onSelectBank,
  onClose,
}) => {
  /**
   * Lọc danh sách ngân hàng theo search query
   * Tìm kiếm trong: tên đầy đủ, tên viết tắt, và mã ngân hàng
   */
  const filteredBanks = useMemo(() => {
    if (!searchQuery.trim()) {
      return banks; // Trả về tất cả nếu không có search query
    }

    const query = searchQuery.toLowerCase();
    return banks.filter((bank) => {
      return (
        bank.name.toLowerCase().includes(query) ||           // Tìm trong tên đầy đủ
        bank.shortName.toLowerCase().includes(query) ||      // Tìm trong tên viết tắt
        bank.code.toLowerCase().includes(query)              // Tìm trong mã ngân hàng
      );
    });
  }, [banks, searchQuery]);

  /**
   * Render mỗi item trong danh sách ngân hàng
   */
  const renderBankItem = ({ item }: { item: Bank }) => {
    const isSelected = item.bin === selectedBankBin;

    return (
      <TouchableOpacity
        style={styles.bankItem}
        onPress={() => onSelectBank(item)}
        activeOpacity={0.7}
      >
        {/* Logo ngân hàng */}
        <Image
          source={{ uri: item.logo }}
          style={styles.bankLogo}
          resizeMode="contain"
        />

        {/* Thông tin ngân hàng */}
        <View style={styles.bankInfo}>
          <Text style={styles.bankName} numberOfLines={1}>
            {item.shortName}
          </Text>
          <Text style={styles.bankCode}>
            {item.code} - BIN: {item.bin}
          </Text>
        </View>

        {/* Checkbox cho ngân hàng đã chọn */}
        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={24}
            color="#10B981"
            style={styles.bankCheckbox}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay - nền đen mờ */}
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose} // Đóng modal khi click vào overlay
      >
        {/* Modal Container - slide up từ dưới lên */}
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()} // Prevent close khi click vào modal content
        >
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chọn ngân hàng</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm ngân hàng..."
              value={searchQuery}
              onChangeText={onSearch}
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Danh sách ngân hàng */}
          <FlatList
            data={filteredBanks}
            renderItem={renderBankItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.bankList}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              // Hiển thị message khi không tìm thấy ngân hàng
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Ionicons name="business-outline" size={48} color="#D1D5DB" />
                <Text style={styles.noBanksText}>
                  {banks.length === 0 
                    ? 'Không thể tải danh sách ngân hàng.\nVui lòng nhập thông tin thủ công.' 
                    : 'Không tìm thấy ngân hàng phù hợp'}
                </Text>
              </View>
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default BankPickerModal;
