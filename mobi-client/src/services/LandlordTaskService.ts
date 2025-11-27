import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './config/Constant';

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

const BASE_URL = `${API_URL}/landlord-tasks`;

/**
 * Get authentication headers with token
 */
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('accessToken');
  if (!token) {
    throw new Error('Authentication required. Please login again.');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

export const LandlordTaskService = {
  /**
   * Create a new landlord task
   */
  async createTask(data: LandlordTaskCreateDto): Promise<LandlordTaskResponseDto> {
    try {
      // console.log('📝 Creating task:', data);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      // console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create task error:', errorText);
        throw new Error(`Failed to create task: ${response.status}`);
      }

      const result = await response.json();
      // console.log('✅ Task created:', result);
      return result;
    } catch (error) {
      console.error('💥 createTask error:', error);
      throw error;
    }
  },

  /**
   * Update an existing landlord task
   */
  async updateTask(
    taskId: string,
    data: LandlordTaskUpdateDto
  ): Promise<LandlordTaskResponseDto> {
    try {
      // console.log('📝 Updating task:', taskId, data);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/${taskId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      // console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Update task error:', errorText);
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const result = await response.json();
      // console.log('✅ Task updated:', result);
      return result;
    } catch (error) {
      console.error('💥 updateTask error:', error);
      throw error;
    }
  },

  /**
   * Get tasks by landlord ID
   */
  async getTasksByLandlord(landlordId: string): Promise<LandlordTaskResponseDto[]> {
    try {
      // console.log('🔍 Fetching tasks for landlord:', landlordId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/landlord/${landlordId}`, {
        method: 'GET',
        headers,
      });

      // console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch tasks error:', errorText);
        throw new Error(`Failed to fetch tasks: ${response.status}`);
      }

      const tasks = await response.json();
      // console.log('✅ Tasks fetched:', tasks.length);
      return tasks;
    } catch (error) {
      console.error('💥 getTasksByLandlord error:', error);
      throw error;
    }
  },

  /**
   * Get task detail by task ID
   */
  async getTaskDetail(taskId: string): Promise<LandlordTaskResponseDto> {
    try {
      // console.log('🔍 Fetching task detail:', taskId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/${taskId}`, {
        method: 'GET',
        headers,
      });

      // console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch task detail error:', errorText);
        throw new Error(`Failed to fetch task detail: ${response.status}`);
      }

      const task = await response.json();
      // console.log('✅ Task detail fetched:', task);
      return task;
    } catch (error) {
      console.error('💥 getTaskDetail error:', error);
      throw error;
    }
  },

  /**
   * Delete a landlord task
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      // console.log('🗑️ Deleting task:', taskId);
      
      const headers = await getAuthHeaders();
      const response = await fetch(`${BASE_URL}/${taskId}`, {
        method: 'DELETE',
        headers,
      });

      // console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Delete task error:', errorText);
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      // console.log('✅ Task deleted');
    } catch (error) {
      console.error('💥 deleteTask error:', error);
      throw error;
    }
  },

  /**
   * Get tasks by status
   */
  async getTasksByStatus(
    landlordId: string,
    status: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.status === status);
  },

  /**
   * Get tasks by priority
   */
  async getTasksByPriority(
    landlordId: string,
    priority: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.priority === priority);
  },

  /**
   * Get overdue tasks
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
   * Get tasks by contract
   */
  async getTasksByContract(
    contractId: string,
    landlordId: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.contractId === contractId);
  },

  /**
   * Get tasks by room
   */
  async getTasksByRoom(
    roomId: string,
    landlordId: string
  ): Promise<LandlordTaskResponseDto[]> {
    const tasks = await this.getTasksByLandlord(landlordId);
    return tasks.filter(task => task.roomId === roomId);
  },
};