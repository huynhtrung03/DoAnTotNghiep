
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Vibration,
  Platform,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface PaymentFailureParams {
  reason?: string;
  message?: string;
  transactionId?: string;
  canRetry?: boolean;
}

const PaymentFailure = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = (route.params as PaymentFailureParams) || {};

  const reason = params.reason || 'Thanh toán không thành công';
  const errorMessage =
    params.message || 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng thử lại sau.';
  const canRetry = params.canRetry !== false; // Default to true

  useEffect(() => {
    // Haptic Feedback: Error pattern (Double vibration or long vibration)
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 50, 50, 50]); // Pattern for iOS
    } else {
      Vibration.vibrate(400); // Long vibration for Android
    }
  }, []);

  const handleRetry = () => {
    // Go back to the previous screen (likely the payment method selection or input)
    // allowing the user to try again
    navigation.goBack();
  };

  const handleChangeMethod = () => {
    // Logic to navigate to "Select Payment Method" screen
    // For now, going back usually allows choosing another method
    navigation.goBack();
    // ideally navigate to a specific screen if the flow is complex
  };

  const handleGoHome = () => {
    navigation.navigate('LandlordApp' as never);
  };

  const handleContactSupport = () => {
    // Open support chat or call hotline
    console.log('Contact Support');
    navigation.navigate('Chat' as never); // Example navigation
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header Spacer */}
        <View style={styles.headerSpacer} />

        {/* Icon Container */}
        <View style={styles.iconContainer}>
          <View style={styles.circleBackground}>
            <Ionicons name="alert" size={64} color="#EF4444" />
          </View>
        </View>

        {/* Main Title & Message */}
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Thanh toán thất bại</Text>
          
          <Text style={styles.errorReason}>{reason}</Text>
          
          <View style={styles.messageBox}>
            <Text style={styles.errorMessage}>{errorMessage}</Text>
            <Text style={styles.reassuranceText}>
              Tài khoản của bạn chưa bị trừ tiền.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {/* Primary Action: Retry */}
          {canRetry && (
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.8}
              onPress={handleRetry}
            >
              <Text style={styles.primaryButtonText}>Thử lại ngay</Text>
            </TouchableOpacity>
          )}

          {/* Secondary Action: Change Method */}
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.8}
            onPress={handleChangeMethod}
          >
            <Text style={styles.secondaryButtonText}>Chọn phương thức khác</Text>
          </TouchableOpacity>

          {/* Tertiary Action: Go Home */}
          <TouchableOpacity
            style={styles.textButton}
            onPress={handleGoHome}
          >
             <Text style={styles.textButtonText}>Về trang chủ</Text>
          </TouchableOpacity>
        </View>

        {/* Support Link */}
        <TouchableOpacity style={styles.supportLink} onPress={handleContactSupport}>
          <Text style={styles.supportText}>
            Gặp sự cố? <Text style={styles.supportHighlight}>Liên hệ CSKH</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  headerSpacer: {
    height: 60,
  },
  iconContainer: {
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FEE2E2', // Soft red background
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorReason: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  reassuranceText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#EF4444', // Red for "Retry" but slightly softer than pure red
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  textButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  supportLink: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  supportText: {
    fontSize: 14,
    color: '#6B7280',
  },
  supportHighlight: {
    color: '#EF4444',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PaymentFailure;
