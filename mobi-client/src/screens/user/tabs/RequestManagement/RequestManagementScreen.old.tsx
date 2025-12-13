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
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { 
  RequirementsService,
  RequirementDetail,
  PaginatedResponse,
  updateRequirementWithImage,
} from '../../../../services/Requirements';
import Colors from '../../../../colors/colors';
import { URL_IMAGE } from '../../../../services/Constant';

type StatusType = 0 | 1 | 2;

const RequestManagementScreen = () => {
  // ===== STATE =====
  const [requests, setRequests] = useState<RequirementDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 5;

  // Edit Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState<RequirementDetail | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Completion View Modal State
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<RequirementDetail | null>(null);

  // ===== FETCH DATA =====
  const fetchRequests = useCallback(async (page: number = 0, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const result = await RequirementsService.userFetchRequirements(page, pageSize);
      
      setRequests(result.data || []);
      setCurrentPage(result.page || 0);
      setTotalPages(result.totalPages || 0);
      setTotalRecords(result.totalRecords || 0);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải danh sách yêu cầu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(0);
  }, [fetchRequests]);

  const onRefresh = () => {
    fetchRequests(currentPage, true);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      fetchRequests(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      fetchRequests(currentPage - 1);
    }
  };

  // ===== GET STATUS INFO =====
  const getStatusInfo = (status: StatusType) => {
    switch (status) {
      case 0:
        return { text: 'Chờ xử lý', color: '#FFA500', icon: 'time-outline' };
      case 1:
        return { text: 'Đã hoàn thành', color: '#10B981', icon: 'checkmark-circle' };
      case 2:
        return { text: 'Bị từ chối', color: '#EF4444', icon: 'close-circle' };
      default:
        return { text: 'Không xác định', color: '#6B7280', icon: 'help-circle' };
    }
  };

  // Handle edit request
  const handleEditRequest = (request: RequirementDetail) => {
    if (request.status !== 0) {
      Alert.alert('Thông báo', 'Chỉ có thể chỉnh sửa yêu cầu chưa xử lý');
      return;
    }
    setEditingRequest(request);
    setEditDescription(request.description || '');
    setSelectedImage(null);
    setEditModalVisible(true);
  };

  // Handle view completion
  const handleViewCompletion = (request: RequirementDetail) => {
    setViewingRequest(request);
    setCompletionModalVisible(true);
  };

  // Pick image
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  // Submit edit
  const handleSubmitEdit = async () => {
    if (!editingRequest) return;

    if (!editDescription.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả yêu cầu');
      return;
    }

    if (editDescription.length < 5) {
      Alert.alert('Lỗi', 'Mô tả phải có ít nhất 5 ký tự');
      return;
    }

    if (editDescription.length > 500) {
      Alert.alert('Lỗi', 'Mô tả không được vượt quá 500 ký tự');
      return;
    }

    try {
      setUpdating(true);

      let imageFileName: string | undefined;
      let imageType: string | undefined;

      if (selectedImage) {
        const uriParts = selectedImage.split('/');
        imageFileName = uriParts[uriParts.length - 1];
        imageType = 'image/jpeg';
      }

      await updateRequirementWithImage(
        editingRequest.id,
        editDescription,
        selectedImage || undefined,
        imageFileName,
        imageType
      );

      Alert.alert('Thành công', 'Cập nhật yêu cầu thành công');
      setEditModalVisible(false);
      setEditingRequest(null);
      fetchRequests(currentPage);
    } catch (error: any) {
      console.error('Error updating request:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật yêu cầu');
    } finally {
      setUpdating(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Get image URL
  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${URL_IMAGE}${imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl}`;
  };

  // Render request item
  const renderRequestItem = ({ item, index }: { item: RequirementDetail; index: number }) => {
    const statusInfo = getStatusInfo(item.status as StatusType);
    const stt = currentPage * pageSize + index + 1;

    return (
      <View style={styles.requestCard}>
        {/* Header */}
        <View style={styles.requestHeader}>
          <View style={styles.requestHeaderLeft}>
            <Text style={styles.requestNumber}>#{stt}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Ionicons name={statusInfo.icon as any} size={14} color="#FFFFFF" />
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </View>
          </View>
          <View style={styles.requestActions}>
            {item.status === 1 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleViewCompletion(item)}
              >
                <Ionicons name="eye-outline" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, item.status !== 0 && styles.actionButtonDisabled]}
              onPress={() => handleEditRequest(item)}
              disabled={item.status !== 0}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={item.status !== 0 ? Colors.textTertiary : Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.requestContent}>
          {item.imageUrl && (
            <Image
              source={{ uri: getImageUrl(item.imageUrl) }}
              style={styles.requestImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.requestInfo}>
            <Text style={styles.requestTitle} numberOfLines={1}>
              {item.roomName || 'N/A'}
            </Text>
            <Text style={styles.requestDescription} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={styles.requestMeta}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.requestDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Render empty
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>Chưa có yêu cầu nào</Text>
      <Text style={styles.emptyText}>Các yêu cầu của bạn sẽ hiển thị ở đây</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Yêu cầu</Text>
      </View>

      {/* Stats */}
      {totalRecords > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="document-text" size={20} color={Colors.primary} />
            <Text style={styles.statText}>Tổng: {totalRecords}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="albums" size={20} color={Colors.primary} />
            <Text style={styles.statText}>
              Trang {currentPage + 1}/{totalPages}
            </Text>
          </View>
        </View>
      )}

      {/* List */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequestItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={[styles.paginationButton, currentPage === 0 && styles.paginationButtonDisabled]}
            onPress={handlePrevPage}
            disabled={currentPage === 0}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={currentPage === 0 ? Colors.textTertiary : Colors.primary}
            />
            <Text
              style={[
                styles.paginationButtonText,
                currentPage === 0 && styles.paginationButtonTextDisabled,
              ]}
            >
              Trước
            </Text>
          </TouchableOpacity>

          <Text style={styles.paginationInfo}>
            {currentPage + 1} / {totalPages}
          </Text>

          <TouchableOpacity
            style={[
              styles.paginationButton,
              currentPage >= totalPages - 1 && styles.paginationButtonDisabled,
            ]}
            onPress={handleNextPage}
            disabled={currentPage >= totalPages - 1}
          >
            <Text
              style={[
                styles.paginationButtonText,
                currentPage >= totalPages - 1 && styles.paginationButtonTextDisabled,
              ]}
            >
              Sau
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={currentPage >= totalPages - 1 ? Colors.textTertiary : Colors.primary}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chỉnh sửa Yêu cầu</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Room Name (disabled) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên phòng</Text>
                <View style={[styles.input, styles.inputDisabled]}>
                  <Text style={styles.inputTextDisabled}>
                    {editingRequest?.roomName || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Mô tả yêu cầu <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Nhập mô tả yêu cầu (5-500 ký tự)"
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
                <Text style={styles.charCount}>
                  {editDescription.length}/500 ký tự
                </Text>
              </View>

              {/* Image Upload */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cập nhật hình ảnh (Tùy chọn)</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <Ionicons name="cloud-upload-outline" size={24} color={Colors.primary} />
                  <Text style={styles.uploadButtonText}>Chọn ảnh mới</Text>
                </TouchableOpacity>

                {/* Current Image */}
                {editingRequest?.imageUrl && !selectedImage && (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imageLabel}>Ảnh hiện tại:</Text>
                    <Image
                      source={{ uri: getImageUrl(editingRequest.imageUrl) }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </View>
                )}

                {/* New Image */}
                {selectedImage && (
                  <View style={styles.imagePreview}>
                    <Text style={styles.imageLabel}>Ảnh mới đã chọn:</Text>
                    <Image
                      source={{ uri: selectedImage }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setSelectedImage(null)}
                    >
                      <Ionicons name="close-circle" size={24} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setEditModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.modalButtonTextCancel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSubmit]}
                onPress={handleSubmitEdit}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonTextSubmit}>Cập nhật</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Completion View Modal */}
      <Modal
        visible={completionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCompletionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết Hoàn thành</Text>
              <TouchableOpacity onPress={() => setCompletionModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Room Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tên phòng</Text>
                <Text style={styles.completionText}>{viewingRequest?.roomName || 'N/A'}</Text>
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Mô tả yêu cầu</Text>
                <Text style={styles.completionText}>{viewingRequest?.description}</Text>
              </View>

              {/* Image */}
              {viewingRequest?.imageUrl && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Hình ảnh minh chứng</Text>
                  <Image
                    source={{ uri: getImageUrl(viewingRequest.imageUrl) }}
                    style={styles.completionImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Status Badge */}
              <View style={styles.completionStatus}>
                <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                <Text style={styles.completionStatusText}>Đã hoàn thành</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  statText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  requestHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonDisabled: {
    opacity: 0.3,
  },
  requestContent: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  requestImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  requestInfo: {
    flex: 1,
    gap: 4,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.backgroundDark,
  },
  paginationButtonDisabled: {
    opacity: 0.3,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  paginationButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  paginationInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.backgroundLight,
  },
  inputDisabled: {
    backgroundColor: Colors.backgroundDark,
  },
  inputTextDisabled: {
    color: Colors.textSecondary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  imagePreview: {
    marginTop: 12,
    position: 'relative',
  },
  imageLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.backgroundDark,
  },
  modalButtonSubmit: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalButtonTextSubmit: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  completionImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  completionStatus: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  completionStatusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default RequestManagementScreen;
