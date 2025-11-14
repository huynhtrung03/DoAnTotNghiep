/**
 * DashboardScreen Component
 *
 * Màn hình Dashboard cho chủ trọ
 * Hiển thị tổng quan về thống kê, công việc và thông báo
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Import Services
import {
  getLandlordPostedRoomCount,
  getLandlordRentedRoomCount,
  getLandlordViewedRoomCount,
  getLandlordFavoritedRoomCount,
  getLandlordRevenueStatistics,
  getLandlordMaintenanceStatistics,
} from '../../../services/LandLordStatisticsService';
import { LandlordTaskService } from '../../../services/LandlordTaskService';
import type { LandlordTaskResponseDto } from '../../../services/LandlordTaskService';

// Import Styles
import { styles } from './styles/DashboardScreen.style';
import Colors from '../../../styles/colors';

// ===== TYPES =====

interface DashboardStatistics {
  totalPostedRooms: number;
  totalRentedRooms: number;
  totalViews: number;
  totalFavorites: number;
  totalRevenue: number;
  totalMaintenanceCost: number;
  monthlyRevenue: number;
}

interface TaskStatistics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

interface StatCardData {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: [string, string, ...string[]];
  unit?: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [landlordName, setLandlordName] = useState<string>('Chủ trọ');
  const [landlordAvatar, setLandlordAvatar] = useState<string | null>(null);

  // Trạng thái thống kê
  const [statistics, setStatistics] = useState<DashboardStatistics>({
    totalPostedRooms: 0,
    totalRentedRooms: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalRevenue: 0,
    totalMaintenanceCost: 0,
    monthlyRevenue: 0,
  });

  // Trạng thái công việc
  const [taskStats, setTaskStats] = useState<TaskStatistics>({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });

  const [recentTasks, setRecentTasks] = useState<LandlordTaskResponseDto[]>([]);

  /**
   * Khởi tạo - Lấy thông tin landlord từ AsyncStorage
   */
  useEffect(() => {
    initializeLandlordData();
  }, []);

  /**
   * Tải lại dữ liệu khi màn hình được focus
   */
  useFocusEffect(
    useCallback(() => {
      if (landlordId) {
        fetchDashboardData();
      }
    }, [landlordId])
  );

  /**
   * Khởi tạo dữ liệu landlord
   */
  const initializeLandlordData = async () => {
    try {
      const userProfileString = await AsyncStorage.getItem('userProfile');
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        setLandlordId(userProfile.id);
        setLandlordName(userProfile.fullName || 'Chủ trọ');
        setLandlordAvatar(userProfile.avatar || null);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin tài khoản');
      }
    } catch (error) {
      console.error('❌ Error initializing landlord data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin tài khoản');
    }
  };

  /**
   * Tải toàn bộ dữ liệu dashboard
   */
  const fetchDashboardData = async () => {
    if (!landlordId) return;

    setLoading(true);
    try {
      await Promise.all([
        fetchStatisticsData(),
        fetchTasksData(),
      ]);
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tải dữ liệu thống kê
   */
  const fetchStatisticsData = async () => {
    try {
      // Lấy thống kê song song
      const [
        postedRooms,
        rentedRooms,
        viewedRooms,
        favoritedRooms,
        revenueStats,
        maintenanceStats,
      ] = await Promise.all([
        getLandlordPostedRoomCount(),
        getLandlordRentedRoomCount(),
        getLandlordViewedRoomCount(),
        getLandlordFavoritedRoomCount(),
        getLandlordRevenueStatistics(),
        getLandlordMaintenanceStatistics(),
      ]);

      // Tính doanh thu tháng hiện tại
      const currentMonth = new Date().getMonth();
      const monthlyRevenue = revenueStats.revenueByMonth?.find(
        (item) => new Date(item.month).getMonth() === currentMonth
      )?.revenue || 0;

      setStatistics({
        totalPostedRooms: postedRooms.count,
        totalRentedRooms: rentedRooms.count,
        totalViews: viewedRooms.count,
        totalFavorites: favoritedRooms.count,
        totalRevenue: revenueStats.totalRevenue,
        totalMaintenanceCost: maintenanceStats.totalCost,
        monthlyRevenue,
      });

      console.log('✅ Statistics data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      // Không hiển thị alert để không làm phiền người dùng
    }
  };

  /**
   * Tải dữ liệu công việc
   */
  const fetchTasksData = async () => {
    if (!landlordId) return;

    try {
      const tasks = await LandlordTaskService.getTasksByLandlord(landlordId);

      // Tính toán thống kê
      const now = new Date();
      const taskStatistics: TaskStatistics = {
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((task) => task.status === 'PENDING').length,
        inProgressTasks: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
        completedTasks: tasks.filter((task) => task.status === 'COMPLETED').length,
        overdueTasks: tasks.filter(
          (task) =>
            task.dueDate &&
            new Date(task.dueDate) < now &&
            task.status !== 'COMPLETED' &&
            task.status !== 'CANCELLED'
        ).length,
      };

      setTaskStats(taskStatistics);

      // Lấy 5 công việc gần nhất
      const sortedTasks = tasks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

      setRecentTasks(sortedTasks);

      console.log('✅ Tasks data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
    }
  };

  /**
   * Xử lý refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  /**
   * Lấy lời chào theo thời gian trong ngày
   */
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  /**
   * Format số với dấu phân cách
   */
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  /**
   * Format ngày giờ
   */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  /**
   * Lấy màu cho trạng thái công việc
   */
  const getTaskStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return Colors.warning;
      case 'IN_PROGRESS':
        return Colors.info;
      case 'COMPLETED':
        return Colors.success;
      case 'CANCELLED':
        return Colors.error;
      default:
        return Colors.textSecondary;
    }
  };

  /**
   * Lấy tên trạng thái công việc
   */
  const getTaskStatusLabel = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xử lý';
      case 'IN_PROGRESS':
        return 'Đang thực hiện';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  /**
   * Lấy màu cho độ ưu tiên công việc
   */
  const getTaskPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'LOW':
        return Colors.info;
      case 'MEDIUM':
        return Colors.warning;
      case 'HIGH':
        return Colors.error;
      case 'URGENT':
        return Colors.premium;
      default:
        return Colors.textSecondary;
    }
  };

  /**
   * Định nghĩa dữ liệu các thẻ thống kê
   */
  const statCards: StatCardData[] = [
    {
      title: 'Phòng đã đăng',
      value: statistics.totalPostedRooms,
      icon: 'home',
      gradientColors: Colors.gradients.blue,
      unit: 'phòng',
    },
    {
      title: 'Phòng đã thuê',
      value: statistics.totalRentedRooms,
      icon: 'checkmark-circle',
      gradientColors: Colors.gradients.green,
      unit: 'phòng',
    },
    {
      title: 'Lượt xem',
      value: statistics.totalViews,
      icon: 'eye',
      gradientColors: Colors.gradients.purple,
      unit: 'lượt',
    },
    {
      title: 'Yêu thích',
      value: statistics.totalFavorites,
      icon: 'heart',
      gradientColors: Colors.gradients.pink,
      unit: 'lượt',
    },
  ];

  /**
   * Render Header Dashboard
   */
  const renderHeader = () => (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark]}
      style={styles.headerContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        {/* Thông tin chủ trọ */}
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
            style={styles.avatarContainer}
          >
            {landlordAvatar ? (
              <Image source={{ uri: landlordAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={28} color={Colors.primary} />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.landlordName}>{landlordName}</Text>
          </View>
        </View>

        {/* Nút thông báo */}
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
        >
          <Ionicons name="notifications-outline" size={24} color={Colors.textWhite} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Ngày tháng */}
      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={16} color={Colors.textWhite} />
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>
    </LinearGradient>
  );

  /**
   * Render các thẻ thống kê
   */
  const renderStatisticsCards = () => (
    <View style={styles.statisticsContainer}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>Xem chi tiết</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Grid các thẻ thống kê */}
      <View style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={styles.statCard}
            activeOpacity={0.8}
            onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
          >
            <LinearGradient
              colors={card.gradientColors}
              style={styles.statCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Icon */}
              <View style={styles.statIconContainer}>
                <Ionicons name={card.icon} size={28} color={Colors.textWhite} />
              </View>

              {/* Giá trị */}
              <Text style={styles.statValue}>{formatNumber(card.value)}</Text>

              {/* Tiêu đề và đơn vị */}
              <View style={styles.statFooter}>
                <Text style={styles.statTitle} numberOfLines={1}>
                  {card.title}
                </Text>
                {card.unit && <Text style={styles.statUnit}>{card.unit}</Text>}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Thống kê doanh thu */}
      <View style={styles.revenueContainer}>
        <LinearGradient
          colors={Colors.gradients.sunset}
          style={styles.revenueCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.revenueHeader}>
            <Ionicons name="wallet" size={32} color={Colors.textWhite} />
            <Text style={styles.revenueTitle}>Doanh thu tháng này</Text>
          </View>

          <View style={styles.revenueContent}>
            <Text style={styles.revenueValue}>
              {formatNumber(statistics.monthlyRevenue)} đ
            </Text>
            <Text style={styles.revenueSubtext}>
              Tổng doanh thu: {formatNumber(statistics.totalRevenue)} đ
            </Text>
          </View>

          <View style={styles.revenueDivider} />

          <View style={styles.revenueFooter}>
            <View style={styles.revenueFooterItem}>
              <Text style={styles.revenueFooterLabel}>Chi phí bảo trì</Text>
              <Text style={styles.revenueFooterValue}>
                {formatNumber(statistics.totalMaintenanceCost)} đ
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );

  /**
   * Render các hành động nhanh
   */
  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Hành động nhanh</Text>

      <View style={styles.quickActionsGrid}>
        {/* Thêm phòng mới */}
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
        >
          <LinearGradient
            colors={Colors.gradients.blue}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="add-circle" size={32} color={Colors.textWhite} />
            <Text style={styles.quickActionText}>Đăng phòng</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý hợp đồng */}
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
        >
          <LinearGradient
            colors={Colors.gradients.green}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="document-text" size={32} color={Colors.textWhite} />
            <Text style={styles.quickActionText}>Hợp đồng</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quản lý công việc */}
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
        >
          <LinearGradient
            colors={Colors.gradients.purple}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="checkmark-done" size={32} color={Colors.textWhite} />
            <Text style={styles.quickActionText}>Công việc</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Xem thống kê */}
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
        >
          <LinearGradient
            colors={Colors.gradients.orange}
            style={styles.quickActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="bar-chart" size={32} color={Colors.textWhite} />
            <Text style={styles.quickActionText}>Thống kê</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Render tổng quan công việc
   */
  const renderTaskOverview = () => (
    <View style={styles.taskOverviewContainer}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Công việc</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>Xem tất cả</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Thống kê công việc */}
      <View style={styles.taskStatsRow}>
        <View style={styles.taskStatItem}>
          <Text style={styles.taskStatValue}>{taskStats.totalTasks}</Text>
          <Text style={styles.taskStatLabel}>Tổng số</Text>
        </View>
        <View style={styles.taskStatItem}>
          <Text style={[styles.taskStatValue, { color: Colors.warning }]}>
            {taskStats.pendingTasks}
          </Text>
          <Text style={styles.taskStatLabel}>Chờ xử lý</Text>
        </View>
        <View style={styles.taskStatItem}>
          <Text style={[styles.taskStatValue, { color: Colors.info }]}>
            {taskStats.inProgressTasks}
          </Text>
          <Text style={styles.taskStatLabel}>Đang làm</Text>
        </View>
        <View style={styles.taskStatItem}>
          <Text style={[styles.taskStatValue, { color: Colors.success }]}>
            {taskStats.completedTasks}
          </Text>
          <Text style={styles.taskStatLabel}>Hoàn thành</Text>
        </View>
      </View>

      {/* Danh sách công việc gần đây */}
      {recentTasks.length > 0 ? (
        <View style={styles.tasksList}>
          {recentTasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskItem}
              onPress={() =>
                Alert.alert('Thông báo', `Xem chi tiết công việc: ${task.title}`)
              }
            >
              <View style={styles.taskItemHeader}>
                <View style={styles.taskTitleContainer}>
                  <View
                    style={[
                      styles.taskStatusDot,
                      { backgroundColor: getTaskStatusColor(task.status) },
                    ]}
                  />
                  <Text style={styles.taskItemTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                </View>
                <View
                  style={[
                    styles.taskPriorityBadge,
                    { backgroundColor: getTaskPriorityColor(task.priority) },
                  ]}
                >
                  <Text style={styles.taskPriorityText}>
                    {task.priority === 'LOW' && 'Thấp'}
                    {task.priority === 'MEDIUM' && 'Trung bình'}
                    {task.priority === 'HIGH' && 'Cao'}
                    {task.priority === 'URGENT' && 'Khẩn cấp'}
                  </Text>
                </View>
              </View>

              {task.description && (
                <Text style={styles.taskItemDescription} numberOfLines={2}>
                  {task.description}
                </Text>
              )}

              <View style={styles.taskItemFooter}>
                <View style={styles.taskStatusBadge}>
                  <Text
                    style={[
                      styles.taskStatusText,
                      { color: getTaskStatusColor(task.status) },
                    ]}
                  >
                    {getTaskStatusLabel(task.status)}
                  </Text>
                </View>
                {task.dueDate && (
                  <View style={styles.taskDueDate}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.taskDueDateText}>
                      {formatDate(task.dueDate)}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyTasksContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color={Colors.border} />
          <Text style={styles.emptyTasksText}>Không có công việc nào</Text>
          <Text style={styles.emptyTasksSubtext}>
            Tạo công việc mới để quản lý tốt hơn
          </Text>
        </View>
      )}
    </View>
  );

  /**
   * Render màn hình loading
   */
  if (loading && !landlordId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header với thông tin chủ trọ */}
        {renderHeader()}

        {/* Thẻ thống kê tổng quan */}
        {renderStatisticsCards()}

        {/* Các hành động nhanh */}
        {renderQuickActions()}

        {/* Tổng quan công việc */}
        {renderTaskOverview()}

        {/* Khoảng trống cuối trang */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}


