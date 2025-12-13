import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import { Colors } from '../../../../styles/colors';

interface NumberInputWithFormatProps {
  label: string;
  placeholder?: string;
  value: number | null;
  onChangeValue: (value: number | null) => void;
  isCurrency?: boolean;
  suffix?: string;
  min?: number;
  max?: number;
}

const NumberInputWithFormat: React.FC<NumberInputWithFormatProps> = ({
  label,
  placeholder = '0',
  value,
  onChangeValue,
  isCurrency = false,
  suffix = '',
  min,
  max,
}) => {
  const [displayValue, setDisplayValue] = useState<string>('');

  useEffect(() => {
    if (value !== null && value !== undefined) {
      setDisplayValue(value.toString());
    }
  }, [value]);

  const formatNumberDisplay = (num: number): string => {
    if (isCurrency) {
      return num.toLocaleString('vi-VN');
    }
    return num.toString();
  };

  const handleChange = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/[^0-9]/g, '');
    setDisplayValue(cleaned);

    if (cleaned === '') {
      onChangeValue(null);
    } else {
      const numValue = parseInt(cleaned, 10);
      
      // Check min/max constraints
      let finalValue = numValue;
      if (min !== undefined && numValue < min) {
        finalValue = min;
      } else if (max !== undefined && numValue > max) {
        finalValue = max;
      }
      
      onChangeValue(finalValue);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          keyboardType="number-pad"
          value={displayValue}
          onChangeText={handleChange}
        />
        {suffix && (
          <Text style={styles.suffix}>{suffix}</Text>
        )}
      </View>
      {value !== null && isCurrency && (
        <Text style={styles.formatted}>
          = {formatNumberDisplay(value)} {suffix}
        </Text>
      )}
    </View>
  );
};

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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    paddingRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  suffix: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  formatted: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default NumberInputWithFormat;
