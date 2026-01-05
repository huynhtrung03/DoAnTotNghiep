/**
 * SearchScreen Modern Styles
 * 
 * Thiết kế UI hiện đại cho SearchScreen
 * - Clean header với search bar
 * - Modern tabs
 * - Beautiful room cards
 * - Smooth transitions
 */

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with 16px padding

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingBottom: 100, //  Add padding for tab bar
  },

  // ==================== MODERN HEADER ====================
  modernHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 100,
  },

  // Search Container
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },

  modernSearchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchIcon: {
    marginRight: 8,
  },

  modernSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },

  clearButton: {
    padding: 4,
  },

  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Modern Tabs
  modernTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  modernTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },

  modernTabActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },

  modernTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  modernTabTextActive: {
    color: '#2563EB',
  },

  // Room Count Badge
  modernRoomCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#2563EB',
  },

  modernRoomCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // ==================== SUGGESTIONS ====================
  modernSuggestionsContainer: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1000,
  },

  suggestionsScrollView: {
    borderRadius: 16,
  },

  modernSuggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },

  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  suggestionTextContainer: {
    flex: 1,
  },

  modernSuggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },

  modernSuggestionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },

  modernSuggestionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },

  // ==================== MAP VIEW ====================
  mapContainer: {
    flex: 1,
  },

  // Map Controls
  mapControlsContainer: {
    position: 'absolute',
    bottom: 100, // Tăng để tránh bị bottom tab che (thường bottom tab cao ~80-90px)
    right: 16,
    gap: 12,
    alignItems: 'flex-end',
  },

  modernMapButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  primaryButton: {
    flexDirection: 'row',
    width: 'auto',
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: '#2563EB',
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Map Center Crosshair
  modernMapCenterMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  crosshairOuter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#2563EB',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  crosshairInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },

  // Map Loading
  modernMapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },

  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  modernLoadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  modernLoadingSubtext: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // ==================== LIST VIEW ====================
  modernListContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  // Filter Bar
  modernFilterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },

  filterChipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },

  modernFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  modernFilterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  modernFilterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },

  modernFilterChipTextActive: {
    color: '#FFFFFF',
  },

  // Rooms List
  roomsScrollView: {
    flex: 1,
  },

  roomsScrollContent: {
    padding: 16,
    paddingBottom: 120, // Tăng để tránh bị bottom tab che
  },

  modernLoadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  // ==================== ROOM CARDS ====================
  modernCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },

  modernCardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },

  modernVipBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
  },

  modernVipBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modernCardContent: {
    padding: 16,
  },

  modernCardPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 8,
  },

  modernPriceUnit: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B7280',
  },

  modernCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 22,
  },

  modernInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  modernInfoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  modernInfoDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#E5E7EB',
  },

  modernInfoText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },

  // ==================== EMPTY STATE ====================
  modernEmptyState: {
    paddingVertical: 80,
    paddingHorizontal: 32,
    alignItems: 'center',
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },

  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  emptyActionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },

  emptyActionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ==================== OLD STYLES (Compatibility) ====================
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2563EB',
  },
  mapCenterMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  roomCountBadge: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  roomCountText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  searchAddressContainer: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchAddressInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
  },
  searchAddressButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#2563EB',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 140,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  suggestionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  mapLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  allRoomsContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterBar: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  vipBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#FBBF24',
  },
  vipBadgeText: {
    marginLeft: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#6B7280',
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  roomsListContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  // ==================== SEARCH ROOM CARD (RoomCard style) ====================
  searchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  // Image section
  searchImageContainer: {
    height: 220,
    backgroundColor: '#E5E7EB',
  },
  searchImage: {
    width: '100%',
    height: '100%',
  },
  searchGradientOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },

  // Top row with badges and heart
  searchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  searchBadgesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  searchVipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  searchVipText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  searchImageCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  searchImageCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  searchHeartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom info on image
  searchImageBottomInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  searchLocationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    maxWidth: '70%',
  },
  searchLocationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Content section
  searchContentContainer: {
    padding: 16,
  },
  searchTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  searchAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  searchAddress: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },

  // Specs row
  searchSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchSpecItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchSpecText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  searchSpecDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 10,
  },

  // Price section
  searchPriceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  searchPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  searchPriceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  searchPriceUnit: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  searchViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  searchViewButtonText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
});