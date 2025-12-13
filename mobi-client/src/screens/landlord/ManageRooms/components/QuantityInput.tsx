import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../../styles/colors';

interface QuantityInputProps {
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  value,
  onChangeValue,
  min = 1,
  max = 10,
  step = 1,
}) => {
  const handleDecrease = () => {
    if (value > min) {
      onChangeValue(value - step);
    }
  };

  const handleIncrease = () => {
    if (value < max) {
      onChangeValue(value + step);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          value <= min && styles.buttonDisabled,
        ]}
        onPress={handleDecrease}
        disabled={value <= min}
      >
        <MaterialIcons
          name="remove"
          size={20}
          color={value <= min ? Colors.textTertiary : Colors.primary}
        />
      </TouchableOpacity>

      <Text style={styles.value}>{value}</Text>

      <TouchableOpacity
        style={[
          styles.button,
          value >= max && styles.buttonDisabled,
        ]}
        onPress={handleIncrease}
        disabled={value >= max}
      >
        <MaterialIcons
          name="add"
          size={20}
          color={value >= max ? Colors.textTertiary : Colors.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  value: {
    width: 40,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

export default QuantityInput;
