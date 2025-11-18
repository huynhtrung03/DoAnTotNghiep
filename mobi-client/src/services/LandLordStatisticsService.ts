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
    console.log(`📊 Fetching ${logName}...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ ${logName} API not available:`, errorText);
      return defaultValue;
    }

    const data = await response.json();
    console.log(`✅ ${logName} fetched successfully`);
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
export const getLandlordPostedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/posted-room`,
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
export const getLandlordRentedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/rented-room`,
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
export const getLandlordViewedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/viewed-room`,
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
export const getLandlordFavoritedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    return await fetchWithFallback(
      `${API_URL}/landlord/statistics/favorited-room`,
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
  startDate?: string,
  endDate?: string
): Promise<MaintenanceStatistics> => {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/landlord/statistics/maintaince-room${queryString ? `?${queryString}` : ''}`;

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
  startDate?: string,
  endDate?: string
): Promise<FeePostRoomStatistics> => {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/landlord/statistics/cost-post-room${queryString ? `?${queryString}` : ''}`;

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
  startDate?: string,
  endDate?: string
): Promise<RevenueStatistics> => {
  try {
    const headers = await getAuthHeaders();
    const queryParams = new URLSearchParams();

    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/landlord/statistics/revenue-room${queryString ? `?${queryString}` : ''}`;

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