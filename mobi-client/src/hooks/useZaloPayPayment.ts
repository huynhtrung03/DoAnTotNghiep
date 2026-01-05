import { useState, useEffect, useRef } from 'react';
import ZaloPayService, { ZaloPayErrorCode, ZaloPayResponse } from '../services/ZaloPayService';
import { ZaloPayApiService, CreateOrderRequest, QueryStatusResponse, ConfirmPaymentResponse } from '../services/api/ZaloPayApiService';

/**
 * Trạng thái thanh toán
 */
export enum PaymentStatus {
  IDLE = 'idle',
  CREATING_ORDER = 'creating_order',
  OPENING_ZALOPAY = 'opening_zalopay',
  PROCESSING = 'processing',
  VERIFYING = 'verifying',
  QUERYING_STATUS = 'querying_status',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELED = 'canceled',
  APP_NOT_INSTALLED = 'app_not_installed',
  PAYMENT_PROCESSING = 'payment_processing',
}

/**
 * Hook để xử lý thanh toán ZaloPay với đầy đủ logic
 */
export const useZaloPayPayment = () => {
  const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.IDLE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  
  // Ref để lưu timeout query status
  const queryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const earlyQueryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ref để lưu userId cho confirm payment
  const userIdRef = useRef<string | null>(null);
  
  // Ref để đếm số lần query để tránh infinite loop
  const queryRetryCountRef = useRef<number>(0);
  const maxQueryRetries = 5;
  
  // 🔥 KEY FIX: Thêm flag để track xem đã nhận callback chưa
  const hasReceivedCallbackRef = useRef<boolean>(false);
  
  // 🔥 KEY FIX: Thêm flag để track xem payment đã được resolve chưa (success/failed definitively)
  const isPaymentResolvedRef = useRef<boolean>(false);
  
  // 🔥 KEY FIX: Thêm minimum wait time trước khi cho phép hiển thị failed
  const paymentStartTimeRef = useRef<number>(0);
  const MIN_WAIT_BEFORE_FAILED = 5000; // 5 giây

  /**
   * Cleanup khi unmount
   */
  useEffect(() => {
    console.log(`[${new Date().toISOString()}] 🧹 [Hook] useZaloPayPayment cleanup on unmount`);
    return () => {
      if (queryTimeoutRef.current) {
        clearTimeout(queryTimeoutRef.current);
      }
      if (earlyQueryTimeoutRef.current) {
        clearTimeout(earlyQueryTimeoutRef.current);
      }
      ZaloPayService.cleanup();
    };
  }, []);

  /**
   * Track status changes
   */
  useEffect(() => {
    const statusTime = new Date().toISOString();
    console.log(`[${statusTime}] 📊 [Hook] Status changed to:`, status);
  }, [status]);

  /**
   * Query trạng thái đơn hàng từ backend (fallback)
   */
  const queryOrderStatus = async (apptransid: string): Promise<void> => {
    const queryStartTime = new Date().toISOString();
    console.log(`[${queryStartTime}] 🔍 [Hook] queryOrderStatus called for apptransid:`, apptransid);
    console.log(`[${queryStartTime}] 🔍 [Hook] Current retry count:`, queryRetryCountRef.current);
    console.log(`[${queryStartTime}] 🔍 [Hook] Payment resolved:`, isPaymentResolvedRef.current);
    console.log(`[${queryStartTime}] 🔍 [Hook] Has received callback:`, hasReceivedCallbackRef.current);

    // 🔥 KEY FIX: Nếu payment đã được resolve (success/failed definitively), không query nữa
    if (isPaymentResolvedRef.current) {
      console.log(`[${queryStartTime}] ⏹️ [Hook] Payment already resolved, skipping query`);
      return;
    }

    // Kiểm tra số lần retry
    if (queryRetryCountRef.current >= maxQueryRetries) {
      console.log(`[${queryStartTime}] ⚠️ [Hook] Max retries reached (${maxQueryRetries}), setting failed status`);
      
      // 🔥 KEY FIX: Chỉ set failed nếu đã đợi đủ lâu
      const timeSinceStart = Date.now() - paymentStartTimeRef.current;
      if (timeSinceStart < MIN_WAIT_BEFORE_FAILED) {
        console.log(`[${queryStartTime}] ⏳ [Hook] Not enough time passed (${timeSinceStart}ms), waiting more...`);
        return;
      }
      
      isPaymentResolvedRef.current = true;
      setStatus(PaymentStatus.FAILED);
      setError('Không thể xác nhận thanh toán, vui lòng liên hệ hỗ trợ');
      setLoading(false);
      return;
    }

    queryRetryCountRef.current += 1;

    try {
      // 🔥 KEY FIX: Nếu chưa nhận callback, set status sang PAYMENT_PROCESSING thay vì QUERYING_STATUS
      // để tránh hiển thị "đang kiểm tra" ngay sau khi quay về app
      if (!hasReceivedCallbackRef.current) {
        console.log(`[${new Date().toISOString()}] 🔄 [Hook] Setting status to PAYMENT_PROCESSING (no callback yet)`);
        setStatus(PaymentStatus.PAYMENT_PROCESSING);
      } else {
        console.log(`[${new Date().toISOString()}] 🔍 [Hook] Setting status to QUERYING_STATUS`);
        setStatus(PaymentStatus.QUERYING_STATUS);
      }

      const result: QueryStatusResponse = await ZaloPayApiService.queryOrderStatus(apptransid);

      const queryEndTime = new Date().toISOString();
      console.log(`[${queryEndTime}] 📊 [Hook] Query result received:`, result);

      // returncode = 1: Thanh toán thành công
      if (result.returncode === 1) {
        console.log(`[${queryEndTime}] ✅ [Hook] Payment successful (returncode = 1)`);
        isPaymentResolvedRef.current = true;
        setStatus(PaymentStatus.SUCCESS);
        setTransactionId(result.zptransid?.toString() || null);
        setLoading(false);
      }
      // returncode = -1: Thất bại thực sự
      else if (result.returncode === -1) {
        console.log(`[${queryEndTime}] ❌ [Hook] Payment failed definitively (returncode = -1)`);
        
        // 🔥 KEY FIX: Chỉ set failed nếu đã đợi đủ lâu
        const timeSinceStart = Date.now() - paymentStartTimeRef.current;
        if (timeSinceStart < MIN_WAIT_BEFORE_FAILED) {
          console.log(`[${queryEndTime}] ⏳ [Hook] Not enough time for definitive fail (${timeSinceStart}ms), retrying...`);
          // Retry sau 2 giây
          queryTimeoutRef.current = setTimeout(() => {
            queryOrderStatus(apptransid);
          }, 2000);
          return;
        }
        
        isPaymentResolvedRef.current = true;
        setStatus(PaymentStatus.FAILED);
        setError(result.returnmessage || 'Thanh toán thất bại');
        setLoading(false);
      }
      // Các trường hợp khác: đang xử lý
      else {
        console.log(`[${queryEndTime}] ⏳ [Hook] Transaction still processing (returncode = ${result.returncode})`);
        setStatus(PaymentStatus.PAYMENT_PROCESSING);
        
        // 🔥 KEY FIX: Giảm thời gian retry xuống 2 giây thay vì 3 giây
        queryTimeoutRef.current = setTimeout(() => {
          queryOrderStatus(apptransid);
        }, 2000);
      }
    } catch (err) {
      const errorTime = new Date().toISOString();
      console.error(`[${errorTime}] ❌ [Hook] Error in queryOrderStatus:`, err);

      // 🔥 KEY FIX: Không set failed ngay khi có lỗi query, retry thêm
      console.log(`[${errorTime}] 🔄 [Hook] Query error, will retry after delay`);
      setStatus(PaymentStatus.PAYMENT_PROCESSING);
      
      queryTimeoutRef.current = setTimeout(() => {
        queryOrderStatus(apptransid);
      }, 2000);
    }
  };

  /**
   * Xác nhận thanh toán với backend
   */
  const confirmPayment = async (
    appTransId: string,
    userId: string,
    returnCode: string
  ): Promise<void> => {
    const confirmStartTime = new Date().toISOString();
    console.log(`[${confirmStartTime}] 🔐 [Hook] confirmPayment called with:`, {
      appTransId,
      userId,
      returnCode
    });

    // 🔥 KEY FIX: Nếu payment đã resolved, không confirm nữa
    if (isPaymentResolvedRef.current) {
      console.log(`[${confirmStartTime}] ⏹️ [Hook] Payment already resolved, skipping confirm`);
      return;
    }

    try {
      setStatus(PaymentStatus.VERIFYING);

      const response = await ZaloPayApiService.confirmPayment(
        appTransId,
        userId,
        returnCode
      );

      const confirmEndTime = new Date().toISOString();
      console.log(`[${confirmEndTime}] ✅ [Hook] confirmPayment response:`, response);

      if (response.success) {
        console.log(`[${confirmEndTime}] 🎉 [Hook] Payment confirmed successfully`);
        isPaymentResolvedRef.current = true;
        setStatus(PaymentStatus.SUCCESS);
        setTransactionId(response.zptransid || appTransId);
        setLoading(false);
      } else {
        // 🔥 KEY FIX: Nếu confirm fail, không set failed ngay, để query xử lý
        console.log(`[${confirmEndTime}] ⚠️ [Hook] Confirm not successful, fallback to query`);
        await queryOrderStatus(appTransId);
      }
    } catch (err) {
      const errorTime = new Date().toISOString();
      console.error(`[${errorTime}] ❌ [Hook] confirmPayment error:`, err);

      // Fallback: nếu confirm fail, thử query
      console.log(`[${errorTime}] ⚠️ [Hook] Confirm error, fallback to query`);
      await queryOrderStatus(appTransId);
    }
  };

  /**
   * Xử lý callback từ ZaloPay SDK
   */
  const handleZaloPayCallback = async (
    result: ZaloPayResponse, 
    appTransId: string,
    userId: string
  ): Promise<void> => {
    const callbackTime = new Date().toISOString();
    console.log(`[${callbackTime}] 📲 [Hook] handleZaloPayCallback received:`, result);

    // 🔥 KEY FIX: Đánh dấu đã nhận callback
    hasReceivedCallbackRef.current = true;

    // Clear timeout query nếu có
    if (queryTimeoutRef.current) {
      clearTimeout(queryTimeoutRef.current);
      queryTimeoutRef.current = null;
    }
    if (earlyQueryTimeoutRef.current) {
      clearTimeout(earlyQueryTimeoutRef.current);
      earlyQueryTimeoutRef.current = null;
    }

    const returnCodeStr = String(result.returnCode);

    // Xử lý theo returnCode
    switch (returnCodeStr) {
      case ZaloPayErrorCode.PAYMENT_SUCCESS:
      case ZaloPayErrorCode.PAYMENT_PROCESSING:
        console.log(`[${callbackTime}] ✅ [Hook] Callback indicates success/processing, confirming...`);
        await confirmPayment(appTransId, userId, returnCodeStr);
        break;

      case ZaloPayErrorCode.PAYMENT_CANCELED:
        console.log(`[${callbackTime}] ⚠️ [Hook] User canceled payment`);
        isPaymentResolvedRef.current = true;
        setStatus(PaymentStatus.CANCELED);
        setError('Người dùng đã hủy thanh toán');
        setLoading(false);
        break;

      case ZaloPayErrorCode.APP_NOT_INSTALLED:
        console.log(`[${callbackTime}] 📱 [Hook] App not installed`);
        isPaymentResolvedRef.current = true;
        setStatus(PaymentStatus.APP_NOT_INSTALLED);
        setLoading(false);
        break;

      case ZaloPayErrorCode.PAYMENT_FAILED:
        console.log(`[${callbackTime}] ❌ [Hook] Callback indicates failed, but confirming to be sure...`);
        // 🔥 KEY FIX: Vẫn confirm để backend verify, không tin callback hoàn toàn
        await confirmPayment(appTransId, userId, returnCodeStr);
        break;

      default:
        console.log(`[${callbackTime}] ❓ [Hook] Unknown returnCode, confirming...`);
        await confirmPayment(appTransId, userId, returnCodeStr);
        break;
    }
  };

  /**
   * Bắt đầu thanh toán
   */
  const startPayment = async (orderData: CreateOrderRequest): Promise<void> => {
    const paymentStartTime = new Date().toISOString();
    console.log(`[${paymentStartTime}] 🚀 [Hook] startPayment called with:`, orderData);

    try {
      setLoading(true);
      setError(null);
      setStatus(PaymentStatus.CREATING_ORDER);
      
      // 🔥 KEY FIX: Reset tất cả flags
      hasReceivedCallbackRef.current = false;
      isPaymentResolvedRef.current = false;
      queryRetryCountRef.current = 0;
      paymentStartTimeRef.current = Date.now();

      // Lưu userId
      userIdRef.current = orderData.userId;

      // 1. Tạo đơn hàng
      console.log(`[${new Date().toISOString()}] 💳 [Hook] Bước 1: Tạo đơn hàng ZaloPay`);
      const orderResponse = await ZaloPayApiService.createOrder(orderData);

      if (!orderResponse.zptranstoken) {
        throw new Error('Không nhận được zpTransToken từ server');
      }

      setTransactionId(orderResponse.transactionId);
      console.log(`[${new Date().toISOString()}] ✅ [Hook] Đơn hàng đã tạo:`, orderResponse.transactionId);

      // 2. Kiểm tra ZaloPay app
      const isInstalled = await ZaloPayService.isZaloPayInstalled();
      console.log(`[${new Date().toISOString()}] 📱 [Hook] ZaloPay app installed:`, isInstalled);

      if (!isInstalled) {
        isPaymentResolvedRef.current = true;
        setStatus(PaymentStatus.APP_NOT_INSTALLED);
        setLoading(false);
        return;
      }

      // 3. Mở ZaloPay app
      console.log(`[${new Date().toISOString()}] 💳 [Hook] Bước 2: Mở ZaloPay app`);
      setStatus(PaymentStatus.OPENING_ZALOPAY);

      const expectCallback = await ZaloPayService.payOrder(
        orderResponse.zptranstoken,
        (result) => handleZaloPayCallback(
          result, 
          orderResponse.transactionId,
          orderData.userId
        )
      );

      console.log(`[${new Date().toISOString()}] 🔧 [Hook] PayZaloBridge expect callback:`, expectCallback);

      if (!expectCallback) {
        console.log(`[${new Date().toISOString()}] ⚠️ [Hook] PayZaloBridge failed, will query after delay`);
        setStatus(PaymentStatus.PAYMENT_PROCESSING);
        // 🔥 KEY FIX: Tăng delay lên 5 giây để đảm bảo ZaloPay đã xử lý xong
        setTimeout(() => {
          queryOrderStatus(orderResponse.transactionId);
        }, 5000);
        return;
      }

      setStatus(PaymentStatus.PROCESSING);

      // 4. Setup early timeout - query sớm hơn nếu chưa có callback
      // 🔥 KEY FIX: Tăng từ 10 giây lên 12 giây
      earlyQueryTimeoutRef.current = setTimeout(() => {
        if (!hasReceivedCallbackRef.current && !isPaymentResolvedRef.current) {
          console.log(`[${new Date().toISOString()}] ⏰ [Hook] 12s passed, no callback yet, querying...`);
          queryOrderStatus(orderResponse.transactionId);
        }
      }, 12000);

      // 5. Setup main timeout - query sau 15 giây
      queryTimeoutRef.current = setTimeout(() => {
        if (!isPaymentResolvedRef.current) {
          console.log(`[${new Date().toISOString()}] ⏰ [Hook] 15s passed, querying status...`);
          if (earlyQueryTimeoutRef.current) {
            clearTimeout(earlyQueryTimeoutRef.current);
          }
          queryOrderStatus(orderResponse.transactionId);
        }
      }, 15000);

    } catch (err) {
      const errorTime = new Date().toISOString();
      console.error(`[${errorTime}] ❌ [Hook] Error in startPayment:`, err);

      isPaymentResolvedRef.current = true;
      setStatus(PaymentStatus.FAILED);
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
      setLoading(false);
    }
  };

  /**
   * Reset trạng thái về ban đầu
   */
  const reset = (): void => {
    if (queryTimeoutRef.current) {
      clearTimeout(queryTimeoutRef.current);
      queryTimeoutRef.current = null;
    }
    if (earlyQueryTimeoutRef.current) {
      clearTimeout(earlyQueryTimeoutRef.current);
      earlyQueryTimeoutRef.current = null;
    }
    setStatus(PaymentStatus.IDLE);
    setLoading(false);
    setError(null);
    setTransactionId(null);
    userIdRef.current = null;
    queryRetryCountRef.current = 0;
    hasReceivedCallbackRef.current = false;
    isPaymentResolvedRef.current = false;
    paymentStartTimeRef.current = 0;
  };

  /**
   * Mở Store để tải ZaloPay
   */
  const openStore = async (): Promise<void> => {
    try {
      await ZaloPayService.openZaloPayStore();
    } catch (err) {
      console.error('❌ Lỗi mở Store:', err);
    }
  };

  return {
    status,
    loading,
    error,
    transactionId,
    startPayment,
    reset,
    openStore,
    isSuccess: status === PaymentStatus.SUCCESS,
    isFailed: status === PaymentStatus.FAILED,
    isCanceled: status === PaymentStatus.CANCELED,
    isAppNotInstalled: status === PaymentStatus.APP_NOT_INSTALLED,
    isPaymentProcessing: status === PaymentStatus.PAYMENT_PROCESSING,
  };
};