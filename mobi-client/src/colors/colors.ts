// Bộ màu chủ đạo của ứng dụng
export const Colors = {
  // Primary Colors
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  
  // Secondary Colors
  secondary: '#10B981',
  secondaryLight: '#34D399',
  secondaryDark: '#059669',
  
  // Accent Colors
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',
  
  // Background Colors
  background: '#F9FAFB',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#F3F4F6',
  
  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textWhite: '#FFFFFF',
  
  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Gradient Colors - Quick Actions
  gradients: {
    purple: ['#667eea', '#764ba2'] as [string, string, ...string[]],
    pink: ['#f093fb', '#f5576c'] as [string, string, ...string[]],
    blue: ['#4facfe', '#00f2fe'] as [string, string, ...string[]],
    orange: ['#fa709a', '#fee140'] as [string, string, ...string[]],
    red: ['#f093fb', '#f5576c'] as [string, string, ...string[]],
    green: ['#43e97b', '#38f9d7'] as [string, string, ...string[]],
    sunset: ['#fa709a', '#fee140'] as [string, string, ...string[]],
    ocean: ['#667eea', '#764ba2'] as [string, string, ...string[]],
  },
  
  // Icon Colors
  iconPrimary: '#428aef',
  iconSecondary: '#6B7280',
  iconTertiary: '#9CA3AF',
  
  // Card Colors
  cardBackground: '#FFFFFF',
  cardShadow: '#000000',
  
  // Special Colors
  vip: '#F59E0B',
  premium: '#EF4444',
  
  // Opacity helpers
  opacity: (color: string, opacity: number) => `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
};

// Hàm tiện ích để tạo màu với độ trong suốt
export const withOpacity = (color: string, opacity: number): string => {
  const hex = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `${color}${hex}`;
};

// Export default để dùng nhanh
export default Colors;
