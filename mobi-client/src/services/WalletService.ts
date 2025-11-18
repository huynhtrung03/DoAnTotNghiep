import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletErrorResponse {
  forbidden?: boolean;
  passwordNull?: boolean;
}

/**
 * Get user wallet information
 * @returns Wallet object, null if not found, or error response object
 */
export async function getUserWallet(): Promise<Wallet | WalletErrorResponse | null> {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    const userDataStr = await AsyncStorage.getItem('userData');

    if (!token || !userDataStr) {
      throw new Error('User is not authenticated');
    }

    const userData = JSON.parse(userDataStr);
    const userId = userData.id;

    if (!userId) {
      throw new Error('User ID not found');
    }

    console.log('📱 Fetching wallet for user:', userId);

    const response = await fetch(`${API_URL}/wallets/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Handle 400 - Wallet not found for user
    if (response.status === 400) {
      console.log('⚠️ Wallet not found for user');
      return null;
    }

    // Handle 403 - Forbidden
    if (response.status === 403) {
      console.log('🚫 Access forbidden');
      return { forbidden: true };
    }

    // Handle other errors
    if (!response.ok) {
      let errorMsg = 'Failed to fetch user wallet';
      try {
        const error = await response.json();
        errorMsg = Array.isArray(error.message)
          ? error.message[0]
          : error.message || error.error || errorMsg;

        // Handle special case: password cannot be null
        if (errorMsg === 'password cannot be null') {
          console.log('⚠️ Password null error');
          return { passwordNull: true };
        }
      } catch (e) {
        // If JSON parsing fails, keep default error message
        console.error('❌ Error parsing response:', e);
      }
      throw new Error(errorMsg);
    }

    const wallet = await response.json();

    // If backend returns null (no wallet), return null
    if (!wallet) {
      console.log('⚠️ Wallet data is null');
      return null;
    }

    console.log('✅ Wallet fetched successfully:', wallet.id);
    return wallet as Wallet;
  } catch (error) {
    console.error('❌ getUserWallet error:', error);
    throw error;
  }
}
