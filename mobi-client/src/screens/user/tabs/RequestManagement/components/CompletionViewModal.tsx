import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RequirementDetail } from '../../../../../services/Requirements';
import { styles } from '../styles';

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

  // ===== RENDER =====
  if (!request || request.status !== 1) return null;

  const imageUrl = getImageUrl(request.imageUrl);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Completion Details</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody}>
            <View style={{ padding: 16 }}>
              {/* Room Info */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Room:</Text>
                <Text style={styles.value}>
                  {request.roomName || 'Phòng không xác định'}
                </Text>
              </View>

              {/* Original Request */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Original Request:</Text>
                <Text style={styles.description}>{request.description}</Text>
              </View>

              {/* Original Image */}
              {imageUrl && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Request Image:</Text>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.requestImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: '#e0e0e0',
                  marginVertical: 20,
                }}
              />

              {/* Completion Note */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Completion Note:</Text>
                <View
                  style={{
                    backgroundColor: '#f6ffed',
                    padding: 12,
                    borderRadius: 6,
                    borderLeftWidth: 3,
                    borderLeftColor: '#52c41a',
                  }}
                >
                  <Text style={{ fontSize: 14, color: '#389e0d', lineHeight: 20 }}>
                    {request.completionNote || 'No completion note'}
                  </Text>
                </View>
              </View>

              {/* Completion Date */}
              {request.updatedAt && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Completed At:</Text>
                  <Text style={styles.value}>
                     {formatDate(request.updatedAt)}
                  </Text>
                </View>
              )}

              {/* Success Badge */}
              <View
                style={{
                  backgroundColor: '#52c41a',
                  padding: 16,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 16,
                }}
              >
                <Ionicons name="checkmark-circle" size={40} color="#fff" style={{ marginBottom: 8 }} />
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  Request has been processed
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CompletionViewModal;
