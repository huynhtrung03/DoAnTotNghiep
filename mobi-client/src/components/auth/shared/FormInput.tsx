// Input field đa năng cho Auth forms
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
import Colors from '../../../colors/colors';

interface FormInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  isPassword?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Input field đa năng cho Auth forms
 * Hỗ trợ text, email, password với toggle visibility
 */
export default function FormInput({
  label,
  value,
  onChangeText,
  error,
  isPassword = false,
  icon,
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Label */}
      <Text style={styles.label}>{label}</Text>

      {/* Input Container */}
      <View style={[styles.inputWrapper, error && styles.inputError]}>
        {/* Icon */}
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={error ? Colors.error : Colors.textSecondary}
            style={styles.icon}
          />
        )}

        {/* Input */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize={isPassword ? 'none' : props.autoCapitalize}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
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
        )}
      </View>

      {/* Error Message */}
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
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 54,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: '#FFF5F5',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
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
