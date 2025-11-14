/**
 * UserScreen Component
 * 
 * Màn hình User với thiết kế đơn giản, sạch sẽ:
 * - Màu trắng chủ đạo
 * - Header đơn giản với avatar
 * - Menu items với icon màu nhẹ nhàng
 * - Settings section
 * - Clean minimal design
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  Image,
  StatusBar,
  RefreshControl,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';
import Colors, { withOpacity } from '../../styles/colors';

interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
}

interface UserData {
  id: string;
  username: string;
  roles: string[];
  userProfile: UserProfileData;
}

interface MenuItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  badge?: number;
  onPress: () => void;
}

interface SettingItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'switch' | 'navigate';
  value?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

export default function UserScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  useEffect(() => {
    loadUserProfile();
    loadSettings();
  }, []);

  /**
   * Load thông tin user từ AsyncStorage
   */
  const loadUserProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const userProfileStr = await AsyncStorage.getItem('userProfile');
      const userDataStr = await AsyncStorage.getItem('userData');
      
      if (userProfileStr) {
        const profile: UserProfileData = JSON.parse(userProfileStr);
        
        if (profile.avatar && !profile.avatar.startsWith('http')) {
          profile.avatar = `https://res.cloudinary.com${profile.avatar}`;
        }
        
        setUserProfile(profile);
      }

      // Lấy roles từ userData
      if (userDataStr) {
        const userData: UserData = JSON.parse(userDataStr);
        setUserRoles(userData.roles || []);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Load settings từ AsyncStorage
   */
  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notificationsEnabled');
      const location = await AsyncStorage.getItem('locationEnabled');
      
      if (notifications !== null) setNotificationsEnabled(notifications === 'true');
      if (location !== null) setLocationEnabled(location === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  /**
   * Save setting
   */
  const saveSetting = async (key: string, value: boolean) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  /**
   * Handle pull to refresh
   */
  const onRefresh = () => {
    loadUserProfile(true);
  };

  /**
   * Get role display info
   */
  const getRoleInfo = (roles: string[]) => {
    // Thứ tự ưu tiên: ADMIN > LANDLORD > USER
    if (roles.includes('ADMIN')) {
      return {
        text: 'Quản trị viên',
        icon: 'shield-checkmark' as const,
        color: Colors.error,
        bgColor: 'rgba(244, 67, 54, 0.1)',
      };
    }
    if (roles.includes('LANDLORD')) {
      return {
        text: 'Người cho thuê',
        icon: 'home' as const,
        color: Colors.primary,
        bgColor: 'rgba(33, 150, 243, 0.1)',
      };
    }
    // Default: USER
    return {
      text: 'Người dùng',
      icon: 'person' as const,
      color: Colors.success,
      bgColor: 'rgba(76, 175, 80, 0.1)',
    };
  };

  /**
   * Xử lý đăng xuất
   */
  const handleLogout = async () => {
    Alert.alert(
      t('user.logout'),
      t('user.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('user.logout'), 
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear all user data from AsyncStorage
              await AsyncStorage.multiRemove([
                'accessToken', 
                'refreshToken', 
                'userRoles', 
                'userProfile',
                'userData',
              ]);

              // Clear other cached data
              await AsyncStorage.multiRemove([
                'notificationsEnabled',
                'locationEnabled',
              ]);

              console.log('✅ User data cleared, reloading app...');

              // Reload the app to reset all state
              try {
                await Updates.reloadAsync();
              } catch (reloadError) {
                console.error('❌ Reload failed, using navigation fallback:', reloadError);
                // Fallback: navigate to login if reload fails
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Auth/Login' as never }],
                  })
                );
              }
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert(t('common.error'), 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          }
        }
      ]
    );
  };

  /**
   * Navigation handlers
   */
  const handleNavigateToProfile = () => {
    navigation.navigate('Users/ProfileDetail' as never);
  };

  const handleNavigateToContracts = () => {
    navigation.navigate('Users/MyContracts' as never);
  };

  const handleNavigateToHistory = () => {
    navigation.navigate('Users/RentalHistory' as never);
  };

  const handleNavigateToRequests = () => {
    navigation.navigate('Users/RequestManagement' as never);
  };

  const handleNavigateToFavorites = () => {
    Alert.alert(t('user.favorites'), t('features.inDevelopment'));
  };

  const handleNavigateToPassword = () => {
    navigation.navigate('Users/ChangePassword' as never);
  };

  const handleNavigateToMessages = () => {
    Alert.alert(t('user.messages'), t('features.inDevelopment'));
  };

  const handleNavigateToLanguage = () => {
    navigation.navigate('Users/LanguageSelection' as never);
  };

  /**
   * Toggle handlers
   */
  const handleToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting('notificationsEnabled', value);
  };

  const handleToggleLocation = (value: boolean) => {
    setLocationEnabled(value);
    saveSetting('locationEnabled', value);
  };

  /**
   * Menu items - Đơn giản, icon màu nhẹ
   */
  const menuItems: MenuItem[] = [
    {
      key: 'profile',
      label: t('user.profile'),
      icon: 'person-outline',
      iconColor: '#3B82F6',
      iconBg: '#EFF6FF',
      onPress: handleNavigateToProfile,
    },
    {
      key: 'contracts',
      label: t('user.contracts'),
      icon: 'document-text-outline',
      iconColor: '#10B981',
      iconBg: '#ECFDF5',
      badge: 0,
      onPress: handleNavigateToContracts,
    },
    {
      key: 'history',
      label: t('user.history'),
      icon: 'time-outline',
      iconColor: '#F59E0B',
      iconBg: '#FFFBEB',
      onPress: handleNavigateToHistory,
    },
    {
      key: 'requests',
      label: t('user.requests'),
      icon: 'clipboard-outline',
      iconColor: '#EF4444',
      iconBg: '#FEF2F2',
      badge: 0,
      onPress: handleNavigateToRequests,
    },
    {
      key: 'favorites',
      label: t('user.favorites'),
      icon: 'heart-outline',
      iconColor: '#EC4899',
      iconBg: '#FDF2F8',
      onPress: handleNavigateToFavorites,
    },
    {
      key: 'password',
      label: t('user.password'),
      icon: 'lock-closed-outline',
      iconColor: '#8B5CF6',
      iconBg: '#F5F3FF',
      onPress: handleNavigateToPassword,
    },
   
  ];

  /**
   * Settings items
   */
  const settingItems: SettingItem[] = [
    {
      key: 'notifications',
      label: t('settings.notifications'),
      icon: 'notifications-outline',
      type: 'switch',
      value: notificationsEnabled,
      onToggle: handleToggleNotifications,
    },
    {
      key: 'location',
      label: t('settings.location'),
      icon: 'location-outline',
      type: 'switch',
      value: locationEnabled,
      onToggle: handleToggleLocation,
    },
    {
      key: 'language',
      label: t('settings.language'),
      icon: 'language-outline',
      type: 'navigate',
      onPress: handleNavigateToLanguage,
    },
    {
      key: 'help',
      label: t('settings.help'),
      icon: 'help-circle-outline',
      type: 'navigate',
      onPress: () => Alert.alert(t('settings.help'), t('features.inDevelopment')),
    },
    {
      key: 'about',
      label: t('settings.about'),
      icon: 'information-circle-outline',
      type: 'navigate',
      onPress: () => Alert.alert(t('settings.about'), t('settings.aboutText')),
    },
  ];

  /**
   * Render menu item - Thiết kế đơn giản
   */
  const renderMenuItem = (item: MenuItem, index: number) => (
    <Animated.View 
      key={item.key}
      entering={FadeInDown.duration(400).delay(index * 50)}
    >
      <TouchableOpacity
        style={styles.menuItem}
        onPress={item.onPress}
        activeOpacity={0.7}
      >
        {/* Icon với background màu nhẹ */}
        <View style={[styles.menuIcon, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon} size={24} color={item.iconColor} />
        </View>

        {/* Label */}
        <Text style={styles.menuLabel}>{item.label}</Text>

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {item.badge > 99 ? '99+' : item.badge}
            </Text>
          </View>
        )}

        {/* Arrow */}
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={Colors.textSecondary} 
        />
      </TouchableOpacity>
    </Animated.View>
  );

  /**
   * Render setting item
   */
  const renderSettingItem = (item: SettingItem, index: number) => (
    <Animated.View 
      key={item.key}
      entering={FadeInDown.duration(400).delay(index * 50)}
    >
      {item.type === 'switch' ? (
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name={item.icon} size={22} color={Colors.textSecondary} />
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: '#D1D5DB', true: withOpacity(Colors.primary, 0.5) }}
            thumbColor={item.value ? Colors.primary : '#F3F4F6'}
          />
        </View>
      ) : (
        <TouchableOpacity
          style={styles.settingItem}
          onPress={item.onPress}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeft}>
            <Ionicons name={item.icon} size={22} color={Colors.textSecondary} />
            <Text style={styles.settingLabel}>{item.label}</Text>
          </View>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={Colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header đơn giản - nền trắng */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {userProfile?.avatar ? (
              <Image 
                source={{ uri: userProfile.avatar }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={Colors.textSecondary} />
              </View>
            )}
          </View>

          {/* User Info */}
          <Text style={styles.userName}>
            {userProfile?.fullName || 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {userProfile?.email || ''}
          </Text>

          {/* Role Badge */}
          {userRoles.length > 0 && (
            <Animated.View 
              entering={FadeIn.duration(600).delay(200)}
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleInfo(userRoles).bgColor }
              ]}
            >
              <Ionicons 
                name={getRoleInfo(userRoles).icon}
                size={14} 
                color={getRoleInfo(userRoles).color}
              />
              <Text style={[styles.roleText, { color: getRoleInfo(userRoles).color }]}>
                {getRoleInfo(userRoles).text}
              </Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
          <View style={styles.card}>
            {menuItems.map((item, index) => renderMenuItem(item, index))}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.title')}</Text>
          <View style={styles.card}>
            {settingItems.map((item, index) => renderSettingItem(item, index))}
          </View>
        </View>

        {/* Logout Button */}
        <Animated.View 
          entering={FadeInDown.duration(600).delay(300)}
          style={styles.logoutContainer}
        >
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={Colors.error} />
            <Text style={styles.logoutText}>{t('user.logout')}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header - Đơn giản, nền trắng
  header: {
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  
  // Avatar
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  
  // User Info
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },

  // Role Badge
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Menu Item - Đơn giản
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: 8,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  
  // Setting Item
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  
  // Logout
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 100, // ✅ Add bottom margin for tab bar
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cardBackground,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: withOpacity(Colors.error, 0.3),
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.error,
    marginLeft: 8,
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: 120, // ✅ Increased from 32 to 120 for tab bar
  },
});
