/**
 * Types và Interfaces cho Profile Components
 * 
 * File này chứa tất cả các type definitions được sử dụng
 * trong các components profile-related
 */

// Interface cho thông tin ngân hàng từ VietQR API
export interface Bank {
  id: number;           // ID ngân hàng
  name: string;         // Tên đầy đủ ngân hàng (VD: "Ngân hàng TMCP Ngoại Thương Việt Nam")
  code: string;         // Mã ngân hàng (VD: "ICB", "VCB")
  bin: string;          // Bank Identification Number (VD: "970436")
  shortName: string;    // Tên viết tắt (VD: "Vietcombank")
  logo: string;         // URL logo ngân hàng
  transferSupported: number;  // 1 = hỗ trợ chuyển khoản, 0 = không hỗ trợ
  lookupSupported: number;    // 1 = hỗ trợ tra cứu, 0 = không hỗ trợ
}

// Interface cho địa chỉ
export interface Address {
  id: string;
  street: string;       // Tên đường/số nhà
  ward: {
    id: number;
    name: string;       // Tên phường/xã
    district: {
      id: number;
      name: string;     // Tên quận/huyện
      province: {
        id: number;
        name: string;   // Tên tỉnh/thành phố
      };
    };
  };
}

// Interface cho thông tin profile đầy đủ
export interface UserProfile {
  id: string;                           // UUID của profile
  fullName: string;                     // Họ và tên
  email: string;                        // Email
  phoneNumber?: string;                 // Số điện thoại (optional)
  avatar?: string;                      // URL avatar (Cloudinary)
  bankName?: string;                    // Tên ngân hàng
  binCode?: string;                     // Mã BIN ngân hàng
  bankNumber?: string;                  // Số tài khoản ngân hàng
  accoutHolderName?: string;           // Tên chủ tài khoản (lưu ý: typo từ backend)
  address?: Address;                    // Địa chỉ đầy đủ (optional)
}

// Props cho ProfileInformation component chính
export interface ProfileInformationProps {
  userId: string;       // UUID của user hiện tại
  profileId: string;    // UUID của profile (thường trùng với userId)
  accessToken: string;  // JWT token để authenticate API calls
}

// Props cho AvatarSection component
export interface AvatarSectionProps {
  avatarUri: string | null;                         // URI của avatar hiện tại
  isEditing: boolean;                               // Có đang ở chế độ edit không
  onPickImage: () => void;                          // Callback khi chọn ảnh mới
}

// Props cho PersonalInfoSection component
export interface PersonalInfoSectionProps {
  fullName: string;                                 // Họ tên
  email: string;                                    // Email
  phoneNumber: string;                              // Số điện thoại
  isEditing: boolean;                               // Có đang edit không
  onChangeFullName: (text: string) => void;         // Callback thay đổi họ tên
  onChangeEmail: (text: string) => void;            // Callback thay đổi email
  onChangePhoneNumber: (text: string) => void;      // Callback thay đổi SĐT
}

// Props cho AddressSection component
export interface AddressSectionProps {
  address?: Address;    // Địa chỉ (optional vì user có thể chưa có địa chỉ)
}

// Props cho BankSection component
export interface BankSectionProps {
  hasBankAccount: boolean;                          // Đã xác thực ngân hàng chưa
  bankName: string;                                 // Tên ngân hàng
  binCode: string;                                  // Mã BIN
  bankNumber: string;                               // Số tài khoản
  accountHolderName: string;                        // Tên chủ TK
  isEditing: boolean;                               // Có đang edit không
  onChangeBankName: (text: string) => void;         // Callback thay đổi tên ngân hàng
  onChangeBinCode: (text: string) => void;          // Callback thay đổi BIN
  onChangeBankNumber: (text: string) => void;       // Callback thay đổi số TK
  onChangeAccountHolder: (text: string) => void;    // Callback thay đổi tên chủ TK
  onOpenBankPicker: () => void;                     // Callback mở modal chọn ngân hàng
}

// Props cho NotificationsSection component
export interface NotificationsSectionProps {
  emailNotificationsEnabled: boolean;               // Trạng thái bật/tắt email notifications
  loadingNotifications: boolean;                    // Đang load settings không
  onToggleNotifications: (value: boolean) => void;  // Callback khi toggle switch
}

// Props cho BankPickerModal component
export interface BankPickerModalProps {
  visible: boolean;                                 // Modal có đang hiển thị không
  banks: Bank[];                                    // Danh sách tất cả ngân hàng
  selectedBankBin: string;                         // BIN của ngân hàng đang chọn
  searchQuery: string;                              // Text search hiện tại
  onSearch: (text: string) => void;                 // Callback khi search
  onSelectBank: (bank: Bank) => void;               // Callback khi chọn ngân hàng
  onClose: () => void;                              // Callback khi đóng modal
}
