import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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
    maxHeight: '90%',
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

  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },

  infoLabel: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    textAlign: 'right',
  },

  accountNumber: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#1976D2',
  },

  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 4,
  },

  qrContainer: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 20,
  },

  qrCode: {
    width: width * 0.6,
    height: width * 0.6,
  },

  uploadButton: {
    borderWidth: 2,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
  },

  uploadButtonText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },

  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },

  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
  },

  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 14,
  },

  instructionsCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },

  instructionsText: {
    flex: 1,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
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

  confirmButton: {
    backgroundColor: '#1976D2',
  },

  confirmButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },

  confirmButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },

  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },

  damageFee: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5722',
  },

  accountNumberContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },

  copyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },

  qrDescription: {
    textAlign: 'center',
    fontSize: 12,
    color: '#757575',
    marginTop: 8,
  },

  contactCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },

  contactText: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },

  requiredNote: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 12,
    fontWeight: '600',
  },

  requiredFieldNote: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
  },

  confirmationSection: {
    backgroundColor: '#FFFDE7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFEB3B',
  },

  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  confirmationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F57F17',
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  checkbox: {
    marginTop: 2,
  },

  checkboxLabel: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
    lineHeight: 20,
  },

  checkboxLabelBold: {
    fontWeight: '700',
    color: '#212121',
  },

  // Confirmation Dialog
  confirmDialogOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmDialog: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 400,
  },

  confirmDialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
  },

  confirmDialogMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  confirmDialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },

  confirmDialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  confirmDialogButtonPrimary: {
    backgroundColor: '#1976D2',
  },

  cancelDialogButton: {
    backgroundColor: '#F5F5F5',
  },

  cancelDialogButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },

  confirmDialogButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },

  // Enhanced Transfer Details Styles
  transferDetailsCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },

  transferDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },

  transferDetailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },

  transferDetailsContent: {
    gap: 12,
  },

  transferDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  transferDetailLabel: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
  },

  transferDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    textAlign: 'right',
  },

  accountNumberText: {
    fontFamily: 'monospace',
    fontSize: 15,
    color: '#1976D2',
    fontWeight: '600',
  },

  // Enhanced QR Code Styles
  qrCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  // Enhanced Upload Section
  uploadSectionCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },

  uploadSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },

  uploadSectionNote: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 12,
    lineHeight: 20,
  },
});
