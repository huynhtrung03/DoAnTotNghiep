import { BaseApiClient } from './api/BaseApiClient';

export interface IRegisterInputs {
  fullName: string;
  email: string;
  username: string;
  password: string;
  repeatPassword: string;
  accountType: '0' | '1';
}

/**
 * Dang ky tai khoan moi
 */
export async function RegisterService(data: IRegisterInputs) {
  try {
    return await BaseApiClient.post('/auth/register', data);
  } catch (error: any) {
    console.error('Loi dang ky:', error);

    // Xu ly cac dinh dang loi khac nhau
    const errorMsg =
      Array.isArray(error.response?.data?.message) ? error.response.data.message[0]
      : Array.isArray(error.response?.data?.errors) ? error.response.data.errors[0]
      : error.response?.data?.message || error.response?.data?.error || 'Dang ky that bai';

    throw new Error(errorMsg);
  }
}