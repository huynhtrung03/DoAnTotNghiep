import { StyleSheet } from 'react-native';
import Colors from '../../../../../colors/colors';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingTop: 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  // Content
  content: {
    flex: 1,
  },

  // Bill Summary
  billSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F0F7FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  summaryMonth: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 16,
  },
  amountContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Section
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },

  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Payment Methods
  methodsContainer: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  methodCardSelected: {
    backgroundColor: `${Colors.primary}10`,
    borderColor: Colors.primary,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  methodDescription: {
    fontSize: 11,
    color: '#9E9E9E',
    marginTop: 2,
  },
  methodCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodCheckboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  // Payment Instructions
  instructionsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 8,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  stepText: {
    flex: 1,
    fontSize: 12,
    color: '#1A1A1A',
    lineHeight: 16,
  },

  // Agreement Card
  agreementCard: {
    flexDirection: 'row',
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  agreementText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: Colors.primary,
    lineHeight: 16,
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  buttonSecondary: {
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // Bottom Padding
  bottomPadding: {
    height: 20,
  },
});
