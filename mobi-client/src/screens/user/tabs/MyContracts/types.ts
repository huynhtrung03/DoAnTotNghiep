/**
 * ===== TYPES CHO MY CONTRACTS SCREEN =====
 * Quản lý hợp đồng của người dùng (tenant)
 */

// Trạng thái hợp đồng (giống với service)
export type ContractStatus = 0 | 1 | 2 | 3;
// 0: Active (Đang hoạt động)
// 1: Terminated (Đã kết thúc)
// 2: Expired (Đã hết hạn)
// 3: Pending (Chờ xử lý)

// Extended contract với thông tin hiển thị (populated data)
export interface ContractDisplayData {
  id: string;
  contractName: string;
  roomId: string;
  roomTitle: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  landlordId: string;
  landlordName: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  monthlyRent: number;
  status: ContractStatus; // 0: active, 1: terminated, 2: expired, 3: pending
  contractImage?: string;
  bills: any[]; // Simplified for display
  residents?: any[];
  landlordPaymentInfo?: any;
}

// Re-export BaseContractData nếu cần
// export type { BaseContractData as ContractData };

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
