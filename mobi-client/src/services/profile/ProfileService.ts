/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_URL } from "../config/Constant";
import { UserSearchPreferences } from "../../types/types";

/**
 * Helper function to extract error message from response
 */
async function getErrorMessage(response: Response, defaultMsg: string): Promise<string> {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const error = await response.json();
      return Array.isArray(error.message)
        ? error.message[0]
        : error.message || error.error || defaultMsg;
    } else {
      const text = await response.text();
      return text || defaultMsg;
    }
  } catch (e) {
    console.error("Error parsing response:", e);
    return defaultMsg;
  }
}

// ==================== Profile APIs ====================

/**
 * Get profile by ID
 * @param profileId - Profile ID
 * @param accessToken - JWT access token
 */
export async function getProfileById(profileId: string, accessToken: string) {
  const response = await fetch(`${API_URL}/profile/${profileId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 400 || response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to fetch profile");
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Get full name by profile ID
 * @param profileId - Profile ID
 * @param accessToken - JWT access token
 */
export async function getFullName(profileId: string, accessToken: string) {
  const response = await fetch(`${API_URL}/profile/getname/${profileId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to fetch full name");
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Update profile with optional avatar
 * @param profileId - Profile ID
 * @param accessToken - JWT access token
 * @param profileData - Profile data to update
 * @param avatarFile - Optional avatar file
 */
export async function updateProfileWithAvatar(
  profileId: string,
  accessToken: string,
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

  // Add avatar if provided
  if (avatarFile) {
    formData.append('avatar', avatarFile as any);
  }

  // Add profile data with profileId
  const profilePayload = {
    id: profileId,
    ...profileData,
  };

  formData.append('profile', JSON.stringify(profilePayload));

  const response = await fetch(`${API_URL}/profile/update`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      // Don't set Content-Type, let browser set it with boundary for multipart/form-data
    },
    body: formData,
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to update profile");
    throw new Error(errorMsg);
  }

  return response.json();
}

// ==================== Bank APIs ====================

/**
 * Get list of banks from VietQR API
 */
export async function getBanks() {
  const response = await fetch("https://api.vietqr.io/v2/banks", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch banks");
  }

  const result = await response.json();
  return Array.isArray(result.data) ? result.data : [];
}

/**
 * Check if user has bank account
 * @param accessToken - JWT access token
 */
export async function isHaveBankAccount(accessToken: string) {
  const response = await fetch(`${API_URL}/profile/ishavebank`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to check bank account");
    throw new Error(errorMsg);
  }

  return response.json();
}

// ==================== Preferences APIs ====================

/**
 * Update user search preferences
 * @param userId - User ID
 * @param preferences - Search preferences
 * @param accessToken - JWT access token
 */
export async function updateUserSearchPreferences(
  userId: string,
  preferences: UserSearchPreferences,
  accessToken: string
) {
  const response = await fetch(`${API_URL}/profile/${userId}/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to update search preferences");
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Update matching address preferences
 * @param userId - User ID
 * @param preferences - Address preferences
 * @param accessToken - JWT access token
 */
export async function updateMatchingAddressPreferences(
  userId: string,
  preferences: any,
  accessToken: string
) {
  const response = await fetch(`${API_URL}/profile/matching-address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ userId, ...preferences }),
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to update preferences");
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Get user matching address preferences
 * @param accessToken - JWT access token
 */
export async function getUserMatchingAddressPreferences(accessToken: string) {
  const response = await fetch(`${API_URL}/profile/matching-address`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to fetch preferences");
    throw new Error(errorMsg);
  }

  return response.json();
}

// ==================== Notification APIs ====================

/**
 * Set email notifications preference
 * @param enabled - Enable or disable email notifications
 * @param accessToken - JWT access token
 */
export async function setEmailNotifications(enabled: boolean, accessToken: string) {
  const response = await fetch(`${API_URL}/profile/email-notifications`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to update email notifications");
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Get email notifications preference
 * @param userId - User ID
 * @param accessToken - JWT access token
 */
export async function getEmailNotifications(userId: string, accessToken: string) {
  const response = await fetch(
    `${API_URL}/profile/email-notifications?userId=${userId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorMsg = await getErrorMessage(response, "Failed to fetch email notifications");
    throw new Error(errorMsg);
  }

  const data = await response.json();
  const raw = data?.emailNotifications;

  // Normalize various backend representations: boolean, number (1/0), string
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
}
