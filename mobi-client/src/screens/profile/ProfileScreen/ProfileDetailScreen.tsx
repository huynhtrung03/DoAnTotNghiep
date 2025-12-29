/**
 * ProfileDetailScreen Component
 * 
 * Màn hình chi tiết thông tin cá nhân
 * Sử dụng ProfileInformation component
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfileInformation from '../../../components/profile/ProfileForm/components/ProfileInformation';

interface UserProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export default function ProfileDetailScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  /**
   * Load thông tin user từ AsyncStorage
   */
  const loadUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('accessToken');
      const userProfileStr = await AsyncStorage.getItem('userProfile');
      
      if (!token || !userProfileStr) {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin đăng nhập');
        return;
      }

      const userProfile: UserProfileData = JSON.parse(userProfileStr);
      
      setAccessToken(token);
      setUserId(userProfile.id);
      setProfileId(userProfile.id);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!userId || !profileId || !accessToken) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không thể tải thông tin người dùng</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ProfileInformation 
        userId={userId}
        profileId={profileId}
        accessToken={accessToken}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
