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
  iconBgColor: string;
  iconColor: string;
  unit?: string;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
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
      if (landlordId) {
        fetchDashboardData();
      }
    }, [landlordId])
  );

  const initializeLandlordData = async () => {
    try {
      const userProfileString = await AsyncStorage.getItem('userProfile');
      if (userProfileString) {
        const userProfile = JSON.parse(userProfileString);
        setLandlordId(userProfile.id);
        setLandlordName(userProfile.fullName || 'Chủ trọ');
        setLandlordAvatar(userProfile.avatar || null);
      }
    } catch (error) {
      console.error('Error initializing landlord data:', error);
    }
  };

  const fetchDashboardData = async () => {
    if (!landlordId) return;
    setLoading(true);
    try {
      await Promise.all([fetchStatisticsData(), fetchTasksData()]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatisticsData = async () => {
    try {
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
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchTasksData = async () => {
    if (!landlordId) return;
    try {
      const tasks = await LandlordTaskService.getTasksByLandlord(landlordId);
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
      const sortedTasks = tasks
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentTasks(sortedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
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