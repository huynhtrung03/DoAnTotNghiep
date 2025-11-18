/**
 * Profile Components - Index File
 * 
 * Export tất cả components và types để import dễ dàng hơn
 * 
 * Usage:
 * import ProfileInformation, { UserProfile, Bank } from '@/components/profile';
 */

// Export main component (default export)
export { default } from './ProfileForm/components/ProfileInformation';

// Export named component
export { default as ProfileInformation } from './ProfileForm/components/ProfileInformation';

// Export sub-components (nếu cần sử dụng riêng lẻ)
export { default as AvatarSection } from './components/AvatarSection';
export { default as PersonalInfoSection } from './components/PersonalInfoSection';
export { default as AddressSection } from './components/AddressSection';
export { default as BankSection } from './components/BankSection';
export { default as NotificationsSection } from './components/NotificationsSection';
export { default as BankPickerModal } from './components/BankPickerModal';

// Export types
export type {
  ProfileInformationProps,
  UserProfile,
  Bank,
  Address,
  AvatarSectionProps,
  PersonalInfoSectionProps,
  AddressSectionProps,
  BankSectionProps,
  NotificationsSectionProps,
  BankPickerModalProps,
} from './types';

// Export styles (nếu cần customize)
export { styles as ProfileStyles } from '../../styles/screens/user/ProfileInformation.styles';
