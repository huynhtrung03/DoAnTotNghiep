
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Import Services
import {
  getProfileById,
  updateProfileWithAvatar,
  getBanks,
  isHaveBankAccount,
  getEmailNotifications,
  setEmailNotifications,
} from '../../../../services/profile/ProfileService';

// Import Types
import { ProfileInformationProps, UserProfile, Bank } from '../../types';

// Import Sub-components
import AvatarSection from '../../components/AvatarSection';
import PersonalInfoSection from '../../components/PersonalInfoSection';
import AddressSection from '../../components/AddressSection';
import BankSection from '../../components/BankSection';
import NotificationsSection from '../../components/NotificationsSection';
import BankPickerModal from '../../components/BankPickerModal';

// Import Styles
import { styles } from '../../../../styles/screens/user/ProfileInformation.styles';

// Import Functions
import {
  FunctionParams,
  createLoadProfile,
  createLoadBanks,
  createCheckBankAccount,
  createLoadEmailNotifications,
  createHandlePickImage,
  createHandleSelectBank,
  createHandleToggleNotifications,
  createHandleEdit,
  createHandleCancel,
  createHandleSave,
} from '../../../../hooks/ProfileInformation.functions';

const ProfileInformation: React.FC<ProfileInformationProps> = ({
  userId,
  profileId,
  accessToken,
}) => {
  // ==================== STATE MANAGEMENT ====================
  
  // Profile data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [newAvatarFile, setNewAvatarFile] = useState<any>(null);
  
  // Bank info
  const [bankName, setBankName] = useState('');
  const [binCode, setBinCode] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  
  // Bank picker modal
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [searchBank, setSearchBank] = useState('');
  
  // Notifications
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // ==================== CREATE FUNCTION PARAMETERS ====================
  
  /**
   * Tạo object chứa tất cả parameters cần thiết cho các functions
   * Để tránh prop drilling và giữ code clean
   */
  const functionParams: FunctionParams = {
    // Props
    profileId,
    accessToken,
    userId,
    // Setters
    setProfile,
    setLoading,
    setSaving,
    setEditing,
    setFullName,
    setEmail,
    setPhoneNumber,
    setAvatarUri,
    setNewAvatarFile,
    setBankName,
    setBinCode,
    setBankNumber,
    setAccountHolderName,
    setBanks,
    setHasBankAccount,
    setShowBankPicker,
    setEmailNotificationsEnabled,
    setLoadingNotifications,
    // Current values
    profile,
    fullName,
    email,
    phoneNumber,
    avatarUri,
    newAvatarFile,
    bankName,
    binCode,
    bankNumber,
    accountHolderName,
  };

  // ==================== CREATE FUNCTIONS ====================
  
  /**
   * Tạo tất cả functions từ function creators
   * Mỗi function được inject với functionParams
   */
  const loadProfile = createLoadProfile(functionParams);
  const loadBanks = createLoadBanks(functionParams);
  const checkBankAccount = createCheckBankAccount(functionParams);
  const loadEmailNotifications = createLoadEmailNotifications(functionParams);
  const handlePickImage = createHandlePickImage(functionParams);
  const handleSelectBank = createHandleSelectBank(functionParams);
  const handleToggleNotifications = createHandleToggleNotifications(functionParams);
  const handleEdit = createHandleEdit(functionParams);
  const handleCancel = createHandleCancel(functionParams);
  const handleSave = createHandleSave(functionParams);

  // ==================== LIFECYCLE ====================
  
  /**
   * Load tất cả dữ liệu khi component mount
   * - Profile data (thông tin user) - REQUIRED
   * - Bank list (danh sách ngân hàng từ VietQR) - Optional
   * - Bank account status (trạng thái xác thực) - Optional
   * - Email notifications settings (cài đặt thông báo) - Optional
   * 
   * Note: Các API phụ (banks, notifications) không block UI nếu fail
   */
  useEffect(() => {
    loadProfile();
    loadBanks();
    checkBankAccount();
    loadEmailNotifications();
  }, [profileId]); // Chỉ chạy lại khi profileId thay đổi

  // ==================== RENDER ====================
  
  /**
   * Show loading spinner khi đang load profile lần đầu
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  /**
   * Main UI
   */
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          
          {/* Edit Button hoặc Save/Cancel Buttons */}
          {!editing ? (
            // Nút "Chỉnh sửa" - hiển thị khi không ở edit mode
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          ) : (
            // Nhóm nút "Hủy" và "Lưu" - hiển thị khi đang edit
            <View style={styles.editButtonsGroup}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* AVATAR */}
        <AvatarSection
          avatarUri={avatarUri}
          isEditing={editing}
          onPickImage={handlePickImage}
        />

        {/* PERSONAL INFO */}
        <PersonalInfoSection
          fullName={fullName}
          email={email}
          phoneNumber={phoneNumber}
          isEditing={editing}
          onChangeFullName={setFullName}
          onChangeEmail={setEmail}
          onChangePhoneNumber={setPhoneNumber}
        />

        {/* ADDRESS - Chỉ hiển thị nếu user có địa chỉ */}
        {profile?.address && <AddressSection address={profile.address} />}

        {/* BANK INFO */}
        <BankSection
          hasBankAccount={hasBankAccount}
          bankName={bankName}
          binCode={binCode}
          bankNumber={bankNumber}
          accountHolderName={accountHolderName}
          isEditing={editing}
          onChangeBankName={setBankName}
          onChangeBinCode={setBinCode}
          onChangeBankNumber={setBankNumber}
          onChangeAccountHolder={setAccountHolderName}
          onOpenBankPicker={() => setShowBankPicker(true)}
        />

        {/* NOTIFICATIONS */}
        <NotificationsSection
          emailNotificationsEnabled={emailNotificationsEnabled}
          loadingNotifications={loadingNotifications}
          onToggleNotifications={handleToggleNotifications}
        />
      </ScrollView>

      {/* BANK PICKER MODAL - Modal slide up để chọn ngân hàng */}
      <BankPickerModal
        visible={showBankPicker}
        banks={banks}
        selectedBankBin={binCode}
        searchQuery={searchBank}
        onSearch={setSearchBank}
        onSelectBank={handleSelectBank}
        onClose={() => {
          setShowBankPicker(false);
          setSearchBank(''); // Reset search khi đóng modal
        }}
      />
    </View>
  );
};

export default ProfileInformation;
