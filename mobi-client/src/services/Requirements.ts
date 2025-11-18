import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config/Constant';

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  totalRecords: number;
}

export interface Requirement {
  id: string;
  userId: string;
  roomId: string;
  description: string;
  status: number;
  createdAt: string;
  updatedAt?: string;
  imageUrl?: string;
}

export interface RequirementDetail extends Requirement {
  userName?: string;
  roomName?: string;
  landlordName?: string;
  completionNote?: string; // Ghi chú khi hoàn thành
  rejectionReason?: string; // Lý do từ chối
}

export interface RequirementRequestRoomDto {
  userId?: string | number;
  roomId: string | number;
  description: string;
  image?: string;
}

export interface UpdateRequestRoomDto {
  id: string;
  description: string;
}

/**
 * Tạo request mới (React Native version)
 */
export async function createRequest(
  data: RequirementRequestRoomDto,
  imageUri?: string,
  imageFileName?: string,
  imageType?: string
): Promise<RequirementRequestRoomDto> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const formData = new FormData();
    
    // Append data as JSON string
    formData.append('data', JSON.stringify(data));
    
    // Append image if provided (React Native format)
    if (imageUri) {
      formData.append('image', {
        uri: imageUri,
        type: imageType || 'image/jpeg',
        name: imageFileName || 'request-image.jpg',
      } as any);
    }

    const response = await fetch(`${API_URL}/requirements/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      let errorMsg = result?.error || result?.message || 'Failed to create request';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }
    return result;
  } catch (error) {
    console.error('createRequest error:', error);
    throw error;
  }
}
/**
 * Upload image + update requirement (React Native version)
 */
export async function updateRequirementWithImage(
  idRequirement: string,
  description: string,
  imageUri?: string,
  imageFileName?: string,
  imageType?: string
): Promise<RequirementRequestRoomDto> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const formData = new FormData();
    
    const updateData = {
      id: idRequirement,
      description: description,
    };
    
    formData.append('data', JSON.stringify(updateData));
    
    if (imageUri) {
      formData.append('image', {
        uri: imageUri,
        type: imageType || 'image/jpeg',
        name: imageFileName || 'requirement-image.jpg',
      } as any);
    }

    const response = await fetch(
      `${API_URL}/requirements/${idRequirement}/update-with-image`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );

    const result = await response.json();
    if (!response.ok) {
      let errorMsg = result?.error || result?.message || 'Failed to update requirement';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }
    return result;
  } catch (error) {
    console.error('updateRequirementWithImage error:', error);
    throw error;
  }
}

/**
 * Lấy requests của landlord (React Native version)
 */
export async function getRequestsByLandlordId(
  page = 0,
  size = 5
): Promise<PaginatedResponse<Requirement>> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await fetch(
      `${API_URL}/requirements/requirements-landlord?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (!response.ok) {
      let errorMsg = result?.error || result?.message || 'Failed to fetch requests';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }

    // Normalize backend response
    const normalized: PaginatedResponse<Requirement> = {
      data: result.data || [],
      page: result.pageNumber ?? 0,
      size: result.pageSize ?? size,
      totalElements: result.totalRecords ?? 0,
      totalPages: result.totalPages ?? 1,
      totalRecords: result.totalRecords ?? 0,
    };

    return normalized;
  } catch (error) {
    console.error('getRequestsByLandlordId error:', error);
    throw error;
  }
}

/**
 * Update requirement status (React Native version)
 */
export async function updateRequirementStatus(id: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await fetch(`${API_URL}/requirements/update-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const result = await response.json();
      let errorMsg = result?.error || result?.message || 'Failed to update requirement status';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('updateRequirementStatus error:', error);
    throw error;
  }
}

/**
 * Upload requirement image (React Native version)
 */
export async function uploadRequirementImage(
  idRequirement: string,
  imageUri: string,
  imageFileName?: string,
  imageType?: string
): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const formData = new FormData();
    
    formData.append('idRequirement', idRequirement);
    formData.append('image', {
      uri: imageUri,
      type: imageType || 'image/jpeg',
      name: imageFileName || 'requirement-image.jpg',
    } as any);

    const response = await fetch(`${API_URL}/requirements/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const result = await response.json();
      let errorMsg = result?.error || result?.message || 'Failed to upload image';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('uploadRequirementImage error:', error);
    throw error;
  }
}

