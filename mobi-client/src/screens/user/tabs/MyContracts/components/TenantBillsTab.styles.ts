import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../../../colors/colors';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARD_WIDTH = width - CARD_MARGIN * 2;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 20,
  },

  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9E9E9E',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9E9E9E',
  },

  // Statistics Section
  statisticsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 16,
    justifyContent: 'space-between',
    gap: 8,
  },
  statisticCard: {
    width: (CARD_WIDTH - 12) / 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statisticIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statisticValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  statisticLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 4,
  },

  // Summary Card
  summaryCard: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
  },

  // Filter Section
  filterSection: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: 16,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#FFF',
  },

  // Bills Container
  billsContainer: {
    marginHorizontal: CARD_MARGIN,
  },
  separator: {
    height: 8,
  },

  // Bill Card
  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  billInfo: {
    flex: 1,
  },
  billMonth: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9E9E9E',
  },
  billAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  billStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 12,
  },
  billStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Bill Details Grid
  billDetails: {
    marginBottom: 16,
  },
  billDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  billDetailItem__last: {
    marginBottom: 0,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 2,
  },
  detailSubtext: {
    fontSize: 11,
    color: '#BDBDBD',
    marginTop: 2,
  },

  // Bill Note
  billNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  billNoteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#F57F17',
    fontWeight: '500',
  },

  // Bill Image Proof
  billImageProof: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  billImageProofText: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Bill Actions
  billActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFF',
    borderColor: Colors.primary,
  },
  actionButtonSuccess: {
    backgroundColor: '#F1F5FE',
    borderColor: '#4CAF50',
  },
  actionButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Image Preview Modal
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width * 0.9,
    height: width * 0.9,
    resizeMode: 'contain',
  },
});
