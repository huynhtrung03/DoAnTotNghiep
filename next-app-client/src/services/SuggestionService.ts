// Removed axios import
const API_URL = "/api/suggestion";

export interface UserPreferenceProfile {
  userLat: number;
  userLng: number;
  avgPrice: number;
  avgArea: number;
  avgCapacity: number;
  avgLen: number;
  avgWid: number;
  favConvenientIds: string[];
}

export interface CombinedUserProfiles {
  favoriteBasedProfile: UserPreferenceProfile | null;
  viewHistoryBasedProfile: UserPreferenceProfile | null;
}

export const getUserSimilarityProfile = async (userId: string): Promise<CombinedUserProfiles | null> => {
  try {
    const url = new URL(API_URL, window.location.origin);
    url.searchParams.append("userId", userId);
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching user similarity profile:", error);
    return null;
  }
};
