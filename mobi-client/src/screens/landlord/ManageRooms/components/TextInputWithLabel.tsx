import React from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors } from '../../../../colors/colors';

interface TextInputWithLabelProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
}

const TextInputWithLabel: React.FC<TextInputWithLabelProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  const isError = !!error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          isError && styles.inputError,
          props.multiline && styles.inputMultiline,
        ]}
        placeholderTextColor={Colors.textTertiary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
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
  input: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 6,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 6,
  },
});

export default TextInputWithLabel;
