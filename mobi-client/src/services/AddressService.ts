import { BaseApiClient } from './api/BaseApiClient';

/**
 * Fetch all provinces
 * @returns Promise<Province[]>
 */
export async function getProvinces() {
  try {
    console.log('📍 Fetching provinces...');
    const response = await BaseApiClient.get('/provinces');
    
    // Handle flexible response format
    let data: any[] = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (response && typeof response === 'object' && 'data' in response) {
      const responseData = (response as any).data;
      data = Array.isArray(responseData) ? responseData : [];
    } else if (response && typeof response === 'object') {
      data = [response];
    }
    
    console.log('✅ Provinces fetched successfully:', data.length);
    return data;
  } catch (error: any) {
    console.error('❌ Failed to fetch provinces:', error.message);
    throw new Error(error.message || 'Failed to fetch provinces');
  }
}

/**
 * Fetch districts by province ID
 * @param provinceId - The province ID
 * @returns Promise<District[]>
 */
export async function getDistricts(provinceId: string) {
  try {
    console.log(`📍 Fetching districts for province: ${provinceId}`);
    const response = await BaseApiClient.get(`/districts/${provinceId}`);
    
    // Handle flexible response format
    let data: any[] = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (response && typeof response === 'object' && 'data' in response) {
      const responseData = (response as any).data;
      data = Array.isArray(responseData) ? responseData : [];
    } else if (response && typeof response === 'object') {
      data = [response];
    }
    
    console.log(`✅ Districts fetched successfully:`, data.length);
    return data;
  } catch (error: any) {
    console.error(`❌ Failed to fetch districts for province ${provinceId}:`, error.message);
    throw new Error(error.message || 'Failed to fetch districts');
  }
}

/**
 * Fetch wards by district ID
 * @param districtId - The district ID
 * @returns Promise<Ward[]>
 */
export async function getWards(districtId: string) {
  try {
    console.log(`📍 Fetching wards for district: ${districtId}`);
    const response = await BaseApiClient.get(`/wards/${districtId}`);
    
    // Handle flexible response format
    let data: any[] = [];
    if (Array.isArray(response)) {
      data = response;
    } else if (response && typeof response === 'object' && 'data' in response) {
      const responseData = (response as any).data;
      data = Array.isArray(responseData) ? responseData : [];
    } else if (response && typeof response === 'object') {
      data = [response];
    }
    
    console.log(`✅ Wards fetched successfully:`, data.length);
    return data;
  } catch (error: any) {
    console.error(`❌ Failed to fetch wards for district ${districtId}:`, error.message);
    throw new Error(error.message || 'Failed to fetch wards');
  }
}
