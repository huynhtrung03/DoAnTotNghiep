import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PaymentModalProps } from '../../types/rental';
import {
  getLandlordPaymentInfo,
  uploadBillTransferImage,
  updateBookingStatus,
} from '../../services/BookingService';
import { BillService } from '../../services/BillService';
import { BillData, ContractData } from '../../types/types';
import styles from './PaymentModal.styles';

interface ExtendedPaymentModalProps extends PaymentModalProps {
  bill?: BillData;
  contract?: ContractData;
}

const PaymentModal: React.FC<ExtendedPaymentModalProps> = ({
  visible,
  bookingId,
  bill,
  contract,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const [transferConfirmed, setTransferConfirmed] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (visible) {
      console.log('PaymentModal opened with bookingId:', bookingId, 'bill:', bill?.id, 'contract:', contract?.id);
      if (bill && contract) {
        // For bill payment, no need to fetch payment info
        setPaymentInfo(null);
      } else if (bookingId) {
        // For booking payment, fetch landlord payment info
        fetchPaymentInfo();
      }
    }
  }, [visible, bookingId, bill, contract]);

  const fetchPaymentInfo = async () => {
    if (!bookingId) {
      console.log('fetchPaymentInfo: No bookingId provided');
      return;
    }

    console.log('fetchPaymentInfo: Fetching payment info for bookingId:', bookingId);
    setLoading(true);
    try {
      const info = await getLandlordPaymentInfo(bookingId);
      console.log('fetchPaymentInfo: Payment info fetched successfully:', info);
      setPaymentInfo(info);
    } catch (error: any) {
      console.error('fetchPaymentInfo: Error fetching payment info for bookingId:', bookingId, error);
      Alert.alert('Error', error.message || 'Failed to load payment info');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload payment proof.'
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
        console.log('handlePickImage: Image selected for bookingId:', bookingId, 'fileName:', asset.uri.split('/').pop());
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.uri.split('/').pop() || 'payment-proof.jpg',
          type: asset.type === 'image' ? 'image/jpeg' : 'image/jpeg',
        });
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleUploadAndConfirm = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select a payment proof image');
      return;
    }

    if (!transferConfirmed) {
      Alert.alert('Warning', 'Please confirm that you have completed the transfer');
      return;
    }

    setConfirmLoading(true);
    try {
      if (bill && contract) {
        // Bill payment
        console.log('handleUploadAndConfirm: Uploading bill payment proof for bill:', bill.id, 'contract:', contract.id);
        
        const result = await BillService.uploadBillImageProof(
          contract.id,
          bill.id,
          {
            uri: selectedImage.uri,
            name: selectedImage.fileName,
            type: selectedImage.type,
          }
        );

        console.log('handleUploadAndConfirm: Bill payment proof uploaded successfully:', result);

        // Update bill status to CONFIRMING if current status is PENDING
        if (bill.status === 'PENDING') {
          await BillService.updateBillStatus(contract.id, bill.id, 'CONFIRMING');
          console.log('handleUploadAndConfirm: Bill status updated to CONFIRMING');
        }

        Alert.alert('Success', 'Payment proof uploaded successfully! Waiting for landlord confirmation.', [
          {
            text: 'OK',
            onPress: () => {
              setSelectedImage(null);
              setTransferConfirmed(false);
              onSuccess();
              onClose();
            },
          },
        ]);
      } else if (bookingId) {
        // Booking payment (existing logic)
        console.log('handleUploadAndConfirm: Uploading booking payment proof for bookingId:', bookingId);

        await uploadBillTransferImage(
          bookingId,
          selectedImage.uri,
          selectedImage.fileName,
          selectedImage.type
        );

        // Update booking status to "waiting for deposit confirmation" (status = 3)
        await updateBookingStatus(bookingId, 3);
        console.log('handleUploadAndConfirm: Booking status updated to 3 (waiting for deposit confirmation) for bookingId:', bookingId);

        Alert.alert('Success', 'Payment confirmation submitted successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setSelectedImage(null);
              setTransferConfirmed(false);
              onSuccess();
              onClose();
            },
          },
        ]);
      } else {
        console.log('handleUploadAndConfirm: Invalid payment context - no bill/contract or bookingId');
        Alert.alert('Error', 'Invalid payment context');
        return;
      }
    } catch (error: any) {
      console.error('handleUploadAndConfirm: Upload error for bookingId:', bookingId, 'bill:', bill?.id, error);
      Alert.alert('Error', error.message || 'Failed to upload payment proof');
    } finally {
      setConfirmLoading(false);
    }
  };

  const copyBankNumber = async () => {
    if (paymentInfo?.bankNumber) {
      console.log('copyBankNumber: Copying bank number:', paymentInfo.bankNumber, 'for bookingId:', bookingId);
      Alert.alert('Copied', `Bank number ${paymentInfo.bankNumber} copied to clipboard`);
      // Note: React Native doesn't have navigator.clipboard, using Alert for now
    } else {
      console.log('copyBankNumber: No bank number available for bookingId:', bookingId);
    }
  };

  const handleCallPhone = (phoneNumber: string) => {
    console.log('handleCallPhone: Calling phone number:', phoneNumber, 'for bookingId:', bookingId);
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleSendEmail = (email: string) => {
    console.log('handleSendEmail: Sending email to:', email, 'for bookingId:', bookingId);
    Linking.openURL(`mailto:${email}`);
  };

  const handleClose = () => {
    console.log('handleClose: Closing PaymentModal for bookingId:', bookingId, 'bill:', bill?.id);
    setSelectedImage(null);
    setPaymentInfo(null);
    setTransferConfirmed(false);
    onClose();
  };

  useEffect(() => {
    console.log('PaymentModal render - visible:', visible, 'bookingId:', bookingId, 'bill:', bill?.id);
  }, [visible, bookingId, bill]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {bill ? `Thanh toán hóa đơn - ${new Date(bill.month).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}` : 'Thông tin thanh toán'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Đang tải thông tin thanh toán...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {bill && contract ? (
                <>
                  {/* Bill Information */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="document-text-outline" size={18} color="#1976D2" />{' '}
                      Chi tiết hóa đơn
                    </Text>
                    
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tháng:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(bill.month).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phòng:</Text>
                        <Text style={styles.infoValue}>{contract.roomTitle || 'N/A'}</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tổng tiền:</Text>
                        <Text style={[styles.infoValue, styles.amount]}>
                          {bill.totalAmount?.toLocaleString()} đ
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Chủ nhà:</Text>
                        <Text style={styles.infoValue}>{contract.landlordName || 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Bill Breakdown */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="list-outline" size={18} color="#1976D2" />{' '}
                      Chi tiết hóa đơn
                    </Text>
                    
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Điện:</Text>
                        <Text style={styles.infoValue}>
                          {bill.electricityFee?.toLocaleString()} đ
                          {bill.electricityUsage ? ` (${bill.electricityUsage.toFixed(2)} kWh)` : ''}
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Nước:</Text>
                        <Text style={styles.infoValue}>
                          {bill.waterFee?.toLocaleString()} đ
                          {bill.waterUsage ? ` (${bill.waterUsage.toFixed(2)} m³)` : ''}
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Phí dịch vụ:</Text>
                        <Text style={styles.infoValue}>{bill.serviceFee?.toLocaleString()} đ</Text>
                      </View>
                      {bill.damageFee && bill.damageFee > 0 && (
                        <>
                          <View style={styles.divider} />
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Phí hư hỏng:</Text>
                            <Text style={[styles.infoValue, styles.damageFee]}>
                              +{bill.damageFee.toLocaleString()} đ
                            </Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </>
              ) : paymentInfo ? (
                <>
                  {/* Transfer Details - Enhanced styling */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="business-outline" size={18} color="#1976D2" />{' '}
                      Thông tin chuyển khoản
                    </Text>
                    
                    <View style={styles.transferDetailsCard}>
                      <View style={styles.transferDetailsHeader}>
                        <Ionicons name="card-outline" size={20} color="#1976D2" />
                        <Text style={styles.transferDetailsTitle}>Chi tiết chuyển khoản</Text>
                      </View>
                      
                      <View style={styles.transferDetailsContent}>
                        <View style={styles.transferDetailRow}>
                          <Text style={styles.transferDetailLabel}>Tên ngân hàng:</Text>
                          <Text style={styles.transferDetailValue}>{paymentInfo.bankName}</Text>
                        </View>
                        
                        <View style={styles.transferDetailRow}>
                          <Text style={styles.transferDetailLabel}>Chủ tài khoản:</Text>
                          <Text style={styles.transferDetailValue}>{paymentInfo.accountHolderName}</Text>
                        </View>
                        
                        <View style={styles.transferDetailRow}>
                          <Text style={styles.transferDetailLabel}>Số tài khoản:</Text>
                          <View style={styles.accountNumberContainer}>
                            <Text style={styles.accountNumberText}>{paymentInfo.bankNumber}</Text>
                            <TouchableOpacity
                              style={styles.copyButton}
                              onPress={copyBankNumber}
                            >
                              <Ionicons name="copy-outline" size={16} color="#1976D2" />
                              <Text style={styles.copyButtonText}>Sao chép</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* QR Code - Enhanced */}
                  {paymentInfo.binCode && paymentInfo.depositAmount && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons name="qr-code-outline" size={18} color="#1976D2" />{' '}
                        Mã QR thanh toán
                      </Text>
                      <View style={styles.qrCard}>
                        <Image
                          source={{
                            uri: `https://img.vietqr.io/image/${paymentInfo.binCode}-${paymentInfo.bankNumber}-qr_only.png?amount=${paymentInfo.depositAmount}&addInfo=Dat coc phong ${bookingId}`
                          }}
                          style={styles.qrCode}
                          resizeMode="contain"
                        />
                        <Text style={styles.qrDescription}>
                          Quét mã QR để thanh toán đặt cọc
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Contact Info - Enhanced */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="person-outline" size={18} color="#1976D2" />{' '}
                      Liên hệ chủ nhà
                    </Text>
                    
                    <View style={styles.contactCard}>
                      <TouchableOpacity
                        style={styles.contactRow}
                        onPress={() => handleCallPhone(paymentInfo.phoneNumber)}
                      >
                        <Ionicons name="call-outline" size={20} color="#1976D2" />
                        <Text style={styles.contactText}>
                           Điện thoại: {paymentInfo.phoneNumber}
                        </Text>
                      </TouchableOpacity>
                      <View style={styles.divider} />
                      <TouchableOpacity
                        style={styles.contactRow}
                        onPress={() => handleSendEmail(paymentInfo.email)}
                      >
                        <Ionicons name="mail-outline" size={20} color="#1976D2" />
                        <Text style={styles.contactText}>
                           Email: {paymentInfo.email}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              ) : null}

              {/* Upload Section - Enhanced */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  <Ionicons name="cloud-upload-outline" size={18} color="#1976D2" />{' '}
                  Tải lên ảnh chuyển khoản *
                </Text>
                
                <View style={styles.uploadSectionCard}>
                  <Text style={styles.uploadSectionTitle}>
                    Tải lên bằng chứng thanh toán
                  </Text>
                  <Text style={styles.uploadSectionNote}>
                    Vui lòng tải lên ảnh chụp màn hình hoặc ảnh của giao dịch chuyển khoản để làm bằng chứng thanh toán.
                  </Text>

                  {selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: selectedImage.uri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => setSelectedImage(null)}
                      >
                        <Ionicons name="close-circle" size={28} color="#F44336" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={handlePickImage}
                    >
                      <Ionicons name="image-outline" size={40} color="#1976D2" />
                      <Text style={styles.uploadButtonText}>
                        {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {!selectedImage && (
                    <Text style={styles.requiredFieldNote}>
                      * Trường này bắt buộc để xác nhận thanh toán của bạn
                    </Text>
                  )}
                </View>
              </View>

              {/* Transfer Confirmation */}
              <View style={styles.confirmationSection}>
                <View style={styles.confirmationHeader}>
                  <Ionicons name="checkbox-outline" size={20} color="#FF9800" />
                  <Text style={styles.confirmationTitle}>Xác nhận chuyển khoản</Text>
                </View>

                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => setTransferConfirmed(!transferConfirmed)}
                  >
                    {transferConfirmed ? (
                      <Ionicons name="checkbox" size={20} color="#4CAF50" />
                    ) : (
                      <Ionicons name="square-outline" size={20} color="#757575" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>
                    <Text style={styles.checkboxLabelBold}>Tôi xác nhận rằng:</Text>
                    {'\n'}• Tôi đã hoàn thành chuyển khoản ngân hàng
                    {'\n'}• Tôi đã bao gồm ID đặt phòng trong mô tả chuyển khoản
                    {'\n'}• Tôi sẽ liên hệ với chủ nhà nếu cần
                  </Text>
                </View>
              </View>

              {/* Instructions */}
              <View style={styles.instructionsCard}>
                <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
                <Text style={styles.instructionsText}>
                  Sau khi thực hiện thanh toán, vui lòng tải lên bằng chứng thanh toán (ảnh chụp màn hình hoặc ảnh) 
                  và xác nhận rằng bạn đã hoàn thành chuyển khoản.
                  {bill ? ' Trạng thái hóa đơn của bạn sẽ được cập nhật thành "Đang xác nhận" và chủ nhà sẽ xem xét.' : ' Đặt phòng của bạn sẽ được cập nhật thành "đang chờ xác nhận đặt cọc".'}
                </Text>
              </View>
            </ScrollView>
          )}

          {/* Footer Actions */}
          {!loading && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  (!selectedImage || !transferConfirmed || confirmLoading) && styles.confirmButtonDisabled,
                ]}
                onPress={() => setShowConfirmDialog(true)}
                disabled={!selectedImage || !transferConfirmed || confirmLoading}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.confirmButtonText}>Xác nhận đã thanh toán</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Confirmation Dialog */}
          <Modal
            visible={showConfirmDialog}
            transparent
            animationType="fade"
            onRequestClose={() => setShowConfirmDialog(false)}
          >
            <View style={styles.confirmDialogOverlay}>
              <View style={styles.confirmDialog}>
                <Text style={styles.confirmDialogTitle}>
                  Xác nhận hoàn thành thanh toán
                </Text>
                <Text style={styles.confirmDialogMessage}>
                  Bạn có chắc chắn đã hoàn thành chuyển khoản ngân hàng? Điều này sẽ thông báo cho chủ nhà để xác nhận.
                </Text>

                <View style={styles.confirmDialogButtons}>
                  <TouchableOpacity
                    style={[styles.confirmDialogButton, styles.cancelDialogButton]}
                    onPress={() => setShowConfirmDialog(false)}
                  >
                    <Text style={styles.cancelDialogButtonText}>Chưa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmDialogButton, styles.confirmDialogButtonPrimary]}
                    onPress={() => {
                      setShowConfirmDialog(false);
                      handleUploadAndConfirm();
                    }}
                  >
                    {confirmLoading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.confirmDialogButtonText}>Đã chuyển khoản</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;
