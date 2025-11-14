/**
 * ===== TYPES CHO MY CONTRACTS SCREEN =====
 * Quản lý hợp đồng của người dùng (tenant)
 */

// Import ContractData từ service (source of truth)
import { ContractData as ServiceContractData } from '../../../../services/ContractService';

// Trạng thái hợp đồng (giống với service)
export type ContractStatus = 0 | 1 | 2 | 3;
// 0: Active (Đang hoạt động)
// 1: Terminated (Đã kết thúc)
// 2: Expired (Đã hết hạn)
// 3: Pending (Chờ xử lý)

// Extended contract với thông tin hiển thị (populated data)
export interface ContractDisplayData {
  id: string;
  roomId: string;
  tenantId: string;
  landlordId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount: number;
  status: ContractStatus; // Override với type cụ thể hơn
  contractImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Extended fields
  roomTitle?: string;
  landlordName?: string;
  contractName?: string;
  tenantName?: string;
}

// Re-export ServiceContractData nếu cần
export type { ServiceContractData as ContractData };

// Map trạng thái
export interface StatusInfo {
  text: string;
  color: string;
}

export const statusMap: Record<ContractStatus, StatusInfo> = {
  0: { text: 'Đang thuê', color: '#52c41a' },      // Green
  1: { text: 'Đã kết thúc', color: '#f5222d' },    // Red
  2: { text: 'Hết hạn', color: '#fa8c16' },        // Orange
  3: { text: 'Chờ xử lý', color: '#1890ff' },      // Blue
};
