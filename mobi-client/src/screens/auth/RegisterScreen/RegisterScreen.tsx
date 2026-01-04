import React, { useState } from 'react';
import { Alert, Text, Pressable, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AuthLayout, FormCard, FormInput } from '../../../components/auth/shared';
import { RegisterService } from '../../../services/RegisterService';
import Colors from '../../../colors/colors';

type RegisterInputs = {
  fullName: string;
  email: string;
  username: string;
  password: string;
  repeatPassword: string;
  accountType: '0' | '1';
};

const schema = yup
  .object({
    fullName: yup.string().required('Vui lòng nhập họ và tên'),
    email: yup.string().email('Email không hợp lệ').required('Vui lòng nhập email'),
    username: yup.string().required('Vui lòng nhập tên đăng nhập').matches(/^[a-zA-Z0-9]{3,30}$/, 'Tên đăng nhập không hợp lệ'),
    password: yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
    repeatPassword: yup.string().oneOf([yup.ref('password')], 'Mật khẩu không khớp').required('Vui lòng nhập lại mật khẩu'),
    accountType: yup.string().oneOf(['0', '1'], 'Vui lòng chọn loại tài khoản').required('Vui lòng chọn loại tài khoản'),
  })
  .required();

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const { control, handleSubmit, setValue, watch, formState: { errors, isValid, isSubmitting } } = useForm<RegisterInputs>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      repeatPassword: '',
      accountType: '0',
    },
  });

  const accountType = watch('accountType');

  const handleRegisterSubmit = async (values: RegisterInputs) => {
    try {
      await RegisterService(values);
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.', [
        { text: 'OK', onPress: () => navigation.navigate('Auth/Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Đăng ký thất bại', error?.message || 'Vui lòng thử lại');
    }
  };

  return (
    <AuthLayout showLogo={false}>
      <FormCard
        title="Đăng ký tài khoản"
        subtitle="Tạo tài khoản mới để bắt đầu"
      >
        {/* Full Name */}
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Họ và tên"
              value={value}
              onChangeText={onChange}
              placeholder="Nhập họ và tên"
              icon="person"
              error={errors.fullName?.message}
            />
          )}
        />

        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Email"
              value={value}
              onChangeText={onChange}
              placeholder="nguyenvana@gmail.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="mail"
              error={errors.email?.message}
            />
          )}
        />

        {/* Username */}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Tên đăng nhập"
              value={value}
              onChangeText={onChange}
              placeholder="Nhập tên đăng nhập"
              autoCapitalize="none"
              icon="at"
              error={errors.username?.message}
            />
          )}
        />

        {/* Password */}
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Mật khẩu"
              value={value}
              onChangeText={onChange}
              placeholder="Nhập mật khẩu"
              isPassword
              icon="lock-closed"
              error={errors.password?.message}
            />
          )}
        />

        {/* Repeat Password */}
        <Controller
          control={control}
          name="repeatPassword"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Nhập lại mật khẩu"
              value={value}
              onChangeText={onChange}
              placeholder="Nhập lại mật khẩu"
              isPassword
              icon="lock-closed"
              error={errors.repeatPassword?.message}
            />
          )}
        />

        {/* Account Type Selection */}
        <View style={styles.accountTypeGroup}>
          <Text style={styles.label}>Loại tài khoản</Text>
          <View style={styles.radioGroup}>
            <Pressable
              onPress={() => setValue('accountType', '0')}
              style={styles.radioOption}
            >
              <View style={[styles.radioCircle, accountType === '0' && styles.radioCircleSelected]}>
                {accountType === '0' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Người thuê</Text>
            </Pressable>

            <Pressable
              onPress={() => setValue('accountType', '1')}
              style={styles.radioOption}
            >
              <View style={[styles.radioCircle, accountType === '1' && styles.radioCircleSelected]}>
                {accountType === '1' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Chủ trọ</Text>
            </Pressable>
          </View>
          {errors.accountType && (
            <Text style={styles.errorText}>{errors.accountType.message}</Text>
          )}
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit(handleRegisterSubmit)}
          disabled={!isValid || isSubmitting}
          style={[styles.registerButton, (!isValid || isSubmitting) && styles.registerButtonDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={styles.registerButtonText}>Đăng ký</Text>
          )}
        </Pressable>

        {/* Login Link */}
        <Pressable
          onPress={() => navigation.navigate('Auth/Login')}
          style={styles.loginLinkButton}
        >
          <Text style={styles.loginLinkText}>
            Đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập ngay</Text>
          </Text>
        </Pressable>

        {/* Terms */}
        <Text style={styles.termsText}>
          Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
        </Text>
      </FormCard>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  accountTypeGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  radioLabel: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
  },
  registerButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonDisabled: {
    backgroundColor: Colors.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },
  loginLinkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});