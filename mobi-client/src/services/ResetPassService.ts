import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseApiClient } from './api/BaseApiClient';

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
 * Gui yeu cau dat lai mat khau qua email
 * @param email - Dia chi email cua nguoi dung
 * @returns Thong bao ket qua
 */
export async function resetPassword(email: string): Promise<ResetPasswordResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);

    return await BaseApiClient.post<ResetPasswordResponse>('/auth/reset-password', formData, 'multipart/form-data');
  } catch (error) {
    console.error('Loi gui yeu cau dat lai mat khau:', error);
    throw error;
  }
}

/**
 * Xac minh ma dat lai gui den email
 * @param email - Dia chi email cua nguoi dung
 * @param code - Ma xac minh tu email
 * @returns Ket qua xac minh
 */
export async function verifyResetCode(
  email: string,
  code: string
): Promise<VerifyCodeResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('code', code);

    return await BaseApiClient.post<VerifyCodeResponse>('/auth/verify-reset-code', formData, 'multipart/form-data');
  } catch (error) {
    console.error('Loi xac minh ma dat lai:', error);
    throw error;
  }
}

/**
 * Doi mat khau voi ma da xac minh
 * @param email - Dia chi email cua nguoi dung
 * @param newPassword - Mat khau moi
 * @param code - Ma dat lai da xac minh
 * @returns Ket qua doi mat khau
 */
export async function changePassword(
  email: string,
  newPassword: string,
  code: string
): Promise<ChangePasswordResponse> {
  try {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('newPassword', newPassword);
    formData.append('code', code);

    return await BaseApiClient.post<ChangePasswordResponse>('/auth/change-password', formData, 'multipart/form-data');
  } catch (error) {
    console.error('Loi doi mat khau:', error);
    throw error;
  }
}

/**
 * Cap nhat mat khau cho nguoi dung da xac thuc
 * @param request - Mat khau hien tai va moi
 * @returns Ket qua cap nhat
 */
export async function updatePassword(
  request: UpdatePasswordRequest
): Promise<UpdatePasswordResponse> {
  try {
    const userDataStr = await AsyncStorage.getItem('userData');

    if (!userDataStr) {
      throw new Error('Khong tim thay thong tin nguoi dung');
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.id;

    const requestBody = {
      ...request,
      userId: userId,
    };

    return await BaseApiClient.patch<UpdatePasswordResponse>('/auth/update-password', requestBody);
  } catch (error) {
    console.error('Loi cap nhat mat khau:', error);
    throw error;
  }
}
