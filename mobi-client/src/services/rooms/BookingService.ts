import { API_URL } from '../config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LandlordPaymentInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrCodeUrl?: string;
}

interface BookingData {
  roomId: string;
  rentalDate: string;
  rentalExpires: string;
  tenantCount: number;
}

/**
 * Lấy danh sách booking của user (tenant)
 */
export async function userFetchBookings(page: number, size: number) {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userDataStr = await AsyncStorage.getItem('userData');
    
    if (!userDataStr) {
      throw new Error('User not logged in. Please login again.');
    }
    
    const userData = JSON.parse(userDataStr);
    const userId = userData.id;
    
    if (!userId) {
      throw new Error('User ID not found. Please login again.');
    }
    
    // console.log('🔍 userFetchBookings - Fetching:', `${API_URL}/bookings/user/${userId}/paging?page=${page}&size=${size}`);
    // console.log('🔑 Token:', token ? `${token}...` : 'NULL');
    // console.log('👤 UserId:', userId);
    
    const response = await fetch(
      `${API_URL}/bookings/user/${userId}/paging?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    // console.log('📡 Response status:', response.status);
    // console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response text:', errorText);
      
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) {
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to fetch bookings'}`);
      }
      
      throw new Error(errorJson.message || errorJson.error || 'Failed to fetch bookings');
    }

    const data = await response.json();
    // console.log('✅ Bookings fetched:', data?.bookings?.length || 0, 'items');
    return data;
  } catch (error) {
    console.error('💥 userFetchBookings error:', error);
    throw error;
  }
}

/**
 * Lấy danh sách booking của landlord (chủ nhà)
 */
export async function landlordFetchBookings(page: number, size: number) {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await fetch(
      `${API_URL}/bookings/landlord?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.message || 'Failed to fetch bookings');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('landlordFetchBookings error:', error);
    throw error;
  }
}

/**
 * Tạo booking mới - Sử dụng format giống như backend API
 */
export async function createBooking(bookingData: BookingData, userId: string) {
  try {
    // console.log('BookingService - createBooking called with:', bookingData, 'userId:', userId);

    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/bookings/user/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookingData),
    });

    // console.log('BookingService - Response status:', response.status);
    // console.log('BookingService - Response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = 'Failed to create booking';

      try {
        const errorText = await response.text();
        console.error('BookingService - Error response text:', errorText);

        // Try to parse as JSON first
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.details || errorJson.message || errorJson.error || errorMessage;
        } catch (parseError) {
          // If not JSON, use the raw text (might be HTML error page)
          errorMessage = errorText || `HTTP ${response.status}: ${errorMessage}`;
        }
      } catch (textError) {
        console.error('BookingService - Failed to read error response:', textError);
        errorMessage = `HTTP ${response.status}: ${errorMessage}`;
      }

      throw new Error(errorMessage);
    }

    const booking = await response.json();
    // console.log('BookingService - Success response:', booking);
    return booking;
  } catch (error) {
    console.error('createBooking error:', error);
    throw error;
  }
}

/**
 * Cập nhật trạng thái booking
 * @param bookingId - ID của booking
 * @param newStatus - Trạng thái mới (0: pending, 1: confirmed, 2: cancelled, etc.)
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: number
) {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.message || 'Failed to update booking status');
    }

    const booking = await response.json();
    return booking;
  } catch (error) {
    console.error('updateBookingStatus error:', error);
    throw error;
  }
}

/**
 * Lấy thông tin thanh toán của landlord
 */
export async function getLandlordPaymentInfo(
  bookingId: string
): Promise<LandlordPaymentInfo> {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(
      `${API_URL}/bookings/${bookingId}/landlord-payment-info`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.message || 'Failed to get landlord payment info');
    }

    const paymentInfo = await response.json();
    return paymentInfo;
  } catch (error) {
    console.error('getLandlordPaymentInfo error:', error);
    throw error;
  }
}

/**
 * Xóa booking (soft delete - set isRemoved = 1)
 */
export async function deleteBooking(bookingId: string) {
  try {
    if (!bookingId) {
      throw new Error('Missing bookingId');
    }

    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(
      `${API_URL}/bookings/${bookingId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      let message = 'Failed to delete booking';
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || text || message;
      } catch (_) {
        message = text || message;
      }
      throw new Error(message);
    }

    const result = await response.json();
    return { success: true, message: result.message || 'Booking deleted successfully' };
  } catch (error) {
    console.error('deleteBooking error:', error);
    throw error;
  }
}

/**
 * Upload ảnh chuyển khoản (bill transfer image)
 * React Native sử dụng FormData khác với Web
 */
export async function uploadBillTransferImage(bookingId: string, fileUri: string, fileName: string, fileType: string) {
  try {
    if (!bookingId) {
      throw new Error('Missing bookingId');
    }

    if (!fileUri) {
      throw new Error('Missing file URI');
    }

    // console.log('BookingService - uploadBillTransferImage called with:', {
    //   bookingId,
    //   fileName,
    //   fileUri,
    // });

    const token = await AsyncStorage.getItem('accessToken');

    // Tạo FormData cho React Native
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: fileType || 'image/jpeg',
      name: fileName || 'bill-transfer.jpg',
    } as any);

    const response = await fetch(
      `${API_URL}/bookings/${bookingId}/upload-bill-transfer`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );

    // console.log('BookingService - Upload response status:', response.status);
    // console.log('BookingService - Upload response ok:', response.ok);

    if (!response.ok) {
      const errorJson = await response.json();
      console.error('BookingService - Upload error response:', errorJson);

      const errorMessage =
        errorJson.error ||
        errorJson.message ||
        'Failed to upload bill transfer image';
      throw new Error(errorMessage);
    }

    const result = await response.json();
    // console.log('BookingService - Upload success response:', result);
    return result;
  } catch (error) {
    console.error('uploadBillTransferImage error:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết booking theo ID
 */
export async function getBookingById(bookingId: string) {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(
      `${API_URL}/bookings/${bookingId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.message || 'Failed to fetch booking details');
    }

    const booking = await response.json();
    return booking;
  } catch (error) {
    console.error('getBookingById error:', error);
    throw error;
  }
}

/**
 * Hủy booking (user/tenant cancel)
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    const response = await fetch(
      `${API_URL}/bookings/${bookingId}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.message || 'Failed to cancel booking');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('cancelBooking error:', error);
    throw error;
  }
}
