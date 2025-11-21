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

// ===== API FUNCTIONS =====

/**
 * Lấy số lượng phòng đã đăng
 * @returns Số lượng phòng đã đăng
 */
export const getLandlordPostedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    console.log('📊 Fetching posted room count...');

    const response = await fetch(
      `${API_URL}/landlord/statistics/posted-room`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch posted room count:', errorText);
      throw new Error('Failed to fetch posted room count');
    }

    const data = await response.json();
    console.log('✅ Posted room count:', data.count);
    return data;
  } catch (error) {
    console.error('❌ getLandlordPostedRoomCount error:', error);
    throw error;
  }
};

/**
 * Lấy số lượng phòng đã cho thuê
 * @returns Số lượng phòng đã cho thuê
 */
export const getLandlordRentedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    console.log('📊 Fetching rented room count...');

    const response = await fetch(
      `${API_URL}/landlord/statistics/rented-room`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch rented room count:', errorText);
      throw new Error('Failed to fetch rented room count');
    }

    const data = await response.json();
    console.log('✅ Rented room count:', data.count);
    return data;
  } catch (error) {
    console.error('❌ getLandlordRentedRoomCount error:', error);
    throw error;
  }
};

/**
 * Lấy số lượng lượt xem phòng
 * @returns Số lượng lượt xem
 */
export const getLandlordViewedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    console.log('📊 Fetching viewed room count...');

    const response = await fetch(
      `${API_URL}/landlord/statistics/viewed-room`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch viewed room count:', errorText);
      throw new Error('Failed to fetch viewed room count');
    }

    const data = await response.json();
    console.log('✅ Viewed room count:', data.count);
    return data;
  } catch (error) {
    console.error('❌ getLandlordViewedRoomCount error:', error);
    throw error;
  }
};

/**
 * Lấy số lượng phòng được yêu thích
 * @returns Số lượng phòng yêu thích
 */
export const getLandlordFavoritedRoomCount = async (): Promise<RoomCountResponse> => {
  try {
    const headers = await getAuthHeaders();
    console.log('📊 Fetching favorited room count...');

    const response = await fetch(
      `${API_URL}/landlord/statistics/favorited-room`,
      {
        method: 'GET',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch favorited room count:', errorText);
      throw new Error('Failed to fetch favorited room count');
    }

    const data = await response.json();
    console.log('✅ Favorited room count:', data.count);
    return data;
  } catch (error) {
    console.error('❌ getLandlordFavoritedRoomCount error:', error);
    throw error;
  }
};

/**
 * Lấy thống kê bảo trì phòng theo khoảng thời gian
 * @param startDate - Ngày bắt đầu (YYYY-MM-DD), không bắt buộc
 * @param endDate - Ngày kết thúc (YYYY-MM-DD), không bắt buộc
 * @returns Thống kê bảo trì
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

    console.log('📊 Fetching maintenance statistics...');
    if (startDate || endDate) {
      console.log(`   Khoảng thời gian: ${startDate || 'không giới hạn'} → ${endDate || 'không giới hạn'}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch maintenance statistics:', errorText);
      throw new Error('Failed to fetch maintenance statistics');
    }

    const data = await response.json();
    console.log('✅ Maintenance statistics:', {
      total: data.totalMaintenances,
      cost: data.totalCost,
    });
    return data;
  } catch (error) {
    console.error('❌ getLandlordMaintenanceStatistics error:', error);
    throw error;
  }
};

/**
 * Lấy thống kê chi phí đăng phòng theo khoảng thời gian
 * @param startDate - Ngày bắt đầu (YYYY-MM-DD), không bắt buộc
 * @param endDate - Ngày kết thúc (YYYY-MM-DD), không bắt buộc
 * @returns Thống kê chi phí đăng phòng
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

    console.log('📊 Fetching fee post room statistics...');
    if (startDate || endDate) {
      console.log(`   Khoảng thời gian: ${startDate || 'không giới hạn'} → ${endDate || 'không giới hạn'}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch fee post room statistics:', errorText);
      throw new Error('Failed to fetch fee post room statistics');
    }

    const data = await response.json();
    console.log('✅ Fee post room statistics:', {
      totalFee: data.totalFee,
      totalPosts: data.totalPosts,
    });
    return data;
  } catch (error) {
    console.error('❌ getLandlordFeePostRoomStatistics error:', error);
    throw error;
  }
};

/**
 * Lấy thống kê doanh thu theo khoảng thời gian
 * @param startDate - Ngày bắt đầu (YYYY-MM-DD), không bắt buộc
 * @param endDate - Ngày kết thúc (YYYY-MM-DD), không bắt buộc
 * @returns Thống kê doanh thu
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

    console.log('📊 Fetching revenue statistics...');
    if (startDate || endDate) {
      console.log(`   Khoảng thời gian: ${startDate || 'không giới hạn'} → ${endDate || 'không giới hạn'}`);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch revenue statistics:', errorText);
      throw new Error('Failed to fetch revenue statistics');
    }

    const data = await response.json();
    console.log('✅ Revenue statistics:', {
      totalRevenue: data.totalRevenue,
      totalContracts: data.totalContracts,
    });
    return data;
  } catch (error) {
    console.error('❌ getLandlordRevenueStatistics error:', error);
    throw error;
  }
};
