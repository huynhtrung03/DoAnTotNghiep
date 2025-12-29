import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  RequirementsService,
  RequirementDetail,
} from '../../../../services/Requirements';
import { styles, RequestColors } from './styles';
import RequestCard from './components/RequestCard';
import EditRequestModal from './components/EditRequestModal';
import CompletionViewModal from './components/CompletionViewModal';

type StatusFilter = 'all' | 0 | 1 | 2; // all, pending, completed, rejected

interface FilterTab {
  label: string;
  value: StatusFilter;
  icon: string;
}

const FILTER_TABS: FilterTab[] = [
  { label: 'Tất cả', value: 'all', icon: 'list-outline' },
  { label: 'Chờ xử lý', value: 0, icon: 'time-outline' },
  { label: 'Hoàn thành', value: 1, icon: 'checkmark-circle-outline' },
  { label: 'Từ chối', value: 2, icon: 'close-circle-outline' },
];

const RequestManagementScreen = () => {
  // ===== STATE =====
  const [allRequests, setAllRequests] = useState<RequirementDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('all');
  const pageSize = 10;

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RequirementDetail | null>(null);

  // Completion View Modal State
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<RequirementDetail | null>(null);

  // ===== FETCH DATA =====
  const fetchRequests = useCallback(async (page: number = 0, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (page === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const result = await RequirementsService.userFetchRequirements(page, pageSize);
      
      if (isRefresh || page === 0) {
        setAllRequests(result.data || []);
      } else {
        // Append data for infinite scroll
        setAllRequests(prev => [...prev, ...(result.data || [])]);
      }
      
      setCurrentPage(result.page || 0);
      setHasMore((result.page || 0) < (result.totalPages || 0) - 1);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(0);
  }, []);

  // ===== REFRESH =====
  const onRefresh = useCallback(() => {
    setCurrentPage(0);
    setHasMore(true);
    fetchRequests(0, true);
  }, [fetchRequests]);

  // ===== LOAD MORE (Infinite Scroll) =====
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      fetchRequests(currentPage + 1);
    }
  }, [loadingMore, hasMore, loading, currentPage, fetchRequests]);

  // ===== FILTER =====
  const filteredRequests = useCallback(() => {
    if (activeFilter === 'all') {
      return allRequests;
    }
    return allRequests.filter(req => req.status === activeFilter);
  }, [allRequests, activeFilter]);

  const getFilterCount = useCallback((filter: StatusFilter) => {
    if (filter === 'all') return allRequests.length;
    return allRequests.filter(req => req.status === filter).length;
  }, [allRequests]);

  // ===== HANDLE EDIT =====
  const handleEditRequest = (request: RequirementDetail) => {
    if (request.status !== 0) {
      Alert.alert('Thông báo', 'Chỉ có thể chỉnh sửa yêu cầu chưa xử lý');
      return;
    }
    setEditingRequest(request);
    setEditModalVisible(true);
  };

  // ===== HANDLE VIEW COMPLETION =====
  const handleViewCompletion = (request: RequirementDetail) => {
    setViewingRequest(request);
    setCompletionModalVisible(true);
  };

  // ===== HANDLE EDIT SUCCESS =====
  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingRequest(null);
    onRefresh();
  };

  // ===== RENDER HEADER =====
  const renderHeader = () => (
    <>
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Yêu cầu</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollView}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.value;
            const count = getFilterCount(tab.value);
            
            return (
              <TouchableOpacity
                key={tab.value}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                onPress={() => setActiveFilter(tab.value)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={16} 
                  color={isActive ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive
                ]}>
                  {tab.label}
                </Text>
                <View style={[
                  styles.filterBadge,
                  isActive && styles.filterBadgeActive
                ]}>
                  <Text style={styles.filterBadgeText}>{count}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Stats */}
      {allRequests.length > 0 && (
        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            Tổng số: {allRequests.length} yêu cầu
          </Text>
        </View>
      )}
    </>
  );

  // ===== RENDER ITEM =====
  const renderRequestItem = ({ item }: { item: RequirementDetail }) => (
    <RequestCard
      request={item}
      onEdit={handleEditRequest}
      onViewCompletion={handleViewCompletion}
    />
  );

  // ===== RENDER EMPTY =====
  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color="#9CA3AF" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>
          {activeFilter === 'all' 
            ? 'Chưa có yêu cầu nào' 
            : `Không có yêu cầu ${FILTER_TABS.find(t => t.value === activeFilter)?.label.toLowerCase()}`
          }
        </Text>
        <Text style={styles.emptyText}>
          {activeFilter === 'all'
            ? 'Các yêu cầu của bạn sẽ hiển thị ở đây'
            : 'Thử chọn bộ lọc khác'
          }
        </Text>
      </View>
    );
  };

  // ===== RENDER FOOTER =====
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={RequestColors.primary} />
        <Text style={[styles.loadingText, { marginLeft: 8 }]}>Đang tải thêm...</Text>
      </View>
    );
  };

  // ===== LOADING STATE =====
  if (loading && allRequests.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={RequestColors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      
      {/* Header */}
      {renderHeader()}

      {/* List with Infinite Scroll */}
      <FlatList
        data={filteredRequests()}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[RequestColors.primary]}
            tintColor={RequestColors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />

      {/* Edit Modal */}
      <EditRequestModal
        visible={editModalVisible}
        request={editingRequest}
        onClose={() => {
          setEditModalVisible(false);
          setEditingRequest(null);
        }}
        onSuccess={handleEditSuccess}
      />

      {/* Completion View Modal */}
      <CompletionViewModal
        visible={completionModalVisible}
        request={viewingRequest}
        onClose={() => {
          setCompletionModalVisible(false);
          setViewingRequest(null);
        }}
      />
    </SafeAreaView>
  );
};

export default RequestManagementScreen;
