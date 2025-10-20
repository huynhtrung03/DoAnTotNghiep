import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, ActivityIndicator } from 'react-native';
import AppTabs from './AppTabs';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
// import RoomDetailScreen from '../screens/user/RoomDetailScreen';
import { getUserRoles } from '../lib/auth';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
	const [initialRoute, setInitialRoute] = useState<'Auth/Login' | 'Root' | 'Users' | 'LandlordDashboard'>('Auth/Login');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				
				
				// Debug: Check all AsyncStorage keys
				const allKeys = await AsyncStorage.getAllKeys();
				
				
				const token = await AsyncStorage.getItem('accessToken');
				console.log('RootNavigator: Token found:', !!token);
				console.log('RootNavigator: Token value:', token ? token.substring(0, 20) + '...' : 'null');
				
				if (token) {
					// Get user roles to determine initial route
					const roles = await getUserRoles();
				
					
					if (roles.includes('Landlords')) {
					
						setInitialRoute('LandlordDashboard');
					} else if (roles.includes('Users')) {
					
						setInitialRoute('Users');
					} else {
					
						setInitialRoute('Root');
					}
				} else {
					console.log('RootNavigator: No token found, setting route to Auth/Login');
					setInitialRoute('Auth/Login');
				}
			} catch (error) {
				console.error('RootNavigator: Error checking auth:', error);
				setInitialRoute('Auth/Login');
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	return (
		<NavigationContainer>
			{isLoading ? (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
					<ActivityIndicator size="large" color="#3B82F6" />
					<Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Loading...</Text>
				</View>
			) : (
				<Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
					<Stack.Screen name="Auth/Login" component={LoginScreen} />
					<Stack.Screen name="Auth/Forgot" component={ForgotPasswordScreen} />
					<Stack.Screen name="Auth/Register" component={RegisterScreen} />
					<Stack.Screen name="Root" component={AppTabs} />
					<Stack.Screen name="Users" component={AppTabs} />
					<Stack.Screen name="LandlordDashboard" component={AppTabs} />
					{/* <Stack.Screen 
						name="Detail" 
						component={RoomDetailScreen}
						options={{ 
							headerShown: true,
							title: 'Chi tiết phòng',
							headerBackTitle: 'Quay lại'
						}} 
					/> */}
				</Stack.Navigator>
			)}
		</NavigationContainer>
	);
}