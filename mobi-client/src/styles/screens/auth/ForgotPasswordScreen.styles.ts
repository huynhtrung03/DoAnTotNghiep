import { StyleSheet } from 'react-native';

export const forgotPasswordScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  formContainer: {
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
  },
});

export default forgotPasswordScreenStyles;
