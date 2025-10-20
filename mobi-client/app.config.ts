// app.config.ts
import { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  name: 'mobi-client',
  slug: 'mobi-client',
  scheme: 'mobi-client',
  android: { package: 'com.namaesieunhangao.mobiclient',
    jsEngine: 'hermes',
   },
  plugins: ['expo-web-browser', '@react-native-google-signin/google-signin'],
  extra: {
    // API_BASE_URL: 'https://api.your-domain.com',
    GOOGLE_CLIENT_ID_ANDROID: process.env.GOOGLE_CLIENT_ID_ANDROID,
    GOOGLE_CLIENT_ID_WEB: process.env.GOOGLE_CLIENT_ID_WEB,
    // GOOGLE_CLIENT_ID_IOS: process.env.GOOGLE_CLIENT_ID_IOS,
    eas: { projectId: 'b079c809-771e-438d-8493-28884acfb643' },
  },
});