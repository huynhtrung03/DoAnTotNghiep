import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './Constant';
import { ContractData, BillData } from '../types/types';
import { getFullName } from './ProfileService';
import { BaseApiClient } from './api/BaseApiClient';

interface PaginatedContractResponse {
  content: ContractData[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

/**
 * Giải quyết tên cho hợp đồng bằng cách lấy từ profile service nếu cần
 */
const resolveContractNames = async (contract: ContractData): Promise<ContractData> => {
  const resolvedContract = { ...contract };

  // Giải quyết tên người thuê nếu là ID hoặc bắt đầu bằng #
  if (!resolvedContract.tenantName || resolvedContract.tenantName.startsWith('#')) {
    try {
      const tenantName = await getFullName(resolvedContract.tenantId);
      resolvedContract.tenantName = tenantName || `Tenant ${resolvedContract.tenantId}`;
    } catch (error) {
      console.warn('Không thể lấy tên người thuê:', error);
      resolvedContract.tenantName = `Tenant ${resolvedContract.tenantId}`;
    }
  }

  // Giải quyết tên chủ nhà nếu là ID hoặc bắt đầu bằng #
  if (!resolvedContract.landlordName || resolvedContract.landlordName.startsWith('#')) {
    try {
      const landlordName = await getFullName(resolvedContract.landlordId);
      resolvedContract.landlordName = landlordName || `Landlord ${resolvedContract.landlordId}`;
    } catch (error) {
      console.warn('Không thể lấy tên chủ nhà:', error);
      resolvedContract.landlordName = `Landlord ${resolvedContract.landlordId}`;
    }
  }

  return resolvedContract;
};

export const ContractService = {
  /**
   * Lấy hợp đồng theo ID người thuê
   */
  async getByTenant(tenantId: string): Promise<ContractData[]> {
    try {
      console.log('Đang lấy hợp đồng cho người thuê:', tenantId);

      const contracts = await BaseApiClient.get<ContractData[]>(`/contracts/tenant/${tenantId}`);
      console.log('Đã lấy hợp đồng:', contracts.length);

      // Giải quyết tên cho mỗi hợp đồng
      const resolvedContracts = await Promise.all(contracts.map(resolveContractNames));
      return resolvedContracts;
    } catch (error) {
      console.error('Lỗi getByTenant:', error);
      throw error;
    }
  },

  /**
   * Lấy hợp đồng theo ID chủ nhà với phân trang
   */
  async getByLandlord(
    landlordId: string,
    page: number = 0,
    size: number = 10
  ): Promise<PaginatedContractResponse> {
    try {
      console.log('Đang lấy hợp đồng cho chủ nhà:', landlordId, `page=${page}, size=${size}`);

      const contractsResponse = await BaseApiClient.get<PaginatedContractResponse>(
        `/contracts/landlord/${landlordId}`,
        { page, size }
      );
      console.log('Đã lấy hợp đồng:', contractsResponse.content?.length || 0);

      // Giải quyết tên cho mỗi hợp đồng
      if (contractsResponse.content && Array.isArray(contractsResponse.content)) {
        contractsResponse.content = await Promise.all(
          contractsResponse.content.map(resolveContractNames)
        );
      }

      return contractsResponse;
    } catch (error) {
      console.error('Lỗi getByLandlord:', error);
      throw error;
    }
  },

  /**
   * Lấy hợp đồng theo ID phòng
   */
  async getByRoom(roomId: string): Promise<ContractData[]> {
    try {
      console.log('Đang lấy hợp đồng cho phòng:', roomId);

      const contracts = await BaseApiClient.get<ContractData[]>(`/contracts/room/${roomId}`);
      console.log('Đã lấy hợp đồng:', contracts.length);

      // Giải quyết tên cho mỗi hợp đồng
      const resolvedContracts = await Promise.all(contracts.map(resolveContractNames));
      return resolvedContracts;
    } catch (error) {
      console.error('Lỗi getByRoom:', error);
      throw error;
    }
  },

  /**
   * Lấy hợp đồng theo ID
   */
  async getById(contractId: string): Promise<ContractData> {
    try {
      console.log('Đang lấy hợp đồng:', contractId);

      const contract = await BaseApiClient.get<ContractData>(`/contracts/${contractId}`);
      console.log('Đã lấy hợp đồng:', contract);

      // Giải quyết tên nếu cần
      const resolvedContract = await resolveContractNames(contract);
      return resolvedContract;
    } catch (error) {
      console.error('Lỗi getById:', error);
      throw error;
    }
  },

  /**
   * Lấy hợp đồng theo trạng thái
   */
  async getByStatus(status: number): Promise<ContractData[]> {
    try {
      console.log('Đang lấy hợp đồng với trạng thái:', status);

      const contracts = await BaseApiClient.get<ContractData[]>(`/contracts/status/${status}`);
      console.log('Đã lấy hợp đồng:', contracts.length);

      // Giải quyết tên cho mỗi hợp đồng
      const resolvedContracts = await Promise.all(contracts.map(resolveContractNames));
      return resolvedContracts;
    } catch (error) {
      console.error('Lỗi getByStatus:', error);
      throw error;
    }
  },

  /**
   * Tạo hợp đồng mới
   */
  async createContract(data: Partial<ContractData>): Promise<ContractData> {
    try {
      console.log('Đang tạo hợp đồng:', data);

      const contract = await BaseApiClient.post<ContractData>('/contracts', data);
      console.log('Đã tạo hợp đồng:', contract);

      // Giải quyết tên cho hợp đồng mới
      const resolvedContract = await resolveContractNames(contract);
      return resolvedContract;
    } catch (error) {
      console.error('Lỗi createContract:', error);
      throw error;
    }
  },

  /**
   * Cập nhật hợp đồng
   */
  async updateContract(
    contractId: string,
    data: Partial<ContractData>
  ): Promise<ContractData> {
    try {
      console.log('Đang cập nhật hợp đồng:', contractId, data);

      const contract = await BaseApiClient.put<ContractData>(`/contracts/${contractId}`, data);
      console.log('Đã cập nhật hợp đồng:', contract);

      // Giải quyết tên cho hợp đồng đã cập nhật
      const resolvedContract = await resolveContractNames(contract);
      return resolvedContract;
    } catch (error) {
      console.error('Lỗi updateContract:', error);
      throw error;
    }
  },

  /**
   * Xuất hóa đơn ra PDF/Excel
   */
  async exportBills(
    contractId: string,
    fromMonth: string,
    toMonth: string
  ): Promise<Blob> {
    try {
      console.log('Đang xuất hóa đơn:', { contractId, fromMonth, toMonth });

      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Cần xác thực');
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

      console.log('Trạng thái phản hồi:', response.status);

      if (!response.ok) {
        throw new Error(`Không thể xuất hóa đơn: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Đã xuất hóa đơn');
      return blob;
    } catch (error) {
      console.error('Lỗi exportBills:', error);
      throw error;
    }
  },

  /**
   * Xóa hợp đồng
   */
  async deleteContract(contractId: string): Promise<void> {
    try {
      console.log('Đang xóa hợp đồng:', contractId);

      await BaseApiClient.delete<void>(`/contracts/${contractId}`);
      console.log('Đã xóa hợp đồng');
    } catch (error) {
      console.error('Lỗi deleteContract:', error);
      throw error;
    }
  },

  /**
   * Upload ảnh hợp đồng (React Native với expo-image-picker)
   */
  async uploadContractImage(
    contractId: string,
    fileUri: string,
    fileName: string = 'contract-image.jpg',
    fileType: string = 'image/jpeg'
  ): Promise<ContractData> {
    try {
      console.log('Đang upload ảnh hợp đồng:', { contractId, fileName });

      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        type: fileType,
        name: fileName,
      } as any);

      const contract = await BaseApiClient.uploadFile<ContractData>(`/contracts/${contractId}/image`, formData);
      console.log('Đã upload ảnh hợp đồng:', contract);

      // Giải quyết tên cho hợp đồng đã cập nhật
      const resolvedContract = await resolveContractNames(contract);
      return resolvedContract;
    } catch (error) {
      console.error('Lỗi uploadContractImage:', error);
      throw error;
    }
  },
};