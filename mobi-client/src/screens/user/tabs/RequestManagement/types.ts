/**
 * ===== TYPES CHO REQUEST MANAGEMENT SCREEN =====
 * Quản lý yêu cầu của người dùng (user/tenant)
 */

// Trạng thái yêu cầu
export type RequestStatus = 0 | 1 | 2;
// 0: Chưa xử lý (Not Processed)
// 1: Đã hoàn thành (Completed)
// 2: Đã từ chối (Rejected)

// Form values cho modal chỉnh sửa
export interface RequestFormValues {
  roomName: string;
  requestDescription: string;
}
