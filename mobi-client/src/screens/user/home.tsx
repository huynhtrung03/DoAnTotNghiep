// screens/home/home.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Image,
  FlatList, // Sử dụng FlatList thay cho ScrollView
  RefreshControl,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withRepeat,
  withTiming,
  Easing,
  FadeIn,
  SlideInUp,
  SlideInLeft,
} from 'react-native-reanimated';

// THAY ĐỔI 1: Import thư viện LinearGradient
import { LinearGradient } from 'expo-linear-gradient';

// Import các component và service cần thiết
import { RoomInUser, PaginatedResponse } from '../../types/types'; // Đảm bảo đường dẫn đúng
import { getRoomNormalUser, getRoomVipUser } from '../../services/RoomService'; // Đảm bảo đường dẫn đúng
import RoomCard from '../../components/rooms/RoomCard'; // Đảm bảo đường dẫn đúng
const AppLogo = require('../../../assets/images/logo-ant.png'); // Sử dụng logo webp mới

const { width } = Dimensions.get('window');

// --- Các Component phụ với Animation ---
const FloatingActionButton = ({ onPress, icon }: { onPress: () => void; icon: string }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View style={[styles.floatingButton, animatedStyle]}>
        <Text style={styles.floatingButtonIcon}>{icon}</Text>
      </Animated.View>
    </Pressable>
  );
};

const SectionHeader = ({ title, subtitle, onViewAll }: { title: string; subtitle?: string; onViewAll?: () => void }) => (
  <Animated.View entering={SlideInUp.duration(600).delay(200)} style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll}>
        <Text style={styles.viewAllText}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </Animated.View>
);

const AnimatedSpinner = () => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateZ: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1 // Lặp vô hạn
    );
  }, []);

  return (
    <Animated.View style={animatedStyle}>
      <ActivityIndicator size="large" color="#3B82F6" />
    </Animated.View>
  );
};

