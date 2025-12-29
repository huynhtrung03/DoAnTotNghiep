/**
 * LanguageSelectionScreen
 * Màn hình chọn ngôn ngữ
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors, { withOpacity } from '../../../colors/colors';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
  },
];

export default function LanguageSelectionScreen() {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleSelectLanguage = async (languageCode: string) => {
    try {
      setSelectedLanguage(languageCode);
      await i18n.changeLanguage(languageCode);
      await AsyncStorage.setItem('userLanguage', languageCode);
      
      Alert.alert(
        'Thành công',
        'Ngôn ngữ đã được thay đổi',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi ngôn ngữ');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn ngôn ngữ / Language</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Language List */}
      <View style={styles.content}>
        {languages.map((language, index) => (
          <Animated.View
            key={language.code}
            entering={FadeInDown.duration(400).delay(index * 100)}
          >
            <TouchableOpacity
              style={[
                styles.languageItem,
                selectedLanguage === language.code && styles.selectedItem,
              ]}
              onPress={() => handleSelectLanguage(language.code)}
              activeOpacity={0.7}
            >
              <View style={styles.languageLeft}>
                <Text style={styles.flag}>{language.flag}</Text>
                <View style={styles.languageTexts}>
                  <Text style={styles.nativeName}>{language.nativeName}</Text>
                  <Text style={styles.languageName}>{language.name}</Text>
                </View>
              </View>

              {selectedLanguage === language.code && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color={Colors.textSecondary} />
        <Text style={styles.infoText}>
          Thay đổi ngôn ngữ sẽ áp dụng cho toàn bộ ứng dụng
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  
  // Content
  content: {
    padding: 16,
  },
  
  // Language Item
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedItem: {
    borderColor: Colors.primary,
    backgroundColor: withOpacity(Colors.primary, 0.05),
  },
  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageTexts: {
    flex: 1,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  languageName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  // Info
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: withOpacity(Colors.primary, 0.1),
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginLeft: 8,
    flex: 1,
  },
});
