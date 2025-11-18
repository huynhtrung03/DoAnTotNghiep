import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== TYPES =====

/** Dữ liệu giao dịch phân trang */
export interface PaginatedTransactions {
  transactions: Transaction[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** Thông tin giao dịch */
export interface Transaction {
  id?: string;
  amount: number;
  transactionType: number;
  bankTransactionName: string;
  transactionCode: string;
  transactionDate: string | null;
  status: number;
  description: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Dữ liệu thanh toán từ VNPay */
export interface PaymentData {
  amount: number;
  vnp_BankCode?: string;
  vnp_TxnRef: string;
  vnp_PayDate?: string | null;
  transactionStatus?: { success: boolean };
  vnp_OrderInfo?: string;
}

/** Payload tạo thanh toán mới */
export interface CreatePaymentPayload {
  amount: number;
  description: string;
  userId: string;
}

/** Response khi tạo thanh toán */
export interface CreatePaymentResponse {
  paymentUrl: string;
  transactionCode: string;
  amount: number;
}

/** Response khi xác nhận thanh toán */
export interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

// ===== HELPER FUNCTIONS =====

/**
 * Lấy headers authentication từ AsyncStorage
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Chuyển đổi ngày từ VNPay (yyyyMMddHHmmss) sang ISO format
 * @param vnpPayDate - Ngày từ VNPay (VD: "20250802195453")
 * @returns ISO string hoặc null
 */
function formatVnpPayDateToISO(vnpPayDate?: string | null): string | null {
  // VNPay trả về dạng "yyyyMMddHHmmss" (VD: "20250802195453")
  if (!vnpPayDate || vnpPayDate.length !== 14) return null;

  const year = vnpPayDate.substring(0, 4);
  const month = vnpPayDate.substring(4, 6);
  const day = vnpPayDate.substring(6, 8);
  const hour = vnpPayDate.substring(8, 10);
  const minute = vnpPayDate.substring(10, 12);
  const second = vnpPayDate.substring(12, 14);

  // Tạo chuỗi ISO: "2025-08-02T19:54:53.000+07:00"
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000+07:00`;
}

/**
 * Chuyển đổi dữ liệu thanh toán từ VNPay sang định dạng Transaction
 * @param payment - Dữ liệu thanh toán từ VNPay
 * @returns Transaction data
 */
export function mapPaymentDataToTransactionData(
  payment: PaymentData
): Omit<Transaction, 'id'> {
  return {
    amount: payment.amount,
    transactionType: 1,
    bankTransactionName: payment.vnp_BankCode || 'VNPAY',
    transactionCode: payment.vnp_TxnRef,
    transactionDate: payment.vnp_PayDate
      ? formatVnpPayDateToISO(payment.vnp_PayDate)
      : null,
    status: payment.transactionStatus?.success ? 1 : 0,
    description: payment.vnp_OrderInfo || '',
  };
}

// ===== API FUNCTIONS =====

/**
 * Lấy danh sách giao dịch theo user ID (có phân trang)
 * @param page - Số trang (bắt đầu từ 0)
 * @param size - Số lượng bản ghi mỗi trang
 * @returns Danh sách giao dịch phân trang
 */
export async function getTransactionsByUserIdPaginated(
  page: number,
  size: number
): Promise<PaginatedTransactions> {
  try {
    const headers = await getAuthHeaders();
    console.log(`📋 Fetching transactions: page ${page}, size ${size}`);

    const response = await fetch(
      `${API_URL}/landlord/payment-history?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      console.error('❌ Network error:', response.status);
      throw new Error('Network error');
    }

    const data = await response.json();
    console.log(
      `✅ Transactions fetched: ${data.transactions?.length || 0} items`
    );
    return data;
  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    // Trả về dữ liệu rỗng khi lỗi
    return {
      transactions: [],
      pageNumber: page,
      pageSize: size,
      totalRecords: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }
}

/**
 * Tạo giao dịch mới (sau khi thanh toán thành công)
 * @param transactionData - Dữ liệu giao dịch
 * @returns Thông tin giao dịch đã tạo
 */
export async function createTransactionByUserId(
  transactionData: Omit<Transaction, 'id'>
): Promise<Transaction> {
  try {
    const headers = await getAuthHeaders();
    console.log('➕ Creating transaction:', transactionData.transactionCode);

    const response = await fetch(`${API_URL}/landlord/payment-result-client`, {
      method: 'POST',
      headers,
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to create transaction:', errorText);
      throw new Error('Failed to create transaction');
    }

    const data = await response.json();
    console.log('✅ Transaction created:', data.id || data.transactionCode);
    return data.transaction || data;
  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    throw error;
  }
}

/**
 * Lấy danh sách giao dịch theo khoảng thời gian
 * @param startDate - Ngày bắt đầu (format: YYYY-MM-DD)
 * @param endDate - Ngày kết thúc (format: YYYY-MM-DD)
 * @param page - Số trang (mặc định 0)
 * @param size - Số lượng mỗi trang (mặc định 5)
 * @returns Danh sách giao dịch phân trang
 */
export async function getTransactionsByUserIdAndDateRange(
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 5
): Promise<PaginatedTransactions> {
  try {
    const headers = await getAuthHeaders();
    console.log(`📅 Fetching transactions: ${startDate} - ${endDate}`);

    const params = new URLSearchParams({
      startDate,
      endDate,
      page: page.toString(),
      size: size.toString(),
    }).toString();

    const response = await fetch(
      `${API_URL}/landlord/payment-history/filter-by-date?${params}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      console.error('❌ Network error:', response.status);
      throw new Error('Network error');
    }

    const data = await response.json();
    console.log(
      `✅ Filtered transactions: ${data.transactions?.length || 0} items`
    );
    return data;
  } catch (error) {
    console.error('❌ Error fetching transactions by date range:', error);
    // Trả về dữ liệu rỗng khi lỗi
    return {
      transactions: [],
      pageNumber: page,
      pageSize: size,
      totalRecords: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false,
    };
  }
}

/**
 * Tạo yêu cầu thanh toán mới (trả về URL thanh toán VNPay)
 * @param payload - Thông tin thanh toán (số tiền, mô tả, userId)
 * @returns URL thanh toán và thông tin giao dịch
 */
export const createPayment = async (
  payload: CreatePaymentPayload
): Promise<CreatePaymentResponse> => {
  try {
    const headers = await getAuthHeaders();
    console.log('💳 Creating payment:', payload.amount, 'VND');

    const res = await fetch(`${API_URL}/payments/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Payment creation failed:', data.error);
      throw new Error(data.error || 'Payment creation failed');
    }

    console.log('✅ Payment created, redirect to:', data.paymentUrl);
    return data;
  } catch (error) {
    console.error('❌ createPayment error:', error);
    throw error;
  }
};

/**
 * Xác nhận thanh toán (sau khi redirect từ VNPay về)
 * @param query - Query string từ VNPay callback
 * @returns Kết quả xác nhận thanh toán
 */
export const confirmPayment = async (
  query: string
): Promise<ConfirmPaymentResponse> => {
  try {
    console.log('🔍 Confirming payment with query:', query.substring(0, 50) + '...');

    const res = await fetch(`${API_URL}/payments/confirm?${query}`, {
      method: 'GET',
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('❌ Payment confirmation failed:', data.message);
      throw new Error(data.message || 'Failed to confirm payment');
    }

    console.log('✅ Payment confirmed:', data.success ? 'SUCCESS' : 'FAILED');
    return data;
  } catch (error) {
    console.error('❌ Confirm payment service error:', error);
    throw error;
  }
};
