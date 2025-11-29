import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../services/Constant';

export async function loginWithUsername(username: string, password: string) {
	console.log('loginWithUsername: Starting login API call');
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