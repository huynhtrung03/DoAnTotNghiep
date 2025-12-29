import { useState, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ZaloPayApiService } from '../../../../../services/api/ZaloPayApiService';
import ZaloPayService, { ZaloPayErrorCode } from '../../../../../services/ZaloPayService';

export enum PaymentState {
  IDLE = 'idle',
  CREATING_ORDER = 'creating_order',
  OPENING_ZALOPAY = 'opening_zalopay',
  WAITING_PAYMENT = 'waiting_payment',
  VERIFYING = 'verifying',
  SUCCESS = 'success',
  FAILED = 'failed',
}

interface OrderResponse {
  zptranstoken?: string;
  zpTransToken?: string;
  transactionId: string;
}

/**
 * Custom hook để quản lý payment logic cho ZaloPay
 * Tách biệt business logic khỏi UI component
 */
export const useZaloPayment = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>(PaymentState.IDLE);
  const [loading, setLoading] = useState(false);
  
  // Refs to track payment
  const transactionIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const hasCallbackRef = useRef<boolean>(false);
  const isVerifiedRef = useRef<boolean>(false);
  const checkingRef = useRef<boolean>(false);
  const autoCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Reset all state về ban đầu
   */
  const resetState = useCallback(() => {
    setPaymentState(PaymentState.IDLE);
    setLoading(false);
    hasCallbackRef.current = false;
    isVerifiedRef.current = false;
    transactionIdRef.current = null;
    userIdRef.current = null;
    checkingRef.current = false;
    if (autoCheckTimeoutRef.current) {
      clearTimeout(autoCheckTimeoutRef.current);
      autoCheckTimeoutRef.current = null;
    }
  }, []);

  /**
   * Query payment status from backend
   */
  const queryPaymentStatus = useCallback(async (
    transactionId: string,
    userId: string
  ): Promise<boolean> => {
    if (!transactionId) {
      console.log('⚠️ [useZaloPayment] Querying with empty transactionId, skipping');
      return false;
    }
    
    console.log('🔍 [useZaloPayment] Querying payment status:', transactionId);
    
    try {
      const result = await ZaloPayApiService.queryOrderStatus(transactionId);
      console.log('📊 [useZaloPayment] Query result:', result);

      if (result.returncode === 1) {
        console.log('✅ [useZaloPayment] Payment verified as successful');
        return true;
      }
      
      if (result.returncode === -1) {
        console.log('❌ [useZaloPayment] Payment verified as failed');
        return false;
      }

      console.log('⏳ [useZaloPayment] Payment still processing');
      return false;
    } catch (error) {
      console.error('❌ [useZaloPayment] Error querying status:', error);
      return false;
    }
  }, []);

  /**
   * Confirm payment with backend
   */
  const confirmPaymentWithBackend = useCallback(async (
    transactionId: string,
    userId: string,
    returnCode: string
  ): Promise<any> => {
    console.log('🔐 [useZaloPayment] Confirming payment with backend:', {
      transactionId,
      userId,
      returnCode
    });

    try {
      const response = await ZaloPayApiService.confirmPayment(
        transactionId,
        userId,
        returnCode
      );

      console.log('✅ [useZaloPayment] Confirm response:', response);

      if (response.success) {
        console.log('💰 [useZaloPayment] Payment confirmed, wallet credited');
        return response;
      } else {
        console.warn('⚠️ [useZaloPayment] Confirm not successful, will query');
        const queryRes = await queryPaymentStatus(transactionId, userId);
        return queryRes ? { success: true } : false;
      }
    } catch (error) {
      console.error('❌ [useZaloPayment] Error confirming payment:', error);
      const queryRes = await queryPaymentStatus(transactionId, userId);
      return queryRes ? { success: true } : false;
    }
  }, [queryPaymentStatus]);

  /**
   * Create ZaloPay order
   */
  const createOrder = useCallback(async (amount: number, description: string) => {
    setLoading(true);
    setPaymentState(PaymentState.CREATING_ORDER);

    try {
      // Get userId from JWT token
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('Không tìm thấy thông tin đăng nhập');
      }

      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = tokenPayload.id;
      userIdRef.current = userId;

      // Create order data
      const orderData = {
        amount,
        description: description || `Nạp ${formatCurrency(amount)} vào ví`,
        userId,
      };

      console.log('💳 [useZaloPayment] Creating ZaloPay order...');

      const orderResponse: OrderResponse = await ZaloPayApiService.createOrder(orderData);
      console.log('✅ [useZaloPayment] Order created:', orderResponse);

      const zpToken = orderResponse.zptranstoken || orderResponse.zpTransToken;
      if (!zpToken) {
        throw new Error('Không nhận được token thanh toán ZaloPay');
      }

      transactionIdRef.current = orderResponse.transactionId;

      return { zpToken, transactionId: orderResponse.transactionId };
    } catch (error: any) {
      console.error('❌ [useZaloPayment] Error creating order:', error);
      setLoading(false);
      setPaymentState(PaymentState.IDLE);
      throw error;
    }
  }, []);

  /**
   * Helper: Format currency
   */
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M₫';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(0) + 'K₫';
    }
    return amount.toLocaleString('vi-VN') + '₫';
  };

  return {
    // States
    paymentState,
    setPaymentState,
    loading,
    setLoading,
    
    // Refs
    transactionIdRef,
    userIdRef,
    hasCallbackRef,
    isVerifiedRef,
    checkingRef,
    autoCheckTimeoutRef,
    
    // Functions
    resetState,
    queryPaymentStatus,
    confirmPaymentWithBackend,
    createOrder,
    formatCurrency,
  };
};
