import { StyleSheet } from 'react-native';
import Colors, { withOpacity } from '../../styles/colors';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(Colors.primary, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    padding: 0,
  },

  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: withOpacity(Colors.error, 0.1),
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // List
  listContent: {
    paddingBottom: 100, // Space for tab bar
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // Conversation Item
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    minHeight: 72,
  },
  conversationItemUnread: {
    backgroundColor: withOpacity(Colors.primary, 0.02),
  },

  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },

  // Content
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  userName: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
    letterSpacing: -0.2,
  },
  userNameUnread: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timeText: {
    fontSize: 13,
    color: Colors.textTertiary,
    fontWeight: '400',
    marginTop: 2,
  },
  timeTextUnread: {
    color: Colors.primary,
    fontWeight: '500',
  },

  // Message Row
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  lastMessageUnread: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Unread Badge
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 2,
  },
  unreadText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Received Message Count Badge
  receivedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 2,
  },
  receivedBadgeText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
