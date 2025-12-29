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
    image: './assets/images/logo-ant.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  plugins: [
    'expo-web-browser',
    '@react-native-google-signin/google-signin',
    'expo-font',
    'expo-localization',

    //CẤU HÌNH FIREBASE & NOTIFICATION ---
  
    "@react-native-firebase/app",
    "@react-native-firebase/messaging",
    [
      "expo-notifications",
      {
        "icon": "./assets/images/thongbao.png",
        // "color": "#ffffff",
        "sounds": ["./assets/audio/notification.mp3"]
      }
    ],

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
    [
      "./plugins/withZaloPayManual.js",
      {
        appId: 554,
        scheme: 'mobi-client',
      },
    ],
  ],

  ios: {
    supportsTablet: true,
    jsEngine: 'hermes',
    bundleIdentifier: 'com.namaesieunhangao.mobiclient',
    // googleServicesFile: './GoogleService-Info.plist', // Bỏ comment nếu làm cho iOS
    "infoPlist": {
      "ITSAppUsesNonExemptEncryption": false,
      "UIBackgroundModes": ["remote-notification"], // Cần thiết cho iOS nếu sau này dùng
      // Cho phép truy cập HTTP (không khuyến nghị cho production)
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": true
      }
    }
  },

  android: {
    package: 'com.namaesieunhangao.mobiclient',
    jsEngine: 'hermes',
    // Đảm bảo file này đã nằm đúng vị trí (cùng cấp với app.config.ts hoặc trong thư mục android/app)
    googleServicesFile: './google-services.json', 
    // Cho phép truy cập HTTP (không khuyến nghị cho production)
    // @ts-ignore - usesCleartextTraffic is valid but not in type definition yet
    usesCleartextTraffic: true,
    adaptiveIcon: {
      foregroundImage: './assets/images/logo-ant.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.POST_NOTIFICATIONS" // Thêm quyền này tường minh
    ],
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },

  web: {
    favicon: './assets/favicon.png',
  },

  extra: {
    GOOGLE_CLIENT_ID_ANDROID: process.env.GOOGLE_CLIENT_ID_ANDROID,
    GOOGLE_CLIENT_ID_WEB: process.env.GOOGLE_CLIENT_ID_WEB,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
    eas: { projectId: 'd7274611-f5cc-40ec-b08a-13a634f545f3' },
  },
});
