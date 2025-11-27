import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ResetPasswordResponse {
  message: string;
  success?: boolean;
}

export interface VerifyCodeResponse {
  message: string;
  valid?: boolean;
}

export interface ChangePasswordResponse {
  message: string;
  success?: boolean;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  userId?: string;
}

export interface UpdatePasswordResponse {
  message: string;
  success?: boolean;
}

/**
 * Request password reset via email
 * @param email - User's email address
 * @returns Response message
 */
export async function resetPassword(email: string): Promise<ResetPasswordResponse> {
  try {
    // console.log('📧 Requesting password reset for:', email);

    const formData = new FormData();
    formData.append('email', email);

    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const msg =
        data?.message?.[0] || data?.error || 'Failed to reset password';
      console.error('❌ Reset password failed:', msg);
      throw new Error(msg);
    }

    // console.log('✅ Password reset email sent');
    return data;
  } catch (error) {
    console.error('❌ resetPassword error:', error);
    throw error;
  }
}

/**
 * Verify reset code sent to email
 * @param email - User's email address
 * @param code - Verification code from email
 * @returns Verification result
 */
export async function verifyResetCode(
  email: string,
  code: string
): Promise<VerifyCodeResponse> {
  try {
    // console.log('🔐 Verifying reset code for:', email);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);

    const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data?.message?.[0] || data?.error || 'Invalid code or email';
      console.error('❌ Code verification failed:', msg);
      throw new Error(msg);
    }

    // console.log('✅ Reset code verified');
    return data;
  } catch (error) {
    console.error('❌ verifyResetCode error:', error);
    throw error;
  }
}

/**
 * Change password with verified code
 * @param email - User's email address
 * @param newPassword - New password
 * @param code - Verified reset code
 * @returns Change password result
 */
export async function changePassword(
  email: string,
  newPassword: string,
  code: string
): Promise<ChangePasswordResponse> {
  try {
    // console.log('🔑 Changing password for:', email);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('newPassword', newPassword);
    formData.append('code', code);

    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const msg =
        data?.message?.[0] || data?.error || 'Failed to change password';
      console.error('❌ Change password failed:', msg);
      throw new Error(msg);
    }

    // console.log('✅ Password changed successfully');
    return data;
  } catch (error) {
    console.error('❌ changePassword error:', error);
    throw error;
  }
}

/**
 * Update password for authenticated user
 * @param request - Current and new password
 * @returns Update result
 */
export async function updatePassword(
  request: UpdatePasswordRequest
): Promise<UpdatePasswordResponse> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userDataStr = await AsyncStorage.getItem('userData');

    if (!token || !userDataStr) {
      throw new Error('User is not authenticated');
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.id;

    // console.log('🔑 Updating password for user:', userId);

    const requestBody = {
      ...request,
      userId: userId,
    };

    const response = await fetch(`${API_URL}/auth/update-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const msg =
        data?.message?.[0] || data?.error || 'Failed to update password';
      console.error('❌ Update password failed:', msg);
      throw new Error(msg);
    }

    // console.log('✅ Password updated successfully');
    return data;
  } catch (error) {
    console.error('❌ updatePassword error:', error);
    throw error;
  }
}
