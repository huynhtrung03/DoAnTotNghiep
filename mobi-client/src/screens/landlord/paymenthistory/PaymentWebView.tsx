import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '../../../colors/colors';
import { confirmPayment } from '../../../services/PaymentService';

interface RouteParams {
  paymentUrl: string;
  onPaymentSuccess?: () => void;
}

const PaymentWebView: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { paymentUrl, onPaymentSuccess } = route.params as RouteParams;
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    // console.log('PaymentWebView - Navigation state changed:', url);

    // Check for success/failure URLs from VNPay
    if (url.includes('vnp_ResponseCode=00') && !isConfirming && !hasConfirmed && !isProcessingSuccess) {
      // console.log('PaymentWebView - Payment success detected, confirming with server...');
      setIsConfirming(true);
      setHasConfirmed(true);
      setIsProcessingSuccess(true);

      try {
        // Extract query parameters from URL
        const urlObj = new URL(url);
        const queryString = urlObj.search.substring(1); // Remove the leading '?'
        // console.log('PaymentWebView - Confirming payment with query:', queryString);

        const confirmResult = await confirmPayment(queryString);
        // console.log('PaymentWebView - Payment confirmation result:', confirmResult);

        if (confirmResult.success || confirmResult.status === 'success') {
          // console.log('PaymentWebView - Payment confirmed successfully');
          // Navigate to success screen (PaymentScreen shows success state)
          (navigation as any).navigate('PaymentScreen');
        } else {
          console.error('PaymentWebView - Payment confirmation failed:', confirmResult);
          // Navigate to failure screen
          (navigation as any).navigate('PaymentFailure', {
            reason: 'Xác nhận thanh toán thất bại',
            message: 'Thanh toán không được xác nhận. Vui lòng liên hệ hỗ trợ.',
            canRetry: true,
          });
        }
      } catch (error: any) {
        console.error('PaymentWebView - Error confirming payment:', error);
        // Navigate to failure screen
        (navigation as any).navigate('PaymentFailure', {
          reason: 'Lỗi xác nhận thanh toán',
          message: error.message || 'Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại.',
          canRetry: true,
        });
      } finally {
        setIsConfirming(false);
        // Delay navigation to allow user to see the alert
        setTimeout(() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            // If can't go back, navigate to a safe screen
            (navigation as any).navigate('LandlordTabs');
          }
        }, 2000);
      }
    } else if (url.includes('vnp_ResponseCode') && !url.includes('vnp_ResponseCode=00') && !hasConfirmed) {
      // console.log('PaymentWebView - Payment failed');
      setHasConfirmed(true);
      // Payment failed - navigate to failure screen
      (navigation as any).navigate('PaymentFailure', {
        reason: 'Thanh toán thất bại',
        message: 'Thanh toán không thành công. Vui lòng thử lại.',
        canRetry: true,
      });
      setTimeout(() => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          (navigation as any).navigate('LandlordTabs');
        }
      }, 2000);
    }
  };

  if (!paymentUrl) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>URL thanh toán không hợp lệ</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isConfirming && (
        <View style={styles.confirmingOverlay}>
          <View style={styles.confirmingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.confirmingText}>Đang xác nhận thanh toán...</Text>
          </View>
        </View>
      )}
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải cổng thanh toán...</Text>
          </View>
        )}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        // NOTE: If you get ERR_CONNECTION_REFUSED, replace localhost in backend VNPay return URL
        // with your computer's IP address (e.g., 192.168.1.100) or use ngrok for testing on device
        // Backend should return URLs like: http://192.168.1.100:8080/api/payment/return
        // or ngrok URL: https://abc123.ngrok.io/api/payment/return
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
  },
  confirmingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confirmingContainer: {
    backgroundColor: Colors.background,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  confirmingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});

export default PaymentWebView;