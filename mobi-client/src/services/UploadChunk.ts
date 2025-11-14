import { API_URL } from './config/Constant';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Response Types
interface InitResponse {
  uploadId: string;
  chunkSize?: number;
}

interface StatusResponse {
  chunks?: number[];
}

interface UploadChunkParams {
  uploadId: string;
  chunkIndex: number;
  totalChunks: number;
  filename: string;
  blob: string; // Base64 string or file URI in React Native
  chunkHash?: string;
}

interface CompleteResponse {
  success: boolean;
  fileUrl?: string;
  message?: string;
}

interface UploadChunkResponse {
  success: boolean;
  chunkIndex: number;
  message?: string;
}

interface CleanupResponse {
  message: string;
  uploadId: string;
  deletedFiles?: number;
}

/**
 * Get authentication headers
 */
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

const API = {
  /**
   * Initialize chunked upload
   */
  init: async (
    filename: string,
    totalChunks: number,
    totalSize: number,
    fileHash?: string
  ): Promise<InitResponse> => {
    try {
      const headers = await getAuthHeaders();
      const body = {
        filename,
        totalChunks,
        totalSize,
        ...(fileHash && { fileHash }),
      };

      console.log('🚀 Initializing upload:', { filename, totalChunks, totalSize });

      const r = await fetch(`${API_URL}/upload/init`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const errorText = await r.text();
        console.error('❌ Init failed:', errorText);
        throw new Error('init failed');
      }

      const result = await r.json() as InitResponse;
      console.log('✅ Upload initialized:', result.uploadId);
      return result;
    } catch (error) {
      console.error('❌ API.init error:', error);
      throw error;
    }
  },

  /**
   * Get upload status
   */
  status: async (uploadId: string): Promise<StatusResponse> => {
    try {
      console.log('📊 Checking upload status:', uploadId);

      const r = await fetch(
        `${API_URL}/upload/status?uploadId=${encodeURIComponent(uploadId)}`
      );

      if (!r.ok) {
        console.error('❌ Status check failed:', r.status);
        throw new Error('status failed');
      }

      const result = await r.json() as StatusResponse;
      console.log('✅ Upload status:', result.chunks?.length || 0, 'chunks uploaded');
      return result;
    } catch (error) {
      console.error('❌ API.status error:', error);
      throw error;
    }
  },

  /**
   * Upload a single chunk with retry logic
   */
  uploadChunk: async (params: UploadChunkParams): Promise<UploadChunkResponse> => {
    const { uploadId, chunkIndex, totalChunks, filename, blob, chunkHash } = params;

    try {
      const token = await AsyncStorage.getItem('accessToken');

      // Create FormData for React Native
      const form = new FormData();
      form.append('uploadId', uploadId);
      form.append('chunkIndex', String(chunkIndex));
      form.append('totalChunks', String(totalChunks));
      form.append('filename', filename);

      // In React Native, blob can be a file URI or base64 string
      // Assuming blob is a file URI from expo-document-picker or similar
      form.append('chunk', {
        uri: blob,
        type: 'application/octet-stream',
        name: `chunk-${chunkIndex}`,
      } as any);

      if (chunkHash) {
        form.append('chunkHash', chunkHash);
      }

      let attempt = 0;
      while (true) {
        try {
          console.log(`📤 Uploading chunk ${chunkIndex + 1}/${totalChunks} (attempt ${attempt + 1})`);

          const r = await fetch(`${API_URL}/upload/chunk`, {
            method: 'POST',
            headers: {
              ...(token && { 'Authorization': `Bearer ${token}` }),
              // Don't set Content-Type for FormData in React Native
            },
            body: form,
          });

          if (!r.ok) {
            throw new Error(`chunk ${chunkIndex} failed ${r.status}`);
          }

          const result = await r.json();
          console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`);
          return result;
        } catch (e) {
          attempt++;
          if (attempt >= 3) {
            console.error(`❌ Chunk ${chunkIndex} failed after 3 attempts:`, e);
            throw e;
          }

          const delay = 500 * 2 ** (attempt - 1);
          console.log(`⏳ Retrying chunk ${chunkIndex} in ${delay}ms...`);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    } catch (error) {
      console.error('❌ API.uploadChunk error:', error);
      throw error;
    }
  },

  /**
   * Complete upload and cleanup
   */
  complete: async (
    uploadId: string,
    filename: string,
    fileHash: string,
    roomId: string
  ): Promise<CompleteResponse> => {
    try {
      const headers = await getAuthHeaders();
      const body = {
        uploadId,
        filename,
        fileHash,
        roomId,
      };

      console.log('🏁 Completing upload:', uploadId);

      const r = await fetch(`${API_URL}/upload/complete`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const errorText = await r.text();
        console.error('❌ Complete failed:', errorText);
        throw new Error('complete failed');
      }

      const result = await r.json() as CompleteResponse;
      console.log('✅ Upload completed:', result.fileUrl);

      // Call cleanup API after successful completion
      try {
        await API.cleanup(uploadId);
      } catch (cleanupError) {
        console.warn('⚠️ Cleanup failed, but upload was successful:', cleanupError);
        // Don't throw error as the main upload was successful
      }

      return result;
    } catch (error) {
      console.error('❌ API.complete error:', error);
      throw error;
    }
  },

  /**
   * Cleanup temporary upload files
   */
  cleanup: async (uploadId: string): Promise<CleanupResponse> => {
    try {
      console.log('🧹 Cleaning up upload:', uploadId);

      const headers = await getAuthHeaders();

      const r = await fetch(
        `${API_URL}/upload/cleanup?uploadId=${encodeURIComponent(uploadId)}`,
        {
          method: 'POST',
          headers,
        }
      );

      if (!r.ok) {
        console.error('❌ Cleanup failed:', r.status);
        throw new Error('cleanup failed');
      }

      const result = await r.json() as CleanupResponse;
      console.log('✅ Cleanup completed:', result.deletedFiles || 0, 'files deleted');
      return result;
    } catch (error) {
      console.error('❌ API.cleanup error:', error);
      throw error;
    }
  },
};

export default API;
export type {
  InitResponse,
  StatusResponse,
  UploadChunkParams,
  CompleteResponse,
  UploadChunkResponse,
  CleanupResponse,
};
