import { API_URL } from '../config/Constant';
import { RoomInUser } from '../../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Paginated Response type
export type PaginatedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

/**
 * FavoriteService for React Native
 * Chuyển đổi từ Next.js sang React Native
 * - Loại bỏ getSession() → Dùng AsyncStorage
 * - Loại bỏ /api/... routes → Dùng direct backend API
 * - Loại bỏ isServer checks
 */

// Helper: Get access token from AsyncStorage
async function getAccessToken(): Promise<string | null> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error);
    return null;
  }
}

/**
 * Lấy danh sách room IDs đã favorite (có phân trang)
 */
export async function getFavoriteRoomIds(
  page = 0, 
  pageSize = 6
): Promise<string[]> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('⚠️ No access token, user not logged in');
      return [];
    }

    const response = await fetch(
      `${API_URL}/favorites?page=${page}&size=${pageSize}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        console.warn('⚠️ Unauthorized - Token expired or invalid');
        // Clear token if unauthorized
        await AsyncStorage.removeItem('accessToken');
        return [];
      }
      
      console.error(`❌ API Error: ${response.status} - ${response.statusText}`);
      return [];
    }

    const data: PaginatedResponse<RoomInUser> = await response.json();
    
    if (!data || !Array.isArray(data.content)) {
      console.error('❌ Invalid data structure from favorites API');
      return [];
    }

    const favoriteIds: string[] = data.content
      .filter((item) => item && typeof item.id === 'string')
      .map((item) => item.id);

    // console.log(`✅ Fetched ${favoriteIds.length} favorite IDs (page ${page})`);
    return favoriteIds;

  } catch (error) {
    console.error('❌ Error fetching favorite room IDs:', error);
    return [];
  }
}

/**
 * Lấy TẤT CẢ room IDs đã favorite (không giới hạn)
 */
export async function getAllFavoriteIds(): Promise<string[]> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('⚠️ No access token, user not logged in');
      return [];
    }

    // Fetch trang đầu tiên để biết totalPages
    const firstPageResponse = await fetch(
      `${API_URL}/favorites?page=0&size=100`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!firstPageResponse.ok) {
      if (firstPageResponse.status === 401) {
        await AsyncStorage.removeItem('accessToken');
        return [];
      }
      console.error(`❌ API Error: ${firstPageResponse.status}`);
      return [];
    }

    const firstPageData: PaginatedResponse<RoomInUser> = await firstPageResponse.json();
    
    if (!firstPageData || !Array.isArray(firstPageData.content)) {
      console.error('❌ Invalid data structure');
      return [];
    }

    // Lấy IDs từ trang đầu tiên
    let allFavoriteIds = firstPageData.content
      .filter((item) => item && typeof item.id === 'string')
      .map((item) => item.id);

    const totalPages = firstPageData.totalPages || 1;
    // console.log(`📄 Total pages: ${totalPages}`);

    // Fetch các trang còn lại (nếu có)
    const fetchPromises = [];
    for (let page = 1; page < totalPages; page++) {
      fetchPromises.push(
        fetch(
          `${API_URL}/favorites?page=${page}&size=100`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );
    }

    // Fetch parallel
    const responses = await Promise.all(fetchPromises);
    
    for (const response of responses) {
      if (!response.ok) continue;
      
      const data: PaginatedResponse<RoomInUser> = await response.json();
      if (!data || !Array.isArray(data.content)) continue;
      
      const pageIds = data.content
        .filter((item) => item && typeof item.id === 'string')
        .map((item) => item.id);
      
      allFavoriteIds = [...allFavoriteIds, ...pageIds];
    }

    // console.log(`✅ Fetched total ${allFavoriteIds.length} favorite IDs`);
    return allFavoriteIds;

  } catch (error) {
    console.error('❌ Error fetching all favorite IDs:', error);
    return [];
  }
}

/**
 * Lấy danh sách phòng đã favorite (với full details)
 */
export async function getFavoriteRooms(
  page = 0,
  size = 10
): Promise<PaginatedResponse<RoomInUser>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('⚠️ No access token');
      throw new Error('Bạn chưa đăng nhập. Vui lòng đăng nhập để xem phòng yêu thích.');
    }

    // console.log(`🔍 Calling API: ${API_URL}/favorites?page=${page}&size=${size}`);

    const response = await fetch(
      `${API_URL}/favorites?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // console.log(`📡 API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      if (response.status === 401) {
        await AsyncStorage.removeItem('accessToken');
        throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
      if (response.status === 404) {
        throw new Error('Không tìm thấy dữ liệu yêu thích.');
      }
      if (response.status === 500) {
        throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ admin.');
      }
      throw new Error(`Lỗi ${response.status}: ${response.statusText}`);
    }

    const data: PaginatedResponse<RoomInUser> = await response.json();
    // console.log(`✅ Fetched ${data.content?.length || 0} favorite rooms`);
    return data;

  } catch (error: any) {
    console.error('❌ Error fetching favorite rooms:', error);
    // Re-throw error với message rõ ràng
    throw error;
  }
}

/**
 * Thêm phòng vào danh sách yêu thích
 */
export async function addFavorite(roomId: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('⚠️ No access token, cannot add favorite');
      return false;
    }

    const response = await fetch(
      `${API_URL}/favorites/rooms/${roomId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to add favorite: ${response.status}`);
      return false;
    }

    // console.log(`✅ Added favorite: ${roomId}`);
    return true;

  } catch (error) {
    console.error('❌ Error adding favorite:', error);
    return false;
  }
}

/**
 * Xóa phòng khỏi danh sách yêu thích
 */
export async function removeFavorite(roomId: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.warn('⚠️ No access token, cannot remove favorite');
      return false;
    }

    const response = await fetch(
      `${API_URL}/favorites/rooms/${roomId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to remove favorite: ${response.status}`);
      return false;
    }

    // console.log(`✅ Removed favorite: ${roomId}`);
    return true;

  } catch (error) {
    console.error('❌ Error removing favorite:', error);
    return false;
  }
}

/**
 * Lấy số lượt yêu thích của 1 phòng (public API)
 */
export async function getFavoriteCount(roomId: string): Promise<number> {
  try {
    const response = await fetch(
      `${API_URL}/favorites/rooms/${roomId}/count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error(`❌ Failed to get favorite count: ${response.status}`);
      return 0;
    }

    const count = await response.json();
    return typeof count === 'number' ? count : 0;

  } catch (error) {
    console.error('❌ Error getting favorite count:', error);
    return 0;
  }
}

/**
 * Kiểm tra xem phòng đã được favorite chưa
 */
export async function isFavorited(roomId: string): Promise<boolean> {
  try {
    const token = await getAccessToken();
    if (!token) return false;

    const response = await fetch(
      `${API_URL}/favorites/rooms/${roomId}/check`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) return false;

    const result = await response.json();
    return result === true || result.isFavorited === true;

  } catch (error) {
    console.error('❌ Error checking favorite status:', error);
    return false;
  }
}

/**
 * Toggle favorite (add nếu chưa có, remove nếu đã có)
 */
export async function toggleFavorite(roomId: string): Promise<boolean> {
  try {
    const isFav = await isFavorited(roomId);
    
    if (isFav) {
      return await removeFavorite(roomId);
    } else {
      return await addFavorite(roomId);
    }
  } catch (error) {
    console.error('❌ Error toggling favorite:', error);
    return false;
  }
}