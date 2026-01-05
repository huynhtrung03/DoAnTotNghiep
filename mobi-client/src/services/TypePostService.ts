import { BaseApiClient } from './api/BaseApiClient';
import type { TypePost } from '../types/types';

/**
 * Lấy danh sách loại bài đăng
 * @returns Mảng các loại bài đăng
 */
export const getPostTypes = async (): Promise<TypePost[]> => {
  try {
    console.log('📋 [getPostTypes] Fetching post types...');
    
    const response = await BaseApiClient.get<any>('/post-types');
    
    // Log response
    console.log('📋 [getPostTypes] API Response:', response);
    
    // Xử lý response - có thể trả về mảng trực tiếp hoặc object chứa data
    let postTypes: TypePost[] = [];
    
    if (Array.isArray(response)) {
      postTypes = response;
    } else if (response?.data && Array.isArray(response.data)) {
      postTypes = response.data;
    } else if (response) {
      postTypes = [response];
    }
    
    console.log(`✅ [getPostTypes] Success - ${postTypes.length} types found`);
    return postTypes;
  } catch (error: any) {
    console.error('❌ [getPostTypes] Error:', error?.message);
    throw new Error(error?.message || 'Failed to fetch post types');
  }
};

/**
 * Lấy thông tin chi tiết của một loại bài đăng
 * @param typePostId - ID của loại bài đăng
 * @returns Thông tin loại bài đăng
 */
export const getPostTypeById = async (typePostId: string): Promise<TypePost | null> => {
  try {
    console.log(`📋 [getPostTypeById] Fetching post type: ${typePostId}`);
    
    const response = await BaseApiClient.get<TypePost>(`/post-types/${typePostId}`);
    
    console.log(`✅ [getPostTypeById] Success:`, response);
    return response;
  } catch (error: any) {
    console.error(`❌ [getPostTypeById] Error:`, error?.message);
    return null;
  }
};
