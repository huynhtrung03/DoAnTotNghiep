import { NativeModules, NativeEventEmitter, Platform, Linking } from 'react-native';

const { PayZaloBridge } = NativeModules;

/**
 * Interface cho response từ ZaloPay SDK
 */
export interface ZaloPayResponse {
  returnCode: string;
  transactionId?: string;
  transToken?: string;
  appTransID?: string;
  error?: string;
}

/**
 * Error codes từ ZaloPay SDK
 */
export enum ZaloPayErrorCode {
  PAYMENT_SUCCESS = '1',
  PAYMENT_PROCESSING = '2', // Đang xử lý - cũng coi như thành công
  PAYMENT_CANCELED = '4',
  PAYMENT_FAILED = '-1',
  APP_NOT_INSTALLED = '3', // Từ tài liệu: khi app chưa cài đặt
}

/**
 * Service xử lý thanh toán ZaloPay cho React Native
 * Theo tài liệu chính thức: https://docs.zalopay.vn/v2/docs/sdk
 */
class ZaloPayService {
  private eventEmitter: NativeEventEmitter | null = null;
  private listener: any = null;
  private pendingCallback: ((result: ZaloPayResponse) => void) | null = null;

  constructor() {
    console.log('🏗️ [ZaloPayService] Constructor called');
    console.log('📱 [ZaloPayService] Platform:', Platform.OS);
    console.log('🔧 [ZaloPayService] PayZaloBridge exists:', !!PayZaloBridge);

    if (Platform.OS === 'android' && PayZaloBridge) {
      console.log('📡 [ZaloPayService] Setting up event emitter');
      this.eventEmitter = new NativeEventEmitter(PayZaloBridge);
      this.setupEventListener();
    } else {
      console.warn('⚠️ [ZaloPayService] Event emitter not set up - platform or module issue');
    }
  }

