import { PageResponse, LandlordDetailByRoom, Landlord, RoomInUser } from '../types/types';
import { BaseApiClient } from './api/BaseApiClient';

export const landlordService = {
  /**
   * Lấy danh sách tất cả chủ nhà với phân trang
   */
  async getAllLandlords(page: number = 0, size: number = 6): Promise<PageResponse<Landlord>> {
    try {
      const result = await BaseApiClient.get<PageResponse<Landlord>>('/landlords', { page, size });
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chủ nhà:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết chủ nhà theo ID
   */
  async getLandlordById(landlordId: string): Promise<LandlordDetailByRoom> {
    try {
      const result = await BaseApiClient.get<LandlordDetailByRoom>(`/landlords/${landlordId}`);
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết chủ nhà:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng của chủ nhà với phân trang
   */
  async getLandlordRooms(landlordId: string, page: number = 0, size: number = 9): Promise<PageResponse<RoomInUser>> {
    try {
      const result = await BaseApiClient.get<PageResponse<RoomInUser>>(`/landlords/${landlordId}/rooms`, { page, size });
      return result;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách phòng của chủ nhà:', error);
      throw error;
    }
  },
};
