import { BaseApiClient } from './api/BaseApiClient';

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

// ===== API FUNCTIONS =====

/**
 * Lấy số lượng phòng đã đăng
 */
export const getLandlordPostedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('ID chủ nhà không hợp lệ');
    return { count: 0 };
  }

  try {
    const data: any = await BaseApiClient.get(`/landlord/statistics/total-posted-rooms/${landlordId}`);

    // Xử lý các trường hợp đặc biệt
    if (data === null || data === undefined) {
      console.warn('API trả về null/undefined, dùng giá trị mặc định');
      return { count: 0 };
    }

    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn('API trả về object rỗng, dùng giá trị mặc định');
      return { count: 0 };
    }

    // Xử lý trường hợp API trả về trực tiếp số
    if (typeof data === 'number') {
      return { count: data };
    }

    // Đảm bảo data là object và có field 'count'
    if (typeof data !== 'object' || !('count' in data)) {
      console.warn('Cấu trúc dữ liệu không hợp lệ hoặc thiếu field count, dùng giá trị mặc định');
      return { count: 0 };
    }
    if (typeof data.count !== 'number') {
      console.warn('Field count không phải số, dùng giá trị mặc định');
      return { count: 0 };
    }

    return data;
  } catch (error) {
    console.warn('Lỗi khi lấy số lượng phòng đã đăng, dùng giá trị mặc định:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng phòng đã cho thuê
 */
export const getLandlordRentedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('ID chủ nhà không hợp lệ');
    return { count: 0 };
  }

  try {
    const data: any = await BaseApiClient.get(`/landlord/statistics/total-rented-rooms/${landlordId}`);

    // Xử lý các trường hợp đặc biệt
    if (data === null || data === undefined) {
      console.warn('API trả về null/undefined, dùng giá trị mặc định');
      return { count: 0 };
    }

    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn('API trả về object rỗng, dùng giá trị mặc định');
      return { count: 0 };
    }

    // Xử lý trường hợp API trả về trực tiếp số
    if (typeof data === 'number') {
      return { count: data };
    }

    // Đảm bảo data là object và có field 'count'
    if (typeof data !== 'object' || !('count' in data)) {
      console.warn('Cấu trúc dữ liệu không hợp lệ hoặc thiếu field count, dùng giá trị mặc định');
      return { count: 0 };
    }
    if (typeof data.count !== 'number') {
      console.warn('Field count không phải số, dùng giá trị mặc định');
      return { count: 0 };
    }

    return data;
  } catch (error) {
    console.warn('Lỗi khi lấy số lượng phòng đã cho thuê, dùng giá trị mặc định:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng lượt xem phòng
 */
export const getLandlordViewedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('ID chủ nhà không hợp lệ');
    return { count: 0 };
  }

  try {
    const data: any = await BaseApiClient.get(`/landlord/statistics/total-viewed-rooms/${landlordId}`);

    // Xử lý các trường hợp đặc biệt
    if (data === null || data === undefined) {
      console.warn('API trả về null/undefined, dùng giá trị mặc định');
      return { count: 0 };
    }

    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn('API trả về object rỗng, dùng giá trị mặc định');
      return { count: 0 };
    }

    // Xử lý trường hợp API trả về trực tiếp số
    if (typeof data === 'number') {
      return { count: data };
    }

    // Đảm bảo data là object và có field 'count'
    if (typeof data !== 'object' || !('count' in data)) {
      console.warn('Cấu trúc dữ liệu không hợp lệ hoặc thiếu field count, dùng giá trị mặc định');
      return { count: 0 };
    }
    if (typeof data.count !== 'number') {
      console.warn('Field count không phải số, dùng giá trị mặc định');
      return { count: 0 };
    }

    return data;
  } catch (error) {
    console.warn('Lỗi khi lấy số lượng lượt xem phòng, dùng giá trị mặc định:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng phòng được yêu thích
 */
export const getLandlordFavoritedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  // Validate input
  if (!landlordId || landlordId.trim() === '') {
    console.error('ID chủ nhà không hợp lệ');
    return { count: 0 };
  }

  try {
    const data: any = await BaseApiClient.get(`/landlord/statistics/total-favorited-rooms/${landlordId}`);

    // Xử lý các trường hợp đặc biệt
    if (data === null || data === undefined) {
      console.warn('API trả về null/undefined, dùng giá trị mặc định');
      return { count: 0 };
    }

    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn('API trả về object rỗng, dùng giá trị mặc định');
      return { count: 0 };
    }

    // Xử lý trường hợp API trả về trực tiếp số
    if (typeof data === 'number') {
      return { count: data };
    }

    // Đảm bảo data là object và có field 'count'
    if (typeof data !== 'object' || !('count' in data)) {
      console.warn('Cấu trúc dữ liệu không hợp lệ hoặc thiếu field count, dùng giá trị mặc định');
      return { count: 0 };
    }
    if (typeof data.count !== 'number') {
      console.warn('Field count không phải số, dùng giá trị mặc định');
      return { count: 0 };
    }

    return data;
  } catch (error) {
    console.warn('Lỗi khi lấy số lượng phòng được yêu thích, dùng giá trị mặc định:', error);
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
    console.error('ID chủ nhà không hợp lệ');
    return {
      totalMaintenances: 0,
      pendingMaintenances: 0,
      completedMaintenances: 0,
      totalCost: 0,
      averageCost: 0,
    };
  }

  try {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const data: any = await BaseApiClient.get(`/landlord/statistics/maintenance-statistics/${landlordId}`, params);

    // Xử lý các trường hợp đặc biệt
    if (data === null || data === undefined) {
      console.warn('API trả về null/undefined, dùng giá trị mặc định');
      return {
        totalMaintenances: 0,
        pendingMaintenances: 0,
        completedMaintenances: 0,
        totalCost: 0,
        averageCost: 0,
      };
    }

    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn('API trả về object rỗng, dùng giá trị mặc định');
      return {
        totalMaintenances: 0,
        pendingMaintenances: 0,
        completedMaintenances: 0,
        totalCost: 0,
        averageCost: 0,
      };
    }

    // Đảm bảo data là object và có field 'totalCost'
    if (typeof data !== 'object' || !('totalCost' in data)) {
      console.warn('Cấu trúc dữ liệu không hợp lệ hoặc thiếu field totalCost, dùng giá trị mặc định');
      return {
        totalMaintenances: 0,
        pendingMaintenances: 0,
        completedMaintenances: 0,
        totalCost: 0,
        averageCost: 0,
      };
    }
    if (typeof data.totalCost !== 'number') {
      console.warn('Field totalCost không phải số, dùng giá trị mặc định');
      return {
        totalMaintenances: 0,
        pendingMaintenances: 0,
        completedMaintenances: 0,
        totalCost: 0,
        averageCost: 0,
      };
    }

    return data;
  } catch (error) {
    console.warn('Lỗi khi lấy thống kê bảo trì phòng, dùng giá trị mặc định:', error);
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
    console.error('ID chủ nhà không hợp lệ');
    return {
      totalFee: 0,
      totalPosts: 0,
      averageFeePerPost: 0,
    };
  }

  try {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const data: any = await BaseApiClient.get(`/landlord/statistics/fee-post-room-statistics/${landlordId}`, params);

    // Xử lý các trường hợp đặc biệt
    if (data === null || data === undefined) {
      console.warn('API trả về null/undefined, dùng giá trị mặc định');
      return {
        totalFee: 0,
        totalPosts: 0,
        averageFeePerPost: 0,
      };
    }

    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn('API trả về object rỗng, dùng giá trị mặc định');
      return {
        totalFee: 0,
        totalPosts: 0,
        averageFeePerPost: 0,
      };
    }

    // Đảm bảo data là object và có field 'totalFee'
    if (typeof data !== 'object' || !('totalFee' in data)) {
      console.warn('Cấu trúc dữ liệu không hợp lệ hoặc thiếu field totalFee, dùng giá trị mặc định');
      return {
        totalFee: 0,
        totalPosts: 0,
        averageFeePerPost: 0,
      };
    }
    if (typeof data.totalFee !== 'number') {
      console.warn('Field totalFee không phải số, dùng giá trị mặc định');
      return {
        totalFee: 0,
        totalPosts: 0,
        averageFeePerPost: 0,
      };
    }

    return data;
  } catch (error) {
    console.warn('Lỗi khi lấy thống kê chi phí đăng phòng, dùng giá trị mặc định:', error);
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
    console.error('ID chủ nhà không hợp lệ');
    return {
      totalRevenue: 0,
      totalContracts: 0,
      averageRevenuePerContract: 0,
    };
  }

  try {
    const params: Record<string, any> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const data: any = await BaseApiClient.get(`/landlord/statistics/revenue-statistics/${landlordId}`, params);

    // Xử lý các trường hợp đặc biệt
    if (data === null || data === undefined) {
      console.warn('API trả về null/undefined, dùng giá trị mặc định');
      return {
        totalRevenue: 0,
        totalContracts: 0,
        averageRevenuePerContract: 0,
      };
    }

    if (typeof data === 'object' && Object.keys(data).length === 0) {
      console.warn('API trả về object rỗng, dùng giá trị mặc định');
      return {
        totalRevenue: 0,
        totalContracts: 0,
        averageRevenuePerContract: 0,
      };
    }

    // Đảm bảo data là object và có field 'totalRevenue'
    if (typeof data !== 'object' || !('totalRevenue' in data)) {
      console.warn('Cấu trúc dữ liệu không hợp lệ hoặc thiếu field totalRevenue, dùng giá trị mặc định');
      return {
        totalRevenue: 0,
        totalContracts: 0,
        averageRevenuePerContract: 0,
      };
    }
    if (typeof data.totalRevenue !== 'number') {
      console.warn('Field totalRevenue không phải số, dùng giá trị mặc định');
      return {
        totalRevenue: 0,
        totalContracts: 0,
        averageRevenuePerContract: 0,
      };
    }

    return data;
  } catch (error) {
    console.warn('Lỗi khi lấy thống kê doanh thu, dùng giá trị mặc định:', error);
    return {
      totalRevenue: 0,
      totalContracts: 0,
      averageRevenuePerContract: 0,
    };
  }
};