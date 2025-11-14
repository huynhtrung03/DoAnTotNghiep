// Màn hình Đổi Mật Khẩu
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FormCard, FormInput } from '../../../components/auth/shared';
import { updatePassword } from '../../../services/ResetPassService';
import { styles } from './ChangePassword.styles';
import Colors from '../../../styles/colors';

/**
 * Màn hình đổi mật khẩu cho người dùng đã đăng nhập
 */
export default function ChangePasswordScreen() {
  const navigation = useNavigation<any>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    let isValid = true;

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
      isValid = false;
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      isValid = false;
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
      isValid = false;
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await updatePassword({
        currentPassword: currentPassword,
        newPassword: newPassword,
      });

      Alert.alert('Thành công', 'Mật khẩu đã được thay đổi thành công!', [
        {
          text: 'OK',
          onPress: () => {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = !currentPassword || !newPassword || !confirmPassword || loading;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={true}
        >
          <FormCard
            title="Đổi mật khẩu"
            subtitle="Thay đổi mật khẩu để bảo mật tài khoản"
          >
          <FormInput
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={(text) => {
              setCurrentPassword(text);
              setErrors({ ...errors, currentPassword: '' });
            }}
            placeholder="Nhập mật khẩu hiện tại"
            isPassword
            icon="lock-closed"
            error={errors.currentPassword}
          />

          <FormInput
            label="Mật khẩu mới"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setErrors({ ...errors, newPassword: '' });
            }}
            placeholder="Nhập mật khẩu mới"
            isPassword
            icon="key"
            error={errors.newPassword}
          />

          <FormInput
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors({ ...errors, confirmPassword: '' });
            }}
            placeholder="Nhập lại mật khẩu mới"
            isPassword
            icon="key"
            error={errors.confirmPassword}
          />

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <Text style={styles.submitButtonText}>Đổi mật khẩu</Text>
            )}
          </Pressable>

          {/* Security Tips */}
          <View style={styles.tipsSection}>
            <View style={styles.tipsTitleRow}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.info} />
              <Text style={styles.tipsTitle}>  Lưu ý bảo mật</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Mật khẩu nên có ít nhất 6 ký tự</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Sử dụng kết hợp chữ hoa, chữ thường và số</Text>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipBullet} />
              <Text style={styles.tipText}>Không chia sẻ mật khẩu với người khác</Text>
            </View>
          </View>
        </FormCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
