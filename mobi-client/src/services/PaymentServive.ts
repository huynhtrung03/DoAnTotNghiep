/* eslint-disable @typescript-eslint/no-explicit-any */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config/Constant';

export async function getTransactionsByUserIdPaginated(
  page: number,
  size: number,
  userId?: string
) {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    // console.log('PaymentService - Access token exists:', !!accessToken);

    // If userId is not provided, get it from JWT token
    let targetUserId = userId;
    if (!targetUserId && accessToken) {
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      targetUserId = tokenPayload.id;
      // console.log('PaymentService - User ID from JWT:', targetUserId);
    }

    const apiUrl = targetUserId
      ? `${API_URL}/transactions/by-user/${targetUserId}/paging?page=${page}&size=${size}`
      : `${API_URL}/landlord/payment-history?page=${page}&size=${size}`;

    // console.log('PaymentService - API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    // console.log('PaymentService - Response status:', response.status);
    // console.log('PaymentService - Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PaymentService - Error response:', errorText);
      throw new Error(`Network error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // console.log('PaymentService - Success response:', data);
    return data;
  } catch (error) {
    console.error("Error fetching transactions:", error);
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

export async function createTransactionByUserId(transactionData: any) {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/landlord/payment-result-client`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify(transactionData),
    });
    if (!response.ok) {
      throw new Error("Failed to create transaction");
    }
    const data = await response.json();
    return data.transaction || data;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

export async function getTransactionsByUserIdAndDateRange(
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 5,
  userId?: string
) {
  try {
    const accessToken = await AsyncStorage.getItem('accessToken');

    // If userId is not provided, get it from JWT token
    let targetUserId = userId;
    if (!targetUserId && accessToken) {
      const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
      targetUserId = tokenPayload.id;
      // console.log('PaymentService - User ID from JWT for date range:', targetUserId);
    }

    // Format endDate to include time if it's just a date (add T23:59:59)
    let formattedEndDate = endDate;
    if (endDate && !endDate.includes('T')) {
      formattedEndDate = `${endDate}T23:59:59`;
      // console.log('PaymentService - Formatted endDate:', endDate, '->', formattedEndDate);
    }

    const params = new URLSearchParams({
      startDate,
      endDate: formattedEndDate,
      page: page.toString(),
      size: size.toString(),
    }).toString();

    const apiUrl = targetUserId
      ? `${API_URL}/transactions/by-user/${targetUserId}/date-range?${params}`
      : `${API_URL}/landlord/payment-history/filter-by-date?${params}`;

    // console.log('PaymentService - Date range API URL:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    // console.log('PaymentService - Date range response status:', response.status);
    // console.log('PaymentService - Date range response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PaymentService - Date range error response:', errorText);
      throw new Error(`Network error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    // console.log('PaymentService - Date range success response:', data);
    return data;
  } catch (error) {
    console.error("Error fetching transactions by date range:", error);
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

export function mapPaymentDataToTransactionData(payment: PaymentData) {
  return {
    amount: payment.amount,
    transactionType: 1,
    bankTransactionName: payment.vnp_BankCode || "VNPAY",
    transactionCode: payment.vnp_TxnRef,
    transactionDate: payment.vnp_PayDate
      ? formatVnpPayDateToISO(payment.vnp_PayDate)
      : null,
    status: payment.transactionStatus?.success ? 1 : 0,
    description: payment.vnp_OrderInfo || "",
  };
}

//-------------create-payment--------------//
export const createPayment = async (payload: {
  amount: number;
  description: string;
  userId: string;
}) => {
  const accessToken = await AsyncStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/payments/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Payment creation failed");
  return data;
};
//------- confirm payment ------//
export const confirmPayment = async (query: string) => {
  try {
    // console.log('PaymentService - Confirming payment with query:', query);
    const accessToken = await AsyncStorage.getItem('accessToken');
    // console.log('PaymentService - Access token exists for confirm:', !!accessToken);

    const res = await fetch(`${API_URL}/payments/confirm?${query}`, {
      method: "GET",
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
    });

    // console.log('PaymentService - Confirm response status:', res.status);
    const data = await res.json();
    // console.log('PaymentService - Confirm response data:', data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to confirm payment");
    }

    return data;
  } catch (error: any) {
    console.error("Confirm payment service error:", error);
    throw error;
  }
};

// export async function getAllTransactionsByUserId(
//   userId: string,
//   accessToken: string
// ) {
//   try {
//     const response = await fetch(`${API_URL}/transactions/${userId}`, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     if (response.status === 400) {
//       return null;
//     }

//     if (response.status === 403) {
//       console.log("Forbidden access to transactions");
//       return { forbidden: true };
//     }

//     if (!response.ok) throw new Error("Network error");
//     const data = await response.json();
//     // Đảm bảo luôn trả về mảng
//     if (!Array.isArray(data)) return [];
//     return data;
//   } catch (error) {
//     console.error("Error getAllTransactionsByUserId:", error);
//     return [];
//   }
// }