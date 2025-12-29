/**
 * ProfileInformation.functions.ts
 * 
 * File chứa tất cả các functions logic cho ProfileInformation component
 * Tách riêng để dễ đọc và maintain
 * 
 * Các functions bao gồm:
 * - loadProfile() - Load thông tin profile từ API
 * - handlePickImage() - Chọn ảnh mới cho avatar
 * - handleEdit() - Bắt đầu chế độ chỉnh sửa
 * - handleCancel() - Hủy chỉnh sửa
 * - handleSave() - Lưu thông tin đã chỉnh sửa
 */

import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  getProfileById,
  updateProfileWithAvatar,
} from '../services/ProfileService';
import { UserProfile } from '../components/profile/types';

/**
 * Interface cho parameters của các functions
 * Để type-safe khi sử dụng
 */
export interface FunctionParams {
  profileId: string;
  accessToken: string;
  userId: string;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setEditing: (editing: boolean) => void;
  setFullName: (name: string) => void;
  setEmail: (email: string) => void;
  setPhoneNumber: (phone: string) => void;
  setAvatarUri: (uri: string | null) => void;
  setNewAvatarFile: (file: any) => void;
  // Current values
  profile: UserProfile | null;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatarUri: string | null;
  newAvatarFile: any;
}

/**
 * FUNCTION 1: Load Profile Data
 * 
 * Load thông tin profile từ API và populate tất cả form fields
 */
export const createLoadProfile = (params: FunctionParams) => async () => {
  const { profileId, accessToken, setProfile, setLoading } = params;
  const { setFullName, setEmail, setPhoneNumber, setAvatarUri } = params;

  try {
    setLoading(true);
    
    // Gọi API để load profile
    const data = await getProfileById(profileId, accessToken);
    
    if (data) {
      // Lưu profile data
      setProfile(data);
      
      // Populate form fields với data từ API
      setFullName(data.fullName || '');
      setEmail(data.email || '');
      setPhoneNumber(data.phoneNumber || '');
      
      // Fix avatar URL - thêm Cloudinary base URL nếu chỉ có path
      let avatarUrl = data.avatar || null;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        avatarUrl = `https://res.cloudinary.com${avatarUrl}`;
      }
      setAvatarUri(avatarUrl);
    }
  } catch (error: any) {
    console.error('Error loading profile:', error);
    Alert.alert('Lỗi', 'Không thể tải thông tin profile: ' + error.message);
  } finally {
    setLoading(false);
  }
};

/**
 * FUNCTION 2: Load Banks List
 * 
 * Load danh sách tất cả ngân hàng từ VietQR API
 */
export const createLoadBanks = (params: FunctionParams) => async () => {
  const { setBanks } = params;

  try {
    // Gọi API VietQR để lấy danh sách ngân hàng
    const banksData = await getBanks();
    
    if (banksData && Array.isArray(banksData)) {
      setBanks(banksData);
    }
  } catch (error: any) {
    // Không log error cho VietQR API vì là external service
    // User vẫn có thể nhập thông tin ngân hàng manually
    setBanks([]);
  }
};

/**
 * FUNCTION 3: Check Bank Account Verification
 * 
 * Kiểm tra xem user đã xác thực tài khoản ngân hàng chưa
 */
export const createCheckBankAccount = (params: FunctionParams) => async () => {
  const { accessToken, setHasBankAccount } = params;

  try {
    // Gọi API để kiểm tra trạng thái xác thực
    const hasAccount = await isHaveBankAccount(accessToken);
    setHasBankAccount(hasAccount);
  } catch (error: any) {
    // Không log error vì API này có thể chưa được implement hoặc user chưa có profile
    // Chỉ set false và continue
    setHasBankAccount(false);
  }
};

/**
 * FUNCTION 4: Handle Pick Image
 * 
 * Mở image picker để chọn ảnh mới cho avatar
 */
export const createHandlePickImage = (params: FunctionParams) => async () => {
  const { setAvatarUri, setNewAvatarFile } = params;

  try {
    // Request permission để truy cập thư viện ảnh
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Thông báo', 'Bạn cần cấp quyền truy cập thư viện ảnh để thay đổi avatar');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Updated: sử dụng array thay vì MediaTypeOptions
      allowsEditing: true,
      aspect: [1, 1], // Square crop
      quality: 0.8,   // 80% quality để giảm file size
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Update avatar URI để hiển thị preview
      setAvatarUri(asset.uri);
      
      // Lưu file info để upload sau khi save
      setNewAvatarFile({
        uri: asset.uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      });
    }
  } catch (error: any) {
    console.error('Error picking image:', error);
    Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + error.message);
  }
};

/**
 * FUNCTION 6: Handle Select Bank
 * 
 * Xử lý khi user chọn ngân hàng từ picker
 */
export const createHandleSelectBank = (params: FunctionParams) => (bank: Bank) => {
  const { setBankName, setBinCode, setShowBankPicker } = params;

  // Tự động điền thông tin ngân hàng
  setBankName(bank.shortName);  // Tên ngân hàng viết tắt
  setBinCode(bank.bin);         // Mã BIN

  // Đóng modal
  setShowBankPicker(false);
};

