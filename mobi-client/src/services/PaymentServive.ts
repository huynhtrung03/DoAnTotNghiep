/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './Constant';
import { BaseApiClient } from './api/BaseApiClient';

/**
 * Lay giao dich theo ID nguoi dung voi phan trang
 */
export async function getTransactionsByUserIdPaginated(
  page: number,
  size: number,
  userId?: string
) {
  try {
    // Neu userId khong duoc cung cap, lay tu JWT token
    let targetUserId = userId;
    if (!targetUserId) {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        targetUserId = tokenPayload.id;
      }
    }

    const endpoint = targetUserId
      ? `/transactions/by-user/${targetUserId}/paging`
      : `/landlord/payment-history`;

    return await BaseApiClient.get(endpoint, { page, size });
  } catch (error) {
    console.error('Loi lay giao dich phan trang:', error);
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
 * Tao giao dich moi theo ID nguoi dung
 */
export async function createTransactionByUserId(transactionData: any) {
  try {
    const data = await BaseApiClient.post<any>('/landlord/payment-result-client', transactionData);
    return data.transaction || data;
  } catch (error) {
    console.error('Loi tao giao dich:', error);
    throw error;
  }
}

/**
 * Lay giao dich theo ID nguoi dung va khoang thoi gian
 */
export async function getTransactionsByUserIdAndDateRange(
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 5,
  userId?: string
) {
  try {
    // Neu userId khong duoc cung cap, lay tu JWT token
    let targetUserId = userId;
    if (!targetUserId) {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        targetUserId = tokenPayload.id;
      }
    }

    // Dinh dang endDate neu can
    let formattedEndDate = endDate;
    if (endDate && !endDate.includes('T')) {
      formattedEndDate = `${endDate}T23:59:59`;
    }

    const params = {
      startDate,
      endDate: formattedEndDate,
      page,
      size,
    };

    const endpoint = targetUserId
      ? `/transactions/by-user/${targetUserId}/date-range`
      : `/landlord/payment-history/filter-by-date`;

    return await BaseApiClient.get(endpoint, params);
  } catch (error) {
    console.error('Loi lay giao dich theo khoang thoi gian:', error);
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

type PaymentData = {
  amount: number;
  vnp_BankCode?: string;
  vnp_TxnRef: string;
  vnp_PayDate?: string | null;
  transactionStatus?: { success: boolean };
  vnp_OrderInfo?: string;
};

/**
 * Dinh dang ngay thanh toan VNPay thanh ISO
 */
function formatVnpPayDateToISO(vnpPayDate?: string | null): string | null {
  // VNPay tra ve dang "yyyyMMddHHmmss" (VD: "20250802195453")
  if (!vnpPayDate || vnpPayDate.length !== 14) return null;
  const year = vnpPayDate.substring(0, 4);
  const month = vnpPayDate.substring(4, 6);
  const day = vnpPayDate.substring(6, 8);
  const hour = vnpPayDate.substring(8, 10);
  const minute = vnpPayDate.substring(10, 12);
  const second = vnpPayDate.substring(12, 14);
  // Tao chuoi ISO: "2025-08-02T19:54:53.000+07:00"
  return `${year}-${month}-${day}T${hour}:${minute}:${second}.000+07:00`;
}

/**
 * Chuyen doi du lieu thanh toan thanh du lieu giao dich
 */
export function mapPaymentDataToTransactionData(payment: PaymentData) {
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

/**
 * Tao thanh toan
 */
export const createPayment = async (payload: {
  amount: number;
  description: string;
  userId: string;
}) => {
  try {
    return await BaseApiClient.post('/payments/create', payload);
  } catch (error: any) {
    console.error('Loi tao thanh toan:', error);
    throw new Error(error.message || 'Tao thanh toan that bai');
  }
};

/**
 * Xac nhan thanh toan
 */
export const confirmPayment = async (query: string) => {
  try {
    const params = Object.fromEntries(new URLSearchParams(query));
    return await BaseApiClient.get('/payments/confirm', params);
  } catch (error: any) {
    console.error('Loi xac nhan thanh toan:', error);
    throw error;
  }
};