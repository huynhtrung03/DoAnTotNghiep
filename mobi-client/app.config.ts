// app.config.ts
import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  name: 'mobi-client',
  slug: 'mobi-client',
  scheme: 'mobi-client',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,

  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  plugins: [
    'expo-web-browser',
    '@react-native-google-signin/google-signin',

    'expo-font',
    'expo-localization',
    // "@react-native-firebase/app",
    // "@react-native-firebase/firestore",
    // "@react-native-firebase/messaging",
    // "@react-native-firebase/storage",
    [
      '@rnmapbox/maps',
      {
        RNMAPBOX_MAPS_DOWNLOAD_TOKEN: process.env.MAPBOX_DOWNLOADS_TOKEN,
      },
    ],
    [
        "expo-image-picker",
        {
          "photosPermission": "Ứng dụng cần quyền truy cập thư viện ảnh để bạn có thể chọn avatar."
        }
      ],
  ],

  ios: {
    supportsTablet: true,
    jsEngine: 'hermes',
    bundleIdentifier: 'com.namaesieunhangao.mobiclient',
    // googleServicesFile: './GoogleService-Info.plist',
    // Đã xóa: config.googleMapsApiKey
    "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false
    }
  },

  android: {
    package: 'com.namaesieunhangao.mobiclient',
    jsEngine: 'hermes',
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    // Đã xóa: config.googleMaps
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },

  web: {
    favicon: './assets/favicon.png',
  },

  extra: {
    // Các biến này cần cho Google Sign-In
    GOOGLE_CLIENT_ID_ANDROID: process.env.GOOGLE_CLIENT_ID_ANDROID,
    GOOGLE_CLIENT_ID_WEB: process.env.GOOGLE_CLIENT_ID_WEB,

    // Biến cho Mapbox
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN, // (pk... token)
    eas: { projectId: 'd7274611-f5cc-40ec-b08a-13a634f545f3' },
    // eas: { projectId: 'b079c809-771e-438d-8493-28884acfb643' },
  },
});