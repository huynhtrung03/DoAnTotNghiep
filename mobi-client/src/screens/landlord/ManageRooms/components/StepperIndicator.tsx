import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../../colors/colors';

const { width } = Dimensions.get('window');

interface StepperIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const STEP_TITLES = ['Media', 'Vị trí', 'Chi tiết', 'Gói tin', 'Xác nhận'];

const StepperIndicator: React.FC<StepperIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const stepWidth = (width - 32) / totalSteps;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${(currentStep / totalSteps) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Step Dots */}
      <View style={styles.stepsContainer}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <View key={stepNum} style={styles.stepWrapper}>
              {/* Dot */}
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isCompleted && styles.dotCompleted,
                ]}
              >
                {isCompleted ? (
                  <MaterialIcons name="check" size={14} color={Colors.textWhite} />
                ) : (
                  <Text style={styles.dotText}>{stepNum}</Text>
                )}
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  (isActive || isCompleted) && styles.labelActive,
                ]}
                numberOfLines={1}
              >
                {STEP_TITLES[index]}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Current Step Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.stepInfo}>
          Bước {currentStep}/{totalSteps}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dotCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  dotText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
  },
  stepInfo: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});

export default StepperIndicator;
