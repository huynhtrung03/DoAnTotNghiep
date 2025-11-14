import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PostType {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get all post types
 * @returns Array of post types
 */
export const getPostTypes = async (): Promise<PostType[]> => {
  try {
    const token = await AsyncStorage.getItem('accessToken');

    console.log('📋 Fetching post types...');

    const response = await fetch(`${API_URL}/post-types`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      let errorMsg = 'Failed to fetch post types';
      try {
        const errorJson = await response.json();
        console.error('❌ Backend error:', errorJson);
        errorMsg = errorJson.message || errorJson.error || errorMsg;
      } catch (e) {
        console.error('❌ Error parsing response:', e);
      }
      throw new Error(errorMsg);
    }

    const postTypes = await response.json();
    console.log('✅ Post types fetched:', postTypes.length);
    return postTypes;
  } catch (error) {
    console.error('❌ getPostTypes error:', error);
    throw error;
  }
};

