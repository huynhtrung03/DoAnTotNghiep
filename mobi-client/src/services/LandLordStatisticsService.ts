import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== TYPES =====

/** Số lượng phòng (response đơn giản) */
export interface RoomCountResponse {
  count: number;
}

/** Thống kê bảo trì phòng */
export interface MaintenanceStatistics {
  totalMaintenances: number;
  pendingMaintenances: number;
  completedMaintenances: number;
  totalCost: number;
  averageCost: number;
  maintenancesByMonth?: Array<{
    month: string;
    count: number;
    cost: number;
  }>;
}

/** Thống kê chi phí đăng phòng */
export interface FeePostRoomStatistics {
  totalFee: number;
  totalPosts: number;
  averageFeePerPost: number;
  feeByMonth?: Array<{
    month: string;
    totalFee: number;
    postCount: number;
  }>;
}

/** Thống kê doanh thu */
export interface RevenueStatistics {
  totalRevenue: number;
  totalContracts: number;
  averageRevenuePerContract: number;
  revenueByMonth?: Array<{
    month: string;
    revenue: number;
    contractCount: number;
  }>;
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

/**
 * Hàm helper để fetch với fallback
 */
const fetchWithFallback = async <T>(
  url: string,
  headers: Record<string, string>,
  defaultValue: T,
  logName: string
): Promise<T> => {
  try {
    // console.log(`📊 Fetching ${logName}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Temporarily suppress backend null return warnings
      if (!errorText.includes('Null return value from advice')) {
        console.warn(`⚠️ ${logName} API not available:`, errorText);
      }
      return defaultValue;
    }

    const data = await response.json();
    // console.log(`✅ ${logName} fetched successfully, raw data:`, data, 'type:', typeof data);
    
    // ✅ XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT
    // Nếu null hoặc undefined → trả về default
    if (data === null || data === undefined) {
      console.warn(`⚠️ ${logName} returned null/undefined, using default`);
      return defaultValue;
    }
    
    // Nếu là object rỗng {} → trả về default
    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn(`⚠️ ${logName} returned empty object, using default`);
      return defaultValue;
    }
    
    // ✅ VALIDATE DỮ LIỆU THEO TYPE
    if (logName.includes('count')) {
      // Xử lý trường hợp API trả về trực tiếp số thay vì object
      if (typeof data === 'number') {
        // console.log(`✅ ${logName} returned direct number:`, data);
        // Trả về object với count từ số trực tiếp
        return { count: data } as any;
      }
      
      // Đảm bảo data là object và có field 'count'
      if (typeof data !== 'object' || data === null || !('count' in data)) {
        console.warn(`⚠️ ${logName} invalid data structure or missing 'count' field, data:`, data, 'using default');
        return defaultValue;
      }
      if (typeof data.count !== 'number') {
        console.warn(`⚠️ ${logName} 'count' field is not a number:`, data.count, 'using default');
        return defaultValue;
      }
    } else if (logName.includes('Revenue')) {
      // Đảm bảo data là object và có field 'totalRevenue'
      if (typeof data !== 'object' || data === null || !('totalRevenue' in data)) {
        console.warn(`⚠️ ${logName} invalid data structure or missing 'totalRevenue' field, data:`, data, 'using default');
        return defaultValue;
      }
      if (typeof data.totalRevenue !== 'number') {
        console.warn(`⚠️ ${logName} 'totalRevenue' field is not a number:`, data.totalRevenue, 'using default');
        return defaultValue;
      }
    } else if (logName.includes('Maintenance')) {
      // Đảm bảo data là object và có field 'totalCost'
      if (typeof data !== 'object' || data === null || !('totalCost' in data)) {
        console.warn(`⚠️ ${logName} invalid data structure or missing 'totalCost' field, data:`, data, 'using default');
        return defaultValue;
      }
      if (typeof data.totalCost !== 'number') {
        console.warn(`⚠️ ${logName} 'totalCost' field is not a number:`, data.totalCost, 'using default');
        return defaultValue;
      }
    }
    
    // Debug log for zero values
    if (data && typeof data === 'object') {
      if (logName.includes('count') && data.count === 0) {
        console.debug(`DEBUG: ${logName} returned count: 0`);
      } else if (logName.includes('Revenue') && data.totalRevenue === 0) {
        console.debug(`DEBUG: ${logName} returned totalRevenue: 0`);
      } else if (logName.includes('Maintenance') && data.totalCost === 0) {
        console.debug(`DEBUG: ${logName} returned totalCost: 0`);
      }
    }
    
    return data;
  } catch (error) {
    console.warn(`⚠️ ${logName} error, using default value:`, error);
    return defaultValue;
  }
};

