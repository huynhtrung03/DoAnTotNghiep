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

  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  section: {
    marginBottom: 24,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 10,
  },

  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#212121',
    minHeight: 120,
    backgroundColor: '#FAFAFA',
  },

  charCount: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'right',
    marginTop: 6,
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

  uploadHint: {
    marginTop: 4,
    fontSize: 12,
    color: '#757575',
  },

  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },

  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },

  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 14,
  },

  changeImageButton: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },

  changeImageText: {
    fontSize: 14,
    fontWeight: '600',
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
    backgroundColor: '#4CAF50',
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
