import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../../colors/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    fontWeight: '500',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.error,
    marginTop: 16,
    marginBottom: 8,
  },

  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  backButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },

  backButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },

  // Image Section
  imageSection: {
    height: SCREEN_HEIGHT * 0.4,
    position: 'relative',
  },

  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.4,
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  imageTopActions: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
  },

  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },

  vipBadgeOnImage: {
    position: 'absolute',
    top: 50,
    left: 20,
  },

  vipBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },

  vipBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },

  paginationContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },

  paginationDotActive: {
    backgroundColor: Colors.textWhite,
  },

  imageCounter: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },

  imageCounterText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },

  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },

  noImageText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },

  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },

  playIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 40,
    padding: 8,
  },

  // Fullscreen Modal
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000',
  },

  fullscreenCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullscreenCounter: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  fullscreenCounterText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },

  fullscreenMediaContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullscreenMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },

  fullscreenNavLeft: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fullscreenNavRight: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Price Card
  priceCard: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.35,
    left: 20,
    right: 20,
    zIndex: 10,
  },

  priceCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },

  priceCardLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },

  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  priceUnit: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },

  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  contactButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },

  // Title Section
  titleSection: {
    padding: 20,
    paddingTop: 80,
  },

  roomTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
    lineHeight: 32,
  },

  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  addressText: {
    fontSize: 16,
    color: Colors.primary,
    flex: 1,
    textDecorationLine: 'underline',
  },

  quickStats: {
    flexDirection: 'row',
    gap: 16,
  },

  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Section Styles
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },

  sectionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },

  // Specs Grid
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  specCard: {
    width: (SCREEN_WIDTH - 40 - 24) / 2,
    minHeight: 100,
  },

  specCardGradient: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },

  specIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  specValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  specLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Address Card
  addressCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },

  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  addressLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  addressValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },

  mapButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },

  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },

  mapButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },

  // Date Card
  dateCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  dateLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
    minWidth: 80,
  },

  dateValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },

  relativeTimeBadge: {
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  relativeTimeText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },

  // Deposit Card
  depositCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  depositContent: {
    flex: 1,
  },

  depositLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },

  depositValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },

  // Description Card
  descriptionCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
  },

  descriptionText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 24,
  },

  // Convenients Grid
  convenientsGrid: {
    gap: 8,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },

  featureIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },

  featureText: {
    fontSize: 16,
    color: Colors.textPrimary,
    flex: 1,
  },

  // Bottom Padding
  bottomPadding: {
    height: 100,
  },
});