// --- Màn hình chính ---
export default function UserHomeScreen() {
  const navigation = useNavigation<any>();

  // --- Logic và State được chuyển từ RoomsList (index.tsx) ---
  const [listData, setListData] = useState<any[]>([]);
  const [vipRooms, setVipRooms] = useState<PaginatedResponse<RoomInUser> | null>(null);
  const [normalRooms, setNormalRooms] = useState<PaginatedResponse<RoomInUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vipPage, setVipPage] = useState(0);
  const [normalPage, setNormalPage] = useState(0);

  // Hàm tải dữ liệu
  const loadRooms = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      if (isRefresh) {
        setVipPage(0);
        setNormalPage(0);
      }
      const vipResponse = await getRoomVipUser(0, 5); // Tải 5 phòng VIP
      const normalResponse = await getRoomNormalUser(0, 6); // Tải 6 phòng thường

      setVipRooms(vipResponse);
      setNormalRooms(normalResponse);

    } catch (error) {
      console.error('Error loading rooms:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Tải thêm phòng thường (infinite scroll)
  const loadMoreNormalRooms = async () => {
    if (!normalRooms || normalPage + 1 >= normalRooms.totalPages || loading) return;
    
    try {
      const nextPage = normalPage + 1;
      const response = await getRoomNormalUser(nextPage, 6);
      
      setNormalRooms(prev => prev ? {
        ...response,
        data: [...prev.data, ...response.data]
      } : response);
      setNormalPage(nextPage);
    } catch (error) {
      console.error('Error loading more normal rooms:', error);
    }
  };
  
  // Chạy lần đầu
  useEffect(() => {
    loadRooms();
  }, []);

  // Xây dựng lại mảng dữ liệu cho FlatList mỗi khi vipRooms hoặc normalRooms thay đổi
  useEffect(() => {
    const data: any[] = [];
    if (vipRooms && vipRooms.data.length > 0) {
      data.push({ type: 'VIP_HEADER' });
      data.push({ type: 'VIP_LIST', rooms: vipRooms.data });
    }
    if (normalRooms && normalRooms.data.length > 0) {
      data.push({ type: 'NORMAL_HEADER' });
      // Thêm từng phòng thường vào mảng
      normalRooms.data.forEach(room => data.push({ type: 'NORMAL_ROOM', room }));
    }
    setListData(data);
  }, [vipRooms, normalRooms]);

  const onRefresh = useCallback(() => {
    loadRooms(true);
  }, []);

  // --- Hàm render cho FlatList ---
  const renderItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'VIP_HEADER':
        return (
          <SectionHeader
            title="🌟 Phòng VIP Dành Cho Bạn"
            subtitle="Những lựa chọn cao cấp, đầy đủ tiện nghi"
          />
        );
      case 'VIP_LIST':
        return (
          <Animated.View entering={SlideInLeft.duration(800).delay(400)}>
            <FlatList
              data={item.rooms}
              renderItem={({ item: roomItem }: { item: RoomInUser }) => (
                <Animated.View 
                  entering={FadeIn.duration(600).delay(600)}
                  style={{ width: width * 0.8 }}
                >
                  <RoomCard room={roomItem} />
                </Animated.View>
              )}
              keyExtractor={(room) => `vip-${room.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            />
          </Animated.View>
        );
      case 'NORMAL_HEADER':
        return (
          <SectionHeader
            title="🏠 Khám Phá Thêm"
            subtitle="Các phòng trọ phổ biến khác"
          />
        );
      case 'NORMAL_ROOM':
        return (
          <Animated.View entering={SlideInUp.duration(600)}>
            <RoomCard room={item.room} />
          </Animated.View>
        );
      default:
        return null;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View entering={FadeIn.duration(600)}>
          <AnimatedSpinner />
        </Animated.View>
      </View>
    );
  }

  // --- Các hàm xử lý sự kiện ---
  const handleCompare = () => Alert.alert("So sánh", "Tính năng sắp ra mắt!");
  const handleChatbot = () => Alert.alert("AI Assistant", "Tính năng sắp ra mắt!");
  const handleNotifications = () => Alert.alert("Thông báo", "Tính năng sắp ra mắt!");
  const handleUserProfile = () => Alert.alert("Hồ sơ", "Tính năng sắp ra mắt!");

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* THAY ĐỔI 2: Đổi barStyle thành 'dark' để phù hợp với nền sáng */}
      <StatusBar barStyle="dark-content" />
      
      {/* THAY ĐỔI 3: Thay thế Animated.View bằng LinearGradient */}
      <LinearGradient
        colors={['#FFDDE1', '#FFE9EC', '#FFFFFF']} // Màu hồng nhạt -> hồng rất nhạt -> trắng
        start={{ x: 0.5, y: 0 }} // Bắt đầu từ đỉnh
        end={{ x: 0.5, y: 1 }}   // Kết thúc ở đáy
        style={styles.header}
      >
        <Animated.View entering={FadeIn.duration(800).delay(100)} style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image 
                source={AppLogo} 
                style={styles.logo} 
                // THAY ĐỔI 4: Đổi màu logo thành màu tối để nổi bật trên nền sáng
                tintColor="#D94C7E" 
              />
            </View>
            <View style={styles.brandText}>
              <Text style={styles.brandTitle}>Ants Room</Text>
              <Text style={styles.brandSubtitle}>Tìm phòng trọ tốt nhất</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleNotifications} style={styles.notificationButton}>
              {/* THAY ĐỔI 5: Đổi màu icon thành màu tối */}
              <Ionicons name="notifications-outline" size={24} color="#333333" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleUserProfile} style={styles.profileButton}>
              <Ionicons name="person-circle-outline" size={28} color="#333333" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Main Content using a single FlatList */}
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.type + index}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Không có phòng nào</Text>
            <Text style={styles.emptySubtitle}>Vui lòng thử lại sau.</Text>
          </View>
        }
        onEndReached={loadMoreNormalRooms}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#FF9A9E"]} />
        }
      />

      {/* Floating Action Buttons */}
      <Animated.View 
        entering={SlideInUp.duration(800).delay(1000)}
        style={styles.floatingActionsContainer}
      >
        <FloatingActionButton onPress={handleCompare} icon="⚖️" />
        <FloatingActionButton onPress={handleChatbot} icon="🤖" />
      </Animated.View>
    </SafeAreaView>
  );
}

// --- Stylesheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
    // Bỏ backgroundColor để LinearGradient có tác dụng
    // Thêm bo góc dưới để tạo sự mềm mại
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoWrapper: {
    // Bỏ nền để trông tự nhiên hơn
  },
  logo: {
    width: 40,
    height: 40,
  },
  brandText: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333', // Màu chữ tối
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#6B7280', // Màu chữ tối
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    position: 'relative',
    marginRight: 16,
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#D94C7E', // Màu hồng đậm hơn cho badge
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFDDE1', // Viền badge cùng tông màu nền
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  viewAllText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  floatingActionsContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  floatingButton: {
    backgroundColor: 'white',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  floatingButtonIcon: {
    fontSize: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
});