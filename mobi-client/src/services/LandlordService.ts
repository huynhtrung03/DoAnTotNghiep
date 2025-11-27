import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config/Constant';
import { PageResponse, LandlordDetailByRoom, Landlord, RoomInUser } from '../types/types';

export const landlordService = {
  async getAllLandlords(page: number = 0, size: number = 6): Promise<PageResponse<Landlord>> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/landlords?page=${page}&size=${size}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch landlords');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlords:', error);
      throw error;
    }
  },

  async getLandlordById(landlordId: string): Promise<LandlordDetailByRoom> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/landlords/${landlordId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch landlord detail');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord detail:', error);
      throw error;
    }
  },

  async getLandlordRooms(landlordId: string, page: number = 0, size: number = 9): Promise<PageResponse<RoomInUser>> {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/landlords/${landlordId}/rooms?page=${page}&size=${size}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch landlord rooms');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching landlord rooms:', error);
      throw error;
    }
  },
};
