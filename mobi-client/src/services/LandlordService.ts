import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== TYPES =====

/** Response phân trang generic */
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Thông tin cơ bản của chủ trọ */
export interface LandLordInfo {
  id: string;
  fullName: string;
  avatar?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  rating?: number;
  totalRooms?: number;
  totalRentedRooms?: number;
  createdAt?: string;
}

/** Thông tin chi tiết của chủ trọ */
export interface LandlordDetail {
  id: string;
  fullName: string;
  avatar?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  rating?: number;
  totalRooms?: number;
  totalRentedRooms?: number;
  totalViews?: number;
  totalFavorites?: number;
  description?: string;
  joinedDate?: string;
  verified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Thông tin phòng trong danh sách */
export interface RoomListing {
  id: string;
  title: string;
  price: number;
  area: number;
  address: string;
  district?: string;
  city?: string;
  status: string;
  images?: string[];
  thumbnail?: string;
  description?: string;
  views?: number;
  favorites?: number;
  landlordId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Lấy headers authentication từ AsyncStorage (optional cho public endpoints)
 */
const getHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ===== LANDLORD SERVICE =====

export const landlordService = {
  /**
   * Lấy danh sách tất cả chủ trọ (có phân trang)
   * @param page - Số trang (bắt đầu từ 0)
   * @param size - Số lượng bản ghi mỗi trang (mặc định 6)
   * @returns Danh sách chủ trọ phân trang
   */
  async getAllLandlords(
    page: number = 0,
    size: number = 6
  ): Promise<PageResponse<LandLordInfo>> {
    try {
      const headers = await getHeaders();
      console.log(`👥 Fetching landlords: page ${page}, size ${size}`);

      const response = await fetch(
        `${API_URL}/landlords?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch landlords:', errorText);
        throw new Error('Failed to fetch landlords');
      }

      const data = await response.json();
      console.log(`✅ Landlords fetched: ${data.content?.length || 0} items`);
      return data;
    } catch (error) {
      console.error('❌ Error fetching landlords:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của một chủ trọ
   * @param landlordId - ID của chủ trọ
   * @returns Thông tin chi tiết chủ trọ
   */
  async getLandlordById(landlordId: string): Promise<LandlordDetail> {
    try {
      const headers = await getHeaders();
      console.log('👤 Fetching landlord detail:', landlordId);

      const response = await fetch(`${API_URL}/landlords/${landlordId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch landlord detail:', errorText);
        throw new Error('Failed to fetch landlord detail');
      }

      const data = await response.json();
      console.log('✅ Landlord detail fetched:', data.fullName);
      return data;
    } catch (error) {
      console.error('❌ Error fetching landlord detail:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng của một chủ trọ (có phân trang)
   * @param landlordId - ID của chủ trọ
   * @param page - Số trang (bắt đầu từ 0)
   * @param size - Số lượng bản ghi mỗi trang (mặc định 9)
   * @returns Danh sách phòng phân trang
   */
  async getLandlordRooms(
    landlordId: string,
    page: number = 0,
    size: number = 9
  ): Promise<PageResponse<RoomListing>> {
    try {
      const headers = await getHeaders();
      console.log(
        `🏠 Fetching landlord rooms: landlord=${landlordId}, page=${page}, size=${size}`
      );

      const response = await fetch(
        `${API_URL}/landlords/${landlordId}/rooms?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch landlord rooms:', errorText);
        throw new Error('Failed to fetch landlord rooms');
      }

      const data = await response.json();
      console.log(
        `✅ Landlord rooms fetched: ${data.content?.length || 0} items`
      );
      return data;
    } catch (error) {
      console.error('❌ Error fetching landlord rooms:', error);
      throw error;
    }
  },
};