/**
 * Reject requirement (React Native version)
 */
export async function rejectRequirement(id: string): Promise<void> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await fetch(`${API_URL}/requirements/reject`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const result = await response.json();
      let errorMsg = result?.error || result?.message || 'Failed to reject requirement';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('rejectRequirement error:', error);
    throw error;
  }
}

/**
 * Lấy requests của user (React Native version)
 */
export async function getRequestsByUser(
  userId: string | number,
  page = 0,
  size = 5
): Promise<PaginatedResponse<RequirementDetail>> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await fetch(
      `${API_URL}/requirements/user/${userId}/requests?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    if (!response.ok) {
      let errorMsg = result?.error || result?.message || 'Failed to fetch requests';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }

    // Normalize backend response
    const normalized: PaginatedResponse<RequirementDetail> = {
      data: result.data || [],
      page: result.pageNumber ?? 0,
      size: result.pageSize ?? size,
      totalElements: result.totalRecords ?? 0,
      totalPages: result.totalPages ?? 1,
      totalRecords: result.totalRecords ?? 0,
    };

    return normalized;
  } catch (error) {
    console.error('getRequestsByUser error:', error);
    throw error;
  }
}

/**
 * Update request (React Native version)
 */
export async function updateRequest(
  data: UpdateRequestRoomDto
): Promise<UpdateRequestRoomDto> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    
    const response = await fetch(`${API_URL}/requirements/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) {
      let errorMsg = result?.error || result?.message || 'Failed to update request';
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      }
      throw new Error(errorMsg);
    }
    return result;
  } catch (error) {
    console.error('updateRequest error:', error);
    throw error;
  }
}

// ===== SERVICE OBJECT (dùng cho RequestManagementScreen) =====
export const RequirementsService = {
  /**
   * 📋 Lấy danh sách yêu cầu của user (có phân trang)
   * Tự động lấy userId từ AsyncStorage
   */
  async userFetchRequirements(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<RequirementDetail>> {
    try {
      console.log(`📋 Đang lấy yêu cầu - Trang ${page + 1}`);
      
      const token = await AsyncStorage.getItem('accessToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      
      if (!token || !userDataStr) {
        throw new Error('Yêu cầu đăng nhập');
      }
      
      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      const response = await fetch(
        `${API_URL}/requirements/user/${userId}/requests?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Lỗi API:', response.status, errorText);
        throw new Error(`Không thể lấy danh sách yêu cầu`);
      }

      const result = await response.json();
      console.log(`✅ Đã lấy ${result.data?.length || 0} yêu cầu`);

      // Chuẩn hóa response từ backend
      return {
        data: result.data || [],
        page: result.pageNumber ?? page,
        size: result.pageSize ?? size,
        totalElements: result.totalRecords ?? 0,
        totalPages: result.totalPages ?? 1,
        totalRecords: result.totalRecords ?? 0,
      };
    } catch (error: any) {
      console.error('❌ Lỗi userFetchRequirements:', error.message);
      throw error;
    }
  },

  /**
   * ✏️ Cập nhật yêu cầu (chỉ mô tả, không có ảnh)
   */
  async updateRequirement(
    requirementId: string,
    description: string
  ): Promise<void> {
    try {
      console.log(`✏️ Đang cập nhật yêu cầu ${requirementId}...`);
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) throw new Error('Yêu cầu đăng nhập');

      const response = await fetch(`${API_URL}/requirements/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: requirementId,
          description: description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.message || 'Không thể cập nhật yêu cầu';
        throw new Error(errorMsg);
      }

      console.log('✅ Đã cập nhật yêu cầu thành công');
    } catch (error: any) {
      console.error('❌ Lỗi updateRequirement:', error.message);
      throw error;
    }
  },
};
