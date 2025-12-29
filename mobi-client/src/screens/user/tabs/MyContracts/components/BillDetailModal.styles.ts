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

  // Bill Header
  billHeaderSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  billMonth: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  billAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoRow__last: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  // Charge Card
  chargeCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chargeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  chargeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
    flex: 1,
  },
  chargeDetails: {
    paddingLeft: 28,
  },
  chargeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  chargeDescLabel: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  chargeDescValue: {
    fontSize: 12,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  chargeDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 6,
  },
  chargeTotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  chargeTotalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Total Section
  totalSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
  },

  // Payment Information
  paymentInfo: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentContent: {
    flex: 1,
    marginLeft: 12,
  },
  paymentMethodLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  paymentMethodDesc: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 2,
  },

  // Note Card
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFDE7',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#F57F17',
    marginLeft: 8,
    lineHeight: 18,
  },

  // Bottom Padding
  bottomPadding: {
    height: 20,
  },
});
