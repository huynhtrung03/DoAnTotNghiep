import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RequirementDetail } from '../../../../../services/Requirements';
import { styles, RequestColors } from '../styles';

interface CompletionViewModalProps {
  visible: boolean;
  request: RequirementDetail | null;
  onClose: () => void;
}

const CompletionViewModal: React.FC<CompletionViewModalProps> = ({
  visible,
  request,
  onClose,
}) => {
  // ===== FORMAT DATE =====
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ===== GET IMAGE URL =====
  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://res.cloudinary.com${imageUrl}`;
  };

  if (!request || request.status !== 1) return null;

  const imageUrl = getImageUrl(request.imageUrl);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable 
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chi tiết hoàn thành</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              {/* Success Badge */}
              <View style={styles.successBadge}>
                <Ionicons 
                  name="checkmark-circle" 
                  size={48} 
                  color={RequestColors.completed.text} 
                  style={styles.successIcon}
                />
                <Text style={styles.successText}>
                  Yêu cầu đã được xử lý thành công
                </Text>
              </View>

              {/* Room Info */}
              <View style={styles.completionSection}>
                <Text style={styles.completionLabel}>Phòng:</Text>
                <Text style={styles.completionValue}>
                  {request.roomTitle || 'Phòng không xác định'}
                </Text>
              </View>

              {/* Original Request */}
              <View style={styles.completionSection}>
                <Text style={styles.completionLabel}>Yêu cầu ban đầu:</Text>
                <Text style={styles.description}>{request.description}</Text>
              </View>

              {/* Original Image */}
              {imageUrl && (
                <View style={styles.completionSection}>
                  <Text style={styles.completionLabel}>Ảnh yêu cầu:</Text>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.requestImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Divider */}
              <View style={styles.completionDivider} />

              {/* Completion Note */}
              <View style={styles.completionSection}>
                <Text style={styles.completionLabel}>Ghi chú hoàn thành:</Text>
                <View style={styles.completionNoteBox}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={RequestColors.completed.text}
                    style={{ marginBottom: 8 }} 
                  />
                  <Text style={styles.completionNoteText}>
                    {request.completionNote || 'Không có ghi chú'}
                  </Text>
                </View>
              </View>

              {/* Completion Date */}
              {request.updatedAt && (
                <View style={styles.completionSection}>
                  <Text style={styles.completionLabel}>Thời gian hoàn thành:</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                    <Text style={[styles.completionValue, { marginLeft: 6 }]}>
                      {formatDate(request.updatedAt)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CompletionViewModal;
