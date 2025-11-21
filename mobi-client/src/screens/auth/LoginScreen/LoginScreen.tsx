import React, { useState } from 'react';
import { Alert, Text, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthLayout, FormCard, FormInput } from '../../../components/auth/shared';
import GoogleSignInButton from '../../../components/common/Button/GoogleSignInButton';
import { loginWithUsername, getUserRoles } from '../../../lib/auth';
import { styles } from './LoginScreen.styles';
import Colors from '../../../styles/colors';

type FormValues = {
  username: string;
  password: string;
};

const schema = yup
  .object({
    username: yup.string().required('Vui lòng nhập email hoặc số điện thoại'),
    password: yup.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').required('Vui lòng nhập mật khẩu'),
  })
  .required();

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  const getRouteByRole = (roles: string[]) => {
    // Kiểm tra roles để điều hướng
    console.log('getRouteByRole - Checking roles:', roles);
    
    if (roles.includes('Landlords')) {
      console.log('Navigating to LandlordDashboard');
      return 'LandlordDashboard';
    }
    if (roles.includes('Users')) {
      console.log('Navigating to Users');
      return 'Users';
    }
    
    console.log('Navigating to Root (default)');
    return 'Root';
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      console.log('Starting login...');
      
      const { user } = await loginWithUsername(data.username, data.password);
      console.log('Login successful - User:', user);
      console.log('User roles from login response:', user.roles);

      // Đợi một chút để đảm bảo AsyncStorage đã lưu xong
      await new Promise(resolve => setTimeout(resolve, 200));

      // Lấy roles từ user object thay vì gọi API getUserRoles()
      const userRoles = Array.isArray(user.roles) ? user.roles : [];
      console.log('User Roles:', userRoles);
      
      const targetRoute = getRouteByRole(userRoles);
      console.log('Target Route:', targetRoute);

      navigation.reset({ index: 0, routes: [{ name: targetRoute }] });
    } catch (e: any) {
      console.error('Login error:', e);
      Alert.alert('Đăng nhập thất bại', e?.response?.data?.message ?? 'Vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async () => {
    try {
      console.log('Google login success, checking roles...');
      
      // Đợi một chút để đảm bảo AsyncStorage đã lưu xong sau khi đăng nhập Google
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Đọc roles từ AsyncStorage thay vì gọi API
      const rolesString = await AsyncStorage.getItem('userRoles');
      const userRoles = rolesString ? JSON.parse(rolesString) : [];
      console.log('Google Login - User Roles:', userRoles);
      
      const targetRoute = getRouteByRole(userRoles);
      console.log('Google Login - Target Route:', targetRoute);
      
      navigation.reset({ index: 0, routes: [{ name: targetRoute }] });
    } catch (error) {
      console.error('Google login navigation error:', error);
      navigation.reset({ index: 0, routes: [{ name: 'Root' }] });
    }
  };

  return (
    <AuthLayout showLogo={false}>
      <FormCard title="Đăng nhập" subtitle="Chào mừng bạn quay lại">
        {/* Username */}
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <FormInput
              label="Email hoặc Số điện thoại"
              value={value}
              onChangeText={onChange}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon="person"
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

        {/* Forgot Password */}
        <Pressable
          onPress={() => navigation.navigate('Auth/Forgot')}
          style={styles.forgotButton}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </Pressable>

        {/* Login Button */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </Pressable>

        {/* Divider */}
        <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>

        {/* Google Sign In */}
        <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={loading} />

        {/* Register Link */}
        <Pressable
          onPress={() => navigation.navigate('Auth/Register')}
          style={styles.registerButton}
        >
          <Text style={styles.registerText}>
            Chưa có tài khoản? <Text style={styles.registerLink}>Đăng ký ngay</Text>
          </Text>
        </Pressable>

        {/* Terms */}
        <Text style={styles.termsText}>
          Bằng cách đăng nhập, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
        </Text>
      </FormCard>
    </AuthLayout>
  );
}