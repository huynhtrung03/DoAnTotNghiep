// import React, { useEffect, useState } from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { View, Text, ActivityIndicator } from 'react-native';
// import AppTabs from './AppTabs';
// import LoginScreen from '../screens/auth/LoginScreen/LoginScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen/ForgotPasswordScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen/RegisterScreen';
// import RoomDetailScreen from '../screens/main/RoomDetailScreen/RoomDetailScreen';
// import { getUserRoles } from '../lib/auth';

// const Stack = createNativeStackNavigator();

// export default function RootNavigator() {
// 	const [initialRoute, setInitialRoute] = useState<'Auth/Login' | 'Root' | 'Users' | 'LandlordDashboard'>('Auth/Login');
// 	const [isLoading, setIsLoading] = useState(true);

// 	useEffect(() => {
// 		(async () => {
// 			try {
				
				
// 				// Debug: Check all AsyncStorage keys
// 				const allKeys = await AsyncStorage.getAllKeys();
				
				
// 				const token = await AsyncStorage.getItem('accessToken');
// 				console.log('RootNavigator: Token found:', !!token);
// 				console.log('RootNavigator: Token value:', token ? token.substring(0, 20) + '...' : 'null');
				
// 				if (token) {
// 					// Get user roles to determine initial route
// 					const roles = await getUserRoles();
				
					
// 					if (roles.includes('Landlords')) {
					
// 						setInitialRoute('LandlordDashboard');
// 					} else if (roles.includes('Users')) {
					
// 						setInitialRoute('Users');
// 					} else {
					
// 						setInitialRoute('Root');
// 					}
// 				} else {
// 					console.log('RootNavigator: No token found, setting route to Auth/Login');
// 					setInitialRoute('Auth/Login');
// 				}
// 			} catch (error) {
// 				console.error('RootNavigator: Error checking auth:', error);
// 				setInitialRoute('Auth/Login');
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		})();
// 	}, []);

// 	return (
// 		<NavigationContainer>
// 			{isLoading ? (
// 				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
// 					<ActivityIndicator size="large" color="#3B82F6" />
// 					<Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Loading...</Text>
// 				</View>
// 			) : (
// 				<Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
// 					<Stack.Screen name="Auth/Login" component={LoginScreen} />
// 					<Stack.Screen name="Auth/Forgot" component={ForgotPasswordScreen} />
// 					<Stack.Screen name="Auth/Register" component={RegisterScreen} />
// 					<Stack.Screen name="Root" component={AppTabs} />
// 					<Stack.Screen name="Users" component={AppTabs} />
// 					<Stack.Screen name="LandlordDashboard" component={AppTabs} />
// 					<Stack.Screen 
// 						name="RoomDetail" 
// 						component={RoomDetailScreen}
// 						options={{ 
// 							headerShown: true,
// 							title: 'Chi tiết phòng',
// 							headerBackTitle: 'Quay lại'
// 						}} 
// 					/>
// 				</Stack.Navigator>
// 			)}
// 		</NavigationContainer>
// 	);
// }

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native';

// Import 2 loại navigation tabs
import UserTabs from './UserTabs';
import LandlordTabs from './LandlordTabs';

// Import màn hình auth
import LoginScreen from '../screens/auth/LoginScreen/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen/ForgotPasswordScreen';
import RegisterScreen from '../screens/auth/RegisterScreen/RegisterScreen';

// Import màn hình chi tiết (dùng chung cho cả 2 role)
import RoomDetailScreen from '../screens/main/RoomDetailScreen/RoomDetailScreen';

// Import NotificationScreen
import NotificationScreen from '../screens/notification/NotificationScreen';

// Import ChatScreen
import ChatScreen from '../screens/mesenger/ChatScreenDetail';

const Stack = createNativeStackNavigator();

type RouteType = 'Auth/Login' | 'UserApp' | 'LandlordApp';

export default function RootNavigator() {
  const [initialRoute, setInitialRoute] = useState<RouteType>('Auth/Login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 RootNavigator: Checking authentication...');
        
        // Debug: Check all AsyncStorage keys
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('🔍 RootNavigator: All AsyncStorage keys:', allKeys);
        
        const token = await AsyncStorage.getItem('accessToken');
        console.log('🔍 RootNavigator: Token found:', !!token);
        console.log('🔍 RootNavigator: Token value:', token ? token.substring(0, 20) + '...' : 'null');
        
        if (token) {
          // Get user roles from AsyncStorage
          const rolesString = await AsyncStorage.getItem('userRoles');
          console.log('🔍 RootNavigator: Roles string:', rolesString);
          
          const roles = rolesString ? JSON.parse(rolesString) : [];
          console.log('🔍 RootNavigator: Parsed roles:', roles);
          
          if (roles.includes('Landlords')) {
            console.log('✅ RootNavigator: User is Landlord, loading LandlordApp');
            setInitialRoute('LandlordApp');
          } else if (roles.includes('Users')) {
            console.log('✅ RootNavigator: User is normal User, loading UserApp');
            setInitialRoute('UserApp');
          } else {
            console.log('⚠️ RootNavigator: Unknown role, defaulting to UserApp');
            setInitialRoute('UserApp');
          }
        } else {
          console.log('❌ RootNavigator: No token found, showing login');
          setInitialRoute('Auth/Login');
        }
      } catch (error) {
        console.error('❌ RootNavigator: Error checking auth:', error);
        setInitialRoute('Auth/Login');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      {isLoading ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: '#F9FAFB' 
        }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ 
            marginTop: 16, 
            fontSize: 16, 
            color: '#6B7280' 
          }}>
            Đang tải...
          </Text>
        </View>
      ) : (
        <Stack.Navigator 
          screenOptions={{ headerShown: false }} 
          initialRouteName={initialRoute}
        >
          {/* Auth Screens */}
          <Stack.Screen 
            name="Auth/Login" 
            component={LoginScreen} 
          />
          <Stack.Screen 
            name="Auth/Forgot" 
            component={ForgotPasswordScreen} 
          />
          <Stack.Screen 
            name="Auth/Register" 
            component={RegisterScreen} 
          />
          
          {/* User App - Giao diện cho người dùng thường */}
          <Stack.Screen 
            name="UserApp" 
            component={UserTabs}
            options={{ 
              headerShown: false,
              // Prevent going back to login
              gestureEnabled: false,
            }}
          />
          
          {/* Landlord App - Giao diện cho chủ trọ */}
          <Stack.Screen 
            name="LandlordApp" 
            component={LandlordTabs}
            options={{ 
              headerShown: false,
              // Prevent going back to login
              gestureEnabled: false,
            }}
          />
          
          {/* Shared Screens - Màn hình dùng chung cho cả 2 role */}
          <Stack.Screen 
            name="RoomDetail" 
            component={RoomDetailScreen}
            options={{ 
              headerShown: true,
              title: 'Chi tiết phòng',
              headerBackTitle: 'Quay lại',
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#111827',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }} 
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationScreen}
            options={{ 
              headerShown: true,
              title: 'Thông báo',
              headerBackTitle: 'Quay lại',
              headerStyle: {
                backgroundColor: '#fff',
              },
              headerTintColor: '#111827',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }} 
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ 
              headerShown: false,
            }} 
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}