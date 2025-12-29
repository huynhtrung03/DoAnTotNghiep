// Card wrapper cho Auth forms
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../colors/colors';

interface FormCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

/**
 * Card component bao bọc form content
 * Có thể dùng cho Login, Register, Forgot, ChangePassword
 */
export default function FormCard({ children, title, subtitle }: FormCardProps) {
  return (
    <View style={styles.card}>
      {/* Header */}
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    // Content wrapper
  },
});
