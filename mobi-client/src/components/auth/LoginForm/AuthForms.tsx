import { useForm, Controller } from 'react-hook-form';
import { View, TextInput, Button, Text, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import GoogleSignInButton from '../../common/Button/GoogleSignInButton';
import AuthInput from '../AuthHeader/AuthInput';
import { getUserRoles } from '../../../lib/auth';

type FormValues = { username: string; password: string };

const schema = yup
	.object({
		username: yup.string().required('Please enter phone number or email'),
		password: yup.string().min(6, 'Password must be at least 6 characters.').required('Please enter your password.'),
	})
	.required();

export default function AuthForms({ onSubmit }: { onSubmit: (v: FormValues) => void }) {
	const navigation = useNavigation<any>();
	const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
		resolver: yupResolver(schema),
		defaultValues: { username: '', password: '' },
	});
	const [showPassword, setShowPassword] = useState(false);

	// Role-based routing function
	const getRouteByRole = (roles: string[]) => {
		if (roles.includes('Landlords')) {
			return 'LandlordDashboard';
		} else if (roles.includes('Users')) {
			return 'Users';
		}
		return 'Root'; // default
	};

	// Enhanced submit handler with role-based navigation
	const handleSubmitWithRole = async (data: FormValues) => {
		try {
	
			
	
			await onSubmit(data);
			
			
			// Small delay to ensure AsyncStorage is updated
			await new Promise(resolve => setTimeout(resolve, 100));
		
			
			// Get user roles after successful login
			const roles = await getUserRoles();
	
			console.log('Roles:', typeof roles);
		
			
			// Ensure roles is an array
			const userRoles = Array.isArray(roles) ? roles : [];
	
			
			// Determine target route based on user role
			const targetRoute = getRouteByRole(userRoles);
	
			
			// Navigate to appropriate screen based on role
			navigation.reset({ 
				index: 0, 
				routes: [{ name: targetRoute }] 
			});
		} catch (error) {
			console.error('Login error details:', error);
			console.error('Error message:', (error as any)?.message);
			console.error('Error stack:', (error as any)?.stack);
			// Let the parent component handle the error
		}
	};

	return (
		<View style={{ padding: 12 }}>
			<View
				style={{
					backgroundColor: 'rgba(255,255,255,0.92)',
					borderRadius: 16,
					padding: 16,
					shadowColor: '#000',
					shadowOpacity: 0.08,
					shadowRadius: 12,
					elevation: 3,
				}}
			>
				<View style={{ flexDirection: 'row', gap: 16, borderBottomWidth: 1, borderColor: '#e5e7eb', paddingBottom: 8, marginBottom: 16 }}>
					<Text style={{ fontWeight: '800', color: '#111827' }}>Log in</Text>
					<Pressable onPress={() => navigation.navigate('Auth/Register') as never}>
						<Text style={{ color: '#6b7280' }}>Create a new account</Text>
					</Pressable>
				</View>

			<AuthInput
				control={control}
				name="username"
				label="Username"
				placeholder="Email or phone"
				keyboardType="email-address"
			/>
			<AuthInput
				control={control}
				name="password"
				label="Password"
				placeholder="Password"
				secure
			/>
			<Pressable
				onPress={handleSubmit(handleSubmitWithRole)}
				style={{ backgroundColor: '#111827', paddingVertical: 12, borderRadius: 999, alignItems: 'center', marginTop: 8 }}
				accessibilityRole="button"
			>
				<Text style={{ color: '#fff', fontWeight: '700' }}>Log in</Text>
			</Pressable>
			<Pressable onPress={() => navigation.navigate('Auth/Forgot') as never} style={{ marginTop: 12 }}>
				<Text style={{ textAlign: 'center', color: '#6b7280' }}>Forgot your password?</Text>
			</Pressable>
			<View style={{ marginTop: 16 }}>
				<Text style={{ fontSize: 12, textAlign: 'center', color: '#9ca3af' }}>
					By logging in or creating an account, you agree to our terms of service and privacy policy.
				</Text>
			</View>
			<GoogleSignInButton onSuccess={async () => {
				try {
					// Small delay to ensure AsyncStorage is updated
					await new Promise(resolve => setTimeout(resolve, 100));
					
					// Get user roles after successful Google login
					const roles = await getUserRoles();
					console.log('Google login successful - User roles:', roles);
					
					// Ensure roles is an array
					const userRoles = Array.isArray(roles) ? roles : [];
					
					// Determine target route based on user role
					const targetRoute = getRouteByRole(userRoles);
					console.log('Redirecting to:', targetRoute);
					
					// Navigate to appropriate screen based on role
					navigation.reset({ 
						index: 0, 
						routes: [{ name: targetRoute }] 
					});
				} catch (error) {
					console.error('Google login navigation error:', error);
					// Fallback to Root if there's an error
					navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
				}
			}} />
			</View>
		</View>
	);
}