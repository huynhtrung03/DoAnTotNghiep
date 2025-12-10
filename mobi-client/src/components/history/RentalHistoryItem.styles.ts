import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  roomImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },

  roomImage: {
    width: '100%',
    height: '100%',
  },

  roomImageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
    flex: 1,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  infoSection: {
    marginBottom: 12,
    paddingHorizontal: 16,
    gap: 8,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

  infoLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
    minWidth: 70,
  },

  infoValue: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },

  detailsSection: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  detailDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },

  detailLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },

  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },

  imageSection: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },

  imageSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },

  imageContainer: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },

  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
    borderStyle: 'dashed',
  },

  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },

  removedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },

  removedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F44336',
  },

  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },

  requestButton: {
    backgroundColor: '#4CAF50',
  },

  paymentButton: {
    backgroundColor: '#1976D2',
  },

  detailButton: {
    backgroundColor: '#FF9800',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
