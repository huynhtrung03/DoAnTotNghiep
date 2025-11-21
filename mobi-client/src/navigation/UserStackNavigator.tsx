/**
 * UserStackNavigator
 * 
 * Stack Navigator cho User tab
 * Bao gồm: UserScreen (Settings menu), ProfileDetailScreen, LanguageSelectionScreen, RequestManagementScreen, MyContracts
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserScreen from '../screens/user/UserScreen';
import ProfileDetailScreen from '../screens/profile/ProfileScreen/ProfileDetailScreen';
import LanguageSelectionScreen from '../screens/profile/LanguageSelectionScreen/LanguageSelectionScreen';
import RequestManagementScreen from '../screens/user/tabs/RequestManagement/RequestManagementScreen';
import MyContracts from '../screens/user/tabs/MyContracts/MyContracts';
import ChangePasswordScreen from '../screens/auth/ChangePassword/ChangePassword';
import HistoryScreen from '../screens/history/RentalHistoryScreen/HistoryScreen';
import BankScreen from '../screens/user/tabs/bank/BankScreen';
import PaymentResultScreen from '../screens/user/tabs/PaymentResult/PaymentResultScreen';

const Stack = createNativeStackNavigator();

export default function UserStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#111827',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen 
        name="UserSettings" 
        component={UserScreen}
        options={{
          headerShown: false, // Ẩn header cho main screen
        }}
      />
      <Stack.Screen 
        name="Users/ProfileDetail" 
        component={ProfileDetailScreen}
        options={{
          title: 'Thông tin cá nhân',
          headerBackTitle: 'Quay lại',
          headerShown: false, 
        }}
      />
      <Stack.Screen 
        name="Users/LanguageSelection" 
        component={LanguageSelectionScreen}
        options={{
          headerShown: false, // Custom header trong component
        }}
      />
      <Stack.Screen 
        name="Users/RequestManagement" 
        component={RequestManagementScreen}
        options={{
          title: 'Request Management',
          headerBackTitle: 'Back',
          headerShown: false, // Màn hình có header riêng
        }}
      />
      <Stack.Screen 
        name="Users/MyContracts" 
        component={MyContracts}
        options={{
          title: 'My Contracts',
          headerBackTitle: 'Back',
          headerShown: false, // Màn hình có header riêng
        }}
      />
      <Stack.Screen 
        name="Users/ChangePassword" 
        component={ChangePasswordScreen}
        options={{
          title: 'Đổi mật khẩu',
          headerBackTitle: 'Quay lại',
        }}
      />
      <Stack.Screen 
        name="Users/RentalHistory" 
        component={HistoryScreen}
        options={{
          title: 'Lịch sử thuê phòng',
          headerBackTitle: 'Quay lại',
          headerShown: false, // Màn hình có header riêng
        }}
      />
      <Stack.Screen 
        name="Users/Bank" 
        component={BankScreen}
        options={{
          title: 'Thẻ ngân hàng',
          headerBackTitle: 'Quay lại',
          headerShown: false, // Custom header trong component
        }}
      />
      <Stack.Screen 
        name="Users/PaymentResult" 
        component={PaymentResultScreen}
        options={{
          title: 'Kết quả thanh toán',
          headerBackTitle: 'Quay lại',
          headerShown: false, // Custom header trong component
        }}
      />
    </Stack.Navigator>
  );
}
