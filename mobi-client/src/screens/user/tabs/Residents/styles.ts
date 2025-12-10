import { StyleSheet } from 'react-native';

// ============================================================================
// DESIGN SYSTEM
// ============================================================================

/**
 * Color Palette - Modern, vibrant, and accessible
 */
export const Colors = {
  // Primary Brand Colors
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Neutral Colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Semantic Colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },

  // Status-specific colors
  active: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
  },

  pending: {
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#92400E',
  },

  inactive: {
    bg: '#F3F4F6',
    border: '#D1D5DB',
    text: '#4B5563',
  },

  rejected: {
    bg: '#FEE2E2',
    border: '#FECACA',
    text: '#991B1B',
  },

  // Background & Surface
  background: '#F9FAFB',
  surface: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

/**
 * Typography System
 */
export const Typography = {
  // Display
  displayLarge: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    letterSpacing: -0.5,
  },

  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },

  // Body
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },

  // Labels
  labelLarge: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
};

/**
 * Spacing System - 8px base unit
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

/**
 * Border Radius System
 */
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

/**
 * Shadow System
 */
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Legacy export for backward compatibility
export const ResidentColors = {
  active: Colors.active,
  pending: Colors.pending,
  inactive: Colors.inactive,
  rejected: Colors.rejected,
};

// ============================================================================
// COMPONENT STYLES
// ============================================================================

/**
 * ResidentScreen Styles
 */
export const residentScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header Section
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flex: 1,
  },

  headerTitle: {
    ...Typography.h1,
    color: Colors.neutral[900],
    marginBottom: 4,
  },

  headerSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
  },

  headerRight: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  headerButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },

  headerButtonActive: {
    backgroundColor: Colors.primary[500],
  },

  addButton: {
    backgroundColor: Colors.primary[500],
  },

  headerAddButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },

  // Search Bar
  searchBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  searchInputContainerFocused: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary[300],
    ...Shadows.sm,
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    paddingVertical: 0,
  },

  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  filterButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },

  filterIcon: {
    color: Colors.neutral[600],
  },

  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  filterBadgeText: {
    ...Typography.labelSmall,
    color: Colors.surface,
    fontSize: 10,
  },

  // List
  listContainer: {
    flex: 1,
  },

  listContentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxxl * 2,
    paddingHorizontal: Spacing.xl,
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },

  emptyIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  emptyTitle: {
    ...Typography.h2,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  emptyDescription: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },

  emptyMessage: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },

  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },

  emptyButtonText: {
    ...Typography.labelLarge,
    color: Colors.surface,
  },

  clearFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    marginTop: Spacing.lg,
  },

  clearFilterButtonText: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
  },

  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[500],
    marginTop: Spacing.md,
  },

  footerLoading: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
});

/**
 * ResidentCard Styles
 */
export const residentCardStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  pressable: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  pressableActive: {
    opacity: 0.7,
  },

  content: {
    padding: Spacing.lg,
  },

  // Header Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  fullName: {
    ...Typography.h3,
    color: Colors.neutral[900],
    flex: 1,
    marginRight: Spacing.sm,
  },

  relationshipTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },

  relationshipTagText: {
    ...Typography.labelMedium,
    color: Colors.primary[700],
  },

  // Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },

  roomTitle: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    flex: 1,
    marginRight: Spacing.sm,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },

  statusIcon: {
    ...Typography.labelMedium,
    fontSize: 10,
  },

  statusBadgeText: {
    ...Typography.labelMedium,
    fontSize: 11,
  },

  // ID Row
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },

  idNumber: {
    ...Typography.bodySmall,
    color: Colors.neutral[500],
    flex: 1,
  },

  swipeHintText: {
    ...Typography.labelSmall,
    color: Colors.primary[500],
  },

  // Swipe Actions
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginLeft: Spacing.sm,
  },

  editButton: {
    backgroundColor: Colors.primary[50],
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },

  editButtonText: {
    ...Typography.labelMedium,
    color: Colors.primary[700],
  },

  deleteButton: {
    backgroundColor: Colors.error[50],
    borderWidth: 1,
    borderColor: Colors.error[200],
  },

  deleteButtonText: {
    ...Typography.labelMedium,
    color: Colors.error[700],
  },
});

/**
 * ResidentDetailModal Styles
 */