/**
 * FUNCTION 7: Handle Edit
 * 
 * Bắt đầu chế độ chỉnh sửa
 */
export const createHandleEdit = (params: FunctionParams) => () => {
  const { setEditing } = params;
  setEditing(true);
};

/**
 * FUNCTION 9: Handle Cancel
 * 
 * Hủy chỉnh sửa và restore lại giá trị ban đầu
 */
export const createHandleCancel = (params: FunctionParams) => () => {
  const { profile, setEditing, setFullName, setEmail, setPhoneNumber } = params;
  const { setAvatarUri, setNewAvatarFile, setBankName, setBinCode } = params;
  const { setBankNumber, setAccountHolderName } = params;

  // Restore lại giá trị ban đầu từ profile
  if (profile) {
    setFullName(profile.fullName || '');
    setEmail(profile.email || '');
    setPhoneNumber(profile.phoneNumber || '');
    setAvatarUri(profile.avatar || null);
    setBankName(profile.bankName || '');
    setBinCode(profile.binCode || '');
    setBankNumber(profile.bankNumber || '');
    setAccountHolderName(profile.accoutHolderName || '');
  }

  // Reset avatar file
  setNewAvatarFile(null);

  // Tắt edit mode
  setEditing(false);
};

/**
 * FUNCTION 10: Handle Save
 * 
 * Lưu thông tin đã chỉnh sửa lên server
 */
export const createHandleSave = (params: FunctionParams) => async () => {
  const { profileId, accessToken, setSaving, setEditing, setProfile, setNewAvatarFile } = params;
  const { fullName, email, phoneNumber, bankName, binCode, bankNumber, accountHolderName } = params;
  const { newAvatarFile } = params;

  // Validation
  if (!fullName.trim()) {
    Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
    return;
  }

  if (!email.trim()) {
    Alert.alert('Lỗi', 'Vui lòng nhập email');
    return;
  }

  // Validate phone number nếu user đã nhập
  if (phoneNumber.trim()) {
    const phoneDigits = phoneNumber.trim().replace(/\D/g, ''); // Loại bỏ ký tự không phải số
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      Alert.alert('Lỗi', 'Số điện thoại phải có 10 hoặc 11 chữ số');
      return;
    }
  }

  // Validate bank info nếu user đã nhập
  const hasBankInfo = bankName.trim() || binCode.trim() || bankNumber.trim() || accountHolderName.trim();
  
  if (hasBankInfo) {
    // Nếu nhập bank info, phải nhập đầy đủ
    if (!bankName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên ngân hàng');
      return;
    }
    
    if (binCode.trim()) {
      const binDigits = binCode.trim().replace(/\D/g, '');
      if (binDigits.length < 6 || binDigits.length > 8) {
        Alert.alert('Lỗi', 'Mã BIN phải có từ 6 đến 8 chữ số');
        return;
      }
    }
    
    if (bankNumber.trim()) {
      const bankDigits = bankNumber.trim().replace(/\D/g, '');
      if (bankDigits.length < 8 || bankDigits.length > 16) {
        Alert.alert('Lỗi', 'Số tài khoản ngân hàng phải có từ 8 đến 16 chữ số');
        return;
      }
    }
  }

  try {
    setSaving(true);

    // Chuẩn bị profile data - CHỈ GỬI FIELDS CÓ GIÁ TRỊ
    const profileData: any = {
      id: profileId,
      fullName: fullName.trim(),
      email: email.trim(),
    };

    // Chỉ thêm phoneNumber nếu user đã nhập
    if (phoneNumber.trim()) {
      profileData.phoneNumber = phoneNumber.trim();
    }

    // Chỉ thêm bank info nếu có ít nhất 1 field được điền
    const hasBankInfo = bankName.trim() || binCode.trim() || bankNumber.trim() || accountHolderName.trim();
    
    if (hasBankInfo) {
      // Nếu có bank info, validate basic requirement
      if (bankName.trim()) profileData.bankName = bankName.trim();
      if (binCode.trim()) profileData.binCode = binCode.trim();
      if (bankNumber.trim()) profileData.bankNumber = bankNumber.trim();
      if (accountHolderName.trim()) profileData.accoutHolderName = accountHolderName.trim();
    }

    // Gọi API để update profile
    // Nếu có avatar mới thì upload, không thì chỉ update data
    const updatedProfile = await updateProfileWithAvatar(
      profileId,
      accessToken,
      profileData,
      newAvatarFile
    );

    if (updatedProfile) {
      // Update profile state với data mới
      setProfile(updatedProfile);
      
      // Reset avatar file
      setNewAvatarFile(null);
      
      // Tắt edit mode
      setEditing(false);
      
      Alert.alert('Thành công', 'Đã cập nhật thông tin profile');
    }
  } catch (error: any) {
    console.error('Error saving profile:', error);
    Alert.alert('Lỗi', 'Không thể lưu thông tin: ' + error.message);
  } finally {
    setSaving(false);
  }
};
