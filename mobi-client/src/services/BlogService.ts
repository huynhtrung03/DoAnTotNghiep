import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== TYPES =====

/** Trạng thái blog */
export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

/** Danh mục blog */
export enum BlogCategory {
  NEWS = 'NEWS',
  GUIDE = 'GUIDE',
  TIPS = 'TIPS',
  STORY = 'STORY',
  REVIEW = 'REVIEW',
  OTHER = 'OTHER',
}

/** Thông tin blog */
export interface BlogResponse {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  thumbnail?: string;
  category: BlogCategory;
  status: BlogStatus;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  views?: number;
  likes?: number;
  tags?: string[];
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/** Response phân trang blog */
export interface BlogPageResponse {
  content: BlogResponse[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/** Tham số lọc danh sách blog */
export interface BlogListParams {
  page?: number;
  size?: number;
  status?: BlogStatus;
  category?: BlogCategory;
  search?: string;
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

// ===== BLOG SERVICE =====

export class BlogService {
  /**
   * Lấy danh sách blog với phân trang và bộ lọc
   * @param params - Tham số lọc (page, size, status, category, search)
   * @returns Danh sách blog phân trang
   */
  static async getBlogs(
    params: BlogListParams = {}
  ): Promise<BlogPageResponse> {
    try {
      const headers = await getHeaders();
      const searchParams = new URLSearchParams();

      // Thiết lập tham số phân trang
      if (params.page !== undefined) {
        searchParams.append('page', params.page.toString());
        console.log('   Page:', params.page);
      }

      if (params.size !== undefined) {
        searchParams.append('size', params.size.toString());
        console.log('   Size:', params.size);
      }

      // Thêm bộ lọc nếu có
      if (params.status) {
        searchParams.append('status', params.status);
        console.log('   Status:', params.status);
      }

      if (params.category) {
        searchParams.append('category', params.category);
        console.log('   Category:', params.category);
      }

      if (params.search) {
        searchParams.append('search', params.search);
        console.log('   Search:', params.search);
      }

      const queryString = searchParams.toString();
      const url = `${API_URL}/blogs${queryString ? `?${queryString}` : ''}`;

      console.log('📰 Fetching blogs...');

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Blogs fetched: ${data.content?.length || 0} items`);
      return data;
    } catch (error) {
      console.error('❌ Error fetching blogs:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách blog đã xuất bản (hiển thị công khai)
   * @param params - Tham số lọc (không bao gồm status)
   * @returns Danh sách blog đã xuất bản
   */
  static async getPublishedBlogs(
    params: Omit<BlogListParams, 'status'> = {}
  ): Promise<BlogPageResponse> {
    console.log('📰 Fetching published blogs only...');
    return this.getBlogs({
      ...params,
      status: BlogStatus.PUBLISHED,
    });
  }

  /**
   * Lấy blog theo slug
   * @param slug - Slug của blog (URL-friendly identifier)
   * @returns Thông tin chi tiết blog
   */
  static async getBlogBySlug(slug: string): Promise<BlogResponse> {
    try {
      if (!slug) {
        console.error('❌ Slug is required');
        throw new Error('Slug is required');
      }

      const headers = await getHeaders();
      const url = `${API_URL}/blogs/${encodeURIComponent(slug)}`;

      console.log('📰 Fetching blog by slug:', slug);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          console.error('❌ Blog not found:', slug);
          throw new Error('Blog not found');
        }
        const errorText = await response.text();
        console.error(`❌ HTTP error! status: ${response.status}`, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Blog fetched:', data.title);
      return data;
    } catch (error) {
      console.error('❌ Error fetching blog by slug:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách blog theo danh mục
   * @param category - Danh mục blog (NEWS, GUIDE, TIPS, etc.)
   * @param params - Tham số lọc khác (không bao gồm category)
   * @returns Danh sách blog theo danh mục
   */
  static async getBlogsByCategory(
    category: BlogCategory,
    params: Omit<BlogListParams, 'category'> = {}
  ): Promise<BlogPageResponse> {
    console.log('📁 Fetching blogs by category:', category);
    return this.getPublishedBlogs({
      ...params,
      category,
    });
  }

  /**
   * Lấy danh sách blog mới nhất (trang đầu tiên của blog đã xuất bản)
   * @param size - Số lượng blog cần lấy (mặc định 5)
   * @returns Danh sách blog mới nhất
   */
  static async getLatestBlogs(size: number = 5): Promise<BlogPageResponse> {
    console.log('🆕 Fetching latest blogs, size:', size);
    return this.getPublishedBlogs({
      page: 0,
      size,
    });
  }
}
