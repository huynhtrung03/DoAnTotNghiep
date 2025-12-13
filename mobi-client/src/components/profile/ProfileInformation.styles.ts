/**
 * Styles cho ProfileInformation Component và các sub-components
 * 
 * File này chứa tất cả các styles được sử dụng trong:
 * - ProfileInformation (main component)
 * - AvatarSection
 * - PersonalInfoSection
 * - BankSection
 * - NotificationsSection
 * - BankPickerModal
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // ======================
  // CONTAINER & LAYOUT
  // ======================
  
  // Container chính cho toàn bộ profile screen
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',  // Light gray background
  },

  // ScrollView container để có thể scroll khi content dài
  scrollContainer: {
    padding: 16,
  },

  // ======================
  // HEADER SECTION
  // ======================
  
  // Header chứa title và edit button
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  // Tiêu đề "Thông tin cá nhân"
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',  // Dark gray
  },

  // Nút "Chỉnh sửa" / "Hủy" / "Lưu"
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3B82F6',  // Blue
  },

  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Container cho nhóm nút "Hủy" và "Lưu" (khi đang edit)
  editButtonsGroup: {
    flexDirection: 'row',
    gap: 8,
  },

  // Nút "Hủy" (secondary button)
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',  // Light gray
  },

  cancelButtonText: {
    color: '#6B7280',  // Medium gray
    fontWeight: '600',
    fontSize: 14,
  },

  // Nút "Lưu" (primary button)
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#10B981',  // Green
  },

  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Nút đang trong trạng thái disabled (khi đang save)
  disabledButton: {
    opacity: 0.5,
  },

  // ======================
  // AVATAR SECTION
  // ======================
  
  // Container cho avatar section
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },

  // Wrapper cho avatar và edit button
  avatarWrapper: {
    position: 'relative',  // Để edit button có thể absolute position
  },

  // Avatar image (khi có ảnh)
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,  // Circle
    borderWidth: 4,
    borderColor: '#3B82F6',  // Blue border
  },

  // Avatar placeholder (khi chưa có ảnh)
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E7EB',  // Light gray
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#D1D5DB',  // Medium gray border
  },

  // Nút camera để thay đổi avatar
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3B82F6',  // Blue
    width: 40,
    height: 40,
    borderRadius: 20,  // Circle
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',  // White border để tách biệt với avatar
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Shadow cho Android
    elevation: 5,
  },

  // ======================
  // SECTION CONTAINERS
  // ======================
  
  // Container chung cho mỗi section (Personal Info, Address, Bank, Notifications)
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow cho iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Shadow cho Android
    elevation: 2,
  },

  // Header của mỗi section (icon + title)
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },

  // Title của section
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',  // Dark gray
  },

  // ======================
  // FORM FIELDS
  // ======================
  
  // Container cho mỗi input field
  fieldContainer: {
    marginBottom: 16,
  },

  // Label của input field
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',  // Dark gray
    marginBottom: 8,
  },

  // Label cho required field (có dấu * đỏ)
  requiredLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  // Dấu * màu đỏ cho required field
  requiredAsterisk: {
    color: '#EF4444',  // Red
  },

  // Input field
  input: {
    backgroundColor: '#F9FAFB',  // Light gray background
    borderWidth: 1,
    borderColor: '#D1D5DB',  // Medium gray border
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',  // Dark gray text
  },

  // Input field khi disabled (không edit mode)
  inputDisabled: {
    backgroundColor: '#F3F4F6',  // Darker gray
    color: '#6B7280',  // Medium gray text
  },

  // Input field có icon bên phải (như bank picker)
  inputWithIcon: {
    paddingRight: 40,  // Space cho icon
  },

  // Icon bên phải input field
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 40,  // Adjust based on label height
  },

  // ======================
  // ADDRESS SECTION
  // ======================
  
  // Container cho địa chỉ (read-only)
  addressContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },

  // Mỗi dòng trong địa chỉ (Tỉnh: ..., Quận: ...)
  addressRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  // Label trong address (Tỉnh:, Quận:)
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',  // Medium gray
    width: 80,  // Fixed width để align
  },

  // Value trong address (TP.HCM, Quận 1)
  addressValue: {
    fontSize: 14,
    color: '#1F2937',  // Dark gray
    flex: 1,
  },

  // Message khi chưa có địa chỉ
  noAddressText: {
    fontSize: 14,
    color: '#9CA3AF',  // Light gray
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // ======================
  // BANK SECTION
  // ======================
  
  // Badge "Đã xác thực" trong bank section
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D1FAE5',  // Light green
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },

  verifiedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',  // Green
  },

  // Warning khi chưa có thông tin ngân hàng
  noBankWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',  // Light yellow
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  noBankWarningText: {
    fontSize: 13,
    color: '#D97706',  // Dark yellow/orange
    flex: 1,
  },

  // ======================
  // NOTIFICATIONS SECTION
  // ======================
  
  // Container cho notification row (label + switch)
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  notificationTextContainer: {
    flex: 1,
    marginRight: 16,
  },

  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  notificationDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },

  // Loading indicator trong notification section
  notificationLoading: {
    marginLeft: 8,
  },

  // ======================
  // BANK PICKER MODAL
  // ======================
  
  // Overlay nền modal (màu đen mờ)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  // Container chính của modal
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',  // Chiếm tối đa 80% chiều cao màn hình
    paddingTop: 20,
  },

  // Header của modal
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // Nút đóng modal (X)
  modalCloseButton: {
    padding: 8,
  },

  // Search bar trong modal
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
  },

  // List container
  bankList: {
    paddingHorizontal: 20,
  },

  // Mỗi item trong danh sách ngân hàng
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  // Logo ngân hàng
  bankLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#F9FAFB',  // Placeholder background
  },

  // Thông tin ngân hàng (name + code)
  bankInfo: {
    flex: 1,
  },

  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },

  bankCode: {
    fontSize: 13,
    color: '#6B7280',
  },

  // Checkbox cho ngân hàng đã chọn
  bankCheckbox: {
    marginLeft: 8,
  },

  // Message khi không tìm thấy ngân hàng
  noBanksText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },

  // ======================
  // LOADING & ERROR STATES
  // ======================
  
  // Loading container (hiển thị khi đang load profile)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },

  // Error message
  errorText: {
    fontSize: 14,
    color: '#EF4444',  // Red
    marginTop: 4,
  },

  // Empty state message
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
