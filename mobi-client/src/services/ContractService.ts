import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config/Constant';

export interface BillData {
  id: string;
  contractId: string;
  month: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  paidDate?: string;
  electricityUsage?: number;
  waterUsage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContractData {
  id: string;
  roomId: string;
  tenantId: string;
  landlordId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  status: number; // 0: active, 1: expired, 2: terminated
  contractImageUrl?: string;
  bills?: BillData[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedContractResponse {
  content: ContractData[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

const BASE_URL = `${API_URL}/contracts`;

/**
 * Get authentication headers with token
 */
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication required. Please login again.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const ContractService = {
  /**
   * Get contracts by tenant ID
   */
  async getByTenant(tenantId: string): Promise<ContractData[]> {
    try {
      console.log('🔍 Fetching contracts for tenant:', tenantId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/tenant/${tenantId}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch contracts error:', errorText);
        throw new Error(`Failed to fetch contracts: ${response.status}`);
      }

      const contracts = await response.json();
      console.log('✅ Contracts fetched:', contracts.length);
      return contracts;
    } catch (error) {
      console.error('💥 getByTenant error:', error);
      throw error;
    }
  },

  /**
   * Get contracts by landlord ID with pagination
   */
  async getByLandlord(
    landlordId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedContractResponse> {
    try {
      console.log('🔍 Fetching contracts for landlord:', landlordId, `page=${page}, size=${size}`);
      
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${BASE_URL}/landlord/${landlordId}?page=${page}&size=${size}`,
        {
          method: 'GET',
          headers,
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch contracts error:', errorText);
        throw new Error(`Failed to fetch contracts: ${response.status}`);
      }

      const contracts = await response.json();
      console.log('✅ Contracts fetched:', contracts.content?.length || 0);
      return contracts;
    } catch (error) {
      console.error('💥 getByLandlord error:', error);
      throw error;
    }
  },

  /**
   * Get contracts by room ID
   */
  async getByRoom(roomId: string): Promise<ContractData[]> {
    try {
      console.log('🔍 Fetching contracts for room:', roomId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/room/${roomId}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch contracts error:', errorText);
        throw new Error(`Failed to fetch contracts: ${response.status}`);
      }

      const contracts = await response.json();
      console.log('✅ Contracts fetched:', contracts.length);
      return contracts;
    } catch (error) {
      console.error('💥 getByRoom error:', error);
      throw error;
    }
  },

  /**
   * Get contract by ID
   */
  async getById(contractId: string): Promise<ContractData> {
    try {
      console.log('🔍 Fetching contract:', contractId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/${contractId}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch contract error:', errorText);
        throw new Error(`Failed to fetch contract: ${response.status}`);
      }

      const contract = await response.json();
      console.log('✅ Contract fetched:', contract);
      return contract;
    } catch (error) {
      console.error('💥 getById error:', error);
      throw error;
    }
  },

  /**
   * Get contracts by status
   */
  async getByStatus(status: number): Promise<ContractData[]> {
    try {
      console.log('🔍 Fetching contracts with status:', status);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/status/${status}`, {
        method: 'GET',
        headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch contracts error:', errorText);
        throw new Error(`Failed to fetch contracts: ${response.status}`);
      }

      const contracts = await response.json();
      console.log('✅ Contracts fetched:', contracts.length);
      return contracts;
    } catch (error) {
      console.error('💥 getByStatus error:', error);
      throw error;
    }
  },

  /**
   * Create a new contract
   */
  async createContract(data: Partial<ContractData>): Promise<ContractData> {
    try {
      console.log('📝 Creating contract:', data);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create contract error:', errorText);
        throw new Error(`Failed to create contract: ${response.status}`);
      }

      const contract = await response.json();
      console.log('✅ Contract created:', contract);
      return contract;
    } catch (error) {
      console.error('💥 createContract error:', error);
      throw error;
    }
  },

  /**
   * Update a contract
   */
  async updateContract(
    contractId: string,
    data: Partial<ContractData>
  ): Promise<ContractData> {
    try {
      console.log('📝 Updating contract:', contractId, data);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/${contractId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update contract error:', errorText);
        throw new Error(`Failed to update contract: ${response.status}`);
      }

      const contract = await response.json();
      console.log('✅ Contract updated:', contract);
      return contract;
    } catch (error) {
      console.error('💥 updateContract error:', error);
      throw error;
    }
  },

  /**
   * Export bills to PDF/Excel
   */
  async exportBills(
    contractId: string,
    fromMonth: string,
    toMonth: string
  ): Promise<Blob> {
    try {
      console.log('📥 Exporting bills:', { contractId, fromMonth, toMonth });
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `${API_URL}/contracts/${contractId}/bills/export?fromMonth=${fromMonth}&toMonth=${toMonth}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to export bills: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('✅ Bills exported');
      return blob;
    } catch (error) {
      console.error('💥 exportBills error:', error);
      throw error;
    }
  },

  /**
   * Delete a contract
   */
  async deleteContract(contractId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting contract:', contractId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/${contractId}`, {
        method: 'DELETE',
        headers,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete contract error:', errorText);
        throw new Error(errorText || `Failed to delete contract: ${response.status}`);
      }

      console.log('✅ Contract deleted');
    } catch (error) {
      console.error('💥 deleteContract error:', error);
      throw error;
    }
  },

  /**
   * Upload contract image (React Native with expo-image-picker)
   */
  async uploadContractImage(
    contractId: string,
    fileUri: string,
    fileName: string = 'contract-image.jpg',
    fileType: string = 'image/jpeg'
  ): Promise<ContractData> {
    try {
      console.log('📤 Uploading contract image:', { contractId, fileName });
      
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);

      const response = await fetch(`${API_URL}/contracts/${contractId}/image`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload image error:', errorText);
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const contract = await response.json();
      console.log('✅ Contract image uploaded:', contract);
      return contract;
    } catch (error) {
      console.error('💥 uploadContractImage error:', error);
      throw error;
    }
  },
};