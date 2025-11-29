import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../../styles/colors';

// ===== CONSTANTS =====
const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2; // 16px padding + 8px gap

// ===== STYLES =====
export const styles = StyleSheet.create({
  // ===== CONTAINER =====
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Light gray background
  },

  scrollView: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },

  bottomSpacing: {
    height: 100, // Space for tab bar
  },

  // ===== HEADER - Compact & Clean =====
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  avatarContainer: {
    marginRight: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  greetingContainer: {
    flex: 1,
  },

  greetingText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  landlordName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },

  notificationButton: {
    position: 'relative',
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },

  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },

  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  dateText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },

  // ===== SECTION HEADERS =====
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 2,
  },

  // ===== STATISTICS - Clean Cards =====
  statisticsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  statCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 1,
  },

  statCardGradient: {
    // Not used in white design
  },

  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },

  statFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },

  statUnit: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  revenueContainer: {
    marginTop: 8,
  },

  revenueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  revenueTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },

  revenueContent: {
    marginBottom: 12,
  },

  revenueValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#10B981', // Green for money
    marginBottom: 4,
  },

  revenueSubtext: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  revenueDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 12,
  },

  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  revenueFooterItem: {
    flex: 1,
  },

  revenueFooterLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },

  revenueFooterValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444', // Red for expenses
  },

  // ===== QUICK ACTIONS - Minimalist =====
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  quickActionButton: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  quickActionGradient: {
    // Not used in white design
    alignItems: 'center',
  },

  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },

  // ===== TASK OVERVIEW - Clean List =====
  taskOverviewContainer: {
    paddingHorizontal: 16,
    marginTop: 20,
  },

  taskStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  taskStatItem: {
    alignItems: 'center',
    flex: 1,
  },

  taskStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },

  taskStatLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },

  tasksList: {
    gap: 8,
  },

  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  taskItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  taskTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },

  taskStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },

  taskItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },

  taskPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  taskPriorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  taskItemDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 18,
  },

  taskItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  taskStatusBadge: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  taskStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskDueDateText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },

  emptyTasksContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },

  emptyTasksText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },

  emptyTasksSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});