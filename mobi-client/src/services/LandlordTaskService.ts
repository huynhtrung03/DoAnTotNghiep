import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './Constant';
import { BaseApiClient } from './api/BaseApiClient';

export interface LandlordTaskCreateDto {
  title: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string; // ISO date string
  contractId?: string;
  roomId?: string;
  landlordId: string;
}

export interface LandlordTaskUpdateDto {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  contractId?: string;
  roomId?: string;
}

export interface LandlordTaskResponseDto {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  contractId?: string;
  roomId?: string;
  landlordId: string;
  createdAt: string;
  updatedAt: string;
}

export const LandlordTaskService = {
  /**
   * Tao moi mot nhiem vu cho chu nha
   */
  async createTask(data: LandlordTaskCreateDto): Promise<LandlordTaskResponseDto> {
    try {
      return await BaseApiClient.post<LandlordTaskResponseDto>('/landlord-tasks', data);
    } catch (error) {
      console.error('Loi tao nhiem vu:', error);
      throw error;
    }
  },

  /**
   * Cap nhat nhiem vu ton tai
   */
  async updateTask(
    taskId: string,
    data: LandlordTaskUpdateDto
  ): Promise<LandlordTaskResponseDto> {
    try {
      return await BaseApiClient.put<LandlordTaskResponseDto>(`/landlord-tasks/${taskId}`, data);
    } catch (error) {
      console.error('Loi cap nhat nhiem vu:', error);
      throw error;
    }
  },

  /**
   * Lay danh sach nhiem vu theo ID chu nha
   */
  async getTasksByLandlord(landlordId: string): Promise<LandlordTaskResponseDto[]> {
    try {
      return await BaseApiClient.get<LandlordTaskResponseDto[]>(`/landlord-tasks/landlord/${landlordId}`);
    } catch (error) {
      console.error('Loi lay danh sach nhiem vu:', error);
      throw error;
    }
  },

  /**
   * Lay chi tiet nhiem vu theo ID
   */
  async getTaskDetail(taskId: string): Promise<LandlordTaskResponseDto> {
    try {
      return await BaseApiClient.get<LandlordTaskResponseDto>(`/landlord-tasks/${taskId}`);
    } catch (error) {
      console.error('Loi lay chi tiet nhiem vu:', error);
      throw error;
    }
  },

  /**
   * Xoa nhiem vu cua chu nha
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await BaseApiClient.delete(`/landlord-tasks/${taskId}`);
    } catch (error) {
      console.error('Loi xoa nhiem vu:', error);
      throw error;
    }
  },

  /**
   * Lay nhiem vu theo trang thai
   */
  async getTasksByStatus(
    landlordId: string,
    status: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.status === status);
  },

  /**
   * Lay nhiem vu theo muc do uu tien
   */
  async getTasksByPriority(
    landlordId: string,
    priority: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.priority === priority);
  },

  /**
   * Lay nhiem vu qua han
   */
  async getOverdueTasks(landlordId: string): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    const now = new Date();
    return tasks.filter(
      task =>
        task.dueDate &&
        new Date(task.dueDate) < now &&
        task.status !== 'COMPLETED' &&
        task.status !== 'CANCELLED'
    );
  },

  /**
   * Lay nhiem vu theo hop dong
   */
  async getTasksByContract(
    contractId: string,
    landlordId: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.contractId === contractId);
  },

  /**
   * Lay nhiem vu theo phong
   */
  async getTasksByRoom(
    roomId: string,
    landlordId: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.roomId === roomId);
  },
};