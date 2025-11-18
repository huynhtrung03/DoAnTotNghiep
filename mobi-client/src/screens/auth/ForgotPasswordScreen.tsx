import { View, TextInput, Button, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { API_URL } from '../../services/Constant';
import axios from 'axios';
import styles from '../../styles/screens/auth/ForgotPasswordScreen.styles';

export default function ForgotPasswordScreen() {
	const [email, setEmail] = useState('');
	const submit = async () => {
		try {
			await axios.post(`${API_URL}/auth/forgot-password`, { email });
			Alert.alert('Check your email for reset link');
		} catch {
			Alert.alert('Failed to send reset email');
		}
	};
	return (
		<KeyboardAvoidingView 
			style={styles.container} 
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			<ScrollView 
				contentContainerStyle={styles.scrollViewContent}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.formContainer}>
					<TextInput 
						value={email} 
						onChangeText={setEmail} 
						placeholder="Email" 
						keyboardType="email-address"
						style={styles.textInput} 
					/>
					<Button title="Send reset link" onPress={submit} />
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}