export const residentDetailModalStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    ...Shadows.xl,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },

  headerTitle: {
    ...Typography.h2,
    color: Colors.neutral[900],
    flex: 1,
    marginRight: Spacing.md,
  },

  editButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },

  // Content
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.xxl,
  },

  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },

  // Info Grid
  infoGrid: {
    gap: Spacing.md,
  },

  infoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  infoItem: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  infoLabel: {
    ...Typography.labelSmall,
    color: Colors.neutral[500],
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    fontWeight: '600',
  },

  infoTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },

  infoTagText: {
    ...Typography.labelMedium,
    fontSize: 12,
    fontWeight: '600',
  },

  // Images
  imageGallery: {
    marginBottom: Spacing.xxl,
  },

  imageRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  imageContainer: {
    flex: 1,
  },

  imageThumbnail: {
    aspectRatio: 1.5,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  imageThumbnailImage: {
    width: '100%',
    height: '100%',
  },

  imageThumbnailLabel: {
    ...Typography.labelSmall,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  imageLabel: {
    ...Typography.labelSmall,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // Highlight Box
  highlightBox: {
    backgroundColor: Colors.primary[50],
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },

  highlightBoxText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[700],
    lineHeight: 22,
  },

  // Footer
  footer: {
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  buttonClose: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },

  buttonCloseText: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
  },
});

/**
 * ResidentEditModal Styles
 */
export const residentEditModalStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '95%',
    ...Shadows.xl,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },

  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },

  headerTitleContainer: {
    flex: 1,
  },

  headerTitle: {
    ...Typography.h2,
    color: Colors.neutral[900],
  },

  headerSubtitle: {
    ...Typography.bodySmall,
    color: Colors.neutral[500],
    marginTop: 2,
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.xxl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  sectionDescription: {
    ...Typography.bodySmall,
    color: Colors.neutral[500],
    marginBottom: Spacing.md,
  },

  // Form Fields
  formField: {
    marginBottom: Spacing.lg,
  },

  label: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },

  required: {
    ...Typography.labelLarge,
    color: Colors.error[500],
    marginLeft: 2,
  },

  textInput: {
    height: 52,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  textInputFocused: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary[300],
    ...Shadows.sm,
  },

  textInputError: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
  },

  textArea: {
    minHeight: 100,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    textAlignVertical: 'top',
  },

  errorText: {
    ...Typography.bodySmall,
    color: Colors.error[600],
    marginTop: Spacing.xs,
  },

  characterCount: {
    ...Typography.bodySmall,
    color: Colors.neutral[400],
    textAlign: 'right',
    marginTop: Spacing.xs,
  },

  // Selector Fields
  selectorButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  selectorButtonError: {
    borderColor: Colors.error[500],
    backgroundColor: Colors.error[50],
  },

  selectorText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },

  selectorPlaceholder: {
    ...Typography.bodyMedium,
    color: Colors.neutral[400],
  },

  // Date Picker
  dateRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  dateField: {
    flex: 1,
  },

  // Image Upload
  imageContainer: {
    marginBottom: Spacing.lg,
  },

  imageLabel: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },

  imageUploadButton: {
    height: 180,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  imageUploadText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[600],
    marginTop: Spacing.sm,
  },

  imageUploadHint: {
    ...Typography.bodySmall,
    color: Colors.neutral[400],
  },

  imagePreview: {
    height: 180,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  imagePreviewImage: {
    width: '100%',
    height: '100%',
  },

  imageRemoveButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.error[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },

  imageRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  imageColumn: {
    flex: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
    backgroundColor: Colors.surface,
  },

  button: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },

  buttonCancel: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },

  buttonCancelText: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
  },

  buttonSubmit: {
    backgroundColor: Colors.primary[500],
    ...Shadows.md,
  },

  buttonSubmitDisabled: {
    backgroundColor: Colors.neutral[300],
  },

  buttonSubmitText: {
    ...Typography.labelLarge,
    color: Colors.surface,
  },

  // Loading State
  buttonLoading: {
    opacity: 0.7,
  },

  // Additional styles
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },

  sectionLabel: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },

  dateButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },

  dateButtonText: {
    ...Typography.bodyMedium,
    color: Colors.neutral[900],
  },

  imageSection: {
    marginBottom: Spacing.xxl,
  },
});

/**
 * FilterModal Styles
 */
export const filterModalStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '85%',
    ...Shadows.xl,
  },

  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },

  headerTitle: {
    ...Typography.h2,
    color: Colors.neutral[900],
  },

  // Content
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.xxl,
  },

  sectionTitle: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
    backgroundColor: Colors.surface,
  },

  chipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
    ...Shadows.sm,
  },

  chipText: {
    ...Typography.labelMedium,
    color: Colors.neutral[700],
  },

  chipTextSelected: {
    color: Colors.surface,
    fontWeight: '600',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },

  button: {
    flex: 1,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },

  buttonClear: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },

  buttonClearText: {
    ...Typography.labelLarge,
    color: Colors.neutral[700],
  },

  buttonApply: {
    backgroundColor: Colors.primary[500],
    ...Shadows.md,
  },

  buttonApplyText: {
    ...Typography.labelLarge,
    color: Colors.surface,
  },
});
