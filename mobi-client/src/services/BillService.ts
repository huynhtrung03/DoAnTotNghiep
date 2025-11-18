import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// ===== TYPES =====

/** Trạng thái hóa đơn */
export type BillStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

/** Thông tin hóa đơn */
export interface BillData {
  id: string;
  contractId: string;
  month: string;
  totalAmount: number;
  status: BillStatus;
  dueDate: string;
  paidDate?: string;
  electricityUsage?: number;
  waterUsage?: number;
  electricityCost?: number;
  waterCost?: number;
  roomPrice?: number;
  otherFees?: number;
  discount?: number;
  note?: string;
  imageProofUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Response upload ảnh chứng từ */
export interface UploadImageProofResponse {
  message: string;
  imageUrl: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Lấy headers authentication từ AsyncStorage
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Yêu cầu đăng nhập');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Lấy headers cho FormData (không set Content-Type)
 */
const getFormDataHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Yêu cầu đăng nhập');
  }
  return {
    Authorization: `Bearer ${token}`,
    // Không set Content-Type cho FormData trong React Native
  };
};

// ===== BILL SERVICE =====

const BASE_URL = `${API_URL}/contracts`;

export const BillService = {
  /**
   * Lấy thông tin chi tiết một hóa đơn
   * @param contractId - ID hợp đồng
   * @param billId - ID hóa đơn
   * @returns Thông tin hóa đơn
   */
  async getById(contractId: string, billId: string): Promise<BillData> {
    try {
      const headers = await getAuthHeaders();
      console.log('🧾 Đang lấy thông tin hóa đơn:', billId);

      const response = await fetch(
        `${BASE_URL}/${contractId}/bills/${billId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Không thể lấy hóa đơn:', errorText);
        throw new Error('Không thể lấy thông tin hóa đơn');
      }

      const bill = await response.json();
      console.log('✅ Đã lấy hóa đơn:', bill.month, '-', bill.totalAmount.toLocaleString(), 'đ');
      return bill;
    } catch (error) {
      console.error('❌ Lỗi khi lấy hóa đơn:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách hóa đơn theo hợp đồng
   * @param contractId - ID hợp đồng
   * @returns Danh sách hóa đơn
   */
  async getByContract(contractId: string): Promise<BillData[]> {
    try {
      const headers = await getAuthHeaders();
      console.log('📋 Đang lấy danh sách hóa đơn của hợp đồng:', contractId);

      const response = await fetch(`${BASE_URL}/${contractId}/bills`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Lỗi không xác định');
        console.error(`❌ Không thể lấy hóa đơn của hợp đồng ${contractId}:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(
          `Không thể lấy hóa đơn (${response.status}): ${errorText}`
        );
      }

      const bills = await response.json();
      console.log(`✅ Đã lấy ${bills.length} hóa đơn`);

      // Hiển thị tổng quan
      const totalAmount = bills.reduce(
        (sum: number, bill: BillData) => sum + bill.totalAmount,
        0
      );
      const paidCount = bills.filter(
        (bill: BillData) => bill.status === 'PAID'
      ).length;
      console.log(`   Tổng tiền: ${totalAmount.toLocaleString()} đ`);
      console.log(`   Đã thanh toán: ${paidCount}/${bills.length}`);

      return bills;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách hóa đơn:', error);
      throw error;
    }
  },

  /**
   * Tạo hóa đơn mới
   * @param contractId - ID hợp đồng
   * @param billData - Dữ liệu hóa đơn
   * @returns Hóa đơn đã tạo
   */
  async createBill(
    contractId: string,
    billData: Partial<BillData>
  ): Promise<BillData> {
    try {
      const headers = await getAuthHeaders();
      console.log('➕ Đang tạo hóa đơn mới cho hợp đồng:', contractId);
      console.log('   Tháng:', billData.month);
      console.log('   Tổng tiền:', billData.totalAmount?.toLocaleString(), 'đ');

      const response = await fetch(`${BASE_URL}/${contractId}/bills`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ contractId, ...billData }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Không thể tạo hóa đơn:', errorText);
        throw new Error('Không thể tạo hóa đơn');
      }

      const bill = await response.json();
      console.log('✅ Đã tạo hóa đơn:', bill.id);
      return bill;
    } catch (error) {
      console.error('❌ Lỗi khi tạo hóa đơn:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin hóa đơn
   * @param contractId - ID hợp đồng
   * @param billId - ID hóa đơn
   * @param billData - Dữ liệu cần cập nhật
   * @returns Hóa đơn đã cập nhật
   */
  async updateBill(
    contractId: string,
    billId: string,
    billData: Partial<BillData>
  ): Promise<BillData> {
    try {
      const headers = await getAuthHeaders();
      console.log('✏️ Đang cập nhật hóa đơn:', billId);

      const res = await fetch(`${BASE_URL}/${contractId}/bills/${billId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(billData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Không thể cập nhật hóa đơn:', errorText);
        throw new Error('Không thể cập nhật hóa đơn');
      }

      const bill = await res.json();
      console.log('✅ Đã cập nhật hóa đơn');
      return bill;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật hóa đơn:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái hóa đơn
   * @param contractId - ID hợp đồng
   * @param billId - ID hóa đơn
   * @param status - Trạng thái mới (PENDING, PAID, OVERDUE, CANCELLED)
   * @returns Hóa đơn đã cập nhật
   */
  async updateBillStatus(
    contractId: string,
    billId: string,
    status: string
  ): Promise<BillData> {
    try {
      const headers = await getAuthHeaders();
      console.log('🔄 Đang cập nhật trạng thái hóa đơn:', billId);
      console.log('   Trạng thái mới:', status);

      const res = await fetch(
        `${BASE_URL}/${contractId}/bills/${billId}/status`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Không thể cập nhật trạng thái:', errorText);
        throw new Error('Không thể cập nhật trạng thái hóa đơn');
      }

      const bill = await res.json();
      console.log('✅ Đã cập nhật trạng thái:', status);
      return bill;
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật trạng thái:', error);
      throw error;
    }
  },

  /**
   * Xóa hóa đơn
   * @param contractId - ID hợp đồng
   * @param billId - ID hóa đơn cần xóa
   */
  async deleteBill(contractId: string, billId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      console.log('🗑️ Đang xóa hóa đơn:', billId);

      const res = await fetch(`${BASE_URL}/${contractId}/bills/${billId}`, {
        method: 'DELETE',
        headers,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Không thể xóa hóa đơn:', errorText);
        throw new Error('Không thể xóa hóa đơn');
      }

      console.log('✅ Đã xóa hóa đơn thành công');
    } catch (error) {
      console.error('❌ Lỗi khi xóa hóa đơn:', error);
      throw error;
    }
  },

  /**
   * Tải hóa đơn về máy (PDF/Excel)
   * @param contractId - ID hợp đồng
   * @param billId - ID hóa đơn
   * @returns File URL để mở/chia sẻ
   */
  async downloadBill(
    contractId: string,
    billId: string
  ): Promise<string> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Yêu cầu đăng nhập');
      }

      console.log('📥 Đang tải hóa đơn:', billId);

      const url = `${BASE_URL}/${contractId}/bills/${billId}/download`;
      
      // ⚠️ TẠM THỜI: Hardcode path vì expo-file-system chưa cài đúng
      // TODO: Cài lại expo-file-system để dùng FileSystem.cacheDirectory
      const fileUri = `file:///data/user/0/com.namaesieunhangao.mobiclient/cache/bill_${billId}.pdf`;

      // Tải file về
      const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (downloadResult.status !== 200) {
        console.error('❌ Không thể tải hóa đơn');
        throw new Error('Không thể tải hóa đơn');
      }

      console.log('✅ Đã tải hóa đơn về:', downloadResult.uri);

      // Kiểm tra xem có thể chia sẻ không
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        // Mở dialog chia sẻ/lưu file
        await Sharing.shareAsync(downloadResult.uri);
      }

      return downloadResult.uri;
    } catch (error) {
      console.error('❌ Lỗi khi tải hóa đơn:', error);
      throw error;
    }
  },

  /**
   * Upload ảnh chứng từ thanh toán
   * @param contractId - ID hợp đồng
   * @param billId - ID hóa đơn
   * @param fileUri - URI ảnh từ expo-image-picker
   * @param fileName - Tên file (optional)
   * @param fileType - Loại file (optional, mặc định image/jpeg)
   * @returns Message và URL ảnh đã upload
   */
  async uploadBillImageProof(
    contractId: string,
    billId: string,
    fileUri: string,
    fileName?: string,
    fileType?: string
  ): Promise<UploadImageProofResponse> {
    try {
      // Kiểm tra tham số
      if (!contractId) {
        console.error('❌ Thiếu contractId');
        throw new Error('Thiếu mã hợp đồng');
      }

      if (!billId) {
        console.error('❌ Thiếu billId');
        throw new Error('Thiếu mã hóa đơn');
      }

      if (!fileUri) {
        console.error('❌ Thiếu file');
        throw new Error('Thiếu file ảnh');
      }

      console.log('📤 Đang upload ảnh chứng từ:');
      console.log('   Hợp đồng:', contractId);
      console.log('   Hóa đơn:', billId);
      console.log('   File:', fileName || 'payment-proof.jpg');

      const headers = await getFormDataHeaders();

      // Tạo FormData
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType || 'image/jpeg',
        name: fileName || 'payment-proof.jpg',
      } as any);

      const response = await fetch(
        `${BASE_URL}/${contractId}/bills/${billId}/upload-image-proof`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      console.log('📡 Upload response status:', response.status);
      console.log('📡 Upload response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload thất bại:', errorText);

        // Thử parse JSON, nếu không được thì dùng plain text
        let errorMessage = 'Không thể upload ảnh chứng từ';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Xử lý cả response JSON và plain text
      const contentType = response.headers.get('content-type');
      let result: UploadImageProofResponse;

      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        console.log('✅ Upload thành công (JSON):', result.imageUrl);
      } else {
        // Backend trả về plain string (URL ảnh)
        const imageUrl = await response.text();
        console.log('✅ Upload thành công (text):', imageUrl);
        result = { message: 'Upload thành công', imageUrl };
      }

      return result;
    } catch (error) {
      console.error('❌ Lỗi khi upload ảnh chứng từ:', error);
      throw error;
    }
  },
};
