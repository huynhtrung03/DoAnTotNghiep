import { StyleSheet, Dimensions } from 'react-native';
import Colors, { withOpacity } from '../../../../styles/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  
  // ==================== LOADING & ERROR ====================
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // ==================== IMAGE SECTION ====================
  imageSection: {
    backgroundColor: '#000',
    position: 'relative',
    height: 380,
  },
  image: {
    width: SCREEN_WIDTH,
    height: 380,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    pointerEvents: 'none',
  },
  imageTopActions: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
  },
  actionButtonFavorite: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  favoriteCountBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  favoriteCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  vipBadgeOnImage: {
    position: 'absolute',
    top: 16,
    left: 16,
    borderRadius: 20,
    overflow: 'hidden',
    zIndex: 10,
  },
  vipBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  vipBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  noImageContainer: {
    width: SCREEN_WIDTH,
    height: 380,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  noImageText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    zIndex: 5,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom:50,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    zIndex: 5,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ==================== FULLSCREEN MODAL ====================
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 999,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  fullscreenCounter: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 998,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  fullscreenCounterText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullscreenMediaContainer: {
    width: SCREEN_WIDTH,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenMedia: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  fullscreenNavLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 997,
  },
  fullscreenNavRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 997,
  },

  // ==================== PRICE CARD ====================
  priceCard: {
    marginHorizontal: 16,
    marginTop: -40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 100,
  },
  priceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceCardLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.success,
  },
  priceUnit: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // ==================== TITLE SECTION ====================
  titleSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  roomTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    lineHeight: 30,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(Colors.error, 0.08),
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 14,
    backgroundColor: Colors.border,
  },

  // ==================== SECTIONS ====================
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },

  // ==================== SPECS GRID ====================
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  specCardGradient: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
  },
  specIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  specValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  specLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // ==================== ADDRESS CARD ====================
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addressRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 120,
    fontWeight: '600',
  },
  addressValue: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  mapButton: {
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },

  // ==================== DATE CARD ====================
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dateValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  relativeTimeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  relativeTimeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // ==================== DEPOSIT CARD ====================
  depositCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  depositContent: {
    flex: 1,
  },
  depositLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  depositValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },

  // ==================== DESCRIPTION CARD ====================
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textPrimary,
  },

  // ==================== CONVENIENCES GRID ====================
  convenientsGrid: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: withOpacity(Colors.success, 0.15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },

  // ==================== LANDLORD SECTION ====================
  landlordSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },

  // ==================== BOTTOM PADDING ====================
  bottomPadding: {
    height: 40,
  },

  // ==================== OLD STYLES (for compatibility) ====================
  headerGradient: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  vipBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  vipBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  badgeContainer: {
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  priceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  convenientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  convenientText: {
    fontSize: 14,
    color: '#1F2937',
  },

  // ==================== FLOATING BOOKING BUTTON ====================
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },

  floatingBookingButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#1976D2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },

  bookingButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },

  bookingButtonTextContainer: {
    flex: 1,
    marginLeft: 4,
  },

  bookingButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },

  bookingButtonSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
