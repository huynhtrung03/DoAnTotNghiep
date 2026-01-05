/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Landlord Statistics Service
 * Cung cấp các API để lấy thống kê cho chủ trọ
 * Sử dụng BaseApiClient để xử lý authentication và error handling
 * 
 * IMPORTANT: Backend trả về mảng trực tiếp, không phải object wrapper
 */

import { BaseApiClient } from './api/BaseApiClient';

// ===== TYPE DEFINITIONS =====

/**
 * Response đơn giản cho số lượng phòng
 */
export interface RoomCountResponse {
  count: number;
}

/**
 * Thống kê bảo trì theo ngày (từ backend)
 * Backend trả về mảng này trực tiếp
 */
export interface MaintainStatisticDto {
  date: string; // Format: YYYY-MM-DD
  count: number;
  cost: number;
}

/**
 * Thống kê phí đăng bài theo ngày (từ backend)
 * Backend trả về mảng này trực tiếp
 */
export interface TransactionStatisticsDto {
  date: string; // Format: YYYY-MM-DD
  cost: number;
  count: number;
}

/**
 * Thống kê doanh thu theo ngày (từ backend)
 * Backend trả về mảng này trực tiếp
 */
export interface RevenueStatisticsDto {
  date: string; // Format: YYYY-MM-DD
  revenue: number;
  contractCount: number;
}

/**
 * Type alias cho compatibility
 */
export type MaintenanceStatistics = MaintainStatisticDto[];
export type FeePostRoomStatistics = TransactionStatisticsDto[];
export type RevenueStatistics = RevenueStatisticsDto[];

/**
 * Parameters cho API có filter theo ngày
 */
export interface DateRangeParams {
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
}

// ===== HELPER FUNCTIONS =====

/**
 * Validate landlord ID
 */
const validateLandlordId = (landlordId: string): boolean => {
  if (!landlordId || landlordId.trim() === '') {
    console.error('❌ [LandlordStats] ID chủ nhà không hợp lệ');
    return false;
  }
  return true;
};

/**
 * Validate date range (max 12 months)
 */
export const validateDateRange = (startDate?: string, endDate?: string): { valid: boolean; error?: string } => {
  if (!startDate || !endDate) {
    return { valid: true }; // Optional params
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Định dạng ngày không hợp lệ. Sử dụng YYYY-MM-DD' };
  }

  if (end < start) {
    return { valid: false, error: 'Ngày kết thúc phải sau ngày bắt đầu' };
  }

  // Calculate months difference
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

  if (monthsDiff > 12) {
    return { valid: false, error: 'Khoảng thời gian không được vượt quá 12 tháng' };
  }

  return { valid: true };
};

/**
 * Format date to YYYY-MM-DD
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ===== API FUNCTIONS =====

/**
 * Lấy số lượng phòng đã đăng
 */
