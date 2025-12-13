import { StyleSheet } from 'react-native';
import { Colors } from '../../../styles/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Light gray background
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header - Simplified
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#262626',
  },
  addButton: {
    padding: 8,
  },

  // Search & Filter Section
  searchFilterContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#262626',
    marginLeft: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#1890ff',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#595959',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },

  // List
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 100, // Increased to avoid bottom tab bar
  },
  loadingMore: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#8c8c8c',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8c8c8c',
    marginTop: 8,
  },

  // Card - Redesigned with horizontal layout
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
    flex: 1,
    marginRight: 8,
  },
  approvalBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1890ff',
  },
  areaDivider: {
    marginHorizontal: 6,
    color: '#d9d9d9',
  },
  area: {
    fontSize: 14,
    color: '#595959',
  },
  address: {
    fontSize: 13,
    color: '#8c8c8c',
    marginBottom: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  endDate: {
    fontSize: 11,
    color: '#8c8c8c',
  },
  expiredText: {
    color: '#ff4d4f',
    fontWeight: '600',
  },

  // Card Actions - Three dot menu
  cardMenu: {
    padding: 4,
    position: 'relative',
  },
  menuOverlay: {
    position: 'absolute',
    top: 30,
    right: -8,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 4,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: '#262626',
    marginLeft: 12,
  },

  // Primary Action (Extend button for expired)
  extendButton: {
    flexDirection: 'row',
    backgroundColor: '#1890ff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  extendButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 13,
  },

  // Bottom Sheet / Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '90%',
    minHeight: 400,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  bottomSheetContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#262626',
    flex: 1,
  },

  // Picker Container
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8c8c8c',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateInputText: {
    fontSize: 14,
    color: '#262626',
    marginLeft: 8,
  },

  // Type Post Option
  typePostOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  typePostOptionSelected: {
    borderColor: '#1890ff',
    backgroundColor: '#f0f8ff',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioFilled: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1890ff',
  },
  typePostName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
  },
  typePostPrice: {
    fontSize: 12,
    color: '#8c8c8c',
    marginTop: 2,
  },

  // Summary
  summaryContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#8c8c8c',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1890ff',
  },

  // Confirm Button
  confirmButton: {
    backgroundColor: '#1890ff',
    borderRadius: 6,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#d9d9d9',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },

  // Message Toast
  message: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageSuccess: {
    backgroundColor: '#52c41a',
  },
  messageError: {
    backgroundColor: '#ff4d4f',
  },
  messageText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
});
