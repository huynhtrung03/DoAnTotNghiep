import { StyleSheet } from 'react-native';

export const registerScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(245,245,245,0.85)',
  },
  headerContainer: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 420,
  },
});

export default registerScreenStyles;
