import { useEffect } from 'react';
import { Pressable, Text, Alert, View } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../../services/Constant';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function GoogleSignInButton({ onSuccess, disabled }: { onSuccess?: () => void; disabled?: boolean }) {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const webClientId = (Constants.expoConfig?.extra as any)?.GOOGLE_CLIENT_ID_WEB;
    console.log('Google Sign-In Button mounted');
    console.log('Web Client ID:', webClientId ? 'Configured' : 'Not found');
    
    GoogleSignin.configure({
        webClientId: webClientId,
        offlineAccess: !!webClientId, // Chỉ bật offlineAccess nếu có webClientId
      });
  }, []);

  const handlePress = async () => {
    try {
        console.log('=== Google Sign-In Button Pressed ===');
        console.log('Starting Google Sign-In process...');
        
        // Xóa session cũ để hiện lại dialog chọn tài khoản
        try {
          await GoogleSignin.signOut();
          console.log('Previous session cleared');
        } catch (e) {
          console.log('No previous session to clear');
        }
        
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        console.log('Play Services verified');
        
        await GoogleSignin.signIn();
        console.log('Google Sign-In successful');
        
        const { idToken } = await GoogleSignin.getTokens();
        console.log('ID Token obtained:', idToken ? 'Yes' : 'No');
      if (!idToken) {
        console.warn('No ID Token returned');
        Alert.alert('Google Sign-In failed', 'No idToken returned');
        return;
      }
      
      console.log('Exchanging token with backend...');
      console.log('API_URL:', API_URL);
      console.log('idToken length:', idToken?.length);
      console.log('idToken first 50 chars:', idToken?.substring(0, 50));
      
      // Exchange idToken for your app tokens
      const response = await axios.post(`${API_URL}/auth/google-login`, { credential: idToken });
      console.log('Backend response received');
      
      const { accessToken, refreshToken, roles, userProfile, username: responseUsername, id } = response.data;
      
      console.log('Google login response:', response.data);
      console.log('Google login roles:', roles);
      console.log('User ID:', id);
      console.log('Username:', responseUsername);
      
      // Create user object from response data
      const user = {
        id,
        username: responseUsername,
        roles: roles || [],
        userProfile: userProfile || {}
      };
      console.log('User object created:', user);
      
      // Save tokens and user info to AsyncStorage (similar to loginWithUsername)
      console.log('Saving to AsyncStorage...');
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken ?? ''],
        ['userRoles', JSON.stringify(roles || [])],
        ['userProfile', JSON.stringify(userProfile || {})],
        ['userData', JSON.stringify(user)], // Save userData (was missing!)
        ['userData', JSON.stringify(user)], // Save userData (was missing!)
      ]);
      console.log('Data saved to AsyncStorage');
      
      console.log('Google login successful - User roles:', roles);
      console.log('=== Google Sign-In Completed Successfully ===');
      
      // Call onSuccess callback to let AuthForms handle navigation
      onSuccess?.();
    } catch (e: any) {
      console.error('=== Google Sign-In Error ===');
      console.error('Error type:', e?.code);
      console.error('Error message:', e?.message);
      console.error('Full error:', JSON.stringify(e, null, 2));
      Alert.alert('Google Sign-In error', e?.message ?? 'Try again');
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#dadce0',
          borderRadius: 12,
          paddingVertical: 14,
          paddingHorizontal: 16,
          opacity: pressed || disabled ? 0.7 : 1,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
          marginTop: 16,
          height: 54,
        },
      ]}
    >
      <View style={{
        width: 24,
        height: 24,
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name="logo-google" size={20} color="#DB4437" />
      </View>
      <Text style={{ color: '#3c4043', fontWeight: '600', fontSize: 15 }}>
        Đăng nhập bằng Google
      </Text>
    </Pressable>
  );
}