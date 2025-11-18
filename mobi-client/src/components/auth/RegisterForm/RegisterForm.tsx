import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigation } from '@react-navigation/native';
import AuthInput from '../AuthHeader/AuthInput';
import { RegisterService } from '../../../services/auth/RegisterService';
import { styles } from './RegisterForm.styles';

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
    fullName: yup.string().required('Please enter your Full Name.'),
    email: yup
      .string()
      .email('Invalid email.')
      .required('Please enter your email.'),
    username: yup
      .string()
      .required('Please enter your user name.')
      .matches(/^[a-zA-Z0-9]{3,30}$/, 'Invalid user name.'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters.')
      .required('Please enter your password.'),
    repeatPassword: yup
      .string()
      .oneOf([yup.ref('password')], 'Passwords must match.')
      .required('Please repeat your password.'),
    accountType: yup.string().oneOf(['0', '1'], 'Please select an account type.').required('Please select an account type.'),
  })
  .required();

export default function RegisterForm() {
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
      Alert.alert('Success', 'Registration successful! Please login to continue.');
      navigation.navigate('Auth/Login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error?.message || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Tabs */}
        <View style={styles.tabContainer}>
          <Pressable onPress={() => navigation.navigate('Auth/Login') as never}>
            <Text style={styles.inactiveTab}>Log in</Text>
          </Pressable>
          <Text style={styles.activeTab}>Create a new account</Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Sign up to get started</Text>
        </View>

        {/* Form Fields */}
        <AuthInput
          control={control}
          name="fullName"
          label="Full Name"
          placeholder="Full Name"
        />

        <AuthInput
          control={control}
          name="email"
          label="Email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <AuthInput
          control={control}
          name="username"
          label="Username"
          placeholder="User Name"
          autoCapitalize="none"
        />

        <AuthInput
          control={control}
          name="password"
          label="Password"
          placeholder="Password"
          secure
        />

        <AuthInput
          control={control}
          name="repeatPassword"
          label="Repeat Password"
          placeholder="Repeat Password"
          secure
        />

        {/* Account Type Selection */}
        <View style={styles.accountTypeGroup}>
          <Text style={styles.inputLabel}>Account Type</Text>
          <View style={styles.radioGroup}>
            <Pressable onPress={() => setValue('accountType', '0')} style={styles.radioOption}>
              <View style={[styles.radioCircle, accountType === '0' && styles.radioSelected]}>
                {accountType === '0' && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={styles.radioLabel}>User</Text>
            </Pressable>
            <Pressable onPress={() => setValue('accountType', '1')} style={styles.radioOption}>
              <View style={[styles.radioCircle, accountType === '1' && styles.radioSelected]}>
                {accountType === '1' && <View style={styles.radioInnerCircle} />}
              </View>
              <Text style={styles.radioLabel}>Landlord</Text>
            </Pressable>
          </View>
          {errors.accountType && <Text style={styles.errorMessage}>{errors.accountType.message}</Text>}
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit(handleRegisterSubmit)}
          disabled={!isValid || isSubmitting}
          style={[styles.primaryButton, (!isValid || isSubmitting) && styles.disabledButton]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValid || isSubmitting }}
        >
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Submitting...' : 'Create Account'}</Text>
        </Pressable>

        {/* Terms */}
        <View style={styles.termsTextContainer}>
          <Text style={styles.termsText}>
            By logging in or creating an account, you agree to our terms of service and privacy policy.
          </Text>
        </View>
      </View>
    </View>
  );
}

