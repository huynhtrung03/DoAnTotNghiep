import { View, TextInput, Button, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { API_URL } from '../../services/Constant';
import axios from 'axios';

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
			style={{ flex: 1 }} 
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
		>
			<ScrollView 
				contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 16 }}
				keyboardShouldPersistTaps="handled"
			>
				<View style={{ gap: 12 }}>
					<TextInput 
						value={email} 
						onChangeText={setEmail} 
						placeholder="Email" 
						keyboardType="email-address"
						style={{ borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8 }} 
					/>
					<Button title="Send reset link" onPress={submit} />
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}