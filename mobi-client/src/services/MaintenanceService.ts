import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== TYPES =====

/** Trạng thái yêu cầu */
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

/** Thông tin phòng */
export interface Room {
  id: string;
  name: string;
  roomNumber?: string;
  floor?: number;
  status?: string;
}

/** Thông tin yêu cầu bảo trì */
export interface Maintenance {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  roomId: string;
  room?: Room;
  landlordId?: string;
  createdAt: string;
  updatedAt?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
}

/** Dữ liệu tạo yêu cầu bảo trì mới */
export interface CreateMaintenanceFormValues {
  title: string;
  description: string;
  roomId: string;
  scheduledDate?: string;
  cost?: number;
  notes?: string;
}

/** Dữ liệu cập nhật yêu cầu bảo trì */
export interface UpdateMaintenanceFormValues {
  title?: string;
  description?: string;
  status?: RequestStatus;
  roomId?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  notes?: string;
}

/** Response phân trang */
export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ===== HELPER FUNCTIONS =====

/**
 * Lấy headers authentication từ AsyncStorage
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ===== API FUNCTIONS =====

/**
 * Lấy danh sách yêu cầu bảo trì có phân trang
 * @param page - Số trang (bắt đầu từ 0)
 * @param size - Số lượng bản ghi mỗi trang
 * @param status - Lọc theo trạng thái (null = tất cả)
 * @returns Danh sách yêu cầu bảo trì phân trang
 */
export async function getMaintenances(
  page: number,
  size: number,
  status: RequestStatus | null = null
): Promise<PaginatedResponse<Maintenance>> {
  try {
    const headers = await getAuthHeaders();
    const statusParam = status !== null ? `&status=${status}` : '';

    console.log(`📋 Fetching maintenances: page ${page}, size ${size}, status: ${status || 'all'}`);

    const response = await fetch(
      `${API_URL}/landlord/maintenances?page=${page}&size=${size}${statusParam}`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      let errorMsg = 'Failed to fetch maintenances';
      try {
        const data = await response.json();
        errorMsg = data.message || errorMsg;
      } catch (e) {
        console.error('❌ Error parsing response:', e);
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log(`✅ Maintenances fetched: ${data.content?.length || 0} items`);
    return data;
  } catch (error) {
    console.error('❌ Error fetching maintenances:', error);
    throw error;
  }
}

/**
 * Lấy danh sách các phòng có sẵn
 * @returns Danh sách phòng
 */
export async function getAvailableRooms(): Promise<Room[]> {
  try {
    const headers = await getAuthHeaders();
    console.log('🏠 Fetching available rooms...');

    const response = await fetch(`${API_URL}/landlord/maintenances/rooms`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMsg = 'Failed to fetch rooms';
      try {
        const data = await response.json();
        errorMsg = data.message || errorMsg;
      } catch (e) {
        console.error('❌ Error parsing response:', e);
      }
      throw new Error(errorMsg);
    }

    const rooms = await response.json();
    console.log(`✅ Rooms fetched: ${rooms.length} items`);
    return rooms;
  } catch (error) {
    console.error('❌ Error fetching rooms:', error);
    throw error;
  }
}

/**
 * Tạo yêu cầu bảo trì mới
 * @param newMaintenance - Thông tin yêu cầu bảo trì mới
 * @returns Yêu cầu bảo trì đã tạo
 */
export async function createMaintenance(
  newMaintenance: CreateMaintenanceFormValues
): Promise<Maintenance> {
  try {
    const headers = await getAuthHeaders();
    console.log('➕ Creating maintenance request:', newMaintenance.title);

    const response = await fetch(`${API_URL}/landlord/maintenances`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newMaintenance),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to create maintenance';
      try {
        const data = await response.json();
        errorMsg = data.message || errorMsg;
      } catch (e) {
        console.error('❌ Error parsing response:', e);
      }
      throw new Error(errorMsg);
    }

    const maintenance = await response.json();
    console.log('✅ Maintenance created:', maintenance.id);
    return maintenance;
  } catch (error) {
    console.error('❌ Error creating maintenance:', error);
    throw error;
  }
}

/**
 * Cập nhật yêu cầu bảo trì hiện có
 * @param id - ID yêu cầu bảo trì
 * @param updatedData - Dữ liệu cần cập nhật
 * @returns Yêu cầu bảo trì đã cập nhật
 */
export async function updateMaintenance(
  id: string,
  updatedData: UpdateMaintenanceFormValues
): Promise<Maintenance> {
  try {
    const headers = await getAuthHeaders();
    console.log('✏️ Updating maintenance:', id);

    const response = await fetch(`${API_URL}/landlord/maintenances`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id, ...updatedData }),
    });

    if (!response.ok) {
      let errorMsg = 'Failed to update maintenance';
      try {
        const data = await response.json();
        errorMsg = data.message || errorMsg;
      } catch (e) {
        console.error('❌ Error parsing response:', e);
      }
      throw new Error(errorMsg);
    }

    const maintenance = await response.json();
    console.log('✅ Maintenance updated:', maintenance.id);
    return maintenance;
  } catch (error) {
    console.error('❌ Error updating maintenance:', error);
    throw error;
  }
}

/**
 * Xóa yêu cầu bảo trì
 * @param id - ID yêu cầu bảo trì cần xóa
 */
export async function deleteMaintenance(id: string): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    console.log('🗑️ Deleting maintenance:', id);

    const response = await fetch(
      `${API_URL}/landlord/maintenances?id=${id}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      let errorMsg = 'Failed to delete maintenance';
      try {
        const data = await response.json();
        errorMsg = data.message || errorMsg;
      } catch (e) {
        console.error('❌ Error parsing response:', e);
      }
      throw new Error(errorMsg);
    }

    console.log('✅ Maintenance deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting maintenance:', error);
    throw error;
  }
}
