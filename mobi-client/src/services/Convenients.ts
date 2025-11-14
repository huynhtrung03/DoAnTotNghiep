import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== TYPES =====

/** Thông tin tiện ích */
export interface Convenient {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ===== HELPER FUNCTIONS =====

/**
 * Lấy headers authentication từ AsyncStorage (optional cho public endpoint)
 */
const getHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// ===== API FUNCTIONS =====

/**
 * Lấy danh sách tất cả tiện ích
 * @returns Danh sách tiện ích
 */
export const getConvenients = async (): Promise<Convenient[]> => {
  try {
    const headers = await getHeaders();
    console.log('🏪 Fetching convenients...');

    const response = await fetch(`${API_URL}/convenients`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to fetch convenients:', errorText);
      throw new Error('Failed to fetch convenients');
    }

    const convenients = await response.json();
    console.log(`✅ Convenients fetched: ${convenients.length} items`);
    return convenients;
  } catch (error) {
    console.error('❌ Error fetching convenients:', error);
    throw error;
  }
};
