import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },

  // Statistics
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    minWidth: width * 0.4,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  statIcon: {
    marginBottom: 8,
  },

  statContent: {
    flex: 1,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },

  statTitle: {
    fontSize: 12,
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Search and Filter
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#212121',
  },

  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
  },

  // Bills List
  billsContainer: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },

  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  billContent: {
    marginBottom: 16,
  },

  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  feeLabel: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },

  feeValueContainer: {
    alignItems: 'flex-end',
    flex: 1,
  },

  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },

  usageText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },

  damageLabel: {
    color: '#F44336',
  },

  damageValue: {
    color: '#F44336',
    fontWeight: '700',
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
  },

  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
  },

  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1976D2',
  },

  // Image Proof
  imageProofSection: {
    marginBottom: 16,
  },

  imageProofContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  imageProof: {
    width: '100%',
    height: '100%',
  },

  noImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  noImageText: {
    fontSize: 12,
    color: '#BDBDBD',
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1976D2',
    backgroundColor: '#FFF',
    gap: 6,
  },

  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },

  payButton: {
    backgroundColor: '#1976D2',
    borderColor: '#1976D2',
  },

  payButtonText: {
    color: '#FFF',
  },

  confirmingButton: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },

  confirmingButtonText: {
    color: '#FFF',
  },

  paidButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },

  paidButtonText: {
    color: '#FFF',
  },

  // Loading and Empty States
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#757575',
  },

  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#BDBDBD',
  },

  // Payment Information
  paymentInfoContainer: {
    marginTop: 20,
  },

  paymentInfoCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },

  paymentInfoText: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    lineHeight: 20,
  },

  paymentNote: {
    fontSize: 13,
    color: '#757575',
    marginTop: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  filterModal: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: width * 0.8,
    maxWidth: 400,
  },

  filterModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 20,
    textAlign: 'center',
  },

  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  filterOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },

  filterOptionText: {
    fontSize: 16,
    color: '#212121',
  },

  filterOptionTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },

  filterCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },

  filterCancelText: {
    fontSize: 16,
    color: '#757575',
  },

  imagePreviewModal: {
    width: width * 0.9,
    height: width * 0.9,
    backgroundColor: '#000',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closePreviewButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  // Payment Modal
  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  paymentModalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '50%',
  },

  paymentModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },

  paymentModalSubtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },

  paymentModalContent: {
    gap: 16,
  },

  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976D2',
    textAlign: 'center',
    marginBottom: 8,
  },

  paymentModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },

  payNowButton: {
    backgroundColor: '#1976D2',
  },

  payNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },

  cancelModalButton: {
    backgroundColor: '#F5F5F5',
  },

  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
});