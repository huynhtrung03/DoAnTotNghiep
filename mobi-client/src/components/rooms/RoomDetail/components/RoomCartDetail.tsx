import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Share,
  Alert,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, SlideInRight, ZoomIn, FadeIn } from 'react-native-reanimated';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RoomDetail } from '../../../../types/types';
import { getRoomById } from '../../../../services/rooms/RoomService';
import { URL_IMAGE } from '../../../../services/config/Constant';
import UserInfoCard from '../../../profile/UserInfoCard/UserInfoCard';
import BookingModal from '../../BookingModal/BookingModal';
import Colors, { withOpacity } from '../../../../styles/colors';
import { styles } from './RoomCartDetail.styles';
import { useFavoriteStore } from '../../../../stores/FavoriteStore';
import { 
  addFavorite as addFavoriteAPI, 
  removeFavorite as removeFavoriteAPI,
  getFavoriteCount
} from '../../../../services/favorites/FavoriteService';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RoomCartDetailProps {
  roomId: string;
  onClose?: () => void;
}

const formatVNDPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price);

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} giây trước`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} tháng trước`;
  return `${Math.floor(diffInSeconds / 31536000)} năm trước`;
};

// Spec Card Component với thiết kế mới
const SpecCard = ({ 
  icon, 
  value, 
  label, 
  color,
  delay = 0
}: { 
  icon: any; 
  value: string; 
  label: string; 
  color: string;
  delay?: number;
}) => (
  <Animated.View 
    entering={FadeInDown.duration(500).delay(delay)}
    style={styles.specCard}
  >
    <LinearGradient
      colors={[withOpacity(color, 0.15), withOpacity(color, 0.05)]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.specCardGradient}
    >
      <View style={[styles.specIconContainer, { backgroundColor: withOpacity(color, 0.2) }]}>
        {icon}
      </View>
      <Text style={[styles.specValue, { color }]}>{value}</Text>
      <Text style={styles.specLabel}>{label}</Text>
    </LinearGradient>
  </Animated.View>
);

// Feature Item Component với animation
const FeatureItem = ({ text, delay = 0 }: { text: string; delay?: number }) => (
  <Animated.View 
    entering={SlideInRight.duration(400).delay(delay)}
    style={styles.featureItem}
  >
    <View style={styles.featureIconContainer}>
      <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </Animated.View>
);

