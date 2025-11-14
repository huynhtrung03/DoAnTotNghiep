// Component Input Password có thể tái sử dụng
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../styles/colors';

interface PasswordInputProps extends TextInputProps {
  label: string;
  error?: string;
  value: string;
  onChangeText: (text: string) => void;
  containerStyle?: any;
}

/**
 * Component Input cho mật khẩu với tính năng ẩn/hiện
 * @param label - Nhãn hiển thị phía trên input
 * @param error - Thông báo lỗi (nếu có)
 * @param value - Giá trị hiện tại của input
 * @param onChangeText - Callback khi giá trị thay đổi
 * @param containerStyle - Style tùy chỉnh cho container
 */
export default function PasswordInput({
  label,
  error,
  value,
  onChangeText,
  containerStyle,
  ...textInputProps
}: PasswordInputProps) {
  // State để điều khiển hiển thị/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input Container */}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={Colors.textTertiary}
          {...textInputProps}
        />

        {/* Toggle Button - Nút ẩn/hiện mật khẩu */}
        <TouchableOpacity
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Error Message - Hiển thị lỗi nếu có */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 16,
    height: 52,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginLeft: 4,
    flex: 1,
  },
});
