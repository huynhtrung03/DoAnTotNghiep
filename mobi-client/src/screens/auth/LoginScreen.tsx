import { View, Alert, ImageBackground, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthForms from '../../components/auth/AuthForms';
import { loginWithUsername } from '../../lib/auth';

export default function LoginScreen() {

	const onSubmit = async ({ username, password }: { username: string; password: string }) => {
		try {
			const { user } = await loginWithUsername(username, password);
			console.log('Login successful - User:', user);
			// Navigation is now handled by AuthForms component
		} catch (e: any) {
			Alert.alert('Login failed', e?.response?.data?.message ?? 'Please try again');
			throw e; // Re-throw to let AuthForms handle the error
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<ImageBackground
				source={require('../../../assets/images/anh3.jpg')}
				style={StyleSheet.absoluteFillObject}
				resizeMode="cover"
			/>
			<View style={{ flex: 1, backgroundColor: 'rgba(245,245,245,0.85)' }}>
				<KeyboardAvoidingView 
					style={{ flex: 1 }}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
				>
					<View style={{ paddingTop: 24, paddingHorizontal: 16 }}>
						<AuthHeader />
					</View>
					<ScrollView 
						contentContainerStyle={{ 
							flexGrow: 1, 
							alignItems: 'center', 
							justifyContent: 'center', 
							paddingHorizontal: 16,
							paddingBottom: 20
						}}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<View style={{ width: '100%', maxWidth: 420 }}>
							<AuthForms onSubmit={onSubmit} />
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</View>
	);
}