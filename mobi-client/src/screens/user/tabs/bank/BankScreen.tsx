/**
 * BankScreen Component
 *
 * Màn hình phương thức thanh toán theo thiết kế Google Pay
 * Hiển thị phương thức hiện tại và tùy chọn thêm mới
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import Colors from '../../../../colors/colors';
import styles from './BankScreen.style';

export default function BankScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleAddCreditCard = () => {
    // Navigate to add credit card screen
    console.log('Add credit card');
  };

  const handleAddShopeePay = () => {
    // Navigate to add ShopeePay
    console.log('Add ShopeePay');
  };

  const handleAddMoMo = () => {
    // Navigate to add MoMo
    console.log('Add MoMo');
  };

  const handleRedeemCode = () => {
    // Navigate to redeem code
    console.log('Redeem code');
  };

  const handlePaymentSettings = () => {
    // Navigate to payment settings
    console.log('Payment settings');
  };

  const renderAddOption = (icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, index: number, isBrandIcon = false) => (
    <Animated.View
      entering={FadeInDown.duration(400).delay(index * 50)}
    >
      <TouchableOpacity
        style={styles.optionItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.optionIcon}>
          <Ionicons
            name={icon}
            size={24}
            color={isBrandIcon ? Colors.primary : Colors.textSecondary}
          />
        </View>
        <Text style={styles.optionText}>{label}</Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.textTertiary}
        />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phương thức thanh toán</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Payment Methods */}
        <View style={styles.section}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <TouchableOpacity style={styles.currentMethod} activeOpacity={0.7}>
              <View style={styles.methodIcon}>
                <Ionicons name="phone-portrait-outline" size={24} color={Colors.textWhite} />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>Mobifone</Text>
                <Text style={styles.methodStatus}>Không có</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Add New Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Thêm phương thức thanh toán vào Tài khoản của bạn
          </Text>

          <View style={styles.optionsList}>
            {renderAddOption('card-outline', 'Thêm thẻ tín dụng hoặc ghi nợ', handleAddCreditCard, 0)}
            {renderAddOption('wallet-outline', 'Thêm Ví ShopeePay', handleAddShopeePay, 1, true)}
            {renderAddOption('wallet-outline', 'Thêm MoMo e-wallet', handleAddMoMo, 2, true)}
            {renderAddOption('gift-outline', 'Đổi mã', handleRedeemCode, 3)}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.separator} />
          <TouchableOpacity
            style={styles.footerItem}
            onPress={handlePaymentSettings}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.footerText}>Chế độ thanh toán khác</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
