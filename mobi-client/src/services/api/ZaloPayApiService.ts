import { BaseApiClient } from './BaseApiClient';

/**
 * Interface cho request tạo đơn hàng
 */
export interface CreateOrderRequest {
  amount: number;
  userId: string;
  description?: string;
}

/**
 * Interface cho response tạo đơn hàng
 */
export interface CreateOrderResponse {
  success: boolean;
  transactionId: string;
  zptranstoken: string;
  orderurl: string;
  returncode: number;
  returnmessage?: string;
}

/**
 * Interface cho query status
 */
export interface QueryStatusRequest {
  apptransid: string;
}

export interface QueryStatusResponse {
  returncode: number;
  returnmessage: string;
  isprocessing: boolean;
  amount?: number;
  discountamount?: number;
  zptransid?: number;
}

/**
 * Interface cho confirm payment response
 */
export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  zptransid?: string;
  transaction?: any;
  alreadyProcessed?: boolean;
}

/**
 * Service để gọi API ZaloPay từ backend
 */
export class ZaloPayApiService {
  private static readonly CREATE_ORDER_ENDPOINT = '/zalopay/create-order';
  private static readonly QUERY_STATUS_ENDPOINT = '/zalopay/query-status';
  private static readonly CONFIRM_PAYMENT_ENDPOINT = '/zalopay/confirm-payment';
  private static readonly TIMEOUT = 30000; // 30 giây cho payment API (ZaloPay có thể chậm)

  /**
   * Tạo đơn hàng ZaloPay
   * @param data - Thông tin đơn hàng
   * @returns Promise với thông tin order và token
   */
  static async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      console.log('🔵 Tạo đơn hàng ZaloPay:', data);
      
      const response = await BaseApiClient.post<CreateOrderResponse>(
        this.CREATE_ORDER_ENDPOINT,
        data,
        'application/json',
        this.TIMEOUT
      );

      if (!response.success) {
        throw new Error(response.returnmessage || 'Không thể tạo đơn hàng');
      }

      console.log('✅ Tạo đơn hàng thành công:', response.transactionId);
      return response;
    } catch (error) {
      console.error('❌ Lỗi tạo đơn hàng ZaloPay:', error);
      throw error;
    }
  }

  /**
   * Xác nhận thanh toán với backend
   * Mobile gọi sau khi nhận callback từ ZaloPay
   * Backend sẽ verify với ZaloPay và cộng tiền
   * @param appTransId - Mã giao dịch từ callback
   * @param userId - ID user
   * @param returnCode - Return code từ ZaloPay
   * @returns Promise với kết quả xác nhận
   */
  static async confirmPayment(
    appTransId: string,
    userId: string,
    returnCode: string
  ): Promise<ConfirmPaymentResponse> {
    try {
      console.log('🔐 [API] Xác nhận thanh toán:', { appTransId, userId, returnCode });
      
      const response = await BaseApiClient.post<ConfirmPaymentResponse>(
        this.CONFIRM_PAYMENT_ENDPOINT,
        {
          appTransId,
          userId,
          returnCode,
        },
        'application/json',
        this.TIMEOUT
      );

      console.log('✅ [API] Xác nhận thanh toán thành công:', response);
      return response;
    } catch (error) {
      console.error('❌ [API] Lỗi xác nhận thanh toán:', error);
      throw error;
    }
  }

  /**
   * Truy vấn trạng thái đơn hàng (fallback)
   * Gọi API này sau 15 giây nếu chưa nhận được callback
   * @param apptransid - Mã giao dịch của app
   * @returns Promise với trạng thái đơn hàng
   */
  static async queryOrderStatus(apptransid: string): Promise<QueryStatusResponse> {
    try {
      console.log('🔵 Truy vấn trạng thái đơn hàng:', apptransid);
      
      const response = await BaseApiClient.post<QueryStatusResponse>(
        this.QUERY_STATUS_ENDPOINT,
        { apptransid },
        'application/json',
        this.TIMEOUT
      );

      console.log('✅ Trạng thái đơn hàng:', response);
      return response;
    } catch (error) {
      console.error('❌ Lỗi truy vấn trạng thái:', error);
      throw error;
    }
  }

  /**
   * Cancellable create order - hữu ích khi cần hủy request
   */
  static createOrderCancellable(data: CreateOrderRequest) {
    return BaseApiClient.postCancellable<CreateOrderResponse>(
      this.CREATE_ORDER_ENDPOINT,
      data,
      'application/json',
      this.TIMEOUT
    );
  }
}