
import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// Define the params type for better type checking if needed
interface PaymentSuccessParams {
  amount?: string;
  transactionId?: string;
  time?: string;
  paymentMethod?: string;
  message?: string;
  serviceName?: string;
}

const PaymentSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Safe access to params with defaults
  const params = (route.params as PaymentSuccessParams) || {};
  
  // Helper function to format currency
  const formatCurrency = (value: string | number | undefined): string => {
    if (!value) return '0VND';
    
    // If value is already a formatted string with currency symbol, return as is
    if (typeof value === 'string' && (value.includes('đ') || value.includes('VND'))) {
      return value;
    }
    
    // Convert to number if string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Format with thousand separators
    return new Intl.NumberFormat('vi-VN').format(numValue) + 'VND';
  };
  
  const amount = formatCurrency(params.amount);
  const transactionId = params.transactionId || '---';
  const time = params.time || new Date().toLocaleString('vi-VN');
  const paymentMethod = params.paymentMethod || 'ZaloPay';
  const serviceName = params.serviceName || 'Nạp tiền';

  const viewShotRef = useRef<View>(null);

  const handleGoHome = () => {
    // Navigate to appropriate home/dashboard
    navigation.navigate('LandlordApp' as never); // Or use navigation.popToTop()
  };

  const handleDetail = () => {
    // Navigate to transaction details
    console.log('Navigate to details');
  };

  const handleSaveImage = async () => {
    try {
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Toast.show({
            type: 'error',
            text1: 'Quyền truy cập bị từ chối',
            text2: 'Vui lòng cấp quyền truy cập thư viện ảnh',
          });
          return;
        }
      }

      const localUri = await captureRef(viewShotRef, {
        format: 'png',
        quality: 1.0,
        result: 'tmpfile',
      });

      if (Platform.OS === 'android') {
        await MediaLibrary.saveToLibraryAsync(localUri);
        Toast.show({
          type: 'success',
          text1: 'Lưu ảnh thành công',
          text2: 'Ảnh đã được lưu vào thư viện',
        });
      } else {
        await Sharing.shareAsync(localUri);
      }

    } catch (error) {
      console.error('Save image error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lưu ảnh thất bại',
        text2: 'Có lỗi xảy ra khi lưu ảnh',
      });
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Section */}
        <View style={styles.header}>
            <TouchableOpacity onPress={handleGoHome} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
        </View>

        {/* Content to capture */}
        <View collapsable={false} ref={viewShotRef} style={styles.receiptContainer}>
          {/* Success Icon */}
          <View style={styles.iconWrapper}>
            <Ionicons name="checkmark-circle" size={80} color="#22C55E" />
          </View>

          {/* Amount & Title */}
          <View style={styles.headerInfo}>
            <Text style={styles.successText}>Thanh toán thành công!</Text>
            <Text style={styles.amountText}>{amount}</Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Mã giao dịch</Text>
                <Text style={styles.detailValue}>{transactionId}</Text>
            </View>
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Thời gian</Text>
                <Text style={styles.detailValue}>{time}</Text>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phương thức</Text>
                <View style={styles.methodWrapper}>
                    <Ionicons name={paymentMethod.includes('Zalo') ? 'wallet-outline' : 'card-outline'} size={16} color="#374151" style={{marginRight: 6}} />
                    <Text style={styles.detailValue}>{paymentMethod}</Text>
                </View>
            </View>
            <View style={styles.divider} />

            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Dịch vụ</Text>
                <Text style={styles.detailValue}>{serviceName}</Text>
            </View>
          </View>

          <View style={styles.dashedDivider} />
          
          < View style={styles.footerNote}>
            <Text style={styles.footerText}>Cảm ơn bạn đã sử dụng dịch vụ</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
             <TouchableOpacity 
                style={styles.saveButton} 
                activeOpacity={0.7}
                onPress={handleSaveImage}
            >
                <Ionicons name="download-outline" size={20} color="#22C55E" />
                <Text style={styles.saveButtonText}>Lưu hóa đơn</Text>
            </TouchableOpacity>

            <View style={styles.mainActions}>
                <TouchableOpacity 
                    style={styles.homeButton} 
                    activeOpacity={0.8}
                    onPress={handleGoHome}
                >
                    <Text style={styles.homeButtonText}>Về trang chủ</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.detailButton} 
                    activeOpacity={0.8}
                    onPress={handleDetail}
                >
                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
            </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingTop: 10,
      marginBottom: 10,
  },
  closeButton: {
      padding: 8,
      backgroundColor: '#E5E7EB',
      borderRadius: 20,
  },
  receiptContainer: {
      width: width - 40,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 24,
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 4,
      marginTop: 10,
  },
  iconWrapper: {
      marginBottom: 16,
  },
  headerInfo: {
      alignItems: 'center',
      marginBottom: 32,
  },
  successText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#374151',
      marginBottom: 8,
  },
  amountText: {
      fontSize: 32,
      fontWeight: '800',
      color: '#111827',
  },
  detailsCard: {
      width: '100%',
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
  },
  detailLabel: {
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
  },
  detailValue: {
      fontSize: 14,
      color: '#111827',
      fontWeight: '600',
      textAlign: 'right',
      flex: 1,
      marginLeft: 16,
  },
  methodWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  divider: {
      height: 1,
      backgroundColor: '#F3F4F6',
      width: '100%',
  },
  dashedDivider: {
    height: 1,
    width: '100%',
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 1,
    marginTop: 24,
    marginBottom: 16,
  },
  footerNote: {
      alignItems: 'center',
  },
  footerText: {
      fontSize: 12,
      color: '#9CA3AF',
  },
  actionsContainer: {
      width: '100%',
      paddingHorizontal: 20,
      marginTop: 24,
      gap: 16,
  },
  saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
  },
  saveButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '600',
      color: '#374151',
  },
  mainActions: {
      flexDirection: 'row',
      gap: 12,
  },
  homeButton: {
      flex: 1,
      backgroundColor: '#22C55E',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      shadowColor: "#22C55E",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
  },
  homeButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
  },
  detailButton: {
      flex: 1,
      backgroundColor: '#E5E7EB',
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
  },
  detailButtonText: {
      color: '#374151',
      fontSize: 16,
      fontWeight: '600',
  },
});

export default PaymentSuccess;
