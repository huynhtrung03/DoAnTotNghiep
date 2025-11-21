import { View, Alert, ImageBackground, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AuthHeader from '../../components/auth/AuthHeader';
import AuthForms from '../../components/auth/AuthForms';
import { loginWithUsername } from '../../lib/auth';
import styles from '../../styles/screens/auth/LoginScreen.styles';

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
		<View style={styles.container}>
			<ImageBackground
				source={require('../../../assets/images/anh3.jpg')}
				style={StyleSheet.absoluteFillObject}
				resizeMode="cover"
			/>
			<View style={styles.backgroundOverlay}>
				<KeyboardAvoidingView 
					style={styles.container}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
					keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
				>
					<View style={styles.headerContainer}>
						<AuthHeader />
					</View>
					<ScrollView 
						contentContainerStyle={styles.scrollViewContent}
						showsVerticalScrollIndicator={false}
						keyboardShouldPersistTaps="handled"
					>
						<View style={styles.formContainer}>
							<AuthForms onSubmit={onSubmit} />
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</View>
		</View>
	);
}