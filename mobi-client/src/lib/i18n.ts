/**
 * i18n Configuration
 * Cấu hình đa ngôn ngữ cho ứng dụng
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import vi from '../locales/vi.json';
import en from '../locales/en.json';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

// Get saved language or use device language
const initLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('userLanguage');
    return savedLanguage || Localization.getLocales()[0]?.languageCode || 'vi';
  } catch (error) {
    return 'vi';
  }
};

initLanguage().then((language) => {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: language,
      fallbackLng: 'vi',
      compatibilityJSON: 'v4',
      interpolation: {
        escapeValue: false,
      },
    });
});

export default i18n;
