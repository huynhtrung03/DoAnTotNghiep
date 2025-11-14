import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 8,
    flex: 1,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingBottom: 8,
    marginBottom: 12,
  },
  activeTab: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 16,
  },
  inactiveTab: {
    color: '#6b7280',
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: 2,
    fontSize: 14,
  },
  inputLabel: {
    marginBottom: 4,
    color: '#374151',
    fontSize: 11,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#ef4444',
    marginTop: 2,
    fontSize: 11,
  },
  accountTypeGroup: {
    gap: 6,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#f97316',
  },
  radioInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97316',
  },
  radioLabel: {
    marginLeft: 6,
    color: '#374151',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 6,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  termsTextContainer: {
    marginTop: 12,
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#9ca3af',
    lineHeight: 14,
  },
});
