import React, { useState } from 'react';
import { Alert, Text, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthLayout, FormCard, FormInput } from '../../../components/auth/shared';
import { API_URL } from '../../../services/Constant';
import axios from 'axios';
import { styles } from './ForgotPasswordScreen.styles';
import Colors from '../../../colors/colors';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!validateEmail(email)) {
      setError('Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      Alert.alert(
        'Thành công',
        'Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout showLogo={false}>
      <FormCard
        title="Quên mật khẩu?"
        subtitle="Nhập email của bạn để nhận link đặt lại mật khẩu"
      >
        <FormInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError('');
          }}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          icon="mail"
          error={error}
        />

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={styles.submitButtonText}>Gửi link đặt lại</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>Quay lại đăng nhập</Text>
        </Pressable>
      </FormCard>
    </AuthLayout>
  );
}