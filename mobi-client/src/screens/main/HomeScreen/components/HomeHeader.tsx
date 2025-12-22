import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface HomeHeaderProps {
  userName?: string;
  userAvatar?: string;
  currentLocation?: string;
  unreadNotifications?: number;
  isGuest?: boolean; // Guest mode flag
  onLocationPress?: () => void;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onLoginPress?: () => void; // Login action for guest
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName = 'Bạn',
  userAvatar,
  currentLocation = 'Đang xác định vị trí...',
  unreadNotifications = 0,
  isGuest = false,
  onLocationPress,
  onAvatarPress,
  onNotificationPress,
  onLoginPress,
}) => {
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <LinearGradient
      colors={['#667EEA', '#764BA2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Top Row: Greeting + Notification + Avatar */}
      <View style={styles.topRow}>
        <View style={styles.greetingContainer}>
          {isGuest ? (
            <>
              <Text style={styles.greeting}>Chào bạn,</Text>
              <Text style={styles.userName}>Khách!</Text>
            </>
          ) : (
            <>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{userName}!</Text>
            </>
          )}
        </View>

        <View style={styles.actionsContainer}>
          {/* Notification Button - Hide for guests */}
          {!isGuest && (
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={onNotificationPress}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              {unreadNotifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* Avatar Button / Login Button */}
          {isGuest ? (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={onLoginPress}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={20} color="#667EEA" />
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.avatarButton}
              onPress={onAvatarPress}
              activeOpacity={0.8}
            >
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={24} color="#667EEA" />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Location Row */}
      <TouchableOpacity 
        style={styles.locationRow}
        onPress={onLocationPress}
        activeOpacity={0.7}
      >
        <Ionicons name="location" size={16} color="rgba(255,255,255,0.9)" />
        <Text style={styles.locationText} numberOfLines={1}>
          {currentLocation}
        </Text>
        <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.9)" />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    paddingBottom: 32, // Extra space for floating search bar
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  greetingContainer: {
    flex: 1,
  },

  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  userName: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 2,
  },

  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  notificationButton: {
    position: 'relative',
    padding: 4,
  },

  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#667EEA',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  avatarButton: {
    marginLeft: 0,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  locationText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    flex: 1,
  },

  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  loginButtonText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '700',
  },
});

export default HomeHeader;