  /**
   * Setup event listener một lần duy nhất
   * Tránh việc add/remove listener liên tục
   */
  private setupEventListener(): void {
    console.log('🎧 [ZaloPayService] setupEventListener called');
    console.log('🎧 [ZaloPayService] eventEmitter exists:', !!this.eventEmitter);

    if (!this.eventEmitter) {
      console.error('❌ [ZaloPayService] No eventEmitter, cannot setup listener');
      return;
    }

    console.log('🎧 [ZaloPayService] Adding EventPayZalo listener');

    // Also listen for all events to debug
    const allEventsListener = this.eventEmitter.addListener('*', (event: any) => {
      console.log('📡 [ZaloPayService] ANY EVENT RECEIVED:', event);
    });
    console.log('🎧 [ZaloPayService] All events listener added');

    this.listener = this.eventEmitter.addListener('EventPayZalo', (response: ZaloPayResponse) => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 📨 [ZaloPayService] EVENT RECEIVED: EventPayZalo`);
      console.log(`[${timestamp}] 📨 [ZaloPayService] Event listener is active and working!`);
      console.log(`[${timestamp}] 📨 [ZaloPayService] Response data:`, JSON.stringify(response, null, 2));
      console.log(`[${timestamp}] 📨 [ZaloPayService] returnCode type:`, typeof response.returnCode);
      console.log(`[${timestamp}] 📨 [ZaloPayService] returnCode value:`, response.returnCode);
      console.log(`[${timestamp}] 📨 [ZaloPayService] pendingCallback exists:`, !!this.pendingCallback);
      
      if (this.pendingCallback) {
        console.log(`[${timestamp}] 📨 [ZaloPayService] Calling pendingCallback with response`);
        this.pendingCallback(response);
        this.pendingCallback = null;
        console.log(`[${timestamp}] 📨 [ZaloPayService] pendingCallback cleared`);
      } else {
        console.warn(`[${timestamp}] ⚠️ [ZaloPayService] No pendingCallback to call`);
      }
    });

    console.log('✅ [ZaloPayService] EventPayZalo listener added successfully');
  }

  /**
   * Kiểm tra xem ZaloPay app đã được cài đặt chưa
   */
  async isZaloPayInstalled(): Promise<boolean> {
    try {
      // Kiểm tra bằng deep link
      const canOpen = await Linking.canOpenURL('zalopay://app');
      return canOpen;
    } catch (error) {
      console.error('❌ Lỗi kiểm tra ZaloPay app:', error);
      return false;
    }
  }

  /**
   * Mở ZaloPay trên Store để tải về
   */
  async openZaloPayStore(): Promise<void> {
    try {
      if (Platform.OS === 'android') {
        const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.vng.zalopay';
        await Linking.openURL(playStoreUrl);
      } else if (Platform.OS === 'ios') {
        const appStoreUrl = 'https://apps.apple.com/vn/app/zalopay-thanh-toan-tien-loi/id1013707704';
        await Linking.openURL(appStoreUrl);
      }
    } catch (error) {
      console.error('❌ Lỗi mở Store:', error);
      throw error;
    }
  }

  /**
   * Mở ZaloPay app để thanh toán
   * @param zpTransToken - Token từ API backend (response.zptranstoken)
   * @param onResult - Callback nhận kết quả thanh toán
   * @returns Promise<boolean> - true nếu expect callback, false nếu sẽ query ngay
   *
   * Luồng:
   * 1. App gọi createOrder API → nhận zpTransToken
   * 2. Gọi payOrder(zpTransToken)
   * 3. Native module mở ZaloPay app
   * 4. User thanh toán trên ZaloPay
   * 5. ZaloPay trả kết quả qua EventPayZalo
   */
  async payOrder(
    zpTransToken: string,
    onResult: (result: ZaloPayResponse) => void
  ): Promise<boolean> {
    console.log('🎯 [ZaloPayService] payOrder called with token length:', zpTransToken?.length || 0);
    console.log('🎯 [ZaloPayService] onResult is function:', typeof onResult === 'function');
    console.log('🎯 [ZaloPayService] Current instance state:');
    console.log('  - eventEmitter:', !!this.eventEmitter);
    console.log('  - listener:', !!this.listener);
    console.log('  - pendingCallback before:', !!this.pendingCallback);

    if (Platform.OS !== 'android') {
      console.warn('⚠️ [ZaloPayService] Platform not Android, returning error');
      onResult({
        returnCode: ZaloPayErrorCode.PAYMENT_FAILED,
        error: 'Platform not supported'
      });
      return false;
    }

    if (!PayZaloBridge) {
      console.error('❌ [ZaloPayService] PayZaloBridge module not found');
      onResult({
        returnCode: ZaloPayErrorCode.PAYMENT_FAILED,
        error: 'Native module not found'
      });
      return false;
    }

    // Kiểm tra method payOrder có tồn tại không
    if (typeof PayZaloBridge.payOrder !== 'function') {
      console.error('❌ [ZaloPayService] PayZaloBridge.payOrder is not a function');
      console.error('❌ [ZaloPayService] Available methods:', Object.keys(PayZaloBridge));
      onResult({
        returnCode: ZaloPayErrorCode.PAYMENT_FAILED,
        error: 'Native method not available'
      });
      return false;
    }

    // Kiểm tra ZaloPay app đã cài chưa
    console.log('🔍 [ZaloPayService] Checking if ZaloPay app is installed...');
    const isInstalled = await this.isZaloPayInstalled();
    console.log('🔍 [ZaloPayService] ZaloPay app installed:', isInstalled);

    if (!isInstalled) {
      console.warn('⚠️ [ZaloPayService] ZaloPay app not installed, calling onResult with APP_NOT_INSTALLED');
      onResult({
        returnCode: ZaloPayErrorCode.APP_NOT_INSTALLED,
        error: 'ZaloPay app not installed'
      });
      return false;
    }

    // Log PayZaloBridge status trước khi gọi
    console.log('🔧 [ZaloPayService] PayZaloBridge object:', PayZaloBridge);
    console.log('🔧 [ZaloPayService] PayZaloBridge type:', typeof PayZaloBridge);
    console.log('🔧 [ZaloPayService] PayZaloBridge methods:', Object.getOwnPropertyNames(PayZaloBridge || {}));
    console.log('🔧 [ZaloPayService] PayZaloBridge has payOrder:', typeof PayZaloBridge?.payOrder);

    // Lưu callback để xử lý khi nhận event
    console.log('💾 [ZaloPayService] Setting pendingCallback');
    this.pendingCallback = onResult;

    try {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🚀 [ZaloPayService] Calling PayZaloBridge.payOrder with token:`, zpTransToken.substring(0, 20) + '...');
      console.log(`[${timestamp}] 🔧 [ZaloPayService] PayZaloBridge methods:`, Object.keys(PayZaloBridge || {}));

      PayZaloBridge.payOrder(zpTransToken);

      console.log(`[${timestamp}] ✅ [ZaloPayService] PayZaloBridge.payOrder called successfully`);
      return true; // Expect callback from native module
    } catch (error) {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] ❌ [ZaloPayService] Error calling PayZaloBridge.payOrder:`, error);
      console.error(`[${timestamp}] ❌ [ZaloPayService] Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      this.pendingCallback = null;
      onResult({
        returnCode: ZaloPayErrorCode.PAYMENT_FAILED,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return false; // Don't expect callback, error already handled
    }
  }

  /**
   * Parse return code thành message dễ hiểu
   */
  getStatusMessage(returnCode: string): string {
    switch (returnCode) {
      case ZaloPayErrorCode.PAYMENT_SUCCESS:
        return 'Thanh toán thành công';
      case ZaloPayErrorCode.PAYMENT_PROCESSING:
        return 'Thanh toán đang xử lý';
      case ZaloPayErrorCode.PAYMENT_CANCELED:
        return 'Người dùng hủy thanh toán';
      case ZaloPayErrorCode.APP_NOT_INSTALLED:
        return 'Chưa cài đặt ZaloPay';
      case ZaloPayErrorCode.PAYMENT_FAILED:
        return 'Thanh toán thất bại';
      default:
        return 'Trạng thái không xác định';
    }
  }

  /**
   * Kiểm tra thanh toán có thành công không
   */
  isPaymentSuccess(returnCode: string): boolean {
    return returnCode === ZaloPayErrorCode.PAYMENT_SUCCESS || returnCode === ZaloPayErrorCode.PAYMENT_PROCESSING;
  }

  /**
   * Cleanup khi component unmount
   */
  cleanup(): void {
    if (this.listener) {
      this.listener.remove();
      this.listener = null;
    }
    this.pendingCallback = null;
    this.eventEmitter = null;
  }
}

export default new ZaloPayService();
// export { ZaloPayErrorCode };