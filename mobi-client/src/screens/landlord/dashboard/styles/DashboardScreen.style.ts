import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../../styles/colors';

// ===== CONSTANTS =====
const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 16px padding mỗi bên + 16px gap

// ===== STYLES =====
export const styles = StyleSheet.create({
  // ===== CONTAINER =====
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollView: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  bottomSpacing: {
    height: 24,
  },

  // ===== HEADER =====
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.textWhite,
  },

  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },

  greetingContainer: {
    flex: 1,
  },

  greetingText: {
    fontSize: 14,
    color: Colors.textWhite,
    opacity: 0.9,
    fontWeight: '500',
  },

  landlordName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textWhite,
    marginTop: 4,
  },

  notificationButton: {
    position: 'relative',
    padding: 8,
  },

  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  notificationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textWhite,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },

  dateText: {
    fontSize: 13,
    color: Colors.textWhite,
    marginLeft: 8,
    opacity: 0.9,
  },

  // ===== SECTION HEADERS =====
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },

  // ===== STATISTICS =====
  statisticsContainer: {
    paddingHorizontal: 16,
    marginTop: -12, // Overlap với header
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },

  statCard: {
    width: cardWidth,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  statCardGradient: {
    padding: 16,
    minHeight: 140,
    justifyContent: 'space-between',
  },

  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: 8,
  },

  statFooter: {
    flexDirection: 'column',
  },

  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
    opacity: 0.9,
  },

  statUnit: {
    fontSize: 12,
    color: Colors.textWhite,
    opacity: 0.7,
    marginTop: 2,
  },

  revenueContainer: {
    marginTop: 16,
  },

  revenueCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  revenueTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textWhite,
    marginLeft: 12,
  },

  revenueContent: {
    marginBottom: 16,
  },

  revenueValue: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 8,
  },

  revenueSubtext: {
    fontSize: 14,
    color: Colors.textWhite,
    opacity: 0.8,
  },

  revenueDivider: {
    height: 1,
    backgroundColor: Colors.textWhite,
    opacity: 0.3,
    marginVertical: 16,
  },

  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  revenueFooterItem: {
    flex: 1,
  },

  revenueFooterLabel: {
    fontSize: 13,
    color: Colors.textWhite,
    opacity: 0.8,
    marginBottom: 4,
  },

  revenueFooterValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textWhite,
  },

  // ===== QUICK ACTIONS =====
  quickActionsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },

  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },

  quickActionButton: {
    width: cardWidth,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },

  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
    marginTop: 12,
    textAlign: 'center',
  },

  // ===== TASK OVERVIEW =====
  taskOverviewContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
  },

  taskStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  taskStatItem: {
    alignItems: 'center',
    flex: 1,
  },

  taskStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },

  taskStatLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  tasksList: {
    gap: 12,
  },

  taskItem: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },

  taskItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },

  taskPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  taskPriorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textWhite,
  },

  taskItemDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },

  taskItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  taskStatusBadge: {
    backgroundColor: Colors.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  taskStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  taskDueDateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 4,
  },

  emptyTasksContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyTasksText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },

  emptyTasksSubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});