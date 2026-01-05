import { StyleSheet } from 'react-native';
import Colors from '../../../colors/colors';

export const styles = StyleSheet.create({
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: Colors.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
