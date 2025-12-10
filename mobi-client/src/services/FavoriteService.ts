import { API_URL } from './Constant';
import { RoomInUser } from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseApiClient } from './api/BaseApiClient';

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
 * FavoriteService cho React Native
 * Chuyển đổi từ Next.js sang React Native
 * - Loại bỏ getSession() → Dùng AsyncStorage
 * - Loại bỏ /api/... routes → Dùng direct backend API
 * - Loại bỏ isServer checks
 */

/**
 * Lấy danh sách room IDs đã favorite (có phân trang)
 * Backend endpoint: /favorites (authenticated)
 */
export async function getFavoriteRoomIds(
  page = 0,
  pageSize = 6
): Promise<string[]> {
  try {
    const data: PaginatedResponse<RoomInUser> = await BaseApiClient.get<PaginatedResponse<RoomInUser>>(
      '/favorites',
      { page, size: pageSize }
    );

    if (!data || !Array.isArray(data.content)) {
      console.error('Cấu trúc dữ liệu không hợp lệ từ API favorites');
      return [];
    }

    const favoriteIds: string[] = data.content
      .filter((item) => item && typeof item.id === 'string')
      .map((item) => item.id);

    return favoriteIds;

  } catch (error: any) {
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.warn('Không được ủy quyền - Token hết hạn hoặc không hợp lệ');
      await AsyncStorage.removeItem('accessToken');
      return [];
    }
    console.error('Lỗi khi lấy favorite room IDs:', error);
    return [];
  }
}

/**
 * Lấy TẤT CẢ room IDs đã favorite (không giới hạn)
 * Backend endpoint: /favorites (authenticated)
 */
export async function getAllFavoriteIds(): Promise<string[]> {
  try {
    // Lấy trang đầu tiên để biết totalPages
    const firstPageData: PaginatedResponse<RoomInUser> = await BaseApiClient.get<PaginatedResponse<RoomInUser>>(
      '/favorites',
      { page: 0, size: 100 }
    );

    if (!firstPageData || !Array.isArray(firstPageData.content)) {
      console.error('Cấu trúc dữ liệu không hợp lệ');
      return [];
    }

    // Lấy IDs từ trang đầu tiên
    let allFavoriteIds = firstPageData.content
      .filter((item) => item && typeof item.id === 'string')
      .map((item) => item.id);

    const totalPages = firstPageData.totalPages || 1;

    // Lấy các trang còn lại (nếu có)
    const fetchPromises = [];
    for (let page = 1; page < totalPages; page++) {
      fetchPromises.push(
        BaseApiClient.get<PaginatedResponse<RoomInUser>>('/favorites', { page, size: 100 })
      );
    }

    // Fetch parallel
    const responses = await Promise.all(fetchPromises);

    for (const data of responses) {
      if (!data || !Array.isArray(data.content)) continue;

      const pageIds = data.content
        .filter((item) => item && typeof item.id === 'string')
        .map((item) => item.id);

      allFavoriteIds = [...allFavoriteIds, ...pageIds];
    }

    return allFavoriteIds;

  } catch (error: any) {
    if (error.message?.includes('401')) {
      await AsyncStorage.removeItem('accessToken');
      return [];
    }
    console.error('Lỗi khi lấy tất cả favorite IDs:', error);
    return [];
  }
}

/**
 * Lấy danh sách phòng đã favorite (với full details)
 * Backend endpoint: /favorites (authenticated)
 */
export async function getFavoriteRooms(
  page = 0,
  size = 10
): Promise<PaginatedResponse<RoomInUser>> {
  try {
    const data: PaginatedResponse<RoomInUser> = await BaseApiClient.get<PaginatedResponse<RoomInUser>>(
      '/favorites',
      { page, size }
    );

    return data;

  } catch (error: any) {
    if (error.message?.includes('401')) {
      await AsyncStorage.removeItem('accessToken');
      throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
    if (error.message?.includes('404')) {
      throw new Error('Không tìm thấy dữ liệu yêu thích.');
    }
    if (error.message?.includes('500')) {
      throw new Error('Lỗi server. Vui lòng thử lại sau hoặc liên hệ admin.');
    }
    console.error('Lỗi khi lấy favorite rooms:', error);
    throw error;
  }
}

/**
 * Thêm phòng vào danh sách yêu thích
 */
export async function addFavorite(roomId: string): Promise<boolean> {
  try {
    await BaseApiClient.post<void>(`/favorites/rooms/${roomId}`);
    return true;

  } catch (error) {
    console.error('Lỗi khi thêm favorite:', error);
    return false;
  }
}

/**
 * Xóa phòng khỏi danh sách yêu thích
 */
export async function removeFavorite(roomId: string): Promise<boolean> {
  try {
    // Backend có thể trả về empty body, nên ta bắt và xử lý lỗi JSON parse
    try {
      await BaseApiClient.delete<void>(`/favorites/rooms/${roomId}`);
    } catch (error: any) {
      // Nếu là lỗi JSON parse từ response rỗng, coi là thành công
      if (error.message?.includes('JSON Parse error') || error.message?.includes('Unexpected end of input')) {
        console.warn('⚠️ Backend returned empty body for DELETE, treating as success');
        return true;
      }
      throw error;
    }
    return true;

  } catch (error: any) {
    console.error('❌ Lỗi khi xóa favorite:', error?.message || error);
    return false;
  }
}

/**
 * DEPRECATED: Kiểm tra xem phòng đã được favorite chưa
 * Backend endpoint /check trả về HTTP 500
 * Thay vào đó sử dụng Zustand store với favoriteRoomIds.has(roomId)
 */
export async function isFavorited(roomId: string): Promise<boolean> {
  console.warn('⚠️ isFavorited() is deprecated. Use Zustand store favoriteRoomIds instead.');
  return false;
}

/**
 * Lấy số lượt yêu thích của 1 phòng (public API - không cần authentication)
 * Endpoint này hoạt động để hiển thị số lượt yêu thích cho mọi người xem
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
      console.error('Lỗi khi lấy favorite count:', response.status);
      return 0;
    }

    const count = await response.json();
    return typeof count === 'number' ? count : 0;

  } catch (error) {
    console.error('Lỗi khi lấy favorite count:', error);
    return 0;
  }
}

/**
 * DEPRECATED: Toggle favorite
 * Use addFavorite() or removeFavorite() explicitly with Zustand store
 */
export async function toggleFavorite(roomId: string): Promise<boolean> {
  console.warn('⚠️ toggleFavorite() is deprecated. Use addFavorite() or removeFavorite() directly.');
  return false;
}