import React, { useEffect } from 'react';
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import RootNavigator from './src/navigation/RootNavigator';
import './src/lib/i18n'; // Import i18n config
import NotificationService from './src/services/NotificationServiceMobi';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // 1. Xin quyền thông báo
        const permissionGranted = await NotificationService.requestUserPermission();
        if (!permissionGranted) {
          console.log('⚠️ [App] Notification permission denied, skipping FCM setup');
          return;
        }

        // 2. Kiểm tra xem user đã đăng nhập chưa
        const userDataString = await AsyncStorage.getItem('userData');
        if (!userDataString) {
          console.log('ℹ️ [App] User not logged in, skipping FCM token registration');
          // Vẫn setup foreground listener để sẵn sàng khi user đăng nhập
          NotificationService.setupForegroundListener();
          return;
        }

        // Parse user data để lấy userId
        const userData = JSON.parse(userDataString);
        const userId = userData.id;

        if (!userId) {
          console.log('⚠️ [App] No userId found in userData, skipping FCM token registration');
          NotificationService.setupForegroundListener();
          return;
        }

        // 3. Đăng ký FCM token với userId thật
        console.log('📤 [App] Registering FCM token for user:', userId);
        await NotificationService.registerTokenWithBackend(userId);

        // 4. Lắng nghe thông báo khi app đang mở
        const unsubscribe = NotificationService.setupForegroundListener();
        return unsubscribe;

      } catch (error) {
        console.error('❌ [App] Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <KeyboardProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </KeyboardProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
