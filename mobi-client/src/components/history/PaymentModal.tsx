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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { PaymentModalProps } from '../../types/rental';
import {
  getLandlordPaymentInfo,
  uploadBillTransferImage,
  updateBookingStatus,
} from '../../services/rooms/BookingService';
import styles from './PaymentModal.styles';

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  bookingId,
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

  useEffect(() => {
    if (visible && bookingId) {
      fetchPaymentInfo();
    }
  }, [visible, bookingId]);

  const fetchPaymentInfo = async () => {
    if (!bookingId) return;

    setLoading(true);
    try {
      const info = await getLandlordPaymentInfo(bookingId);
      setPaymentInfo(info);
    } catch (error: any) {
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
    if (!bookingId) {
      Alert.alert('Error', 'Booking ID is missing');
      return;
    }

    if (!selectedImage) {
      Alert.alert('Error', 'Please select a payment proof image');
      return;
    }

    setUploading(true);
    try {
      // Upload bill transfer image
      await uploadBillTransferImage(
        bookingId,
        selectedImage.uri,
        selectedImage.fileName,
        selectedImage.type
      );

      // Update booking status to confirmed (status = 1)
      await updateBookingStatus(bookingId, 1);

      Alert.alert('Success', 'Payment proof uploaded successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setSelectedImage(null);
            onSuccess();
            onClose();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setPaymentInfo(null);
    onClose();
  };

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
            <Text style={styles.title}>Payment Information</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976D2" />
              <Text style={styles.loadingText}>Loading payment info...</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {paymentInfo && (
                <>
                  {/* Bank Information */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="business-outline" size={18} color="#1976D2" />{' '}
                      Bank Information
                    </Text>
                    
                    <View style={styles.infoCard}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Bank Name:</Text>
                        <Text style={styles.infoValue}>{paymentInfo.bankName}</Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Account Number:</Text>
                        <Text style={[styles.infoValue, styles.accountNumber]}>
                          {paymentInfo.accountNumber}
                        </Text>
                      </View>
                      <View style={styles.divider} />
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Account Name:</Text>
                        <Text style={styles.infoValue}>{paymentInfo.accountName}</Text>
                      </View>
                    </View>
                  </View>

                  {/* QR Code */}
                  {paymentInfo.qrCodeUrl && (
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        <Ionicons name="qr-code-outline" size={18} color="#1976D2" />{' '}
                        QR Code for Payment
                      </Text>
                      <View style={styles.qrContainer}>
                        <Image
                          source={{ uri: paymentInfo.qrCodeUrl }}
                          style={styles.qrCode}
                          resizeMode="contain"
                        />
                      </View>
                    </View>
                  )}

                  {/* Upload Section */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="cloud-upload-outline" size={18} color="#1976D2" />{' '}
                      Upload Payment Proof
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
                          Tap to select image
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Instructions */}
                  <View style={styles.instructionsCard}>
                    <Ionicons name="information-circle-outline" size={20} color="#1976D2" />
                    <Text style={styles.instructionsText}>
                      After making the payment, please upload the payment proof (screenshot or photo) 
                      and tap "Confirm Payment" button.
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
          )}

          {/* Footer Actions */}
          {!loading && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  (!selectedImage || uploading) && styles.confirmButtonDisabled,
                ]}
                onPress={handleUploadAndConfirm}
                disabled={!selectedImage || uploading}
              >
                {uploading ? (
                  <>
                    <ActivityIndicator size="small" color="#FFF" />
                    <Text style={styles.confirmButtonText}>Uploading...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                    <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default PaymentModal;
