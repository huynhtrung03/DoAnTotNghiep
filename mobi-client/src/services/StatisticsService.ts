import { BaseApiClient } from './api/BaseApiClient';

export interface PublicStatistics {
  totalRooms: number;
  vipRooms: number;
  totalUsers: number;
  totalLandlords: number;
}

/**
 * Lay thong ke cong khai cho trang chu
 * @returns Thong ke ve phong trong, phong VIP, nguoi dung va chu tro
 */
export const getPublicStatistics = async (): Promise<PublicStatistics> => {
  try {
    return await BaseApiClient.get<PublicStatistics>('/public/statistics/overview');
  } catch (error) {
    console.error('Loi lay thong ke cong khai:', error);
    // Tra ve gia tri mac dinh neu co loi
    return {
      totalRooms: 0,
      vipRooms: 0,
      totalUsers: 0,
      totalLandlords: 0,
    };
  }
};

/**
 * Lay so luong phong trong
 */
export const getAvailableRooms = async (): Promise<number> => {
  try {
    return await BaseApiClient.get<number>('/public/statistics/available-rooms');
  } catch (error) {
    console.error('Loi lay so luong phong trong:', error);
    return 0;
  }
};

/**
 * Lay so luong phong VIP
 */
export const getVipRooms = async (): Promise<number> => {
  try {
    return await BaseApiClient.get<number>('/public/statistics/vip-rooms');
  } catch (error) {
    console.error('Loi lay so luong phong VIP:', error);
    return 0;
  }
};

/**
 * Lay tong so nguoi dung
 */
export const getTotalUsers = async (): Promise<number> => {
  try {
    return await BaseApiClient.get<number>('/public/statistics/total-users');
  } catch (error) {
    console.error('Loi lay tong so nguoi dung:', error);
    return 0;
  }
};
