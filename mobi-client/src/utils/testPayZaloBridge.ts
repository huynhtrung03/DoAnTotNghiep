import { NativeModules } from 'react-native';

const { PayZaloBridge } = NativeModules;

/**
 * Script để test PayZaloBridge module
 * Chạy trong console để debug
 */
export const testPayZaloBridge = () => {
  const testTime = new Date().toISOString();
  console.log(`[${testTime}] 🧪 Testing PayZaloBridge module...`);

  console.log(`[${new Date().toISOString()}] PayZaloBridge exists:`, !!PayZaloBridge);
  console.log(`[${new Date().toISOString()}] PayZaloBridge object:`, PayZaloBridge);
  console.log(`[${new Date().toISOString()}] PayZaloBridge type:`, typeof PayZaloBridge);

  if (PayZaloBridge) {
    const methods = Object.getOwnPropertyNames(PayZaloBridge);
    console.log(`[${new Date().toISOString()}] Available methods:`, methods);
    console.log(`[${new Date().toISOString()}] payOrder method:`, PayZaloBridge.payOrder);
    console.log(`[${new Date().toISOString()}] payOrder type:`, typeof PayZaloBridge.payOrder);

    // Test call payOrder with invalid token to see if it throws error
    try {
      console.log(`[${new Date().toISOString()}] Testing payOrder call with invalid token...`);
      PayZaloBridge.payOrder('invalid_token_test');
      console.log(`[${new Date().toISOString()}] ✅ payOrder call succeeded (unexpected)`);
    } catch (error) {
      console.log(`[${new Date().toISOString()}] ❌ payOrder call failed as expected:`, error);
    }
  } else {
    console.log(`[${new Date().toISOString()}] ❌ PayZaloBridge is null/undefined`);
  }

  return {
    exists: !!PayZaloBridge,
    hasPayOrder: typeof PayZaloBridge?.payOrder === 'function',
    methods: PayZaloBridge ? Object.getOwnPropertyNames(PayZaloBridge) : []
  };
};

// Auto run when imported in development
if (typeof window !== 'undefined' && window.console && __DEV__) {
  console.log('🔧 Running PayZaloBridge test automatically in DEV mode...');
  testPayZaloBridge();
}