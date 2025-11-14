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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },

  roomInfoText: {
    flex: 1,
  },

  roomTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },

  roomPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },

  section: {
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 10,
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },

  dateButtonContent: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },

  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },

  durationCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  durationText: {
    fontSize: 14,
    color: '#E65100',
  },

  durationValue: {
    fontWeight: '700',
    fontSize: 16,
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
    minHeight: 100,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
  },

  summaryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  summaryLabel: {
    fontSize: 14,
    color: '#757575',
  },

  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },

  depositValue: {
    color: '#FF9800',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },

  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
  },

  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },

  instructionsContent: {
    flex: 1,
  },

  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 6,
  },

  instructionsText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
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
});
