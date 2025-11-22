/**
 * UserInfoCard Component for React Native
 * 
 * Hiển thị thông tin chủ nhà với:
 * - Thông tin landlord từ getLandlordByRoomId()
 * - Favorite functionality từ FavoriteService
 * - Report functionality
 * - Share, Call, Message actions
 * - Modern UI design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Image,
  Alert,
  Share,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Colors, { withOpacity } from '../../../styles/colors';
import { getLandlordByRoomId } from '../../../services/rooms/RoomService';
import { 
  addFavorite, 
  removeFavorite, 
  getFavoriteCount, 
  isFavorited as checkIsFavorited,
} from '../../../services/favorites/FavoriteService';
import { URL_IMAGE } from '../../../services/config/Constant';

interface UserInfoCardProps {
  roomId: string;
  onChatPress?: () => void; // Optional callback for chat
  compact?: boolean; // Compact mode for inline display
}

interface LandlordDetailByRoom {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  avatar?: string;
  amountPost?: number;  // Số tin đăng
  createDate?: string;  // Ngày tham gia
}

// Mask functions for privacy
const maskPhone = (phone: string) => {
  if (!phone) return '';
  if (phone.length < 4) return phone;
  return phone.slice(0, 2) + '******' + phone.slice(-2);
};

const maskEmail = (email: string) => {
  if (!email) return '';
  const [name, domain] = email.split('@');
  if (!name || !domain) return email;
  if (name.length <= 2) {
    return name[0] + '****@' + domain;
  }
  return name[0] + '****' + name.slice(-1) + '@' + domain;
};

export default function UserInfoCard({ roomId, onChatPress, compact = false }: UserInfoCardProps) {
  const [landlord, setLandlord] = useState<LandlordDetailByRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const REPORT_REASONS = [
    'Thông tin đã hết hạn/không còn hiệu lực',
    'Nội dung trùng lặp',
    'Không thể liên lạc với chủ tin',
    'Thông tin không chính xác (giá, diện tích, hình ảnh...)',
    'Lý do khác',
  ];

  useEffect(() => {
    if (roomId) {
      loadData();
    }
  }, [roomId]);

  /**
   * Load tất cả dữ liệu: landlord info, favorite status, favorite count
   */
  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 UserInfoCard: Loading data for roomId:', roomId);
      
      // Load parallel để nhanh hơn
      const [landlordData, favoriteStatus, favCount] = await Promise.all([
        getLandlordByRoomId(roomId),
        checkIsFavorited(roomId),
        getFavoriteCount(roomId),
      ]);

      console.log('📦 UserInfoCard: Landlord data:', landlordData);
      console.log('🖼️ UserInfoCard: Avatar URL:', landlordData?.avatar);
      console.log('🔗 UserInfoCard: Full avatar URL:', landlordData?.avatar ? `${URL_IMAGE}${landlordData.avatar.startsWith('/') ? landlordData.avatar.slice(1) : landlordData.avatar}` : 'No avatar');
      console.log('❤️ UserInfoCard: Favorite status:', favoriteStatus, 'Count:', favCount);

      if (landlordData) {
        setLandlord(landlordData);
      } else {
        console.warn('⚠️ UserInfoCard: No landlord data received');
      }
      
      setIsFavorited(favoriteStatus);
      setFavoriteCount(favCount);

    } catch (error) {
      console.error('❌ UserInfoCard: Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin chủ nhà');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gọi điện thoại
   */
  const handleCall = () => {
    if (!landlord?.phone) {
      Alert.alert('Thông báo', 'Số điện thoại không khả dụng');
      return;
    }
    
    Alert.alert(
      'Gọi điện thoại',
      `Gọi cho ${landlord.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Gọi', 
          onPress: () => Linking.openURL(`tel:${landlord.phone}`) 
        },
      ]
    );
  };

  /**
   * Nhắn tin
   */
  const handleMessage = () => {
    if (onChatPress) {
      onChatPress();
    } else {
      Alert.alert('Thông báo', 'Tính năng nhắn tin đang được phát triển');
    }
  };

  /**
   * Toggle favorite
   */
  const handleFavorite = async () => {
    try {
      const newFavoriteState = !isFavorited;
      
      // Optimistic update
      setIsFavorited(newFavoriteState);
      setFavoriteCount(prev => newFavoriteState ? prev + 1 : prev - 1);

      // Call API
      const success = newFavoriteState 
        ? await addFavorite(roomId)
        : await removeFavorite(roomId);

      if (!success) {
        // Revert on failure
        setIsFavorited(!newFavoriteState);
        setFavoriteCount(prev => newFavoriteState ? prev - 1 : prev + 1);
        Alert.alert('Lỗi', 'Không thể cập nhật yêu thích');
      }

    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert on error
      setIsFavorited(!isFavorited);
      setFavoriteCount(prev => isFavorited ? prev + 1 : prev - 1);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật yêu thích');
    }
  };

  /**
   * Chia sẻ
   */
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Xem phòng trọ của ${landlord?.fullName || 'chủ nhà'}\nMã phòng: ${roomId}`,
        title: 'Chia sẻ thông tin phòng trọ',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  /**
   * Báo cáo
   */
  const handleReport = () => {
    setShowReportModal(true);
  };

  /**
   * Submit báo cáo
   */
  const submitReport = async () => {
    // Validation
    if (!reportReason) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do báo cáo');
      return;
    }

    if (reportReason === 'Lý do khác' && !reportDescription.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả chi tiết');
      return;
    }

    if (!contactName.trim() || !/^[a-zA-ZÀ-ỹ0-9\s]+$/.test(contactName.trim())) {
      Alert.alert('Lỗi', 'Họ tên không hợp lệ (không chứa ký tự đặc biệt)');
      return;
    }

    if (!contactPhone.trim() || !/^[0-9]{10}$/.test(contactPhone.trim())) {
      Alert.alert('Lỗi', 'Số điện thoại phải là 10 chữ số');
      return;
    }

    try {
      setSubmittingReport(true);

      // TODO: Create ReportService.ts and implement submitReport API
      // For now, just show success
      console.log('Report submitted:', {
        roomId,
        reason: reportReason,
        description: reportDescription,
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
      });

      Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi thành công');
      
      // Reset form
      setShowReportModal(false);
      setReportReason('');
      setReportDescription('');
      setContactName('');
      setContactPhone('');

    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Lỗi', 'Không thể gửi báo cáo. Vui lòng thử lại');
    } finally {
      setSubmittingReport(false);
    }
  };

  /**
   * Format date
   */
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Chưa rõ';
    const date = new Date(dateString);
    const month = date.toLocaleDateString('vi-VN', { month: 'long' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  /**
   * Loading state
   */
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  /**
   * Error state
   */
  if (!landlord) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Không thể tải thông tin chủ nhà</Text>
      </View>
    );
  }

  /**
   * Compact mode - Inline display
   */
  if (compact) {
    return (
      <Animated.View entering={FadeInDown.duration(400)} style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Ionicons name="person-circle" size={20} color={Colors.primary} />
          <Text style={styles.compactTitle}>Thông tin chủ nhà</Text>
        </View>

        <View style={styles.compactContent}>
          {/* Avatar & Name */}
          <View style={styles.compactProfile}>
            {landlord.avatar ? (
              <Image 
                source={{ 
                  uri: landlord.avatar.startsWith('http') 
                    ? landlord.avatar 
                    : `${URL_IMAGE}${landlord.avatar.startsWith('/') ? landlord.avatar.slice(1) : landlord.avatar}` 
                }} 
                style={styles.compactAvatar}
              />
            ) : (
              <View style={styles.compactAvatarPlaceholder}>
                <Ionicons name="person" size={24} color={Colors.textSecondary} />
              </View>
            )}
            
            <View style={styles.compactInfo}>
              <Text style={styles.compactName}>{landlord.fullName}</Text>
              <View style={styles.compactStats}>
                <View style={styles.compactStatItem}>
                  <Ionicons name="home-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.compactStatText}>{landlord.amountPost || 0} tin</Text>
                </View>
                <View style={styles.compactDivider} />
                <View style={styles.compactStatItem}>
                  <Ionicons name="heart-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.compactStatText}>{favoriteCount} thích</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Compact Actions */}
          <View style={styles.compactActions}>
            <TouchableOpacity 
              style={styles.compactActionButton}
              onPress={handleCall}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={Colors.gradients.green}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.compactButtonGradient}
              >
                <Ionicons name="call" size={16} color={Colors.textWhite} />
                <Text style={styles.compactButtonText}>Gọi</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.compactActionButton}
              onPress={handleMessage}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={Colors.gradients.blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.compactButtonGradient}
              >
                <Ionicons name="chatbubble" size={16} color={Colors.textWhite} />
                <Text style={styles.compactButtonText}>Chat</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.compactActionIconButton}
              onPress={handleFavorite}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isFavorited ? "heart" : "heart-outline"} 
                size={20} 
                color={isFavorited ? Colors.error : Colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  }

  /**
   * Full mode - Original display
   */
  return (
    <View style={styles.container}>
      {/* Main Profile Card */}
      <Animated.View 
        entering={FadeInDown.duration(400)}
        style={styles.profileCard}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={Colors.gradients.blue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.avatarContainer}>
            {landlord.avatar ? (
              <Image 
                source={{ 
                  uri: landlord.avatar.startsWith('http') 
                    ? landlord.avatar 
                    : `${URL_IMAGE}${landlord.avatar.startsWith('/') ? landlord.avatar.slice(1) : landlord.avatar}` 
                }} 
                style={styles.avatar}
                onError={(error) => {
                  console.warn('⚠️ UserInfoCard: Error loading avatar:', error.nativeEvent.error);
                  if (landlord.avatar) {
                    console.warn('⚠️ UserInfoCard: Attempted URL:', 
                      landlord.avatar.startsWith('http') ? landlord.avatar : `${URL_IMAGE}${landlord.avatar.startsWith('/') ? landlord.avatar.slice(1) : landlord.avatar}`
                    );
                  }
                }}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={Colors.textWhite} />
              </View>
            )}
          </View>

          <Text style={styles.name}>{landlord.fullName}</Text>
          
          <View style={styles.joinDateContainer}>
            <Ionicons name="calendar-outline" size={14} color={withOpacity(Colors.textWhite, 0.9)} />
            <Text style={styles.joinDate}>
              Tham gia {formatJoinDate(landlord.createDate)}
            </Text>
          </View>
        </LinearGradient>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="home" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{landlord.amountPost || 0}</Text>
              <Text style={styles.statLabel}>Tin đăng</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Ionicons name="heart" size={24} color={Colors.error} />
              <Text style={styles.statValue}>{favoriteCount}</Text>
              <Text style={styles.statLabel}>Lượt thích</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.contactSection}>
            {landlord.phone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={20} color={Colors.primary} />
                <Text style={styles.contactText}>{maskPhone(landlord.phone)}</Text>
              </View>
            )}
            
            {landlord.email && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={20} color={Colors.primary} />
                <Text style={styles.contactText}>{maskEmail(landlord.email)}</Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleCall}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Colors.gradients.green}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="call" size={20} color={Colors.textWhite} />
                <Text style={styles.buttonText}>Gọi điện</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={handleMessage}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={Colors.gradients.blue}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Ionicons name="chatbubble" size={20} color={Colors.textWhite} />
                <Text style={styles.buttonText}>Nhắn tin</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Quick Actions Card */}
      <Animated.View 
        entering={FadeInDown.duration(400).delay(100)}
        style={styles.quickActionsCard}
      >
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleFavorite}
          activeOpacity={0.7}
        >
          <View style={[
            styles.actionIconContainer,
            { backgroundColor: isFavorited ? withOpacity(Colors.error, 0.1) : withOpacity(Colors.textSecondary, 0.1) }
          ]}>
            <Ionicons 
              name={isFavorited ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorited ? Colors.error : Colors.textSecondary} 
            />
          </View>
          <Text style={styles.quickActionText}>
            {isFavorited ? 'Đã thích' : 'Yêu thích'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <View style={[
            styles.actionIconContainer,
            { backgroundColor: withOpacity(Colors.primary, 0.1) }
          ]}>
            <Ionicons name="share-social-outline" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.quickActionText}>Chia sẻ</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={handleReport}
          activeOpacity={0.7}
        >
          <View style={[
            styles.actionIconContainer,
            { backgroundColor: withOpacity(Colors.warning, 0.1) }
          ]}>
            <Ionicons name="flag-outline" size={24} color={Colors.warning} />
          </View>
          <Text style={styles.quickActionText}>Báo cáo</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Trust & Safety Card */}
      <Animated.View 
        entering={FadeInDown.duration(400).delay(200)}
        style={styles.trustCard}
      >
        <View style={styles.trustIconContainer}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.success} />
        </View>
        <View style={styles.trustContent}>
          <Text style={styles.trustTitle}>An toàn & Bảo mật</Text>
          <Text style={styles.trustText}>
            Thông tin cá nhân đã được ẩn để bảo vệ quyền riêng tư. 
            <Text style={styles.trustLink}> Tìm hiểu thêm</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Report Modal */}
      <Modal
        visible={showReportModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Báo cáo tin đăng</Text>
              <TouchableOpacity onPress={() => setShowReportModal(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Lý do báo cáo *</Text>
              <View style={styles.reasonContainer}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonButton,
                      reportReason === reason && styles.reasonButtonActive,
                    ]}
                    onPress={() => setReportReason(reason)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.reasonText,
                        reportReason === reason && styles.reasonTextActive,
                      ]}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {reportReason === 'Lý do khác' && (
                <>
                  <Text style={styles.inputLabel}>Mô tả chi tiết *</Text>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Nhập mô tả chi tiết..."
                    placeholderTextColor={Colors.textSecondary}
                    value={reportDescription}
                    onChangeText={setReportDescription}
                    multiline
                    numberOfLines={4}
                  />
                </>
              )}

              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên của bạn"
                placeholderTextColor={Colors.textSecondary}
                value={contactName}
                onChangeText={setContactName}
              />

              <Text style={styles.inputLabel}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại (10 chữ số)"
                placeholderTextColor={Colors.textSecondary}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowReportModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitReport}
                disabled={submittingReport}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={Colors.gradients.orange}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButtonGradient}
                >
                  {submittingReport ? (
                    <ActivityIndicator color={Colors.textWhite} />
                  ) : (
                    <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  loadingContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: Colors.textWhite,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: withOpacity(Colors.textWhite, 0.2),
    borderWidth: 4,
    borderColor: Colors.textWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  joinDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinDate: {
    fontSize: 14,
    color: withOpacity(Colors.textWhite, 0.9),
  },
  contentSection: {
    padding: 20,
    gap: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  contactSection: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
  },
  contactText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  quickActionsCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  trustCard: {
    backgroundColor: withOpacity(Colors.success, 0.05),
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: withOpacity(Colors.success, 0.1),
  },
  trustIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: withOpacity(Colors.success, 0.1),
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustContent: {
    flex: 1,
    gap: 4,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  trustText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  trustLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: withOpacity('#000000', 0.5),
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    marginTop: 16,
  },
  reasonContainer: {
    gap: 8,
  },
  reasonButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  reasonButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: withOpacity(Colors.primary, 0.1),
  },
  reasonText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reasonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: Colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },

  // ==================== COMPACT MODE STYLES ====================
  compactCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: withOpacity(Colors.primary, 0.05),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  compactContent: {
    padding: 16,
    gap: 16,
  },
  compactProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  compactAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactInfo: {
    flex: 1,
    gap: 6,
  },
  compactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  compactStatText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  compactDivider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.border,
  },
  compactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  compactActionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  compactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  compactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  compactActionIconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
