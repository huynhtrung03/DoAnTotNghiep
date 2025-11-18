import { useEffect } from 'react';
import { Pressable, Text, Alert, Image } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/Constant';
import { useNavigation } from '@react-navigation/native';

export default function GoogleSignInButton({ onSuccess, disabled }: { onSuccess?: () => void; disabled?: boolean }) {
  const navigation = useNavigation<any>();

  useEffect(() => {
    GoogleSignin.configure({
        webClientId: (Constants.expoConfig?.extra as any)?.GOOGLE_CLIENT_ID_WEB,
        offlineAccess: true
      });
  }, []);

  const handlePress = async () => {
    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        await GoogleSignin.signIn();
        const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        Alert.alert('Google Sign-In failed', 'No idToken returned');
        return;
      }
      // Exchange idToken for your app tokens
      const response = await axios.post(`${API_URL}/auth/google`, { credential: idToken });
      const { accessToken, refreshToken, roles, userProfile, username: responseUsername, id } = response.data;
      
      console.log('Google login response:', response.data);
      console.log('Google login roles:', roles);
      
      // Create user object from response data
      const user = {
        id,
        username: responseUsername,
        roles: roles || [],
        userProfile: userProfile || {}
      };
      
      // Save tokens and user info to AsyncStorage (similar to loginWithUsername)
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken ?? ''],
        ['userRoles', JSON.stringify(roles || [])],
        ['userProfile', JSON.stringify(userProfile || {})],
      ]);
      
      console.log('Google login successful - User roles:', roles);
      
      // Call onSuccess callback to let AuthForms handle navigation
      onSuccess?.();
    } catch (e: any) {
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
          borderRadius: 8,
          paddingVertical: 10,
          paddingHorizontal: 16,
          opacity: pressed || disabled ? 0.7 : 1,
          shadowColor: '#000',
          shadowOpacity: 0.05,
          shadowRadius: 3,
          elevation: 1,
          marginTop: 16,
        },
      ]}
    >
      <Image
        source={{
          uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png',
        }}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
      <Text style={{ color: '#3c4043', fontWeight: '600', fontSize: 15 }}>
        Continue with Google
      </Text>
    </Pressable>
  );
}