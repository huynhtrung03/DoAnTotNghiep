/**
 * DashboardScreen Component - Modern White Design
 * Thiết kế gọn gàng, màu trắng làm chủ đạo cho mobile
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import Services
import { API_URL, URL_IMAGE } from '../../../services/Constant';
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
import { getProfileById, getFullName } from '../../../services/ProfileService';

// Import Styles
import { styles } from './styles/DashboardScreen.style';
import Colors from '../../../colors/colors';

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
  iconBgColor: string;
  iconColor: string;
  unit?: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [landlordId, setLandlordId] = useState<string | null>(null);
  const [landlordName, setLandlordName] = useState<string>('Chủ trọ');
  const [landlordAvatar, setLandlordAvatar] = useState<string | null>(null);

  const [statistics, setStatistics] = useState<DashboardStatistics>({
    totalPostedRooms: 0,
    totalRentedRooms: 0,
    totalViews: 0,
    totalFavorites: 0,
    totalRevenue: 0,
    totalMaintenanceCost: 0,
    monthlyRevenue: 0,
  });

  const [taskStats, setTaskStats] = useState<TaskStatistics>({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });

  const [recentTasks, setRecentTasks] = useState<LandlordTaskResponseDto[]>([]);

  useEffect(() => {
    initializeLandlordData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        console.log(' Dashboard focus effect triggered');
        console.log(' Current landlordId:', landlordId);

        // Đảm bảo có landlordId trước khi fetch
        let currentLandlordId = landlordId;
        if (!currentLandlordId) {
          console.log(' Initializing landlord data...');
          await initializeLandlordData();

          // Lấy lại landlordId từ JWT token sau khi init
          const accessToken = await AsyncStorage.getItem('accessToken');
          if (accessToken) {
            const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
            currentLandlordId = tokenPayload.id;
            setLandlordId(currentLandlordId); // Update state
            console.log(' Updated landlordId from JWT:', currentLandlordId);
          }
        }

        // Fetch data với landlordId đã có
        if (currentLandlordId) {
          await fetchDashboardDataWithId(currentLandlordId);
        } else {
          console.warn('️ No landlordId available, cannot fetch data');
          setLoading(false);
        }
      };
      loadData();
    }, []) // Remove landlordId dependency to avoid multiple calls
  );

  const initializeLandlordData = async () => {
    try {
      console.log(' Initializing landlord data...');
      const accessToken = await AsyncStorage.getItem('accessToken');
      const userProfileString = await AsyncStorage.getItem('userProfile');

      if (accessToken && userProfileString) {
        // Extract landlord ID from JWT token
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const landlordId = tokenPayload.id;

        console.log(' Landlord ID from JWT:', landlordId);

        // Try to get fresh profile data from API first
        let landlordName = 'Chủ trọ';
        let landlordAvatar = null;

        try {
          console.log(' Fetching profile from API...');
          const profileData = await getFullName(landlordId, accessToken);
          if (profileData) {
            landlordName = profileData.fullName || 'Chủ trọ';
            // Build full avatar URL if avatar exists
            let avatarUrl = null;
            if (profileData.avatar) {
              // If avatar starts with '/', it's a relative path, prepend URL_IMAGE
              if (profileData.avatar.startsWith('/')) {
                avatarUrl = `${URL_IMAGE}${profileData.avatar.substring(1)}`;
              } else {
                avatarUrl = profileData.avatar;
              }
            }
            landlordAvatar = avatarUrl;
            console.log(' Profile loaded from API:', { landlordName, avatarUrl, hasAvatar: !!landlordAvatar });
          }
        } catch (apiError) {
          console.warn('️ Failed to fetch profile from API, falling back to AsyncStorage:', apiError);
          // Fallback to AsyncStorage if API fails
          const userData = JSON.parse(userProfileString);
          landlordName = userData.userProfile?.fullName || userData.fullName || 'Chủ trọ';
          landlordAvatar = userData.userProfile?.avatar || userData.avatar || null;
          console.log(' Profile loaded from AsyncStorage:', { landlordName, hasAvatar: !!landlordAvatar });
        }

        console.log(' Final landlord data:', { landlordId, landlordName, hasAvatar: !!landlordAvatar });
        setLandlordId(landlordId);
        setLandlordName(landlordName);
        setLandlordAvatar(landlordAvatar);
      } else {
        console.warn('️ No access token or user profile found in AsyncStorage');
      }
    } catch (error) {
      console.error(' Error initializing landlord data:', error);
    }
  };

  const fetchDashboardDataWithId = async (id: string) => {
    console.log(' Starting fetchDashboardDataWithId for landlord:', id);
    setLoading(true);

    try {
      console.log(' Fetching statistics and tasks concurrently...');
      const [statisticsResult, tasksResult] = await Promise.allSettled([
        fetchStatisticsDataWithId(id),
        fetchTasksDataWithId(id),
      ]);

      // Handle statistics result
      if (statisticsResult.status === 'fulfilled') {
        console.log(' Statistics fetched successfully');
      } else {
        console.error(' Statistics fetch failed:', statisticsResult.reason);
        setError('Không thể tải thống kê');
      }

      // Handle tasks result
      if (tasksResult.status === 'fulfilled') {
        console.log(' Tasks fetched successfully');
      } else {
        console.error(' Tasks fetch failed:', tasksResult.reason);
        setError('Không thể tải danh sách công việc');
      }

      console.log(' Current statistics:', statistics);
      console.log(' Current task stats:', taskStats);
    } catch (error) {
      console.error(' Unexpected error in fetchDashboardDataWithId:', error);
      setError('Lỗi không xác định khi tải dữ liệu');
    } finally {
      setLoading(false);
      console.log(' Dashboard data fetch completed');
    }
  };

  const fetchStatisticsDataWithId = async (id: string) => {
    console.log(' Fetching statistics for landlord:', id);
    try {
      const [
        postedRooms,
        rentedRooms,
        viewedRooms,
        favoritedRooms,
        revenueStats,
        maintenanceStats,
      ] = await Promise.all([
        getLandlordPostedRoomCount(id),
        getLandlordRentedRoomCount(id),
        getLandlordViewedRoomCount(id),
        getLandlordFavoritedRoomCount(id),
        getLandlordRevenueStatistics(id),
        getLandlordMaintenanceStatistics(id),
      ]);

      console.log(' All statistics results:');
      console.log(' Posted rooms:', postedRooms);
      console.log(' Rented rooms:', rentedRooms);
      console.log('️ Viewed rooms:', viewedRooms);
      console.log('️ Favorited rooms:', favoritedRooms);
      console.log(' Revenue stats:', revenueStats);
      console.log(' Maintenance stats:', maintenanceStats);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); // 0-11
      const currentYear = currentDate.getFullYear();
      console.log(' Current month/year:', currentMonth, currentYear);

      const monthlyRevenue = revenueStats?.revenueByMonth?.find((item) => {
        const itemDate = new Date(item.month);
        const itemMonth = itemDate.getMonth();
        const itemYear = itemDate.getFullYear();
        console.log(' Checking revenue item:', item, 'month:', itemMonth, 'year:', itemYear);
        return itemMonth === currentMonth && itemYear === currentYear;
      })?.revenue || 0;

      console.log(' Calculated monthly revenue:', monthlyRevenue);

      const newStatistics = {
        totalPostedRooms: postedRooms?.count || 0,
        totalRentedRooms: rentedRooms?.count || 0,
        totalViews: viewedRooms?.count || 0,
        totalFavorites: favoritedRooms?.count || 0,
        totalRevenue: revenueStats?.totalRevenue || 0,
        totalMaintenanceCost: maintenanceStats?.totalCost || 0,
        monthlyRevenue,
      };

      console.log(' Setting statistics:', newStatistics);
      setStatistics(newStatistics);
    } catch (error) {
      console.error(' Error fetching statistics:', error);
      // Reset to default values on error
      setStatistics({
        totalPostedRooms: 0,
        totalRentedRooms: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalRevenue: 0,
        totalMaintenanceCost: 0,
        monthlyRevenue: 0,
      });
    }
  };

  const fetchTasksDataWithId = async (id: string) => {
    console.log(' Fetching tasks for landlord:', id);
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${API_URL}/landlord-tasks/landlord/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('️ Tasks API error:', errorText);
        throw new Error('Failed to fetch landlord tasks');
      }

      const tasks = await response.json();
      console.log(' Tasks fetched successfully:', tasks?.length || 0, 'tasks');

      // Validate response
      if (!Array.isArray(tasks)) {
        console.warn('️ Tasks API returned non-array:', tasks);
        setTaskStats({
          totalTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
        });
        setRecentTasks([]);
        return;
      }

      const now = new Date();
      const taskStatistics: TaskStatistics = {
        totalTasks: tasks.length,
        pendingTasks: tasks.filter((task: any) => task.status === 'PENDING').length,
        inProgressTasks: tasks.filter((task: any) => task.status === 'IN_PROGRESS').length,
        completedTasks: tasks.filter((task: any) => task.status === 'COMPLETED').length,
        overdueTasks: tasks.filter(
          (task: any) =>
            task.dueDate &&
            new Date(task.dueDate) < now &&
            task.status !== 'COMPLETED' &&
            task.status !== 'CANCELLED'
        ).length,
      };

      console.log(' Setting task stats:', taskStatistics);
      setTaskStats(taskStatistics);

      // Sort by startDate (descending) and take 5 most recent
      const sortedTasks = [...tasks]
        .sort((a: any, b: any) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
        .slice(0, 5);

      setRecentTasks(sortedTasks);
    } catch (error) {
      console.error(' Error fetching tasks:', error);
      // Reset to default values on error
      setTaskStats({
        totalTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
      });
      setRecentTasks([]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (landlordId) {
      await fetchDashboardDataWithId(landlordId);
    }
    setRefreshing(false);
  };

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getTaskStatusColor = (status: string): string => {
    const colors = {
      PENDING: '#F59E0B',
      IN_PROGRESS: '#3B82F6',
      COMPLETED: '#10B981',
      CANCELLED: '#EF4444',
    };
    return colors[status as keyof typeof colors] || '#6B7280';
  };

  const getTaskStatusLabel = (status: string): string => {
    const labels = {
      PENDING: 'Chờ xử lý',
      IN_PROGRESS: 'Đang làm',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTaskPriorityColor = (priority: string): string => {
    const colors = {
      LOW: '#3B82F6',
      MEDIUM: '#F59E0B',
      HIGH: '#EF4444',
      URGENT: '#DC2626',
    };
    return colors[priority as keyof typeof colors] || '#6B7280';
  };

  const statCards: StatCardData[] = [
    {
      title: 'Phòng đã đăng',
      value: statistics.totalPostedRooms,
      icon: 'home',
      iconBgColor: '#EFF6FF',
      iconColor: '#3B82F6',
      unit: 'phòng',
    },
    {
      title: 'Phòng đã thuê',
      value: statistics.totalRentedRooms,
      icon: 'checkmark-circle',
      iconBgColor: '#ECFDF5',
      iconColor: '#10B981',
      unit: 'phòng',
    },
    {
      title: 'Lượt xem',
      value: statistics.totalViews,
      icon: 'eye',
      iconBgColor: '#F5F3FF',
      iconColor: '#8B5CF6',
      unit: 'lượt',
    },
    {
      title: 'Yêu thích',
      value: statistics.totalFavorites,
      icon: 'heart',
      iconBgColor: '#FFF1F2',
      iconColor: '#F43F5E',
      unit: 'lượt',
    },
  ];

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.userInfo}>
          <TouchableOpacity
            onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
            style={styles.avatarContainer}
          >
            {landlordAvatar ? (
              <Image source={{ uri: landlordAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color="#9CA3AF" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.greetingContainer}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.landlordName}>{landlordName}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
        >
          <Ionicons name="notifications-outline" size={20} color="#374151" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>
    </View>
  );

  const renderStatisticsCards = () => (
    <View style={styles.statisticsContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>Chi tiết</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {statCards.map((card, index) => (
          <TouchableOpacity key={index} style={styles.statCard} activeOpacity={0.7}>
            <View style={[styles.statIconContainer, { backgroundColor: card.iconBgColor }]}>
              <Ionicons name={card.icon} size={22} color={card.iconColor} />
            </View>
            <Text style={styles.statValue}>{formatNumber(card.value)}</Text>
            <View style={styles.statFooter}>
              <Text style={styles.statTitle}>{card.title}</Text>
              {card.unit && <Text style={styles.statUnit}>{card.unit}</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.revenueContainer}>
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: '#ECFDF5', width: 36, height: 36, borderRadius: 8 }]}>
              <Ionicons name="wallet" size={20} color="#10B981" />
            </View>
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
        </View>
      </View>
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Hành động nhanh</Text>
      <View style={styles.quickActionsGrid}>
        {[
          { icon: 'add-circle', text: 'Đăng phòng', color: '#3B82F6', bg: '#EFF6FF' },
          { icon: 'document-text', text: 'Hợp đồng', color: '#10B981', bg: '#ECFDF5' },
          { icon: 'checkmark-done', text: 'Công việc', color: '#8B5CF6', bg: '#F5F3FF' },
          { icon: 'bar-chart', text: 'Thống kê', color: '#F59E0B', bg: '#FEF3C7' },
        ].map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionButton}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: action.bg, width: 44, height: 44, borderRadius: 12 }]}>
              <Ionicons name={action.icon as any} size={24} color={action.color} />
            </View>
            <Text style={styles.quickActionText}>{action.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTaskOverview = () => (
    <View style={styles.taskOverviewContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Công việc</Text>
        <TouchableOpacity
          onPress={() => Alert.alert('Thông báo', 'Chức năng đang phát triển')}
          style={styles.viewAllButton}
        >
          <Text style={styles.viewAllText}>Tất cả</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.taskStatsRow}>
        <View style={styles.taskStatItem}>
          <Text style={styles.taskStatValue}>{taskStats.totalTasks}</Text>
          <Text style={styles.taskStatLabel}>Tổng</Text>
        </View>
        <View style={styles.taskStatItem}>
          <Text style={[styles.taskStatValue, { color: '#F59E0B' }]}>
            {taskStats.pendingTasks}
          </Text>
          <Text style={styles.taskStatLabel}>Chờ</Text>
        </View>
        <View style={styles.taskStatItem}>
          <Text style={[styles.taskStatValue, { color: '#3B82F6' }]}>
            {taskStats.inProgressTasks}
          </Text>
          <Text style={styles.taskStatLabel}>Đang làm</Text>
        </View>
        <View style={styles.taskStatItem}>
          <Text style={[styles.taskStatValue, { color: '#10B981' }]}>
            {taskStats.completedTasks}
          </Text>
          <Text style={styles.taskStatLabel}>Xong</Text>
        </View>
      </View>

      {recentTasks.length > 0 ? (
        <View style={styles.tasksList}>
          {recentTasks.map((task) => (
            <TouchableOpacity key={task.id} style={styles.taskItem} activeOpacity={0.7}>
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
                    {task.priority === 'MEDIUM' && 'TB'}
                    {task.priority === 'HIGH' && 'Cao'}
                    {task.priority === 'URGENT' && 'Gấp'}
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
                    <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                    <Text style={styles.taskDueDateText}>{formatDate(task.dueDate)}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyTasksContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyTasksText}>Chưa có công việc</Text>
          <Text style={styles.emptyTasksSubtext}>Tạo công việc mới để quản lý tốt hơn</Text>
        </View>
      )}
    </View>
  );

  if (loading && !landlordId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
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
        {renderHeader()}
        {renderStatisticsCards()}
        {renderQuickActions()}
        {renderTaskOverview()}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}