export default function RoomCartDetail({ roomId, onClose }: RoomCartDetailProps) {
  const navigation = useNavigation<any>();
  const { 
    favoriteRoomIds, 
    addFavorite, 
    removeFavorite,
    getFavoriteCount: getLocalFavoriteCount,
    setFavoriteCount: setStoreFavoriteCount,
    incrementFavoriteCount,
    decrementFavoriteCount
  } = useFavoriteStore();

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenVisible, setFullscreenVisible] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [isProcessingFavorite, setIsProcessingFavorite] = useState(false);

  const isFavorite = favoriteRoomIds.has(roomId);

  // Helper function to check if URL is video
  const isVideoUrl = (url: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  useEffect(() => {
    loadRoomDetails();
    checkLoginStatus();
    loadFavoriteCount();
  }, [roomId]);

  // Update favorite count from store
  useEffect(() => {
    const count = getLocalFavoriteCount(roomId);
    if (count > 0) {
      setFavoriteCount(count);
    }
  }, [roomId, getLocalFavoriteCount]);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    }
  };

  const loadFavoriteCount = async () => {
    try {
      const count = await getFavoriteCount(roomId);
      setFavoriteCount(count);
      setStoreFavoriteCount(roomId, count);
    } catch (error) {
      console.error('Error loading favorite count:', error);
    }
  };

  const loadRoomDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRoomById(roomId);
      if (data) {
        setRoom(data);
      } else {
        setError('Không tìm thấy thông tin phòng');
      }
    } catch (err) {
      console.error('Error loading room details:', err);
      setError('Có lỗi xảy ra khi tải thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const openMap = () => {
    if (!room) return;
    const address = `${room.address.street}, ${room.address.ward.name}, ${room.address.ward.district.name}, ${room.address.ward.district.province.name}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleChatPress = () => {
    // TODO: Navigate to chat screen with landlord
    console.log('Open chat with landlord for room:', roomId);
    // navigation.navigate('Chat', { roomId, landlordId: room?.landlord?.id });
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://yourapp.com/room/${roomId}`; // TODO: Replace with actual URL
      await Share.share({
        message: `🏠 ${room?.title}\n\n💰 Giá: ${formatVNDPrice(room?.priceMonth || 0)} VNĐ/tháng\n📍 ${fullAddress}\n\n🔗 Xem chi tiết: ${shareUrl}`,
        title: room?.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCall = () => {
    // TODO: Get landlord phone number and make call
    Alert.alert('Liên hệ', 'Tính năng đang phát triển');
  };

  const handleFavorite = async () => {
    // Kiểm tra đăng nhập
    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để thêm phòng vào danh sách yêu thích',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Đăng nhập', 
            onPress: () => navigation.navigate('Auth/Login')
          }
        ]
      );
      return;
    }

    if (isProcessingFavorite) return;

    setIsProcessingFavorite(true);
    const wasAlreadyFavorite = isFavorite;

    try {
      if (wasAlreadyFavorite) {
        // Xóa khỏi favorite
        const success = await removeFavoriteAPI(roomId);
        
        if (success) {
          removeFavorite(roomId);
          decrementFavoriteCount(roomId);
          setFavoriteCount(prev => Math.max(0, prev - 1));
          console.log(`✅ Removed from favorites: ${roomId}`);
        } else {
          Alert.alert('Lỗi', 'Không thể xóa khỏi danh sách yêu thích');
        }
      } else {
        // Thêm vào favorite
        const success = await addFavoriteAPI(roomId);
        
        if (success) {
          addFavorite(roomId);
          incrementFavoriteCount(roomId);
          setFavoriteCount(prev => prev + 1);
          console.log(`✅ Added to favorites: ${roomId}`);
        } else {
          Alert.alert('Lỗi', 'Không thể thêm vào danh sách yêu thích');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsProcessingFavorite(false);
    }
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setFullscreenVisible(true);
  };

  const closeFullscreen = () => {
    setFullscreenVisible(false);
  };

  const handleBookingPress = () => {
    // Kiểm tra đăng nhập trước khi mở modal booking
    if (!isLoggedIn) {
      Alert.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập để đặt phòng',
        [
          { text: 'Hủy', style: 'cancel' },
          { 
            text: 'Đăng nhập', 
            onPress: () => navigation.navigate('Auth/Login')
          }
        ]
      );
      return;
    }
    setBookingModalVisible(true);
  };

  const handleBookingSuccess = () => {
    Alert.alert(
      'Thành công! 🎉',
      'Bạn có thể xem lịch sử booking trong mục "Rental History"',
      [
        { text: 'OK' }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  if (error || !room) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorTitle}>Không tìm thấy phòng</Text>
        <Text style={styles.errorText}>{error || 'Phòng này không tồn tại hoặc đã bị xóa'}</Text>
        {onClose && (
          <TouchableOpacity style={styles.backButton} onPress={onClose}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const images = room.images || [];
  const fullAddress = `${room.address.street}, ${room.address.ward.name}, ${room.address.ward.district.name}, ${room.address.ward.district.province.name}`;

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      {/* Modern Image Gallery */}
      <View style={styles.imageSection}>
        {images.length > 0 ? (
          <>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {images.map((image, index) => {
                const mediaUrl = `${URL_IMAGE}${image.url.startsWith('/') ? image.url.slice(1) : image.url}`;
                const isVideo = isVideoUrl(image.url);
                
                return (
                  <TouchableOpacity 
                    key={index} 
                    activeOpacity={0.9}
                    onPress={() => openFullscreen(index)}
                  >
                    {isVideo ? (
                      <Video
                        source={{ uri: mediaUrl }}
                        style={styles.image}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={index === currentImageIndex}
                        isLooping
                        isMuted
                      />
                    ) : (
                      <Image
                        source={{ uri: mediaUrl }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    )}
                    
                    {/* Video Play Icon Overlay */}
                    {isVideo && (
                      <View style={styles.videoOverlay}>
                        <View style={styles.playIconContainer}>
                          <Ionicons name="play-circle" size={64} color="rgba(255, 255, 255, 0.9)" />
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            
            {/* Gradient Overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={styles.imageOverlay}
            />

            {/* Top Action Buttons */}
            <View style={styles.imageTopActions}>
              <TouchableOpacity 
                style={[
                  styles.actionButton,
                  isFavorite && styles.actionButtonFavorite
                ]} 
                onPress={handleFavorite}
                disabled={isProcessingFavorite}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? "#EF4444" : "#FFFFFF"} 
                />
                {favoriteCount > 0 && (
                  <View style={styles.favoriteCountBadge}>
                    <Text style={styles.favoriteCountText}>
                      {favoriteCount > 99 ? '99+' : favoriteCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* VIP Badge on Image */}
            {room.typepost?.toLowerCase() === 'vip' && (
              <Animated.View entering={ZoomIn.duration(500).delay(200)} style={styles.vipBadgeOnImage}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.vipBadgeGradient}
                >
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                  <Text style={styles.vipBadgeText}>VIP</Text>
                </LinearGradient>
              </Animated.View>
            )}
            
            {/* Image Pagination */}
            <View style={styles.paginationContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentImageIndex && styles.paginationDotActive,
                  ]}
                />
              ))}
            </View>

            {/* Image Counter */}
            <View style={styles.imageCounter}>
              <Ionicons name="images" size={16} color="#FFFFFF" />
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1}/{images.length}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.noImageContainer}>
            <Ionicons name="image-outline" size={80} color="#D1D5DB" />
            <Text style={styles.noImageText}>Không có hình ảnh</Text>
          </View>
        )}
      </View>

      {/* Fullscreen Image/Video Modal */}
      <Modal
        visible={fullscreenVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeFullscreen}
        statusBarTranslucent
      >
        <View style={styles.fullscreenModal}>
          <StatusBar hidden />
          
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.fullscreenCloseButton}
            onPress={closeFullscreen}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Media Counter */}
          <View style={styles.fullscreenCounter}>
            <Text style={styles.fullscreenCounterText}>
              {fullscreenIndex + 1} / {images.length}
            </Text>
          </View>

          {/* Scrollable Media */}
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setFullscreenIndex(index);
            }}
            scrollEventThrottle={16}
            contentOffset={{ x: fullscreenIndex * SCREEN_WIDTH, y: 0 }}
          >
            {images.map((image, index) => {
              const mediaUrl = `${URL_IMAGE}${image.url.startsWith('/') ? image.url.slice(1) : image.url}`;
              const isVideo = isVideoUrl(image.url);
              
              return (
                <View key={index} style={styles.fullscreenMediaContainer}>
                  {isVideo ? (
                    <Video
                      source={{ uri: mediaUrl }}
                      style={styles.fullscreenMedia}
                      resizeMode={ResizeMode.CONTAIN}
                      shouldPlay={index === fullscreenIndex}
                      isLooping
                      useNativeControls
                    />
                  ) : (
                    <Image
                      source={{ uri: mediaUrl }}
                      style={styles.fullscreenMedia}
                      resizeMode="contain"
                    />
                  )}
                </View>
              );
            })}
          </ScrollView>

          {/* Navigation Arrows */}
          {fullscreenIndex > 0 && (
            <TouchableOpacity 
              style={styles.fullscreenNavLeft}
              onPress={() => setFullscreenIndex(prev => Math.max(0, prev - 1))}
            >
              <Ionicons name="chevron-back" size={40} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          {fullscreenIndex < images.length - 1 && (
            <TouchableOpacity 
              style={styles.fullscreenNavRight}
              onPress={() => setFullscreenIndex(prev => Math.min(images.length - 1, prev + 1))}
            >
              <Ionicons name="chevron-forward" size={40} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {/* Price Card - Floating */}
      <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.priceCard}>
        <View style={styles.priceCardContent}>
          <View>
            <Text style={styles.priceCardLabel}>Giá thuê</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>{formatVNDPrice(room.priceMonth)}</Text>
              <Text style={styles.priceUnit}>VNĐ/tháng</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <LinearGradient
              colors={Colors.gradients.blue}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactButtonGradient}
            >
              <Ionicons name="call" size={20} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Liên hệ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Title & Basic Info */}
      <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.titleSection}>
        <Text style={styles.roomTitle}>{room.title || 'Phòng trọ cho thuê'}</Text>
        
        <TouchableOpacity style={styles.addressContainer} onPress={openMap}>
          <Ionicons name="location" size={18} color={Colors.error} />
          <Text style={styles.addressText} numberOfLines={2}>
            {fullAddress}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.statText}>{getRelativeTime(room.postStartDate)}</Text>
          </View>
        </View>
      </Animated.View>

      {/* Room Specifications */}
      <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionIconBg}
          >
            <MaterialCommunityIcons name="home-outline" size={22} color={Colors.textWhite} />
          </LinearGradient>
          <Text style={styles.sectionTitle}>Thông số phòng</Text>
        </View>

        <View style={styles.specsGrid}>
          <SpecCard
            icon={<MaterialCommunityIcons name="ruler-square" size={28} color="#667eea" />}
            value={`${room.area} m²`}
            label="Diện tích"
            color="#667eea"
            delay={100}
          />
          <SpecCard
            icon={<MaterialCommunityIcons name="arrow-expand-horizontal" size={28} color="#10B981" />}
            value={`${room.roomLength} m`}
            label="Chiều dài"
            color="#10B981"
            delay={150}
          />
          <SpecCard
            icon={<MaterialCommunityIcons name="arrow-expand-vertical" size={28} color="#8B5CF6" />}
            value={`${room.roomWidth} m`}
            label="Chiều rộng"
            color="#8B5CF6"
            delay={200}
          />
          <SpecCard
            icon={<Ionicons name="people-outline" size={28} color="#F59E0B" />}
            value={`${room.maxPeople}`}
            label="Số người"
            color="#F59E0B"
            delay={250}
          />
          <SpecCard
            icon={<MaterialCommunityIcons name="lightning-bolt" size={28} color="#EAB308" />}
            value={formatVNDPrice(room.elecPrice)}
            label="Điện/kWh"
            color="#EAB308"
            delay={300}
          />
          <SpecCard
            icon={<Ionicons name="water-outline" size={28} color="#06B6D4" />}
            value={formatVNDPrice(room.waterPrice)}
            label="Nước/m³"
            color="#06B6D4"
            delay={350}
          />
        </View>
      </Animated.View>

      {/* Address Section */}
      <Animated.View entering={FadeInDown.duration(600).delay(500)} style={styles.section}>
        <View style={styles.sectionHeader}>
          <LinearGradient
            colors={['#f093fb', '#f5576c']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sectionIconBg}
          >
            <Ionicons name="location-outline" size={22} color={Colors.textWhite} />
          </LinearGradient>
          <Text style={styles.sectionTitle}>Địa chỉ chi tiết</Text>
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Tỉnh/Thành phố:</Text>
            <Text style={styles.addressValue}>{room.address.ward.district.province.name}</Text>
          </View>
          
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Quận/Huyện:</Text>
            <Text style={styles.addressValue}>{room.address.ward.district.name}</Text>
          </View>
          
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Phường/Xã:</Text>
            <Text style={styles.addressValue}>{room.address.ward.name}</Text>
          </View>
          
          <View style={styles.addressRow}>
            <Text style={styles.addressLabel}>Đường:</Text>
            <Text style={styles.addressValue}>{room.address.street}</Text>
          </View>

          <TouchableOpacity style={styles.mapButton} onPress={openMap}>
            <LinearGradient
              colors={['#f093fb', '#f5576c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.mapButtonGradient}
            >
              <Ionicons name="map-outline" size={20} color="white" />
              <Text style={styles.mapButtonText}>Xem trên bản đồ</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {/* Landlord Information - Compact Version */}
        <View style={{ marginTop: 16 }}>
          <UserInfoCard 
            roomId={roomId} 
            onChatPress={handleChatPress}
            compact={true}
          />
        </View>
      </Animated.View>

      {/* Posted Date Section */}
      <View style={styles.section}>
        <View style={styles.dateCard}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={20} color="#10B981" />
            <Text style={styles.dateLabel}>Ngày đăng:</Text>
            <Text style={styles.dateValue}>{formatDate(room.postStartDate)}</Text>
            <View style={styles.relativeTimeBadge}>
              <Text style={styles.relativeTimeText}>{getRelativeTime(room.postStartDate)}</Text>
            </View>
          </View>
          
          <View style={styles.dateRow}>
            <Ionicons name="time-outline" size={20} color="#EF4444" />
            <Text style={styles.dateLabel}>Hết hạn:</Text>
            <Text style={styles.dateValue}>{formatDate(room.postEndDate)}</Text>
          </View>
        </View>
      </View>

      {/* Deposit Info */}
      <View style={styles.section}>
        <View style={styles.depositCard}>
          <MaterialCommunityIcons name="cash-multiple" size={28} color="#8B5CF6" />
          <View style={styles.depositContent}>
            <Text style={styles.depositLabel}>Tiền cọc yêu cầu</Text>
            <Text style={styles.depositValue}>{formatVNDPrice(room.priceDeposit)} VNĐ</Text>
          </View>
        </View>
      </View>

      {/* Description Section */}
      {room.description && (
        <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#fa709a', '#fee140']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIconBg}
            >
              <Ionicons name="document-text-outline" size={22} color={Colors.textWhite} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Mô tả</Text>
          </View>

          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>
              {room.description}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Conveniences Section */}
      {room.convenients && room.convenients.length > 0 && (
        <Animated.View entering={FadeInDown.duration(600).delay(450)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#43e97b', '#38f9d7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sectionIconBg}
            >
              <MaterialCommunityIcons name="checkbox-marked-circle-outline" size={22} color={Colors.textWhite} />
            </LinearGradient>
            <Text style={styles.sectionTitle}>Tiện nghi</Text>
          </View>

          <View style={styles.convenientsGrid}>
            {room.convenients.map((convenient, index) => (
              <FeatureItem
                key={convenient.id}
                text={convenient.name}
                delay={index * 50}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* Bottom Padding */}
      <View style={styles.bottomPadding} />

      {/* Floating Booking Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingBookingButton}
          onPress={handleBookingPress}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1976D2', '#1565C0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookingButtonGradient}
          >
            <Ionicons name="calendar" size={24} color="#FFF" />
            <View style={styles.bookingButtonTextContainer}>
              <Text style={styles.bookingButtonText}>Đặt phòng ngay</Text>
              <Text style={styles.bookingButtonSubtext}>
                {formatVNDPrice(room.priceMonth)} ₫/tháng
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Booking Modal */}
      {room && (
        <BookingModal
          visible={bookingModalVisible}
          roomId={roomId}
          roomTitle={room.title}
          priceMonth={room.priceMonth}
          maxPeople={room.maxPeople}
          onClose={() => setBookingModalVisible(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </ScrollView>
  );
}
