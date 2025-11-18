import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== TYPES =====

/** Dữ liệu tạo đánh giá mới */
export interface RatingCreateDto {
  rating: number;
  comment: string;
  userId: string;
}

/** Dữ liệu phản hồi đánh giá */
export interface RatingReplyDto {
  reply: string;
}

/** Thông tin đánh giá (response từ API) */
export interface RatingResponseDto {
  id: string;
  roomId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  reply?: string;
  landlordId?: string;
  landlordName?: string;
  createdAt: string;
  updatedAt?: string;
  repliedAt?: string;
}

/** Quyền truy cập feedback */
export interface FeedbackAccess {
  canFeedback: boolean;
  reason?: string;
  hasActiveContract?: boolean;
  hasFeedback?: boolean;
}

// ===== HELPER FUNCTIONS =====

/**
 * Lấy headers authentication từ AsyncStorage
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Xử lý response từ API
 * @param res - Response object từ fetch
 * @returns JSON data từ response
 * @throws Error nếu response không ok
 */
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    let errorText = 'API request failed';
    try {
      errorText = await res.text();
    } catch (e) {
      console.error('❌ Error reading response:', e);
    }
    console.error('❌ API Error:', errorText);
    throw new Error(errorText || 'API request failed');
  }
  return res.json();
};

// ===== RATING SERVICE =====

export const ratingService = {
  /**
   * Lấy danh sách đánh giá theo phòng
   * @param roomId - ID của phòng
   * @returns Danh sách đánh giá
   */
  getFeedbacksByRoom: async (roomId: string): Promise<RatingResponseDto[]> => {
    try {
      const headers = await getAuthHeaders();
      console.log('📋 Fetching feedbacks for room:', roomId);

      const res = await fetch(`${API_URL}/feedbacks/${roomId}`, {
        method: 'GET',
        headers,
      });

      const feedbacks = await handleResponse(res);
      console.log(`✅ Feedbacks fetched: ${feedbacks.length} items`);
      return feedbacks;
    } catch (error) {
      console.error('❌ Error fetching feedbacks by room:', error);
      throw error;
    }
  },

  /**
   * Tạo đánh giá mới cho phòng
   * @param roomId - ID của phòng
   * @param dto - Dữ liệu đánh giá (rating, comment, userId)
   * @returns Đánh giá đã tạo
   */
  createFeedback: async (
    roomId: string,
    dto: RatingCreateDto
  ): Promise<RatingResponseDto> => {
    try {
      const headers = await getAuthHeaders();
      console.log('➕ Creating feedback for room:', roomId);
      console.log('   Rating:', dto.rating, '/5 ⭐');
      console.log('   Comment:', dto.comment.substring(0, 50) + '...');

      const res = await fetch(`${API_URL}/feedbacks/${roomId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dto),
      });

      const feedback = await handleResponse(res);
      console.log('✅ Feedback created:', feedback.id);
      return feedback;
    } catch (error) {
      console.error('❌ Error creating feedback:', error);
      throw error;
    }
  },

  /**
   * Phản hồi đánh giá (dành cho chủ trọ)
   * @param landlordId - ID của chủ trọ
   * @param feedbackId - ID của đánh giá cần phản hồi
   * @param dto - Nội dung phản hồi
   * @returns Đánh giá đã được cập nhật
   */
  replyFeedback: async (
    landlordId: string,
    feedbackId: string,
    dto: RatingReplyDto
  ): Promise<RatingResponseDto> => {
    try {
      const headers = await getAuthHeaders();
      console.log('💬 Replying to feedback:', feedbackId);
      console.log('   Landlord:', landlordId);
      console.log('   Reply:', dto.reply.substring(0, 50) + '...');

      const res = await fetch(`${API_URL}/feedbacks/reply/${feedbackId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ landlordId, ...dto }),
      });

      const feedback = await handleResponse(res);
      console.log('✅ Feedback replied:', feedback.id);
      return feedback;
    } catch (error) {
      console.error('❌ Error replying to feedback:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra quyền đánh giá của user cho phòng
   * @param roomId - ID của phòng
   * @param userId - ID của user
   * @returns Thông tin quyền truy cập (có thể đánh giá hay không)
   */
  checkFeedbackAccess: async (
    roomId: string,
    userId: string
  ): Promise<FeedbackAccess> => {
    try {
      const headers = await getAuthHeaders();
      console.log('🔍 Checking feedback access:');
      console.log('   Room:', roomId);
      console.log('   User:', userId);

      const res = await fetch(
        `${API_URL}/feedbacks/access/${roomId}?userId=${userId}`,
        {
          method: 'GET',
          headers,
        }
      );

      const access = await handleResponse(res);
      console.log('✅ Access check result:');
      console.log('   Can feedback:', access.canFeedback ? 'YES ✅' : 'NO ❌');
      if (access.reason) {
        console.log('   Reason:', access.reason);
      }
      if (access.hasActiveContract !== undefined) {
        console.log('   Has active contract:', access.hasActiveContract);
      }
      if (access.hasFeedback !== undefined) {
        console.log('   Has feedback:', access.hasFeedback);
      }
      return access;
    } catch (error) {
      console.error('❌ Error checking feedback access:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đánh giá theo chủ trọ
   * @param landlordId - ID của chủ trọ
   * @returns Danh sách đánh giá
   */
  getFeedbacksByLandlord: async (
    landlordId: string
  ): Promise<RatingResponseDto[]> => {
    try {
      const headers = await getAuthHeaders();
      console.log('📋 Fetching feedbacks for landlord:', landlordId);

      const res = await fetch(`${API_URL}/feedbacks/landlord/${landlordId}`, {
        method: 'GET',
        headers,
      });

      const feedbacks = await handleResponse(res);
      console.log(`✅ Landlord feedbacks fetched: ${feedbacks.length} items`);
      return feedbacks;
    } catch (error) {
      console.error('❌ Error fetching feedbacks by landlord:', error);
      throw error;
    }
  },

  /**
   * Xóa đánh giá (chỉ người tạo mới có thể xóa)
   * @param feedbackId - ID của đánh giá cần xóa
   * @param userId - ID của user (để xác thực quyền xóa)
   * @returns Message xác nhận xóa thành công
   */
  deleteFeedback: async (
    feedbackId: string,
    userId: string
  ): Promise<string> => {
    try {
      const headers = await getAuthHeaders();
      console.log('🗑️ Deleting feedback:', feedbackId);
      console.log('   User:', userId);

      const res = await fetch(
        `${API_URL}/feedbacks/delete/${feedbackId}?userId=${userId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      const message = await handleResponse(res);
      console.log('✅ Feedback deleted successfully');
      return message;
    } catch (error) {
      console.error('❌ Error deleting feedback:', error);
      throw error;
    }
  },
};