export const getLandlordPostedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  if (!validateLandlordId(landlordId)) {
    return { count: 0 };
  }

  try {
    const data = await BaseApiClient.get<RoomCountResponse | number>(
      `/landlord/statistics/total-posted-rooms/${landlordId}`
    );

    if (typeof data === 'number') {
      return { count: data };
    }

    if (data && typeof data === 'object' && 'count' in data) {
      return { count: data.count };
    }

    console.warn('⚠️ [LandlordStats] Unexpected response format for posted rooms');
    return { count: 0 };
  } catch (error) {
    console.error('❌ [LandlordStats] Error fetching posted room count:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng phòng đã cho thuê
 */
export const getLandlordRentedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  if (!validateLandlordId(landlordId)) {
    return { count: 0 };
  }

  try {
    const data = await BaseApiClient.get<RoomCountResponse | number>(
      `/landlord/statistics/total-rented-rooms/${landlordId}`
    );

    if (typeof data === 'number') {
      return { count: data };
    }

    if (data && typeof data === 'object' && 'count' in data) {
      return { count: data.count };
    }

    console.warn('⚠️ [LandlordStats] Unexpected response format for rented rooms');
    return { count: 0 };
  } catch (error) {
    console.error('❌ [LandlordStats] Error fetching rented room count:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng lượt xem phòng
 */
export const getLandlordViewedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  if (!validateLandlordId(landlordId)) {
    return { count: 0 };
  }

  try {
    const data = await BaseApiClient.get<RoomCountResponse | number>(
      `/landlord/statistics/total-viewed-rooms/${landlordId}`
    );

    if (typeof data === 'number') {
      return { count: data };
    }

    if (data && typeof data === 'object' && 'count' in data) {
      return { count: data.count };
    }

    console.warn('⚠️ [LandlordStats] Unexpected response format for viewed rooms');
    return { count: 0 };
  } catch (error) {
    console.error('❌ [LandlordStats] Error fetching viewed room count:', error);
    return { count: 0 };
  }
};

/**
 * Lấy số lượng phòng được yêu thích
 */
export const getLandlordFavoritedRoomCount = async (landlordId: string): Promise<RoomCountResponse> => {
  if (!validateLandlordId(landlordId)) {
    return { count: 0 };
  }

  try {
    const data = await BaseApiClient.get<RoomCountResponse | number>(
      `/landlord/statistics/total-favorited-rooms/${landlordId}`
    );

    if (typeof data === 'number') {
      return { count: data };
    }

    if (data && typeof data === 'object' && 'count' in data) {
      return { count: data.count };
    }

    console.warn('⚠️ [LandlordStats] Unexpected response format for favorited rooms');
    return { count: 0 };
  } catch (error) {
    console.error('❌ [LandlordStats] Error fetching favorited room count:', error);
    return { count: 0 };
  }
};

/**
 * Lấy thống kê bảo trì phòng
 * Backend trả về mảng MaintainStatisticDto[] trực tiếp
 */
export const getLandlordMaintenanceStatistics = async (
  landlordId: string,
  startDate?: string,
  endDate?: string
): Promise<MaintenanceStatistics> => {
  if (!validateLandlordId(landlordId)) {
    return [];
  }

  // Validate date range
  const validation = validateDateRange(startDate, endDate);
  if (!validation.valid) {
    console.error(`❌ [LandlordStats] ${validation.error}`);
    return [];
  }

  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const data = await BaseApiClient.get<MaintenanceStatistics>(
      `/landlord/statistics/maintenance-statistics/${landlordId}`,
      params
    );

    // Backend trả về mảng trực tiếp
    if (Array.isArray(data)) {
      return data;
    }

    console.warn('⚠️ [LandlordStats] Invalid maintenance statistics response, expected array');
    return [];
  } catch (error) {
    console.error('❌ [LandlordStats] Error fetching maintenance statistics:', error);
    return [];
  }
};

/**
 * Lấy thống kê chi phí đăng phòng
 * Backend trả về mảng TransactionStatisticsDto[] trực tiếp
 */
export const getLandlordFeePostRoomStatistics = async (
  landlordId: string,
  startDate?: string,
  endDate?: string
): Promise<FeePostRoomStatistics> => {
  if (!validateLandlordId(landlordId)) {
    return [];
  }

  // Validate date range
  const validation = validateDateRange(startDate, endDate);
  if (!validation.valid) {
    console.error(`❌ [LandlordStats] ${validation.error}`);
    return [];
  }

  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const data = await BaseApiClient.get<FeePostRoomStatistics>(
      `/landlord/statistics/fee-post-room-statistics/${landlordId}`,
      params
    );

    // Backend trả về mảng trực tiếp
    if (Array.isArray(data)) {
      return data;
    }

    console.warn('⚠️ [LandlordStats] Invalid fee post room statistics response, expected array');
    return [];
  } catch (error) {
    console.error('❌ [LandlordStats] Error fetching fee post room statistics:', error);
    return [];
  }
};

/**
 * Lấy thống kê doanh thu
 * Backend trả về mảng RevenueStatisticsDto[] trực tiếp
 */
export const getLandlordRevenueStatistics = async (
  landlordId: string,
  startDate?: string,
  endDate?: string
): Promise<RevenueStatistics> => {
  if (!validateLandlordId(landlordId)) {
    return [];
  }

  // Validate date range
  const validation = validateDateRange(startDate, endDate);
  if (!validation.valid) {
    console.error(`❌ [LandlordStats] ${validation.error}`);
    return [];
  }

  try {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const data = await BaseApiClient.get<RevenueStatistics>(
      `/landlord/statistics/revenue-statistics/${landlordId}`,
      params
    );

    // Backend trả về mảng trực tiếp
    if (Array.isArray(data)) {
      return data;
    }

    console.warn('⚠️ [LandlordStats] Invalid revenue statistics response, expected array');
    return [];
  } catch (error) {
    console.error('❌ [LandlordStats] Error fetching revenue statistics:', error);
    return [];
  }
};

// ===== BATCH OPERATIONS =====

/**
 * Lấy tất cả KPI counts cùng lúc
 */
export const getAllKPICounts = async (landlordId: string) => {
  const [posted, rented, viewed, favorited] = await Promise.allSettled([
    getLandlordPostedRoomCount(landlordId),
    getLandlordRentedRoomCount(landlordId),
    getLandlordViewedRoomCount(landlordId),
    getLandlordFavoritedRoomCount(landlordId),
  ]);

  return {
    postedRooms: posted.status === 'fulfilled' ? posted.value : { count: 0 },
    rentedRooms: rented.status === 'fulfilled' ? rented.value : { count: 0 },
    viewedRooms: viewed.status === 'fulfilled' ? viewed.value : { count: 0 },
    favoritedRooms: favorited.status === 'fulfilled' ? favorited.value : { count: 0 },
  };
};

/**
 * Lấy tất cả statistics với date range
 */
export const getAllStatistics = async (
  landlordId: string,
  startDate?: string,
  endDate?: string
) => {
  const [maintenance, feePostRoom, revenue] = await Promise.allSettled([
    getLandlordMaintenanceStatistics(landlordId, startDate, endDate),
    getLandlordFeePostRoomStatistics(landlordId, startDate, endDate),
    getLandlordRevenueStatistics(landlordId, startDate, endDate),
  ]);

  return {
    maintenance: maintenance.status === 'fulfilled' ? maintenance.value : [],
    feePostRoom: feePostRoom.status === 'fulfilled' ? feePostRoom.value : [],
    revenue: revenue.status === 'fulfilled' ? revenue.value : [],
  };
};