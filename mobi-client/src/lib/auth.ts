import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../services/Constant';

export async function loginWithUsername(username: string, password: string) {
	console.log('loginWithUsername: Starting login API call');
	console.log('loginWithUsername: API URL:', `${API_URL}/auth/login`);
	console.log('loginWithUsername: Request body:', { username, password: '***' });
	
	try {
		const res = await axios.post(`${API_URL}/auth/login`, { username, password });
		console.log('loginWithUsername: API response received');
		console.log('loginWithUsername: Response data:', res.data);
		
		const { accessToken, refreshToken, roles, userProfile, username: responseUsername, id } = res.data;
		console.log('loginWithUsername: Extracted roles:', roles);
		console.log('loginWithUsername: Extracted userProfile:', userProfile);
		
		// Create user object from response data
		const user = {
			id,
			username: responseUsername,
			roles: roles || [],
			userProfile: userProfile || {}
		};
		
		console.log('loginWithUsername: Created user object:', user);
		
		console.log('loginWithUsername: Saving to AsyncStorage');
		await AsyncStorage.multiSet([
			['accessToken', accessToken],
			['refreshToken', refreshToken ?? ''],
			['userRoles', JSON.stringify(roles || [])],
			['userProfile', JSON.stringify(userProfile || {})],
			['userData', JSON.stringify(user)], //  SAVE userData
		]);
		console.log('loginWithUsername: AsyncStorage save completed');
		
		return { accessToken, refreshToken, user };
	} catch (error: any) {
		console.error('loginWithUsername: Error occurred');
		console.error('loginWithUsername: Error message:', error.message);
		if (error.response) {
			console.error('loginWithUsername: Response status:', error.response.status);
			console.error('loginWithUsername: Response data:', error.response.data);
			console.error('loginWithUsername: Response headers:', error.response.headers);
		} else if (error.request) {
			console.error('loginWithUsername: No response received');
			console.error('loginWithUsername: Request:', error.request);
		} else {
			console.error('loginWithUsername: Error setting up request');
		}
		throw error;
	}
	console.log('loginWithUsername: API URL:', `${API_URL}/auth/login`);
	console.log('loginWithUsername: Request body:', { username, password: '***' });
	
	try {
		const res = await axios.post(`${API_URL}/auth/login`, { username, password });
		console.log('loginWithUsername: API response received');
		console.log('loginWithUsername: Response data:', res.data);
		
		const { accessToken, refreshToken, roles, userProfile, username: responseUsername, id } = res.data;
		console.log('loginWithUsername: Extracted roles:', roles);
		console.log('loginWithUsername: Extracted userProfile:', userProfile);
		
		// Create user object from response data
		const user = {
			id,
			username: responseUsername,
			roles: roles || [],
			userProfile: userProfile || {}
		};
		
		console.log('loginWithUsername: Created user object:', user);
		
		console.log('loginWithUsername: Saving to AsyncStorage');
		await AsyncStorage.multiSet([
			['accessToken', accessToken],
			['refreshToken', refreshToken ?? ''],
			['userRoles', JSON.stringify(roles || [])],
			['userProfile', JSON.stringify(userProfile || {})],
			['userData', JSON.stringify(user)], //  SAVE userData
		]);
		console.log('loginWithUsername: AsyncStorage save completed');
		
		return { accessToken, refreshToken, user };
	} catch (error: any) {
		console.error('loginWithUsername: Error occurred');
		console.error('loginWithUsername: Error message:', error.message);
		if (error.response) {
			console.error('loginWithUsername: Response status:', error.response.status);
			console.error('loginWithUsername: Response data:', error.response.data);
			console.error('loginWithUsername: Response headers:', error.response.headers);
		} else if (error.request) {
			console.error('loginWithUsername: No response received');
			console.error('loginWithUsername: Request:', error.request);
		} else {
			console.error('loginWithUsername: Error setting up request');
		}
		throw error;
	}
}

export async function logout() {
	await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userRoles', 'userProfile', 'userData']);
}

export async function getUserRoles(): Promise<string[]> {
	const roles = await AsyncStorage.getItem('userRoles');
	console.log('getUserRoles: Role lưu trong store:', roles);
	
	if (!roles) {
		return [];
	}
	
	try {
		const parsedRoles = JSON.parse(roles);
	
		return parsedRoles;
	} catch (error) {
		console.error('getUserRoles: Error parsing roles:', error);
		return [];
	}
}