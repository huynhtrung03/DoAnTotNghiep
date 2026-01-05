import { StyleSheet } from 'react-native';

// ===== SEMANTIC COLORS =====
export const RequestColors = {
  // Status colors - Pastel tones
  pending: {
    bg: '#FFF7E6',
    text: '#D46B08',
    border: '#FFD591',
  },
  completed: {
    bg: '#F6FFED',
    text: '#389E0D',
    border: '#B7EB8F',
  },
  rejected: {
    bg: '#FFF1F0',
    text: '#CF1322',
    border: '#FFCCC7',
  },
  
  // UI colors
  cardBg: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#F0F0F0',
  inputBg: '#F5F5F5',
  inputBorder: '#D9D9D9',
  primary: '#3B82F6',
};

// ===== TYPOGRAPHY =====
export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  h2: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  h3: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: '#6B7280',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: '#9CA3AF',
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
};

// ===== SPACING =====
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const styles = StyleSheet.create({
  // ===== SCREEN CONTAINER =====
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  
  // ===== HEADER =====
  header: {
    backgroundColor: RequestColors.cardBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RequestColors.divider,
  },
  headerTitle: {
    ...Typography.h2,
    textAlign: 'center',
  },
  
  // ===== FILTER TABS =====
  filterContainer: {
    backgroundColor: RequestColors.cardBg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RequestColors.divider,
  },
  filterScrollView: {
    paddingHorizontal: Spacing.lg,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: RequestColors.primary,
    borderColor: RequestColors.primary,
  },
  filterTabText: {
    ...Typography.body,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // ===== STATS =====
  statsContainer: {
    backgroundColor: RequestColors.cardBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: RequestColors.divider,
  },
  statsText: {
    ...Typography.caption,
    textAlign: 'center',
  },
  
  // ===== LIST =====
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  
  // ===== REQUEST CARD =====
  requestCard: {
    backgroundColor: RequestColors.cardBg,
    borderRadius: 16,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: RequestColors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardRoomName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  cardDate: {
    ...Typography.caption,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  statusIcon: {
    // Icon will be added inline
  },
  
  // ===== CARD CONTENT =====
  cardContent: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingTop: 0,
  },
  cardThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  cardThumbnailImage: {
    width: '100%',
    height: '100%',
  },
  cardThumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  cardInfo: {
    flex: 1,
  },
  cardDescription: {
    ...Typography.body,
    lineHeight: 18,
  },
  
  // ===== CARD FOOTER =====
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  cardActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: 4,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
  },
  editButtonText: {
    ...Typography.button,
    fontSize: 13,
    color: '#1976D2',
  },
  viewButton: {
    backgroundColor: '#F3E5F5',
  },
  viewButtonText: {
    ...Typography.button,
    fontSize: 13,
    color: '#7B1FA2',
  },
  disabledButton: {
    backgroundColor: '#F5F5F5',
    opacity: 0.5,
  },
  disabledButtonText: {
    ...Typography.button,
    fontSize: 13,
    color: '#BDBDBD',
  },
  
  // ===== EMPTY STATE =====
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  
  // ===== LOADING =====
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.md,
  },
  footerLoading: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  
  // ===== MODAL OVERLAY (Bottom Sheet Style) =====
  modalOverlay: {
    flex: 1,
    backgroundColor: RequestColors.overlay,
    justifyContent: 'flex-end',
  },
  
  // ===== MODAL CONTAINER =====
  modalContainer: {
    backgroundColor: RequestColors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D9D9D9',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: RequestColors.divider,
  },
  modalTitle: {
    ...Typography.h2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#6B7280',
  },
  
  // ===== MODAL BODY =====
  modalBody: {
    maxHeight: '70%',
  },
  modalContent: {
    padding: Spacing.lg,
  },
  
  // ===== FORM =====
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: Spacing.sm,
  },
  required: {
    color: RequestColors.rejected.text,
  },
  input: {
    backgroundColor: RequestColors.inputBg,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: RequestColors.primary,
  },
  disabledInput: {
    backgroundColor: '#FAFAFA',
    color: '#9CA3AF',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    ...Typography.caption,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  
  // ===== IMAGE PICKER =====
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: RequestColors.primary,
    borderStyle: 'dashed',
    backgroundColor: '#F0F7FF',
  },
  imagePickerText: {
    ...Typography.button,
    fontSize: 14,
    color: RequestColors.primary,
  },
  currentImageLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  currentImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  newImageInfo: {
    backgroundColor: '#E3F2FD',
    padding: Spacing.sm,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  newImageText: {
    ...Typography.caption,
    color: '#1976D2',
  },
  removeImageButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  removeImageText: {
    ...Typography.body,
    color: RequestColors.rejected.text,
    fontWeight: '500',
  },
  
  // ===== MODAL FOOTER =====
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: RequestColors.divider,
    backgroundColor: '#FAFAFA',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: RequestColors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    ...Typography.button,
    color: '#1F2937',
  },
  
  // ===== COMPLETION MODAL SPECIFIC =====
  completionSection: {
    marginBottom: Spacing.lg,
  },
  completionLabel: {
    ...Typography.body,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: Spacing.sm,
  },
  completionValue: {
    ...Typography.body,
    color: '#6B7280',
    lineHeight: 20,
  },
  completionNoteBox: {
    backgroundColor: RequestColors.completed.bg,
    padding: Spacing.md,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: RequestColors.completed.text,
  },
  completionNoteText: {
    ...Typography.body,
    color: RequestColors.completed.text,
    lineHeight: 20,
  },
  completionDivider: {
    height: 1,
    backgroundColor: RequestColors.divider,
    marginVertical: Spacing.xl,
  },
  successBadge: {
    backgroundColor: RequestColors.completed.bg,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: RequestColors.completed.border,
  },
  successIcon: {
    marginBottom: Spacing.sm,
  },
  successText: {
    ...Typography.h3,
    color: RequestColors.completed.text,
  },
  requestImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  value: {
    ...Typography.body,
    color: '#1F2937',
  },
  description: {
    ...Typography.body,
    lineHeight: 20,
  },
  
  // ===== OLD STYLES (Keep for backward compatibility) =====
  requestItem: {
    backgroundColor: RequestColors.cardBg,
    borderRadius: 16,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    shadowColor: RequestColors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  roomName: {
    ...Typography.h3,
    marginBottom: Spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  requestBody: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  label: {
    ...Typography.caption,
    marginBottom: Spacing.xs,
  },
  imageContainer: {
    marginBottom: Spacing.sm,
  },
  noImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    ...Typography.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  date: {
    ...Typography.caption,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    ...Typography.button,
    fontSize: 13,
  },
});
