import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface ResidentData {
  id?: string;
  fullName: string;
  idNumber: string;
  relationship: string;
  startDate: string;
  endDate?: string;
  note?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  contractId?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = `${API_URL}/contracts`;

/**
 * Get authentication headers
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const ResidentService = {
  /**
   * Get all residents for a specific contract
   */
  async getByContract(contractId: string): Promise<ResidentData[]> {
    try {
      const headers = await getAuthHeaders();
      console.log('📋 Fetching residents for contract:', contractId);

      const response = await fetch(`${BASE_URL}/${contractId}/residents`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch residents:', errorText);
        throw new Error('Failed to fetch residents');
      }

      const residents = await response.json();
      console.log('✅ Residents fetched:', residents.length);
      return residents;
    } catch (error) {
      console.error('❌ getByContract error:', error);
      throw error;
    }
  },

  /**
   * Get all residents for a specific landlord
   */
  async getByLandlord(landlordId: string): Promise<ResidentData[]> {
    try {
      const headers = await getAuthHeaders();
      console.log('📋 Fetching residents for landlord:', landlordId);

      const response = await fetch(
        `${API_URL}/temporary-residences/landlord/${landlordId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch residents by landlord:', errorText);
        throw new Error('Failed to fetch residents by landlord');
      }

      const residents = await response.json();
      console.log('✅ Landlord residents fetched:', residents.length);
      return residents;
    } catch (error) {
      console.error('❌ getByLandlord error:', error);
      throw error;
    }
  },

  /**
   * Get all residents for a specific tenant
   */
  async getByTenant(tenantId: string): Promise<ResidentData[]> {
    try {
      const headers = await getAuthHeaders();
      console.log('📋 Fetching residents for tenant:', tenantId);

      const response = await fetch(
        `${API_URL}/temporary-residences/tenant/${tenantId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch residents by tenant:', errorText);
        throw new Error('Failed to fetch residents by tenant');
      }

      const residents = await response.json();
      console.log('✅ Tenant residents fetched:', residents.length);
      return residents;
    } catch (error) {
      console.error('❌ getByTenant error:', error);
      throw error;
    }
  },

  /**
   * Get specific resident by ID
   */
  async getById(contractId: string, residentId: string): Promise<ResidentData> {
    try {
      const headers = await getAuthHeaders();
      console.log('📋 Fetching resident:', residentId);

      const response = await fetch(
        `${BASE_URL}/${contractId}/residents/${residentId}`,
        {
          method: 'GET',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch resident:', errorText);
        throw new Error('Failed to fetch resident');
      }

      const resident = await response.json();
      console.log('✅ Resident fetched:', resident.id);
      return resident;
    } catch (error) {
      console.error('❌ getById error:', error);
      throw error;
    }
  },

  /**
   * Create new resident with images
   */
  async createResident(
    contractId: string,
    residentData: Partial<ResidentData>,
    frontImageUri?: string,
    backImageUri?: string
  ): Promise<ResidentData> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('➕ Creating resident for contract:', contractId);

      const formData = new FormData();

      // Create JSON data blob
      const dataToSend = {
        fullName: residentData.fullName,
        idNumber: residentData.idNumber,
        relationship: residentData.relationship,
        startDate: residentData.startDate,
        endDate: residentData.endDate,
        note: residentData.note || '',
        status: residentData.status || 'PENDING',
        contractId: contractId,
      };

      console.log('📤 Resident data:', dataToSend);

      // In React Native, we can't create Blob, so send as JSON string
      formData.append('data', JSON.stringify(dataToSend));

      // Add images if provided (URIs from expo-image-picker)
      if (frontImageUri) {
        formData.append('frontImage', {
          uri: frontImageUri,
          type: 'image/jpeg',
          name: 'front-id.jpg',
        } as any);
      }

      if (backImageUri) {
        formData.append('backImage', {
          uri: backImageUri,
          type: 'image/jpeg',
          name: 'back-id.jpg',
        } as any);
      }

      const response = await fetch(`${BASE_URL}/${contractId}/residents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type for FormData in React Native
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', errorText);
        throw new Error('Failed to create resident');
      }

      const resident = await response.json();
      console.log('✅ Resident created:', resident.id);
      return resident;
    } catch (error) {
      console.error('❌ createResident error:', error);
      throw error;
    }
  },

  /**
   * Update existing resident with images
   */
  async updateResident(
    contractId: string,
    residentId: string,
    residentData: Partial<ResidentData>,
    frontImageUri?: string,
    backImageUri?: string
  ): Promise<ResidentData> {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('✏️ Updating resident:', residentId);

      const formData = new FormData();

      const dataToSend = {
        fullName: residentData.fullName,
        idNumber: residentData.idNumber,
        relationship: residentData.relationship,
        startDate: residentData.startDate,
        endDate: residentData.endDate,
        note: residentData.note || '',
        status: residentData.status || 'PENDING',
        contractId: contractId,
      };

      console.log('📤 Update data:', dataToSend);

      formData.append('data', JSON.stringify(dataToSend));

      // Add images if provided
      if (frontImageUri) {
        formData.append('frontImage', {
          uri: frontImageUri,
          type: 'image/jpeg',
          name: 'front-id.jpg',
        } as any);
      }

      if (backImageUri) {
        formData.append('backImage', {
          uri: backImageUri,
          type: 'image/jpeg',
          name: 'back-id.jpg',
        } as any);
      }

      const response = await fetch(
        `${BASE_URL}/${contractId}/residents/${residentId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', errorText);
        throw new Error('Failed to update resident');
      }

      const resident = await response.json();
      console.log('✅ Resident updated:', resident.id);
      return resident;
    } catch (error) {
      console.error('❌ updateResident error:', error);
      throw error;
    }
  },

  /**
   * Delete resident
   */
  async deleteResident(contractId: string, residentId: string): Promise<void> {
    try {
      const headers = await getAuthHeaders();
      console.log('🗑️ Deleting resident:', residentId);

      const response = await fetch(
        `${BASE_URL}/${contractId}/residents/${residentId}`,
        {
          method: 'DELETE',
          headers,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to delete resident:', errorText);
        throw new Error('Failed to delete resident');
      }

      console.log('✅ Resident deleted successfully');
    } catch (error) {
      console.error('❌ deleteResident error:', error);
      throw error;
    }
  },
};
