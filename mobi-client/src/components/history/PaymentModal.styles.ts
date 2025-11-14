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
});
