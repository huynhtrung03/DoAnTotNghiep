import { StyleSheet } from 'react-native';
import Colors from '../../../colors/colors';

export const styles = StyleSheet.create({
  // Container chính
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Keyboard avoiding view
  keyboardView: {
    flex: 1,
  },

  // Scroll content
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },

  // Submit Button
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

  // Security Tips Section
  tipsSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.info + '15',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.info,
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
