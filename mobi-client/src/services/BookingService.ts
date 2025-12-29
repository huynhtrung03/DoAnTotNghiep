import { API_URL } from './Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseApiClient } from './api/BaseApiClient';

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
 * Lay danh sach booking cua user (tenant)
 */
export async function userFetchBookings(page: number, size: number) {
  try {
    const userDataStr = await AsyncStorage.getItem('userData');

    if (!userDataStr) {
      throw new Error('Nguoi dung chua dang nhap. Vui long dang nhap lai.');
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.id;

    if (!userId) {
      throw new Error('Khong tim thay ID nguoi dung. Vui long dang nhap lai.');
    }

    console.log(`Lay danh sach booking cua user ${userId}, trang ${page}, kich thuoc ${size}`);

    const params = { page, size };
    return await BaseApiClient.get(`/bookings/user/${userId}/paging`, params);
  } catch (error) {
    console.error('Loi khi lay danh sach booking cua user:', error);
    throw error;
  }
}

/**
 * Lay danh sach booking cua landlord (chu nha)
 */
export async function landlordFetchBookings(page: number, size: number) {
  try {
    console.log(`Lay danh sach booking cua landlord, trang ${page}, kich thuoc ${size}`);

    const params = { page, size };
    return await BaseApiClient.get('/bookings/landlord', params);
  } catch (error) {
    console.error('Loi khi lay danh sach booking cua landlord:', error);
    throw error;
  }
}

/**
 * Tao booking moi - Su dung format giong nhu backend API
 */
export async function createBooking(bookingData: BookingData, userId: string) {
  try {
    console.log(`Tao booking moi cho user ${userId}:`, bookingData);

    return await BaseApiClient.post(`/bookings/user/${userId}`, bookingData);
  } catch (error) {
    console.error('Loi khi tao booking:', error);
    throw error;
  }
}

/**
 * Cập nhật trạng thái booking
 * @param bookingId - ID của booking
 * @param newStatus - Trạng thái mới (0: pending, 1: confirmed, 2: cancelled, 3: waiting for deposit confirmation, etc.)
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: number
) {
  try {
    console.log(`Cập nhật trạng thái booking ${bookingId}: ${newStatus}`);

    // Lấy thông tin user để gửi actorId và actorRole
    const userDataStr = await AsyncStorage.getItem('userData');
    if (!userDataStr) {
      throw new Error('Người dùng chưa đăng nhập. Vui lòng đăng nhập lại.');
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.id;
    
    // Log để debug
    console.log('userData:', JSON.stringify(userData, null, 2));
    
    // Xác định role - tenant thường là người thuê phòng
    const userRole = userData.role || 'TENANT';

    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
    }

    const payload = { 
      status: newStatus,
      actorId: userId,
      actorRole: userRole
    };

    console.log('Payload gửi lên:', JSON.stringify(payload, null, 2));

    return await BaseApiClient.patch(`/bookings/${bookingId}/status`, payload);
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái booking:', error);
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
    console.log(`Lấy thông tin thanh toán của landlord cho booking ${bookingId}`);

    return await BaseApiClient.get<LandlordPaymentInfo>(`/bookings/${bookingId}/landlord-payment-info`);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin thanh toán landlord:', error);
    throw error;
  }
}

/**
 * Xóa booking (soft delete - set isRemoved = 1)
 */
export async function deleteBooking(bookingId: string) {
  try {
    if (!bookingId) {
      throw new Error('Thiếu bookingId');
    }

    console.log(`️ Xóa booking ${bookingId}`);

    const result = await BaseApiClient.delete<{ message?: string }>(`/bookings/${bookingId}`);
    return { success: true, message: result.message || 'Đã xóa booking thành công' };
  } catch (error) {
    console.error('Lỗi khi xóa booking:', error);
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
      throw new Error('Thiếu bookingId');
    }

    if (!fileUri) {
      throw new Error('Thiếu URI file');
    }

    console.log(` Upload ảnh chuyển khoản cho booking ${bookingId}:`, {
      fileName,
      fileUri,
    });

    // Tạo FormData cho React Native
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: fileType || 'image/jpeg',
      name: fileName || 'bill-transfer.jpg',
    } as any);

    return await BaseApiClient.uploadFile(`/bookings/${bookingId}/upload-bill-transfer`, formData);
  } catch (error) {
    console.error('Lỗi khi upload ảnh chuyển khoản:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết booking theo ID
 */
export async function getBookingById(bookingId: string) {
  try {
    console.log(`Lấy chi tiết booking ${bookingId}`);

    return await BaseApiClient.get(`/bookings/${bookingId}`);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết booking:', error);
    throw error;
  }
}

/**
 * Hủy booking (user/tenant cancel)
 */
export async function cancelBooking(bookingId: string, reason?: string) {
  try {
    console.log(`Hủy booking ${bookingId}`, reason ? `với lý do: ${reason}` : '');

    return await BaseApiClient.post(`/bookings/${bookingId}/cancel`, { reason });
  } catch (error) {
    console.error('Lỗi khi hủy booking:', error);
    throw error;
  }
}
