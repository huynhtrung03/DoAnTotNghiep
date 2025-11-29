import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './Constant';
import { BaseApiClient } from './api/BaseApiClient';

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
  completionNote?: string; // Ghi chu khi hoan thanh
  rejectionReason?: string; // Ly do tu choi
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
 * Tao yeu cau moi
 */
export async function createRequest(
  data: RequirementRequestRoomDto,
  imageUri?: string,
  imageFileName?: string,
  imageType?: string
): Promise<RequirementRequestRoomDto> {
  try {
    const formData = new FormData();

    // Them du lieu nhu JSON string
    formData.append('data', JSON.stringify(data));

    // Them anh neu co
    if (imageUri) {
      formData.append('image', {
        uri: imageUri,
        type: imageType || 'image/jpeg',
        name: imageFileName || 'request-image.jpg',
      } as any);
    }

    return await BaseApiClient.uploadFile<RequirementRequestRoomDto>('/requirements/create', formData);
  } catch (error) {
    console.error('Loi tao yeu cau:', error);
    throw error;
  }
}

/**
 * Cap nhat yeu cau voi anh
 */
export async function updateRequirementWithImage(
  idRequirement: string,
  description: string,
  imageUri?: string,
  imageFileName?: string,
  imageType?: string
): Promise<RequirementRequestRoomDto> {
  try {
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

    return await BaseApiClient.patchUpload<RequirementRequestRoomDto>(`/requirements/${idRequirement}/update-with-image`, formData);
  } catch (error) {
    console.error('Loi cap nhat yeu cau voi anh:', error);
    throw error;
  }
}

/**
 * Lay yeu cau cua chu nha
 */
export async function getRequestsByLandlordId(
  page = 0,
  size = 5
): Promise<PaginatedResponse<Requirement>> {
  try {
    const result = await BaseApiClient.get<any>('/requirements/requirements-landlord', { page, size });

    // Chuan hoa response tu backend
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
    console.error('Loi lay yeu cau cua chu nha:', error);
    throw error;
  }
}

/**
 * Cap nhat trang thai yeu cau
 */
export async function updateRequirementStatus(id: string): Promise<void> {
  try {
    await BaseApiClient.patch('/requirements/update-status', { id });
  } catch (error) {
    console.error('Loi cap nhat trang thai yeu cau:', error);
    throw error;
  }
}

/**
 * Upload anh yeu cau
 */
export async function uploadRequirementImage(
  idRequirement: string,
  imageUri: string,
  imageFileName?: string,
  imageType?: string
): Promise<void> {
  try {
    const formData = new FormData();

    formData.append('idRequirement', idRequirement);
    formData.append('image', {
      uri: imageUri,
      type: imageType || 'image/jpeg',
      name: imageFileName || 'requirement-image.jpg',
    } as any);

    await BaseApiClient.uploadFile('/requirements/upload-image', formData);
  } catch (error) {
    console.error('Loi upload anh yeu cau:', error);
    throw error;
  }
}

/**
 * Tu choi yeu cau
 */
export async function rejectRequirement(id: string): Promise<void> {
  try {
    await BaseApiClient.patch('/requirements/reject', { id });
  } catch (error) {
    console.error('Loi tu choi yeu cau:', error);
    throw error;
  }
}

/**
 * Lay yeu cau cua nguoi dung
 */
export async function getRequestsByUser(
  userId: string | number,
  page = 0,
  size = 5
): Promise<PaginatedResponse<RequirementDetail>> {
  try {
    if (!userId) {
      throw new Error('Can co User ID');
    }

    const result = await BaseApiClient.get<any>(`/requirements/user/${userId}/requests`, { page, size });

    // Chuan hoa response tu backend
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
    console.error('Loi lay yeu cau cua nguoi dung:', error);
    throw error;
  }
}

/**
 * Cap nhat yeu cau
 */
export async function updateRequest(
  data: UpdateRequestRoomDto
): Promise<UpdateRequestRoomDto> {
  try {
    return await BaseApiClient.patch<UpdateRequestRoomDto>('/requirements/update', data);
  } catch (error) {
    console.error('Loi cap nhat yeu cau:', error);
    throw error;
  }
}

// ===== SERVICE OBJECT (dung cho RequestManagementScreen) =====
export const RequirementsService = {
  /**
   * Lay danh sach yeu cau cua nguoi dung (co phan trang)
   * Tu dong lay userId tu AsyncStorage
   */
  async userFetchRequirements(
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedResponse<RequirementDetail>> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const userDataStr = await AsyncStorage.getItem('userData');

      if (!token || !userDataStr) {
        throw new Error('Yeu cau dang nhap');
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      const result = await BaseApiClient.get<any>(`/requirements/user/${userId}/requests`, { page, size });

      // Chuan hoa response tu backend
      return {
        data: result.data || [],
        page: result.pageNumber ?? page,
        size: result.pageSize ?? size,
        totalElements: result.totalRecords ?? 0,
        totalPages: result.totalPages ?? 1,
        totalRecords: result.totalRecords ?? 0,
      };
    } catch (error: any) {
      console.error('Loi userFetchRequirements:', error.message);
      throw error;
    }
  },

  /**
   * Cap nhat yeu cau (chi mo ta, khong co anh)
   */
  async updateRequirement(
    requirementId: string,
    description: string
  ): Promise<void> {
    try {
      await BaseApiClient.patch('/requirements/update', {
        id: requirementId,
        description: description,
      });
    } catch (error: any) {
      console.error('Loi updateRequirement:', error.message);
      throw error;
    }
  },
};
