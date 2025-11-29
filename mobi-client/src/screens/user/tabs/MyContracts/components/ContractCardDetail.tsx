import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ContractData } from '../../../../../types/types';
import { ContractService } from '../../../../../services/ContractService';
import { URL_IMAGE } from '../../../../../services/Constant';
import Colors from '../../../../../styles/colors';
import styles from './ContractCardDetail.styles';

interface ContractCardDetailProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
  messageApi?: any;
}

const statusMap: Record<number, { text: string; color: string }> = {
  0: { text: "Đang hoạt động", color: "#10B981" },
  1: { text: "Đã chấm dứt", color: "#EF4444" },
  2: { text: "Đã hết hạn", color: "#F59E0B" },
  3: { text: "Đang chờ", color: "#3B82F6" },
};

const formatVNDPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function ContractCardDetail({
  contract,
  onContractUpdate,
  messageApi,
}: ContractCardDetailProps) {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [fullContract, setFullContract] = useState<ContractData | null>(null);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Edit form state
  const [editForm, setEditForm] = useState({
    startDate: new Date(contract.startDate),
    endDate: new Date(contract.endDate),
    depositAmount: contract.depositAmount.toString(),
    monthlyRent: contract.monthlyRent.toString(),
    status: contract.status,
  });

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Use full contract data if available, otherwise use passed contract
  const displayContract = fullContract || contract;

  // Fetch full contract data on mount
  useEffect(() => {
    const fetchFullContract = async () => {
      try {
        setFetchLoading(true);
        console.log('Fetching full contract details for:', contract.id);
        const fetchedContract = await ContractService.getById(contract.id);
        setFullContract(fetchedContract);
      } catch (error) {
        console.error('Failed to fetch full contract:', error);
        // Fallback to passed contract
        setFullContract(contract);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchFullContract();
  }, [contract.id]);

  useEffect(() => {
    // Update form when contract changes
    if (displayContract) {
      setEditForm({
        startDate: new Date(displayContract.startDate),
        endDate: new Date(displayContract.endDate),
        depositAmount: displayContract.depositAmount.toString(),
        monthlyRent: displayContract.monthlyRent.toString(),
        status: displayContract.status,
      });
    }
  }, [displayContract]);

  const handleImageUpload = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Quyền truy cập bị từ chối',
          'Vui lòng cấp quyền truy cập thư viện ảnh để tải lên hình ảnh hợp đồng.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Uploading contract image for contract:', contract.id);

        setUploadLoading(true);

        const updatedContract = await ContractService.uploadContractImage(
          displayContract.id,
          asset.uri,
          asset.uri.split('/').pop() || 'contract-image.jpg',
          asset.type === 'image' ? 'image/jpeg' : 'image/jpeg'
        );

        if (onContractUpdate) {
          onContractUpdate(updatedContract);
        }

        Alert.alert('Thành công', 'Hình ảnh hợp đồng đã được tải lên thành công!');

        if (messageApi) {
          messageApi.success('Hình ảnh hợp đồng đã được tải lên thành công!');
        }
      }
    } catch (error: any) {
      console.error('Upload image error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải lên hình ảnh hợp đồng!');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    // Reset form
    setEditForm({
      startDate: new Date(contract.startDate),
      endDate: new Date(contract.endDate),
      depositAmount: contract.depositAmount.toString(),
      monthlyRent: contract.monthlyRent.toString(),
      status: contract.status,
    });
  };

  const handleSubmitEdit = async () => {
    try {
      // Validate form
      if (!editForm.depositAmount || parseFloat(editForm.depositAmount) < 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập số tiền đặt cọc hợp lệ!');
        return;
      }

      if (!editForm.monthlyRent || parseFloat(editForm.monthlyRent) < 0) {
        Alert.alert('Lỗi', 'Vui lòng nhập tiền thuê hàng tháng hợp lệ!');
        return;
      }

      if (editForm.startDate >= editForm.endDate) {
        Alert.alert('Lỗi', 'Ngày kết thúc phải sau ngày bắt đầu!');
        return;
      }

      setLoading(true);

      // Prepare update data
      const updateData = {
        startDate: editForm.startDate.toISOString(),
        endDate: editForm.endDate.toISOString(),
        depositAmount: parseFloat(editForm.depositAmount),
        monthlyRent: parseFloat(editForm.monthlyRent),
        status: editForm.status,
      };

      console.log('Updating contract with data:', updateData);

      // Call API to update contract
      const updatedContract = await ContractService.updateContract(
        displayContract.id,
        updateData
      );

      // Call parent update function
      if (onContractUpdate) {
        onContractUpdate(updatedContract);
      }

      Alert.alert('Thành công', 'Hợp đồng đã được cập nhật thành công!');
      setEditModalVisible(false);

      if (messageApi) {
        messageApi.success('Hợp đồng đã được cập nhật thành công!');
      }
    } catch (error: any) {
      console.error('Update contract error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật hợp đồng!');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEditForm(prev => ({ ...prev, startDate: selectedDate }));
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEditForm(prev => ({ ...prev, endDate: selectedDate }));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {fetchLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 50 }}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={{ marginTop: 10, color: '#757575' }}>Đang tải thông tin hợp đồng...</Text>
        </View>
      ) : (
        <>
          {/* Header with Upload Button */}
          <View style={styles.header}>
            <Text style={styles.title}>Thông tin hợp đồng</Text>
            <TouchableOpacity
              style={[styles.uploadButton, uploadLoading && styles.uploadButtonDisabled]}
              onPress={handleImageUpload}
              disabled={uploadLoading}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
              <Text style={styles.uploadButtonText}>
                {uploadLoading ? 'Đang tải...' : 'Tải ảnh hợp đồng'}
              </Text>
            </TouchableOpacity>
          </View>

      {/* Contract Information Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="document-text-outline" size={18} color="#1976D2" />{' '}
          Chi tiết hợp đồng
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên hợp đồng:</Text>
            <Text style={styles.infoValue}>{displayContract.contractName || 'N/A'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phòng:</Text>
            <Text style={styles.infoValue}>{displayContract.roomTitle}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Người thuê:</Text>
            <Text style={styles.infoValue}>{displayContract.tenantName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số điện thoại:</Text>
            <Text style={styles.infoValue}>{displayContract.tenantPhone}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chủ nhà:</Text>
            <Text style={styles.infoValue}>{displayContract.landlordName}</Text>
          </View>
        </View>
      </View>

      {/* Contract Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="calendar-outline" size={18} color="#1976D2" />{' '}
          Thời hạn hợp đồng
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
            <Text style={styles.infoValue}>{formatDate(displayContract.startDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
            <Text style={styles.infoValue}>{formatDate(displayContract.endDate)}</Text>
          </View>
        </View>
      </View>

      {/* Financial Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="cash-outline" size={18} color="#1976D2" />{' '}
          Thông tin tài chính
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiền đặt cọc:</Text>
            <Text style={[styles.infoValue, styles.amount]}>
              {formatVNDPrice(displayContract.depositAmount)} đ
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tiền thuê/tháng:</Text>
            <Text style={[styles.infoValue, styles.amount]}>
              {formatVNDPrice(displayContract.monthlyRent)} đ
            </Text>
          </View>
        </View>
      </View>

      {/* Landlord Payment Information */}
      {displayContract.landlordPaymentInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="card-outline" size={18} color="#1976D2" />{' '}
            Thông tin thanh toán chủ nhà
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngân hàng:</Text>
              <Text style={styles.infoValue}>{displayContract.landlordPaymentInfo.bankName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số tài khoản:</Text>
              <Text style={styles.infoValue}>{displayContract.landlordPaymentInfo.bankNumber}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tên tài khoản:</Text>
              <Text style={styles.infoValue}>{displayContract.landlordPaymentInfo.accountHolderName}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{displayContract.landlordPaymentInfo.phoneNumber}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Contract Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          <Ionicons name="information-circle-outline" size={18} color="#1976D2" />{' '}
          Trạng thái
        </Text>

        <View style={styles.statusCard}>
          <View style={[styles.statusBadge, { backgroundColor: statusMap[displayContract.status]?.color + '20' }]}>
            <Text style={[styles.statusText, { color: statusMap[displayContract.status]?.color }]}>
              {statusMap[displayContract.status]?.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Contract Image */}
      {displayContract.contractImage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Ionicons name="image-outline" size={18} color="#1976D2" />{' '}
            Hình ảnh hợp đồng
          </Text>

          <View style={styles.imageCard}>
            <Image
              source={{ uri: `${URL_IMAGE}${displayContract.contractImage}` }}
              style={styles.contractImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}

      {/* Edit Button */}
      <View style={styles.editSection}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Ionicons name="create-outline" size={20} color="#FFF" />
          <Text style={styles.editButtonText}>Chỉnh sửa hợp đồng</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa hợp đồng</Text>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#757575" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.noteText}>
                <Text style={styles.noteBold}>Lưu ý:</Text> Chỉ có thể chỉnh sửa Trạng thái, Ngày bắt đầu, Ngày kết thúc,
                Tiền đặt cọc và Tiền thuê hàng tháng. Các trường khác chỉ đọc để đảm bảo tính toàn vẹn dữ liệu.
              </Text>

              {/* Status */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Trạng thái</Text>
                <View style={styles.statusOptions}>
                  {Object.entries(statusMap).map(([key, value]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.statusOption,
                        editForm.status === parseInt(key) && styles.statusOptionSelected,
                      ]}
                      onPress={() => setEditForm(prev => ({ ...prev, status: parseInt(key) }))}
                    >
                      <Text
                        style={[
                          styles.statusOptionText,
                          editForm.status === parseInt(key) && styles.statusOptionTextSelected,
                        ]}
                      >
                        {value.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Start Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày bắt đầu</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(editForm.startDate.toISOString())}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#757575" />
                </TouchableOpacity>
              </View>

              {/* End Date */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Ngày kết thúc</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(editForm.endDate.toISOString())}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#757575" />
                </TouchableOpacity>
              </View>

              {/* Deposit Amount */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tiền đặt cọc (VNĐ)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.depositAmount}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, depositAmount: text }))}
                  placeholder="Nhập số tiền đặt cọc"
                  keyboardType="numeric"
                />
              </View>

              {/* Monthly Rent */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tiền thuê hàng tháng (VNĐ)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editForm.monthlyRent}
                  onChangeText={(text) => setEditForm(prev => ({ ...prev, monthlyRent: text }))}
                  placeholder="Nhập tiền thuê hàng tháng"
                  keyboardType="numeric"
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelModalButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmModalButton]}
                onPress={handleSubmitEdit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.confirmModalButtonText}>Cập nhật</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DateTimePicker
            value={editForm.startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={editForm.endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </Modal>
        </>
      )}
    </ScrollView>
  );
}