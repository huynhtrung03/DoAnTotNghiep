/* eslint-disable @typescript-eslint/no-explicit-any */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './Constant';
import { BillData } from '../types/types';
import { BaseApiClient } from './api/BaseApiClient';

const BASE_URL = `${API_URL}/contracts`;

export const BillService = {
  /**
   * Lay thong tin hoa don theo ID
   */
  async getById(contractId: string, billId: string): Promise<BillData> {
    console.log(`Lay hoa don ${billId} cua hop dong ${contractId}`);

    return BaseApiClient.get<BillData>(
      `/contracts/${contractId}/bills/${billId}`
    );
  },

  /**
   * Lay danh sach hoa don cua hop dong
   */
  async getByContract(contractId: string): Promise<BillData[]> {
    console.log(`Lay danh sach hoa don cua hop dong ${contractId}`);

    try {
      return await BaseApiClient.get<BillData[]>(
        `/contracts/${contractId}/bills`
      );
    } catch (error) {
      console.error(`Loi khi lay hoa don hop dong ${contractId}:`, error);
      throw error;
    }
  },

  /**
   * Tao hoa don moi
   */
  async createBill(
    contractId: string,
    billData: Partial<BillData>
  ): Promise<BillData> {
    console.log(`Tao hoa don moi cho hop dong ${contractId}`, billData);

    return BaseApiClient.post<BillData>(
      `/contracts/${contractId}/bills`,
      { contractId, ...billData }
    );
  },

  /**
   * Cap nhat thong tin hoa don
   */
  async updateBill(
    contractId: string,
    billId: string,
    billData: Partial<BillData>
  ): Promise<BillData> {
    console.log(`Cap nhat hoa don ${billId} cua hop dong ${contractId}`, billData);

    return BaseApiClient.patch<BillData>(
      `/contracts/${contractId}/bills/${billId}`,
      billData
    );
  },

  /**
   * Cap nhat trang thai hoa don
   */
  async updateBillStatus(
    contractId: string,
    billId: string,
    status: string
  ): Promise<BillData> {
    console.log(`Cap nhat trang thai hoa don ${billId}: ${status}`);

    return BaseApiClient.patch<BillData>(
      `/contracts/${contractId}/bills/${billId}/status`,
      { status }
    );
  },

  /**
   * Xoa hoa don
   */
  async deleteBill(contractId: string, billId: string): Promise<void> {
    console.log(`Xoa hoa don ${billId} cua hop dong ${contractId}`);

    return BaseApiClient.delete<void>(
      `/contracts/${contractId}/bills/${billId}`
    );
  },

  /**
   * Tai xuong hoa don (tra ve Blob)
   */
  async downloadBill(contractId: string, billId: string): Promise<Blob> {
    console.log(`Tai xuong hoa don ${billId} cua hop dong ${contractId}`);

    const accessToken = await AsyncStorage.getItem('accessToken');
    const headers: Record<string, string> = {};

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Download bill truc tiep vi can tra ve Blob
    const response = await fetch(
      `${API_URL}/contracts/${contractId}/bills/${billId}/download`,
      {
        headers,
      }
    );

    if (!response.ok) {
      throw new Error('Khong the tai xuong hoa don');
    }

    return response.blob();
  },

  /**
   * Upload anh chung minh thanh toan cho hoa don
   */
  async uploadBillImageProof(
    contractId: string,
    billId: string,
    file: any // React Native file object
  ): Promise<{ message: string; imageUrl: string }> {
    // Validation giu nguyen
    if (!contractId) {
      throw new Error("Thieu contractId");
    }

    if (!billId) {
      throw new Error("Thieu billId");
    }

    if (!file) {
      throw new Error("Thieu file");
    }

    console.log("Upload anh chung minh thanh toan:", {
      contractId,
      billId,
      fileName: file.name || file.uri,
    });

    // Tao FormData nhu cu
    const formData = new FormData();
    if (file.uri) {
      // Expo/React Native file
      formData.append("file", {
        uri: file.uri,
        name: file.name || `image_${Date.now()}.jpg`,
        type: file.type || 'image/jpeg',
      } as any);
    } else {
      formData.append("file", file);
    }

    try {
      const result = await BaseApiClient.uploadFile<{ message: string; imageUrl: string }>(
        `/contracts/${contractId}/bills/${billId}/upload-image-proof`,
        formData
      );

      console.log("Upload anh thanh cong:", result);
      return result;
    } catch (error) {
      console.error("Loi upload anh:", error);
      throw error;
    }
  },
};