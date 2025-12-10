import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../Constant';

/**
 * Interface cho cancellable request
 */
export interface CancellableRequest<T> {
  promise: Promise<T>;
  cancel: () => void;
  requestId: string;
}

/**
 * Base API Client để tập trung hóa các yêu cầu HTTP
 * Xử lý xác thực, xử lý lỗi và các phương thức HTTP phổ biến
 */
export class BaseApiClient {
  private static readonly MAX_RETRIES = 1;
  private static readonly RETRY_DELAY = 1000; // 1 giây
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 giây mặc định (tăng lên để upload file)
  private static activeControllers = new Map<string, AbortController>();

  /**
   * Tạo request ID duy nhất để quản lý cancel
   */
  private static generateRequestId(endpoint: string, method: string): string {
    return `${method}_${endpoint}_${Date.now()}_${Math.random()}`;
  }

  /**
   * Hủy request đang chạy
   */
  static cancelRequest(requestId: string): void {
    const controller = this.activeControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.activeControllers.delete(requestId);
      console.log(` Đã hủy request: ${requestId}`);
    }
  }

  /**
   * Hủy tất cả requests đang chạy
   */
  static cancelAllRequests(): void {
    this.activeControllers.forEach((controller, requestId) => {
      controller.abort();
      console.log(` Đã hủy request: ${requestId}`);
    });
    this.activeControllers.clear();
  }

  /**
   * Hủy requests theo endpoint
   */
  static cancelRequestsByEndpoint(endpoint: string): void {
    const requestsToCancel: string[] = [];
    this.activeControllers.forEach((controller, requestId) => {
      if (requestId.includes(endpoint)) {
        controller.abort();
        requestsToCancel.push(requestId);
      }
    });
    requestsToCancel.forEach(id => {
      this.activeControllers.delete(id);
      console.log(`Đã hủy request theo endpoint: ${id}`);
    });
  }

  /**
   * Lấy số lượng requests đang chạy
   */
  static getActiveRequestCount(): number {
    return this.activeControllers.size;
  }

  /**
   * Kiểm tra xem có request nào đang chạy không
   */
  static hasActiveRequests(): boolean {
    return this.activeControllers.size > 0;
  }

  /**
   * Lấy headers xác thực với Bearer token
   */
  private static async getAuthHeaders(contentType: string = 'application/json'): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: Record<string, string> = {};

    if (contentType !== 'multipart/form-data') {
      headers['Content-Type'] = contentType;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Xử lý phản hồi API và trích xuất thông báo lỗi
   */
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails = null;

      console.log(`🔴 Response not OK - Status: ${response.status} ${response.statusText}`);

      try {
        const errorData = await response.json();
        console.log('🔴 Error response JSON:', JSON.stringify(errorData, null, 2));
        errorDetails = errorData;
        errorMessage = errorData.details || errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // Nếu phản hồi không phải JSON, thử lấy text
        try {
          const errorText = await response.text();
          console.log('🔴 Error response text:', errorText);
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          console.log('🔴 Cannot parse error response');
          // Giữ thông báo lỗi mặc định
        }
      }

      console.error('🔴 Final error message:', errorMessage);
      throw new Error(errorMessage);
    }

    // Xử lý phản hồi trống (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    // Xử lý phản hồi có thể là rỗng hoặc JSON
    try {
      const text = await response.text();
      
      // Nếu response body trống, trả về object trống
      if (!text || text.trim() === '') {
        return {} as T;
      }

      // Nếu có content, parse JSON
      return JSON.parse(text) as T;
    } catch (parseError) {
      // Nếu parse lỗi, trả về object trống
      console.warn('⚠️ Failed to parse response as JSON, returning empty object');
      return {} as T;
    }
  }

  /**
   * Hàm sleep để delay retry
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Thực hiện yêu cầu HTTP với logic retry, timeout và cancel
   */
  private static async executeRequest<T>(
    url: string,
    options: RequestInit,
    retryCount: number = 0,
    timeout: number = this.DEFAULT_TIMEOUT,
    requestId?: string,
    externalController?: AbortController
  ): Promise<T> {
    // Sử dụng external controller nếu được cung cấp, ngược lại tạo mới
    const controller = externalController || new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(` Timeout sau ${timeout}ms cho request: ${url}`);
    }, timeout);

    // Lưu controller để có thể cancel từ bên ngoài (chỉ khi không phải external)
    if (requestId && !externalController) {
      this.activeControllers.set(requestId, controller);
    }

    try {
      // console.log(` Yêu cầu API: ${options.method} ${url} (timeout: ${timeout}ms)`);
      console.log(` Yêu cầu API: ${url} (timeout: ${timeout}ms)`);
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (requestId && !externalController) {
        this.activeControllers.delete(requestId);
      }

      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      if (requestId && !externalController) {
        this.activeControllers.delete(requestId);
      }

      // Kiểm tra nếu là lỗi abort (cancel hoặc timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        if (controller.signal.aborted) {
          throw new Error('Request đã bị hủy');
        } else {
          throw new Error(`Timeout sau ${timeout}ms`);
        }
      }

      console.error(` Lỗi API (${options.method} ${url}):`, error);

      // Logic retry cho lỗi mạng (không phải lỗi HTTP 4xx/5xx)
      if (retryCount < this.MAX_RETRIES && this.isRetryableError(error)) {
        console.log(` Thử lại yêu cầu (${retryCount + 1}/${this.MAX_RETRIES})...`);
        await this.sleep(this.RETRY_DELAY);
        return this.executeRequest<T>(url, options, retryCount + 1, timeout, requestId, externalController);
      }

      throw error;
    }
  }

  /**
   * Kiểm tra xem lỗi có thể retry được không (lỗi mạng, không phải lỗi HTTP)
   */
  private static isRetryableError(error: any): boolean {
    // Retry cho lỗi mạng, timeout, etc.
    // Không retry cho lỗi HTTP 4xx/5xx (được xử lý trong handleResponse)
    return error.name === 'TypeError' || error.message?.includes('Network request failed');
  }

  /**
   * Yêu cầu GET
   */
  static async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    const requestId = this.generateRequestId(endpoint, 'GET');

    // Tạo query string
    let url = `${API_URL}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.executeRequest<T>(url, {
      method: 'GET',
      headers,
    }, 0, timeout, requestId);
  }

  /**
   * Yêu cầu POST
   */
  static async post<T>(
    endpoint: string,
    data?: any,
    contentType: string = 'application/json',
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    const headers = await this.getAuthHeaders(contentType);
    const url = `${API_URL}${endpoint}`;
    const requestId = this.generateRequestId(endpoint, 'POST');

    const options: RequestInit = {
      method: 'POST',
      headers,
    };

    if (data) {
      if (contentType === 'multipart/form-data') {
        // Với FormData, để trình duyệt tự đặt Content-Type với boundary
        delete headers['Content-Type'];
        options.body = data; // Đối tượng FormData
      } else {
        options.body = JSON.stringify(data);
      }
    }

    return this.executeRequest<T>(url, options, 0, timeout, requestId);
  }

  /**
   * Yêu cầu PATCH
   */
  static async patch<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    let url = `${API_URL}${endpoint}`;
    const requestId = this.generateRequestId(endpoint, 'PATCH');

    // Thêm query params nếu được cung cấp
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.executeRequest<T>(url, {
      method: 'PATCH',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    }, 0, timeout, requestId);
  }

  /**
   * Yêu cầu PUT
   */
  static async put<T>(
    endpoint: string,
    data?: any,
    params?: Record<string, any>,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    let url = `${API_URL}${endpoint}`;
    const requestId = this.generateRequestId(endpoint, 'PUT');

    // Thêm query params nếu được cung cấp
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.executeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined,
    }, 0, timeout, requestId);
  }

  /**
   * Yêu cầu DELETE
   */
  static async delete<T>(
    endpoint: string,
    params?: Record<string, any>,
    timeout: number = this.DEFAULT_TIMEOUT
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    let url = `${API_URL}${endpoint}`;
    const requestId = this.generateRequestId(endpoint, 'DELETE');

    // Thêm query params nếu được cung cấp
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.executeRequest<T>(url, {
      method: 'DELETE',
      headers,
    }, 0, timeout, requestId);
  }

  /**
   * Upload file với FormData
   * POST request - Do NOT set Content-Type header for FormData
   * Timeout mặc định 30000ms để đủ thời gian upload ảnh
   */
  static async uploadFile<T>(
    endpoint: string,
    formData: FormData,
    timeout: number = 30000 // Tăng timeout cho upload file
  ): Promise<T> {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: Record<string, string> = {};

    // ONLY set Authorization, NOT Content-Type
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;
    const requestId = this.generateRequestId(endpoint, 'UPLOAD');

    return this.executeRequest<T>(url, {
      method: 'POST',
      headers,
      body: formData,
    }, 0, timeout, requestId);
  }

  /**
   * Yêu cầu PUT với FormData
   * Do NOT set Content-Type header for FormData
   * Timeout mặc định 30000ms để đủ thời gian upload ảnh
   */
  static async putUpload<T>(
    endpoint: string,
    formData: FormData,
    timeout: number = 30000 // Tăng timeout cho upload file
  ): Promise<T> {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: Record<string, string> = {};

    // ONLY set Authorization, NOT Content-Type
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;
    const requestId = this.generateRequestId(endpoint, 'PUT');

    return this.executeRequest<T>(url, {
      method: 'PUT',
      headers,
      body: formData,
    }, 0, timeout, requestId);
  }

  /**
   * Yêu cầu PATCH với FormData
   * Do NOT set Content-Type header for FormData
   * Timeout mặc định 30000ms để đủ thời gian upload ảnh
   */
  static async patchUpload<T>(
    endpoint: string,
    formData: FormData,
    timeout: number = 30000 // Tăng timeout cho upload file
  ): Promise<T> {
    const token = await AsyncStorage.getItem('accessToken');
    const headers: Record<string, string> = {};

    // ONLY set Authorization, NOT Content-Type
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;
    const requestId = this.generateRequestId(endpoint, 'PATCH');

    return this.executeRequest<T>(url, {
      method: 'PATCH',
      headers,
      body: formData,
    }, 0, timeout, requestId);
  }

  /**
   * Tạo cancellable request - trả về promise và function cancel
   * Lưu ý: Method này tạo một AbortController riêng và không sử dụng executeRequest
   */
  static createCancellableRequest<T>(
    requestFn: (signal: AbortSignal) => Promise<T>,
    endpoint: string,
    method: string = 'REQUEST',
    timeout: number = this.DEFAULT_TIMEOUT
  ): CancellableRequest<T> {
    const requestId = this.generateRequestId(endpoint, method);
    const controller = new AbortController();

    // Lưu controller
    this.activeControllers.set(requestId, controller);

    // Tạo timeout
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(` Timeout sau ${timeout}ms cho cancellable request: ${requestId}`);
    }, timeout);

    const promise = requestFn(controller.signal).finally(() => {
      clearTimeout(timeoutId);
      this.activeControllers.delete(requestId);
    });

    const cancel = () => {
      clearTimeout(timeoutId);
      controller.abort();
      this.activeControllers.delete(requestId);
      console.log(`Đã hủy cancellable request: ${requestId}`);
    };

    return {
      promise,
      cancel,
      requestId,
    };
  }

  /**
   * Cancellable GET request
   */
  static getCancellable<T>(
    endpoint: string,
    params?: Record<string, any>,
    timeout: number = this.DEFAULT_TIMEOUT
  ): CancellableRequest<T> {
    return this.createCancellableRequest(async (signal) => {
      const headers = await this.getAuthHeaders();

      let url = `${API_URL}${endpoint}`;
      if (params) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
      }

      console.log(`Cancellable GET: ${url} (timeout: ${timeout}ms)`);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal,
      });

      return this.handleResponse<T>(response);
    }, endpoint, 'GET', timeout);
  }

  /**
   * Cancellable POST request
   */
  static postCancellable<T>(
    endpoint: string,
    data?: any,
    contentType: string = 'application/json',
    timeout: number = this.DEFAULT_TIMEOUT
  ): CancellableRequest<T> {
    return this.createCancellableRequest(async (signal) => {
      const headers = await this.getAuthHeaders(contentType);
      const url = `${API_URL}${endpoint}`;

      const options: RequestInit = {
        method: 'POST',
        headers,
        signal,
      };

      if (data) {
        if (contentType === 'multipart/form-data') {
          delete headers['Content-Type'];
          options.body = data;
        } else {
          options.body = JSON.stringify(data);
        }
      }

      console.log(`Cancellable POST: ${url} (timeout: ${timeout}ms)`);

      const response = await fetch(url, options);
      return this.handleResponse<T>(response);
    }, endpoint, 'POST', timeout);
  }
}