import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { 
  RequirementsService,
  RequirementDetail,
  PaginatedResponse,
} from '../../../../services/Requirements';
import { styles } from './styles';
import EditRequestModal from './components/EditRequestModal';
import CompletionViewModal from './components/CompletionViewModal';
import Colors from '../../../../styles/colors';
import RequestCard from './components/RequestCard';

const RequestManagementScreen = () => {
  // ===== STATE =====
  const [data, setData] = useState<PaginatedResponse<RequirementDetail>>({
    data: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    totalRecords: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequirementDetail | null>(null);

  // ===== FETCH DATA =====
  const fetchData = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      console.log(` Đang lấy danh sách yêu cầu - Trang ${page + 1}`);
      setLoading(true);
      
      const result = await RequirementsService.userFetchRequirements(page, size);
      
      console.log(` Đã lấy ${result.data.length} yêu cầu`);
      setData(result);
    } catch (error: any) {
      console.error(' Lỗi khi lấy danh sách yêu cầu:', error.message);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchData(0, 10);
  }, [fetchData]);

  // ===== REFRESH =====
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(0, 10);
  }, [fetchData]);

  // ===== PAGINATION =====
  const handleNextPage = () => {
    if (data.page < data.totalPages - 1) {
      fetchData(data.page + 1, data.size);
    }
  };

  const handlePrevPage = () => {
    if (data.page > 0) {
      fetchData(data.page - 1, data.size);
    }
  };

  // ===== MODAL HANDLERS =====
  const handleEdit = (request: RequirementDetail) => {
    if (request.status !== 0) {
      Alert.alert(
        'Không thể chỉnh sửa',
        'Chỉ có thể chỉnh sửa yêu cầu chưa xử lý'
      );
      return;
    }
    console.log('️ Mở modal chỉnh sửa:', request.id);
    setSelectedRequest(request);
    setEditModalVisible(true);
  };

  const handleViewCompletion = (request: RequirementDetail) => {
    if (request.status !== 1) {
      Alert.alert('Thông báo', 'Yêu cầu này chưa được hoàn thành');
      return;
    }
    console.log('️ Xem thông tin hoàn thành:', request.id);
    setSelectedRequest(request);
    setCompletionModalVisible(true);
  };

  const handleEditSuccess = () => {
    console.log(' Cập nhật yêu cầu thành công');
    setEditModalVisible(false);
    setSelectedRequest(null);
    // Refresh lại trang hiện tại
    fetchData(data.page, data.size);
  };

  const handleCloseModals = () => {
    setEditModalVisible(false);
    setCompletionModalVisible(false);
    setSelectedRequest(null);
  };

  // ===== RENDER ITEM =====
  const renderItem = ({ item }: { item: RequirementDetail }) => (
    <RequestCard
      request={item}
      onEdit={handleEdit}
      onViewCompletion={handleViewCompletion}
    />
  );

  // ===== RENDER EMPTY =====
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>Chưa có yêu cầu nào</Text>
      </View>
    );
  };

  // ===== RENDER LOADING =====
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải danh sách yêu cầu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER =====
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Request Management</Text>
      </View>

      {/* List */}
      <FlatList
        data={data.data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1890ff']}
          />
        }
      />

      {/* Pagination */}
      {data.totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationInfo}>
            {data.page + 1}-{data.totalPages} of {data.totalRecords} items
          </Text>
          <View style={styles.paginationButtons}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                data.page === 0 && styles.paginationButtonDisabled,
              ]}
              onPress={handlePrevPage}
              disabled={data.page === 0}
            >
              <Text style={styles.paginationButtonText}>← Trước</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                data.page >= data.totalPages - 1 && styles.paginationButtonDisabled,
              ]}
              onPress={handleNextPage}
              disabled={data.page >= data.totalPages - 1}
            >
              <Text style={styles.paginationButtonText}>Sau →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Modal */}
      <EditRequestModal
        visible={editModalVisible}
        request={selectedRequest}
        onClose={handleCloseModals}
        onSuccess={handleEditSuccess}
      />

      {/* Completion View Modal */}
      <CompletionViewModal
        visible={completionModalVisible}
        request={selectedRequest}
        onClose={handleCloseModals}
      />
    </SafeAreaView>
  );
};

export default RequestManagementScreen;
