/**
 * PaymentResultScreen Component
 *
 * Màn hình hiển thị kết quả thanh toán thành công
 * Thiết kế hiện đại với animations và thông tin chi tiết
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../../../../styles/colors';
import { confirmPayment } from '../../../../services/PaymentServive';
import styles from './PaymentResultScreen.style';

type PaymentResultRouteProp = RouteProp<
  { PaymentResult: { query: string } },
  'PaymentResult'
>;

interface PaymentDetails {
  amount: number;
  transactionCode: string;
  transactionDate: string;
  status: string;
  description: string;
  bankCode?: string;
}

export default function PaymentResultScreen() {
  const navigation = useNavigation();
  const route = useRoute<PaymentResultRouteProp>();
  const { query } = route.params || {};

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      handlePaymentConfirmation(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const handlePaymentConfirmation = async (queryString: string) => {
    try {
      const result = await confirmPayment(queryString);
      if (result.success) {
        setPaymentDetails({
          amount: result.amount || 0,
          transactionCode: result.transactionCode || '',
          transactionDate: result.transactionDate || new Date().toISOString(),
          status: 'Thành công',
          description: result.description || 'Thanh toán thành công',
          bankCode: result.bankCode,
        });
      } else {
        Alert.alert('Lỗi', 'Xác nhận thanh toán thất bại');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      Alert.alert('Lỗi', 'Không thể xác nhận thanh toán');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleGoHome = () => {
    navigation.navigate('Main/Home' as never);
  };

  const handleViewInvoice = () => {
    // Navigate to invoice screen or show invoice details
    Alert.alert('Thông báo', 'Tính năng xem hóa đơn đang được phát triển');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.View entering={ZoomIn}>
            <Ionicons name="card-outline" size={64} color={Colors.primary} />
          </Animated.View>
          <Text style={styles.loadingText}>Đang xác nhận thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả thanh toán</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <Animated.View entering={ZoomIn.duration(800)} style={styles.successContainer}>
          <LinearGradient
            colors={[Colors.success, '#22c55e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successIconContainer}
          >
            <Ionicons name="checkmark-circle" size={80} color={Colors.textWhite} />
          </LinearGradient>
          <Text style={styles.successTitle}>Thanh toán thành công!</Text>
          <Text style={styles.successSubtitle}>
            Giao dịch của bạn đã được xử lý thành công
          </Text>
        </Animated.View>

        {/* Payment Details */}
        {paymentDetails && (
          <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Chi tiết giao dịch</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số tiền</Text>
              <Text style={styles.detailValue}>{formatCurrency(paymentDetails.amount)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mã giao dịch</Text>
              <Text style={styles.detailValue}>{paymentDetails.transactionCode}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Thời gian</Text>
              <Text style={styles.detailValue}>{formatDate(paymentDetails.transactionDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Trạng thái</Text>
              <View style={styles.statusContainer}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.statusText}>{paymentDetails.status}</Text>
              </View>
            </View>

            {paymentDetails.bankCode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngân hàng</Text>
                <Text style={styles.detailValue}>{paymentDetails.bankCode}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Mô tả</Text>
              <Text style={styles.detailValue}>{paymentDetails.description}</Text>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewInvoice}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={20} color={Colors.textWhite} />
            <Text style={styles.primaryButtonText}>Xem hóa đơn</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Ionicons name="home-outline" size={20} color={Colors.primary} />
            <Text style={styles.secondaryButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}
