import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },

  closeButton: {
    padding: 4,
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  roomInfoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },

  roomTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },

  roomPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },

  section: {
    marginBottom: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 10,
  },

  periodCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  periodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  periodLabel: {
    fontSize: 14,
    color: '#757575',
  },

  periodValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },

  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
    minWidth: 80,
    alignItems: 'center',
  },

  selectOptionSelected: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },

  selectOptionText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },

  selectOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  costCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },

  costHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  costTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
  },

  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  costLabel: {
    fontSize: 14,
    color: '#374151',
  },

  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },

  costDivider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 12,
  },

  totalCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  totalCostLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
  },

  totalCostValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
  },

  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  depositLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },

  depositValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FAFAFA',
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#212121',
    paddingVertical: 12,
  },

  inputSuffix: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },

  hint: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 6,
  },

  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#212121',
    minHeight: 80,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
  },

  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },

  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },

  cancelButton: {
    backgroundColor: '#F5F5F5',
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#757575',
  },

  submitButton: {
    backgroundColor: '#1976D2',
    flex: 1.5,
  },

  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },

  submitButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },

  // Success confirmation modal styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  confirmModalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },

  confirmModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },

  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#065F46',
    marginTop: 12,
  },

  confirmModalMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },

  confirmModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },

  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },

  stayButton: {
    backgroundColor: '#F3F4F6',
  },

  stayButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  historyButton: {
    backgroundColor: '#1976D2',
  },

  historyButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
});
