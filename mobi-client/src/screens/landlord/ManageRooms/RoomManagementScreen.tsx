import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TextInput,
  Image,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getRoomsByLandlord,
  hideShowRoom,
  updateRoomPostExtend,
} from '../../../services/RoomService';
import { getPostTypes } from '../../../services/TypePostService';
import { getProfileById } from '../../../services/ProfileService';
import { URL_IMAGE } from '../../../services/Constant';
import { Colors } from '../../../colors/colors';
import type { TypePost, PaginatedResponse } from '../../../types/types';
import { styles } from './RoomManagementScreen.style';
import EditPostModal from './EditPostModal';

/**
 * ============================================
 * INTERFACES
 * ============================================
 */
interface RoomResponse {
  rooms: any[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

type FilterType = 'all' | 'available' | 'rented';

/**
 * ============================================
 * ROOM CARD COMPONENT - REDESIGNED
 * ============================================
 */
interface RoomCardProps {
  data: any;
  onEdit: (id: string) => void;
  onInfo: (id: string) => void;
  onExtend: (id: string) => void;
  onToggleHide: (record: any) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  data,
  onEdit,
  onInfo,
  onExtend,
  onToggleHide,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  
  const now = new Date();
  const end = new Date(data.postEndDate);
  const start = new Date(data.postStartDate);
  const isStillValid = start <= now && now <= end;
  const isRemoved = data.isRemoved === 1;
  const isReject = data.approval === 2;
  const isExpired = now > end;

  // Approval status color (for dot badge)
  const getApprovalColor = () => {
    if (data.approval === 0) return '#faad14'; // Pending
    if (data.approval === 1) return '#52c41a'; // Approved
    return '#ff4d4f'; // Rejected
  };

  const getAvailableColor = () =>
    data.available === 1 ? '#1890ff' : '#52c41a'; // Blue if rented, Green if available

  const getAvailableText = () => (data.available === 1 ? 'Đã thuê' : 'Còn trống');

  const formatAddress = (address: any) => {
    if (!address) return '-';
    // Short format: District, Province
    const district = address.ward?.district?.name;
    const province = address.ward?.district?.province?.name;
    return [district, province].filter(Boolean).join(', ');
  };

  const formatDate = (date: string | Date) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const calculateArea = () => {
    if (data.roomLength && data.roomWidth) {
      return `${(data.roomLength * data.roomWidth).toFixed(1)}m²`;
    }
    return null;
  };

  // Get first image or placeholder
  // NOTE: Now using v2 API endpoint which includes images!
  // Backend: /v2/by-landlord/${landlordId}/paging returns images array
  // Images are Cloudinary URLs (relative paths) that need to be combined with URL_IMAGE
  const getImageUri = () => {
    let imageUrl = null;

    // Case 1: images array with objects
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      const firstImage = data.images[0];
      // Check if it's an object with url property
      if (typeof firstImage === 'object' && firstImage.url) {
        imageUrl = firstImage.url;
      }
      // Check if it's a direct string
      else if (typeof firstImage === 'string') {
        imageUrl = firstImage;
      }
    }
    
    // Case 2: single image object
    if (!imageUrl && data.image && typeof data.image === 'object' && data.image.url) {
      imageUrl = data.image.url;
    }
    
    // Case 3: direct imageUrl string
    if (!imageUrl && data.imageUrl && typeof data.imageUrl === 'string') {
      imageUrl = data.imageUrl;
    }
    
    // Case 4: thumbnail
    if (!imageUrl && data.thumbnail && typeof data.thumbnail === 'string') {
      imageUrl = data.thumbnail;
    }

    // If we have an image URL, check if it's relative or absolute
    if (imageUrl) {
      // If it's a relative path (starts with /), prepend URL_IMAGE
      if (imageUrl.startsWith('/')) {
        // Remove leading slash to avoid double slash (URL_IMAGE already ends with /)
        const cleanPath = imageUrl.substring(1);
        const fullUrl = `${URL_IMAGE}${cleanPath}`;
        console.log('🖼️ [getImageUri] Relative path detected, full URL:', fullUrl);
        return fullUrl;
      }
      // If it's already a full URL (starts with http:// or https://), return as is
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        console.log('🖼️ [getImageUri] Absolute URL detected:', imageUrl);
        return imageUrl;
      }
      // Otherwise, assume it's a Cloudinary path and prepend URL_IMAGE
      const fullUrl = `${URL_IMAGE}${imageUrl}`;
      console.log('🖼️ [getImageUri] Cloudinary path, full URL:', fullUrl);
      return fullUrl;
    }
    
    // No image found - will show placeholder
    return null;
  };

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {menuVisible && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999,
          }}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}

      <View style={styles.card}>
        {/* Thumbnail */}
        <View style={styles.cardImage}>
          {getImageUri() ? (
            <Image
              source={{ uri: getImageUri() }}
              style={{ width: '100%', height: '100%', borderRadius: 6 }}
              resizeMode="cover"
            />
          ) : (
            <View style={{ 
              flex: 1, 
              justifyContent: 'center', 
              alignItems: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: 6,
            }}>
              <Ionicons name="home-outline" size={32} color="#bfbfbf" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Title + Approval Dot */}
          <View style={styles.cardHeader}>
            <Text style={styles.roomTitle} numberOfLines={2}>
              {data.title}
            </Text>
            <View style={[styles.approvalBadge, { backgroundColor: getApprovalColor() }]} />
          </View>

          {/* Price + Area */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(data.priceMonth)}</Text>
            {calculateArea() && (
              <>
                <Text style={styles.areaDivider}>•</Text>
                <Text style={styles.area}>{calculateArea()}</Text>
              </>
            )}
          </View>

          {/* Address */}
          <Text style={styles.address} numberOfLines={1}>
            {formatAddress(data.address)}
          </Text>

          {/* Status & End Date */}
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: getAvailableColor() }]}>
              <Text style={styles.statusBadgeText}>{getAvailableText()}</Text>
            </View>
            <Text style={[styles.endDate, isExpired && styles.expiredText]}>
              {isExpired ? 'Hết hạn' : formatDate(data.postEndDate)}
            </Text>
          </View>

          {/* Extend Button for Expired */}
          {isExpired && !isRemoved && !isReject && (
            <TouchableOpacity
              style={styles.extendButton}
              onPress={() => onExtend(data.id)}
              activeOpacity={0.7}
            >
              <AntDesign name="reload" size={14} color="white" />
              <Text style={styles.extendButtonText}>Gia hạn ngay</Text>
            </TouchableOpacity>
          )}

          {/* Warning for Removed/Rejected */}
          {isRemoved && (
            <View style={[styles.statusBadge, { backgroundColor: '#ff4d4f', marginTop: 8 }]}>
              <Text style={styles.statusBadgeText}>Đã xóa bởi admin</Text>
            </View>
          )}
          {isReject && (
            <View style={[styles.statusBadge, { backgroundColor: '#faad14', marginTop: 8 }]}>
              <Text style={styles.statusBadgeText}>Bị từ chối</Text>
            </View>
          )}
        </View>

        {/* Three-dot Menu Button (only for valid/non-removed rooms) */}
        {!isRemoved && !isReject && (
          <View>
            <TouchableOpacity
              style={styles.cardMenu}
              onPress={() => setMenuVisible(!menuVisible)}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={20} color="#8c8c8c" />
            </TouchableOpacity>

            {/* Menu Dropdown - positioned relative to card */}
            {menuVisible && (
              <View style={styles.menuOverlay}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    onInfo(data.id);
                  }}
                  activeOpacity={0.7}
                >
                  <AntDesign name="eye" size={16} color="#262626" />
                  <Text style={styles.menuItemText}>Xem chi tiết</Text>
                </TouchableOpacity>

                {isStillValid && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onEdit(data.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <AntDesign name="edit" size={16} color="#262626" />
                    <Text style={styles.menuItemText}>Sửa</Text>
                  </TouchableOpacity>
                )}

                {isStillValid && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onToggleHide(data);
                    }}
                    activeOpacity={0.7}
                  >
                    <AntDesign
                      name={data.hidden === 1 ? 'eye' : 'eye-invisible'}
                      size={16}
                      color="#262626"
                    />
                    <Text style={styles.menuItemText}>
                      {data.hidden === 1 ? 'Hiện' : 'Ẩn'}
                    </Text>
                  </TouchableOpacity>
                )}

                {!isExpired && isStillValid && (
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      setMenuVisible(false);
                      onExtend(data.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <AntDesign name="clock-circle" size={16} color="#262626" />
                    <Text style={styles.menuItemText}>Gia hạn</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );
};

/**
 * ============================================
 * EXTEND POST BOTTOM SHEET COMPONENT
 * ============================================
 */
interface ExtendBottomSheetProps {
  visible: boolean;
  roomData: any;
  onClose: () => void;
  onConfirm: (postStartDate: string, postEndDate: string, typePostId: string) => Promise<void>;
  typePosts: TypePost[];
  loading?: boolean;
}

const ExtendBottomSheet: React.FC<ExtendBottomSheetProps> = ({
  visible,
  roomData,
  onClose,
  onConfirm,
  typePosts,
  loading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date && date >= minDate) {
      setSelectedDate(date);
    }
  };

  const selectedType = typePosts.find((tp) => tp.id === selectedTypeId);

  const calculateFee = () => {
    if (!selectedDate || !selectedType) return { days: 0, fee: 0 };
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(selectedDate);
    end.setHours(0, 0, 0, 0);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { days, fee: days * selectedType.pricePerDay };
  };

  const { days, fee } = calculateFee();

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTypeId) return;
    const postStartDate = new Date().toISOString();
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59);
    const postEndDate = endDate.toISOString();
    await onConfirm(postStartDate, postEndDate, selectedTypeId);
    setSelectedDate(null);
    setSelectedTypeId(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTypeId(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              Gia hạn bài đăng cho "{roomData?.title}"
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
            >
              <AntDesign name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Picker */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Chọn ngày kết thúc mới</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <AntDesign name="calendar" size={20} color="#1890ff" />
                <Text style={styles.dateInputText}>
                  {selectedDate
                    ? selectedDate.toLocaleDateString('vi-VN')
                    : 'Chọn ngày...'}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || minDate}
                  mode="date"
                  display="spinner"
                  minimumDate={minDate}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Post Type Selection */}
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Chọn loại bài đăng</Text>
              {typePosts.map((typepost) => (
                <TouchableOpacity
                  key={typepost.id}
                  style={[
                    styles.typePostOption,
                    selectedTypeId === typepost.id && styles.typePostOptionSelected,
                  ]}
                  onPress={() => setSelectedTypeId(typepost.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.radioCircle}>
                    {selectedTypeId === typepost.id && (
                      <View style={styles.radioFilled} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.typePostName}>{typepost.name}</Text>
                    <Text style={styles.typePostPrice}>
                      {typepost.pricePerDay.toLocaleString('vi-VN')} ₫/ngày
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Summary */}
            {days > 0 && (
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Số ngày gia hạn:</Text>
                  <Text style={styles.summaryValue}>{days} ngày</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tổng phí:</Text>
                  <Text style={styles.summaryValue}>
                    {fee.toLocaleString('vi-VN')} ₫
                  </Text>
                </View>
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedDate || !selectedTypeId || loading) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!selectedDate || !selectedTypeId || loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>
                  Thanh toán & Gia hạn
                </Text>
              )}
            </TouchableOpacity>

            {/* Spacer */}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

/**
 * ============================================
 * MAIN ROOM MANAGEMENT SCREEN
 * ============================================
 */
export default function RoomManagementScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Data State
  const [rooms, setRooms] = useState<any[]>([]);
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [typePosts, setTypePosts] = useState<TypePost[]>([]);

  // Extend State
  const [extendVisible, setExtendVisible] = useState(false);
  const [selectedRoomForExtend, setSelectedRoomForExtend] = useState<any>(null);
  const [extendLoading, setExtendLoading] = useState(false);

  // Edit State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEditRoomId, setSelectedEditRoomId] = useState<string | null>(null);

  // Message State
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Fetch rooms
  const fetchRooms = async (page = 1, append = false) => {
    try {
      console.log(`\n📦 [fetchRooms] Starting fetch - page=${page}, append=${append}, landlordId=${landlordId}`);
      
      // Nếu không có landlordId, không thể lấy phòng
      if (!landlordId) {
        console.warn('⚠️ [fetchRooms] Missing landlordId');
        showMessage('Không thể xác định chủ nhà. Vui lòng đăng nhập lại.', 'error');
        return;
      }

      const pageSize = pagination.pageSize;
      console.log(`📡 [fetchRooms] Calling getRoomsByLandlord(${page}, ${pageSize}, ${landlordId})`);
      const res = (await getRoomsByLandlord(page, pageSize, landlordId)) as any;

      // Kiểm tra response có hợp lệ không
      if (!res) {
        console.error('❌ [fetchRooms] Empty response from API');
        throw new Error('Không thể lấy dữ liệu phòng');
      }

      // Xử lý dữ liệu từ response (có thể là RoomResponse hoặc PaginatedResponse)
      const newRooms = res.rooms || res.data || [];
      const newData = append ? [...rooms, ...newRooms] : newRooms;

      // Debug: Log first room to check structure
      if (newRooms.length > 0) {
        console.log('🔍 [fetchRooms] First room structure:', {
          id: newRooms[0].id,
          title: newRooms[0].title,
          hasImages: !!newRooms[0].images,
          imagesCount: newRooms[0].images?.length || 0,
          firstImage: newRooms[0].images?.[0],
          allKeys: Object.keys(newRooms[0]),
        });
      }

      console.log(`✅ [fetchRooms] Response received:`, {
        newRoomsCount: newRooms.length,
        totalRoomsCount: newData.length,
        pageNumber: res.pageNumber ?? res.page,
        pageSize: res.pageSize ?? res.size,
        totalRecords: res.totalRecords,
      });

      setRooms(newData);
      setPagination({
        current: (res.pageNumber ?? res.page) + 1 || 1,
        pageSize: res.pageSize ?? res.size ?? pageSize,
        total: res.totalRecords ?? 0,
      });

      console.log(`✅ [fetchRooms] State updated successfully\n`);
    } catch (error: any) {
      console.error('❌ [fetchRooms] Error:', error);
      showMessage(
        'Lỗi tải phòng: ' + (error.message || 'Có lỗi xảy ra'),
        'error'
      );
    }
  };

  // Fetch type posts
  const fetchTypePosts = async () => {
    try {
      console.log('📋 [fetchTypePosts] Starting fetch');
      const data = await getPostTypes();
      console.log(`✅ [fetchTypePosts] Fetched ${data?.length || 0} post types:`, data);
      setTypePosts(data || []);
    } catch (error: any) {
      console.error('❌ [fetchTypePosts] Error:', error?.message);
      console.warn('⚠️ [fetchTypePosts] Failed to fetch post types, using empty list');
      setTypePosts([]); // Fallback to empty array, don't block UI
    }
  };

  // Show message
  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessageText(text);
    setMessageType(type);
    setMessageVisible(true);
    setTimeout(() => setMessageVisible(false), 3000);
  };

  // Initial load - lấy landlordId từ AsyncStorage rồi fetch profile
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Lấy userId từ userData.id (dùng để fetch rooms)
        let userId: string | null = null;
        const userDataStr = await AsyncStorage.getItem('userData');
        
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            // Sử dụng userData.id (userId) để tìm kiếm room
            userId = userData.id;
            console.log('✅ [initData] Got userId from userData.id:', userId);
          } catch (e) {
            console.warn('⚠️ [initData] Failed to parse userData:', e);
          }
        } else {
          console.log('📦 [initData] userData not found in AsyncStorage');
        }

        // Fallback: Lấy từ userProfile nếu userData không có
        if (!userId) {
          const userProfileStr = await AsyncStorage.getItem('userProfile');
          if (userProfileStr) {
            try {
              const userProfile = JSON.parse(userProfileStr);
              userId = userProfile.id;
              console.log('✅ [initData] Got userId from userProfile.id:', userId);
            } catch (e) {
              console.warn('⚠️ [initData] Failed to parse userProfile:', e);
            }
          }
        }

        // Debug: Lấy toàn bộ AsyncStorage nếu vẫn không tìm thấy
        if (!userId) {
          console.warn('⚠️ [initData] userId still not found, checking all AsyncStorage keys');
          const allKeys = await AsyncStorage.getAllKeys();
          const allData = await AsyncStorage.multiGet(allKeys);
          console.log('📦 [initData] All AsyncStorage data:', allData);
        }

        if (!userId) {
          console.error('❌ [initData] No userId found in any storage method');
          showMessage('Không thể xác định người dùng. Vui lòng đăng nhập lại.', 'error');
          return;
        }

        console.log('✅ [initData] Retrieved userId successfully:', userId);
        
        // Set landlordId = userId để fetch rooms
        setLandlordId(userId);
        console.log('✅ [initData] Set landlordId:', userId);

        await fetchTypePosts();
      } catch (error: any) {
        console.error('❌ [initData] Error loading data:', error);
        showMessage(
          'Lỗi tải thông tin: ' + (error.message || 'Có lỗi xảy ra'),
          'error'
        );
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  // Fetch rooms khi landlordId thay đổi
  useEffect(() => {
    console.log(`🔄 [useEffect] landlordId changed:`, landlordId);
    if (landlordId) {
      console.log(`🔄 [useEffect] landlordId is valid, fetching rooms`);
      fetchRooms(1, false);
    } else {
      console.warn(`⚠️ [useEffect] landlordId is null/undefined`);
    }
  }, [landlordId]);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    console.log('🔄 [handleRefresh] User initiated refresh');
    setRefreshing(true);
    try {
      await fetchRooms(1, false);
      console.log('✅ [handleRefresh] Refresh completed');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load more (infinite scroll)
  const handleLoadMore = useCallback(async () => {
    console.log(`📥 [handleLoadMore] Check conditions:`, {
      loadingMore,
      roomsLength: rooms.length,
      totalRecords: pagination.total,
      shouldLoad: !loadingMore && rooms.length < pagination.total,
    });

    if (loadingMore || rooms.length >= pagination.total) {
      console.log('⏸️ [handleLoadMore] Skipping - already loading or no more data');
      return;
    }

    console.log(`📥 [handleLoadMore] Loading next page: ${pagination.current + 1}`);
    setLoadingMore(true);
    try {
      await fetchRooms(pagination.current + 1, true);
      console.log('✅ [handleLoadMore] Completed');
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, rooms.length, pagination.total, pagination.current, pagination.pageSize]);

  // Toggle hide/show
  const handleToggleHide = useCallback((record: any) => {
    console.log(`🔒 [handleToggleHide] Toggle room ${record.id}, current hidden state: ${record.hidden}`);
    Alert.alert(
      'Xác nhận',
      record.hidden === 1
        ? 'Bạn có muốn hiển thị bài đăng này lại không?'
        : 'Bạn có chắc muốn ẩn bài đăng này không?',
      [
        { text: 'Hủy', style: 'cancel', onPress: () => console.log('❌ [handleToggleHide] Cancelled') },
        {
          text: 'Đồng ý',
          onPress: async () => {
            try {
              const newState = record.hidden === 1 ? 0 : 1;
              console.log(`🔄 [handleToggleHide] Calling hideShowRoom(${record.id}, ${newState})`);
              await hideShowRoom(record.id, newState);
              showMessage(
                `Bài đăng đã ${record.hidden === 1 ? 'hiển thị' : 'ẩn'} thành công`
              );
              console.log(`✅ [handleToggleHide] Success, refreshing list`);
              await fetchRooms(pagination.current, false);
            } catch (error: any) {
              console.error('❌ [handleToggleHide] Error:', error);
              showMessage(error.message || 'Lỗi cập nhật', 'error');
            }
          },
        },
      ]
    );
  }, [pagination.current]);

  // Handle extend
  const handleExtendClick = useCallback((roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    setSelectedRoomForExtend(room);
    setExtendVisible(true);
  }, [rooms]);

  // Handle extend confirm
  const handleExtendConfirm = async (
    postStartDate: string,
    postEndDate: string,
    typePostId: string
  ) => {
    console.log(`📅 [handleExtendConfirm] Starting extend:`, {
      roomId: selectedRoomForExtend?.id,
      roomTitle: selectedRoomForExtend?.title,
      postStartDate,
      postEndDate,
      typePostId,
    });

    setExtendLoading(true);
    try {
      console.log(`📡 [handleExtendConfirm] Calling updateRoomPostExtend`);
      await updateRoomPostExtend(
        selectedRoomForExtend.id,
        postStartDate,
        postEndDate,
        typePostId
      );
      console.log(`✅ [handleExtendConfirm] Extend successful, refreshing list`);
      showMessage(
        `Gia hạn thành công cho "${selectedRoomForExtend.title}", chờ xét duyệt`
      );
      await fetchRooms(pagination.current, false);
    } catch (error: any) {
      console.error('❌ [handleExtendConfirm] Error:', error);
      showMessage(error.message || 'Lỗi gia hạn bài đăng', 'error');
    } finally {
      setExtendLoading(false);
    }
  };

  // Handle edit
  const handleEdit = useCallback((roomId: string) => {
    console.log('📝 [handleEdit] Opening edit modal for room:', roomId);
    setSelectedEditRoomId(roomId);
    setEditModalVisible(true);
  }, []);

  // Handle edit modal close
  const handleEditModalClose = useCallback(() => {
    console.log('❌ [handleEditModalClose] Closing edit modal');
    setEditModalVisible(false);
    setSelectedEditRoomId(null);
  }, []);

  // Handle edit modal success
  const handleEditModalSuccess = useCallback(() => {
    console.log('✅ [handleEditModalSuccess] Edit successful, refreshing rooms list');
    handleEditModalClose();
    showMessage('Bài đăng đã được cập nhật thành công');
    fetchRooms(pagination.current, false);
  }, [pagination.current]);

  // Handle info
  const handleInfo = useCallback((roomId: string) => {
    // Navigate to HistoryRoomDetail screen with room data
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      console.log('📱 [handleInfo] Navigating to HistoryRoomDetail:', roomId);
      // Note: Only pass roomId, not room data, to force fetch fresh data with images
      // from API in HistoryRoomDetail component
      navigation.navigate('HistoryRoomDetail', { roomId });
    } else {
      console.warn('⚠️ [handleInfo] Room not found:', roomId);
    }
  }, [rooms, navigation]);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filtered rooms based on search and filter
  const filteredRooms = rooms.filter((room) => {
    // Search filter
    const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    let matchesFilter = true;
    if (activeFilter === 'available') {
      matchesFilter = room.available === 0;
    } else if (activeFilter === 'rented') {
      matchesFilter = room.available === 1;
    }
    
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý phòng</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            console.log('📝 [handleAddRoom] Navigating to AddRoom screen');
            navigation.navigate('AddRoom');
          }}
          activeOpacity={0.7}
        >
          <AntDesign name="plus" size={24} color="#1890ff" />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchFilterContainer}>
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <AntDesign name="search" size={16} color="#8c8c8c" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm phòng..."
            placeholderTextColor="#8c8c8c"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'all' && styles.filterChipTextActive,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'available' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('available')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'available' && styles.filterChipTextActive,
              ]}
            >
              Còn trống
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'rented' && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter('rented')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'rented' && styles.filterChipTextActive,
              ]}
            >
              Đã thuê
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Room List */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1890ff" />
        </View>
      ) : filteredRooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <AntDesign name="inbox" size={48} color="#d9d9d9" />
          <Text style={styles.emptyText}>
            {searchQuery || activeFilter !== 'all'
              ? 'Không tìm thấy phòng nào'
              : 'Chưa có phòng nào'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomCard
              data={item}
              onEdit={handleEdit}
              onInfo={handleInfo}
              onExtend={handleExtendClick}
              onToggleHide={handleToggleHide}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1890ff"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.loadingMore}>
                <Text style={styles.loadingMoreText}>Đang tải thêm...</Text>
              </View>
            ) : null
          }
          scrollEventThrottle={16}
        />
      )}

      {/* Message Toast */}
      {messageVisible && (
        <View
          style={[
            styles.message,
            messageType === 'error' ? styles.messageError : styles.messageSuccess,
          ]}
        >
          <Text style={styles.messageText}>{messageText}</Text>
        </View>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        visible={editModalVisible}
        roomId={selectedEditRoomId}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
      />

      {/* Extend Bottom Sheet */}
      <ExtendBottomSheet
        visible={extendVisible}
        roomData={selectedRoomForExtend}
        onClose={() => setExtendVisible(false)}
        onConfirm={handleExtendConfirm}
        typePosts={typePosts}
        loading={extendLoading}
      />
    </View>
  );
}

