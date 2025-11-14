import { API_URL } from '../config/Constant';
import axios from 'axios';

export interface IRegisterInputs {
  fullName: string;
  email: string;
  username: string;
  password: string;
  repeatPassword: string;
  accountType: '0' | '1';
}

export async function RegisterService(data: IRegisterInputs) {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error during registration:', error);
    
    // Handle different error formats
    const errorMsg = 
      Array.isArray(error.response?.data?.message) ? error.response.data.message[0]
      : Array.isArray(error.response?.data?.errors) ? error.response.data.errors[0]
      : error.response?.data?.message || error.response?.data?.error || "Registration failed";
    
    throw new Error(errorMsg);
  }
}