// ===== API FUNCTIONS =====

/**
 * Lấy số lượng phòng đã đăng
 */
export const getLandlordPostedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ Invalid landlordId provided to getLandlordPostedRoomCount');
    return { count: 0 };
  }

  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/total-posted-rooms/${landlordId}`,
      headers,
      { count: 0 },
      'Posted room count'
    );
  } catch (error) {
    console.error('❌ getLandlordPostedRoomCount error:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng phòng đã cho thuê
 */
export const getLandlordRentedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ Invalid landlordId provided to getLandlordRentedRoomCount');
    return { count: 0 };
  }

  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/total-rented-rooms/${landlordId}`,
      headers,
      { count: 0 },
      'Rented room count'
    );
  } catch (error) {
    console.error('❌ getLandlordRentedRoomCount error:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng lượt xem phòng
 */
export const getLandlordViewedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ Invalid landlordId provided to getLandlordViewedRoomCount');
    return { count: 0 };
  }

  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/total-viewed-rooms/${landlordId}`,
      headers,
      { count: 0 },
      'Viewed room count'
    );
  } catch (error) {
    console.error('❌ getLandlordViewedRoomCount error:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng phòng được yêu thích
 */
export const getLandlordFavoritedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ Invalid landlordId provided to getLandlordFavoritedRoomCount');
    return { count: 0 };
  }

  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/total-favorited-rooms/${landlordId}`,
      headers,
      { count: 0 },
      'Favorited room count'
    );
  } catch (error) {
    console.error('❌ getLandlordFavoritedRoomCount error:', error);
    return { count: 0 };
  }
};

/**
 * Lấy thống kê bảo trì phòng
 */
export const getLandlordMaintenanceStatistics = async (
  landlordId: string,
  startDate?: string,
  endDate?: string
): Promise<MaintenanceStatistics> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ Invalid landlordId provided to getLandlordMaintenanceStatistics');
    return {
      totalMaintenances: 0,
      pendingMaintenances: 0,
      completedMaintenances: 0,
      totalCost: 0,
      averageCost: 0,
    };
  }

  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/landlord/statistics/maintenance-statistics/${landlordId}${queryString ? `?${queryString}` : ''}`;

    return await fetchWithFallback(
      url,
      headers,
      {
        totalMaintenances: 0,
        pendingMaintenances: 0,
        completedMaintenances: 0,
        totalCost: 0,
        averageCost: 0,
      },
      'Maintenance statistics'
    );
  } catch (error) {
    console.error('❌ getLandlordMaintenanceStatistics error:', error);
    return {
      totalMaintenances: 0,
      pendingMaintenances: 0,
      completedMaintenances: 0,
      totalCost: 0,
      averageCost: 0,
    };
  }
};

/**
 * Lấy thống kê chi phí đăng phòng
 */
export const getLandlordFeePostRoomStatistics = async (
  landlordId: string,
  startDate?: string,
  endDate?: string
): Promise<FeePostRoomStatistics> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ Invalid landlordId provided to getLandlordFeePostRoomStatistics');
    return {
      totalFee: 0,
      totalPosts: 0,
      averageFeePerPost: 0,
    };
  }

  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/landlord/statistics/fee-post-room-statistics/${landlordId}${queryString ? `?${queryString}` : ''}`;

    return await fetchWithFallback(
      url,
      headers,
      {
        totalFee: 0,
        totalPosts: 0,
        averageFeePerPost: 0,
      },
      'Fee post room statistics'
    );
  } catch (error) {
    console.error('❌ getLandlordFeePostRoomStatistics error:', error);
    return {
      totalFee: 0,
      totalPosts: 0,
      averageFeePerPost: 0,
    };
  }
};

/**
 * Lấy thống kê doanh thu
 */
export const getLandlordRevenueStatistics = async (
  landlordId: string,
  startDate?: string,
  endDate?: string
): Promise<RevenueStatistics> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ Invalid landlordId provided to getLandlordRevenueStatistics');
    return {
      totalRevenue: 0,
      totalContracts: 0,
      averageRevenuePerContract: 0,
    };
  }

  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/landlord/statistics/revenue-statistics/${landlordId}${queryString ? `?${queryString}` : ''}`;

    return await fetchWithFallback(
      url,
      headers,
      {
        totalRevenue: 0,
        totalContracts: 0,
        averageRevenuePerContract: 0,
      },
      'Revenue statistics'
    );
  } catch (error) {
    console.error('❌ getLandlordRevenueStatistics error:', error);
    return {
      totalRevenue: 0,
      totalContracts: 0,
      averageRevenuePerContract: 0,
    };
  }
};