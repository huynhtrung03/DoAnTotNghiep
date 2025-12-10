/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from "./Constant";
import { UserSearchPreferences } from "../types/types";
import { BaseApiClient } from "./api/BaseApiClient";

// ==================== Profile APIs ====================

/**
 * Lay thong tin profile theo ID
 */
export async function getProfileById(profileId: string) {
  try {
    return await BaseApiClient.get<any>(`/profile/${profileId}`);
  } catch (error: any) {
    if (error.message.includes('400') || error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

/**
 * Lay ten day du theo ID profile
 */
export async function getFullName(profileId: string) {
  return await BaseApiClient.get<any>(`/profile/getname/${profileId}`);
}

/**
 * Cap nhat profile voi avatar tuy chon
 */
export async function updateProfileWithAvatar(
  profileId: string,
  profileData: {
    fullName: string;
    email: string;
    phoneNumber?: string | null;
    bankName?: string | null;
    binCode?: string | null;
    bankNumber?: string | null;
    accoutHolderName?: string | null;
  },
  avatarFile?: {
    uri: string;
    name: string;
    type: string;
  } | null
) {
  const formData = new FormData();

  // Them avatar neu co
  if (avatarFile) {
    formData.append('avatar', avatarFile as any);
  }

  // Them du lieu profile voi profileId
  const profilePayload = {
    id: profileId,
    ...profileData,
  };

  formData.append('profile', JSON.stringify(profilePayload));

  return await BaseApiClient.uploadFile<any>('/profile/update', formData);
}

// ==================== Bank APIs ====================

/**
 * Lay danh sach ngan hang tu VietQR API
 */
export async function getBanks() {
  const response = await fetch("https://api.vietqr.io/v2/banks", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Khong the lay danh sach ngan hang");
  }

  const result = await response.json();
  return Array.isArray(result.data) ? result.data : [];
}

/**
 * Kiem tra nguoi dung co tai khoan ngan hang khong
 * 
 * Fallback: Nếu API lỗi (HTTP 500 hoặc network error), trả về false
 * Điều này cho phép UI tiếp tục hoạt động bình thường
 */
export async function isHaveBankAccount() {
  try {
    const result = await BaseApiClient.get<any>('/profile/ishavebank');
    // API có thể trả về boolean hoặc object
    return typeof result === 'boolean' ? result : (result?.hasBankAccount ?? false);
  } catch (error: any) {
    console.warn('⚠️ [ProfileService] isHaveBankAccount error (HTTP 500 likely):', error?.message);
    // Fallback: Trả về false (mặc định user không có tài khoản ngân hàng)
    return false;
  }
}

// ==================== Preferences APIs ====================

/**
 * Cap nhat tuy chon tim kiem cua nguoi dung
 */
export async function updateUserSearchPreferences(
  userId: string,
  preferences: UserSearchPreferences
) {
  return await BaseApiClient.post<any>(`/profile/${userId}/preferences`, preferences);
}

/**
 * Cap nhat tuy chon dia chi khop
 */
export async function updateMatchingAddressPreferences(
  userId: string,
  preferences: any
) {
  return await BaseApiClient.post<any>('/profile/matching-address', { userId, ...preferences });
}

/**
 * Lay tuy chon dia chi khop cua nguoi dung
 */
export async function getUserMatchingAddressPreferences() {
  return await BaseApiClient.get<any>('/profile/matching-address');
}

// ==================== Notification APIs ====================

/**
 * Thiet lap tuy chon thong bao email
 */
export async function setEmailNotifications(enabled: boolean) {
  return await BaseApiClient.patch<any>('/profile/email-notifications', { enabled });
}

/**
 * Lay tuy chon thong bao email
 * 
 * Fallback: Nếu API lỗi (Profile not found hoặc network error), trả về { emailNotifications: false }
 * Điều này cho phép UI tiếp tục hoạt động bình thường
 */
export async function getEmailNotifications(userId: string) {
  try {
    const data = await BaseApiClient.get<any>('/profile/email-notifications', { userId });
    const raw = data?.emailNotifications;

    // Chuyen doi cac dai dien backend: boolean, number (1/0), string
    let emailNotifications = false;
    if (typeof raw === "boolean") {
      emailNotifications = raw;
    } else if (typeof raw === "number") {
      emailNotifications = raw === 1;
    } else if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase();
      emailNotifications =
        normalized === "1" ||
        normalized === "true" ||
        normalized === "yes" ||
        normalized === "on";
    } else if (raw == null) {
      emailNotifications = false;
    } else {
      emailNotifications = Boolean(raw);
    }

    return { emailNotifications };
  } catch (error: any) {
    console.warn('⚠️ [ProfileService] getEmailNotifications error (Profile not found likely):', error?.message);
    // Fallback: Trả về false (mặc định tắt thông báo email)
    return { emailNotifications: false };
  }
}
