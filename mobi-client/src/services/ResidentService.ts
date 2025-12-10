import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseApiClient } from './api/BaseApiClient';
import { Paths, File } from 'expo-file-system';

export interface ResidentData {
  id?: string;
  fullName: string;
  idNumber: string;
  relationship: string;
  startDate: string;
  endDate?: string;
  note?: string;
  status?: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  contractId: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Backend endpoints for residents
const BASE_URL = '/contracts';
const TEMP_RESIDENTS_URL = '/temporary-residences';

/**
 * ResidentService - Quản lý cư dân tạm trú
 * Sử dụng BaseApiClient để xử lý HTTP requests
 */
export const ResidentService = {
  /**
   * Lấy danh sách cư dân theo hợp đồng (sử dụng landlordId)
   * GET /api/temporary-residences/landlord/{landlordId}
   */
  async getByContract(contractId: string): Promise<ResidentData[]> {
    try {
      console.log(`📍 ResidentService.getByContract - contractId: ${contractId}`);
      // Lấy userId từ AsyncStorage để sử dụng làm landlordId
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('userId không tìm thấy trong AsyncStorage');
      }
      const endpoint = `${TEMP_RESIDENTS_URL}/landlord/${userId}`;
      const residents = await BaseApiClient.get<ResidentData[]>(endpoint);
      console.log(`✅ Lấy danh sách cư dân theo hợp đồng thành công - Số lượng: ${residents.length}`);
      return residents;
    } catch (error: any) {
      console.error('❌ Lỗi lấy danh sách cư dân theo hợp đồng:', error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách cư dân theo chủ nhà
   * GET /api/temporary-residences/landlord/{landlordId}
   */
  async getByLandlord(landlordId: string): Promise<ResidentData[]> {
    try {
      console.log(`📍 ResidentService.getByLandlord - landlordId: ${landlordId}`);
      const endpoint = `${TEMP_RESIDENTS_URL}/landlord/${landlordId}`;
      const residents = await BaseApiClient.get<ResidentData[]>(endpoint);
      console.log(`✅ Lấy danh sách cư dân theo chủ nhà thành công - Số lượng: ${residents.length}`);
      return residents;
    } catch (error: any) {
      console.error('❌ Lỗi lấy danh sách cư dân theo chủ nhà:', error.message);
      throw error;
    }
  },

  /**
   * Lấy danh sách cư dân theo người thuê
   * GET /api/temporary-residences/tenant/{tenantId}
   */
  async getByTenant(tenantId: string): Promise<ResidentData[]> {
    try {
      console.log(`📍 ResidentService.getByTenant - tenantId: ${tenantId}`);
      const endpoint = `${TEMP_RESIDENTS_URL}/tenant/${tenantId}`;
      const residents = await BaseApiClient.get<ResidentData[]>(endpoint);
      console.log(`✅ Lấy danh sách cư dân theo người thuê thành công - Số lượng: ${residents.length}`);
      return residents;
    } catch (error: any) {
      console.error('❌ Lỗi lấy danh sách cư dân theo người thuê:', error.message);
      throw error;
    }
  },

  /**
   * Lấy thông tin cư dân cụ thể
   * GET /api/temporary-residences/{residentId}
   */
  async getById(contractId: string, residentId: string): Promise<ResidentData> {
    try {
      console.log(`📍 ResidentService.getById - residentId: ${residentId}`);
      const endpoint = `${TEMP_RESIDENTS_URL}/${residentId}`;
      const resident = await BaseApiClient.get<ResidentData>(endpoint);
      console.log(`✅ Lấy thông tin cư dân thành công`);
      return resident;
    } catch (error: any) {
      console.error('❌ Lỗi lấy thông tin cư dân:', error.message);
      throw error;
    }
  },

  /**
   * Tạo cư dân mới với ảnh
   * POST /api/temporary-residences
   * FormData: data (JSON), frontImage (optional), backImage (optional)
   */
  async createResident(
    contractId: string,
    residentData: Partial<ResidentData>,
    frontImageUri?: string,
    backImageUri?: string,
    frontImageFileName?: string,
    backImageFileName?: string
  ): Promise<ResidentData> {
    try {
      console.log(`📍 ResidentService.createResident - contractId: ${contractId}`);
      console.log(`   Dữ liệu cư dân:`, JSON.stringify(residentData, null, 2));
      console.log(`   Ảnh mặt trước: ${frontImageUri ? 'có' : 'không'}`);
      console.log(`   Ảnh mặt sau: ${backImageUri ? 'có' : 'không'}`);

      const formData = new FormData();

      // Chuẩn bị dữ liệu JSON
      const dataToSend = {
        fullName: residentData.fullName,
        idNumber: residentData.idNumber,
        relationship: residentData.relationship,
        startDate: residentData.startDate,
        endDate: residentData.endDate || '',
        note: residentData.note || '',
        status: residentData.status || 'PENDING',
        contractId: contractId,
      };

      console.log(`   Data để gửi:`, JSON.stringify(dataToSend, null, 2));

      // FIX: Ghi JSON vào file tạm, sau đó upload
      const jsonString = JSON.stringify(dataToSend);
      const tempJsonFile = new File(Paths.cache, `temp_data_${Date.now()}.json`);
      
      await tempJsonFile.write(jsonString);
      
      const jsonFileObject = {
        uri: tempJsonFile.uri,
        type: 'application/json',
        name: 'data.json',
      };
      
      formData.append('data', jsonFileObject as any);
      console.log(`   ✅ Đã thêm dữ liệu JSON (${jsonString.length} bytes) từ file tạm vào FormData`);

      // Thêm ảnh mặt trước nếu có
      if (frontImageUri) {
        const mimeType = this.getMimeTypeFromUri(frontImageUri);
        const fileName = frontImageFileName || `front_${Date.now()}.jpg`;
        
        const frontImageData = {
          uri: frontImageUri,
          type: mimeType,
          name: fileName,
        };
        console.log(`   Thêm ảnh mặt trước: ${fileName} (${mimeType})`);
        formData.append('frontImage', frontImageData as any);
      }

      // Thêm ảnh mặt sau nếu có
      if (backImageUri) {
        const mimeType = this.getMimeTypeFromUri(backImageUri);
        const fileName = backImageFileName || `back_${Date.now()}.jpg`;
        
        const backImageData = {
          uri: backImageUri,
          type: mimeType,
          name: fileName,
        };
        console.log(`   Thêm ảnh mặt sau: ${fileName} (${mimeType})`);
        formData.append('backImage', backImageData as any);
      }

      console.log(`   📤 Chuẩn bị gửi FormData với timeout 30000ms`);
      const endpoint = `${TEMP_RESIDENTS_URL}`;
      
      try {
        const resident = await BaseApiClient.uploadFile<ResidentData>(endpoint, formData, 30000);
        console.log(`✅ Tạo cư dân thành công - ID: ${resident.id}`);
        
        // Cleanup: Xóa file tạm
        if (tempJsonFile.exists) {
          await tempJsonFile.delete();
        }
        
        return resident;
      } catch (error) {
        // Cleanup: Xóa file tạm ngay cả khi lỗi
        if (tempJsonFile.exists) {
          await tempJsonFile.delete();
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Lỗi tạo cư dân:', error.message);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin cư dân
   * PUT /api/temporary-residences/{residentId}
   * FormData: data (JSON), frontImage (optional), backImage (optional)
   * 
   * React Native specific:
   * - FormData sẽ tự động serialize các file objects với uri, type, name
   * - Không set Content-Type header (let FormData handle it)
   * - Server sẽ parse 'data' field như JSON string
   */
  async updateResident(
    contractId: string,
    residentId: string,
    residentData: Partial<ResidentData>,
    frontImageUri?: string,
    backImageUri?: string,
    frontImageFileName?: string,
    backImageFileName?: string
  ): Promise<ResidentData> {
    try {
      console.log(`📍 ResidentService.updateResident - contractId: ${contractId}, residentId: ${residentId}`);
      console.log(`   Dữ liệu cập nhật:`, JSON.stringify(residentData, null, 2));

      const formData = new FormData();

      // Chuẩn bị dữ liệu JSON
      const dataToSend = {
        fullName: residentData.fullName,
        idNumber: residentData.idNumber,
        relationship: residentData.relationship,
        startDate: residentData.startDate,
        endDate: residentData.endDate || '',
        note: residentData.note || '',
        status: residentData.status || 'PENDING',
        contractId: contractId,
      };

      console.log(`   Data để gửi:`, JSON.stringify(dataToSend, null, 2));

      // FIX: Ghi JSON vào file tạm, sau đó upload
      const jsonString = JSON.stringify(dataToSend);
      const tempJsonFile = new File(Paths.cache, `temp_data_${Date.now()}.json`);
      
      await tempJsonFile.write(jsonString);
      
      const jsonFileObject = {
        uri: tempJsonFile.uri,
        type: 'application/json',
        name: 'data.json',
      };
      
      formData.append('data', jsonFileObject as any);
      console.log(`   ✅ Đã thêm dữ liệu JSON (${jsonString.length} bytes) từ file tạm vào FormData`);

      // Thêm ảnh mặt trước nếu có
      if (frontImageUri) {
        const mimeType = this.getMimeTypeFromUri(frontImageUri);
        const fileName = frontImageFileName || `front_${Date.now()}.jpg`;
        
        const frontImageData = {
          uri: frontImageUri,
          type: mimeType,
          name: fileName,
        };
        console.log(`   Cập nhật ảnh mặt trước: ${fileName} (${mimeType})`);
        formData.append('frontImage', frontImageData as any);
      }

      // Thêm ảnh mặt sau nếu có
      if (backImageUri) {
        const mimeType = this.getMimeTypeFromUri(backImageUri);
        const fileName = backImageFileName || `back_${Date.now()}.jpg`;
        
        const backImageData = {
          uri: backImageUri,
          type: mimeType,
          name: fileName,
        };
        console.log(`   Cập nhật ảnh mặt sau: ${fileName} (${mimeType})`);
        formData.append('backImage', backImageData as any);
      }

      const endpoint = `${TEMP_RESIDENTS_URL}/${residentId}`;
      
      console.log(`   📤 Chuẩn bị gửi FormData với timeout 30000ms`);
      
      try {
        const resident = await BaseApiClient.putUpload<ResidentData>(endpoint, formData, 30000);
        console.log(`✅ Cập nhật cư dân thành công - ID: ${resident.id}`);
        
        // Cleanup: Xóa file tạm
        if (tempJsonFile.exists) {
          await tempJsonFile.delete();
        }
        
        return resident;
      } catch (error) {
        // Cleanup: Xóa file tạm ngay cả khi lỗi
        if (tempJsonFile.exists) {
          await tempJsonFile.delete();
        }
        throw error;
      }
    } catch (error: any) {
      console.error('❌ Lỗi cập nhật cư dân:', error.message);
      throw error;
    }
  },

  /**
   * Xóa cư dân
   * DELETE /api/temporary-residences/{residentId}
   */
  async deleteResident(contractId: string, residentId: string): Promise<void> {
    try {
      console.log(`📍 ResidentService.deleteResident - residentId: ${residentId}`);
      const endpoint = `${TEMP_RESIDENTS_URL}/${residentId}`;
      await BaseApiClient.delete(endpoint);
      console.log(`✅ Xóa cư dân thành công`);
    } catch (error: any) {
      console.error('❌ Lỗi xóa cư dân:', error.message);
      throw error;
    }
  },

  /**
   * Chuyển đổi URI ảnh sang base64 để preview
   * React Native - Đọc file từ URI
   */
  async imageUriToBase64(imageUri: string): Promise<string> {
    try {
      console.log(`📍 ResidentService.imageUriToBase64 - uri: ${imageUri}`);
      
      // Sử dụng fetch để lấy ảnh từ URI
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Chuyển blob sang base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error: any) {
      console.error('❌ Lỗi chuyển đổi ảnh sang base64:', error.message);
      throw error;
    }
  },

  /**
   * Helper - Lấy URL đầy đủ cho ảnh từ server
   */
  getImageUrl(imagePath?: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    // Giả định server sử dụng Cloudinary hoặc CDN
    return `https://res.cloudinary.com${imagePath}`;
  },

  /**
   * Helper - Xác định MIME type từ URI hoặc tên file
   * Dùng cho React Native FormData file upload
   */
  getMimeTypeFromUri(uri: string): string {
    // Trích xuất extension từ URI
    const extension = uri.split('.').pop()?.toLowerCase() || '';
    
    const mimeTypes: { [key: string]: string } = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
    };

    return mimeTypes[extension] || 'image/jpeg'; // Default to JPEG
  },

  /**
   * Helper - Kiểm tra trạng thái cư dân
   */
  getStatusText(status?: string): string {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'REJECTED':
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  },

  /**
   * Helper - Lấy màu trạng thái
   */
  getStatusColor(status?: string): string {
    switch (status) {
      case 'PENDING':
        return '#FFA500';
      case 'ACTIVE':
        return '#10B981';
      case 'INACTIVE':
        return '#6B7280';
      case 'REJECTED':
        return '#EF4444';
      default:
        return '#D1D5DB';
    }
  },
};
