import { API_URL } from '../config/Constant';

export interface PublicStatistics {
  totalRooms: number;
  vipRooms: number;
  totalUsers: number;
  totalLandlords: number;
}

/**
 * Lấy thống kê công khai cho trang chủ
 * @returns Thống kê về phòng trống, phòng VIP, người dùng và chủ trọ
 */
export const getPublicStatistics = async (): Promise<PublicStatistics> => {
  try {
    const response = await fetch(`${API_URL}/public/statistics/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Statistics data received:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching public statistics:', error);
    // Trả về giá trị mặc định nếu có lỗi
    return {
      totalRooms: 0,
      vipRooms: 0,
      totalUsers: 0,
      totalLandlords: 0,
    };
  }
};

/**
 * Lấy số lượng phòng trống
 */
export const getAvailableRooms = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/public/statistics/available-rooms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching available rooms count:', error);
    return 0;
  }
};

/**
 * Lấy số lượng phòng VIP
 */
export const getVipRooms = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/public/statistics/vip-rooms`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching VIP rooms count:', error);
    return 0;
  }
};

/**
 * Lấy tổng số người dùng
 */
export const getTotalUsers = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/public/statistics/total-users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ Error fetching total users count:', error);
    return 0;
  }
};
