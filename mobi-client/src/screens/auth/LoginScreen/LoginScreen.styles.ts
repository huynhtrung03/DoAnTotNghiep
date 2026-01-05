import { StyleSheet } from 'react-native';
import Colors from '../../../colors/colors';

export const styles = StyleSheet.create({
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.borderDark,
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
    letterSpacing: 0.5,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  registerLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
});
