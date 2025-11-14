import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RequirementDetail } from '../../../../../services/Requirements';
import { styles } from '../styles';
import Colors from '../../../../../styles/colors';

interface RequestCardProps {
  request: RequirementDetail;
  onEdit: (request: RequirementDetail) => void;
  onViewCompletion: (request: RequirementDetail) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onEdit,
  onViewCompletion,
}) => {
  // ===== GET STATUS INFO =====
  const getStatusInfo = (status: number) => {
    switch (status) {
      case 0:
        return { text: 'Not Processed', color: '#fa8c16' }; // Orange
      case 1:
        return { text: 'Completed', color: '#52c41a' }; // Green
      case 2:
        return { text: 'Rejected', color: '#f5222d' }; // Red
      default:
        return { text: 'Unknown', color: '#d9d9d9' }; // Gray
    }
  };

  // ===== FORMAT DATE =====
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ===== GET IMAGE URL =====
  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://res.cloudinary.com${imageUrl}`;
  };

  const statusInfo = getStatusInfo(request.status);
  const canEdit = request.status === 0;
  const canViewCompletion = request.status === 1;
  const imageUrl = getImageUrl(request.imageUrl);

  return (
    <View style={styles.requestItem}>
      {/* Header: Room name + Status */}
      <View style={styles.requestHeader}>
        <Text style={styles.roomName} numberOfLines={2}>
          {request.roomName || 'Phòng không xác định'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </View>

      {/* Image */}
      {imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.requestImage}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      {/* Description */}
      <View style={styles.requestBody}>
        <Text style={styles.label}>Request Description:</Text>
        <Text style={styles.description} numberOfLines={3}>
          {request.description}
        </Text>
      </View>

      {/* Footer: Date + Actions */}
      <View style={styles.footer}>
        <Text style={styles.date}>
          {formatDate(request.createdAt)}
        </Text>

        <View style={styles.actions}>
          {/* Edit Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              canEdit ? styles.editButton : styles.disabledButton,
            ]}
            onPress={() => onEdit(request)}
            disabled={!canEdit}
          >
            <Ionicons 
              name="create-outline" 
              size={18} 
              color={canEdit ? Colors.textWhite : Colors.textSecondary} 
            />
            <Text
              style={[
                styles.actionButtonText,
                canEdit ? styles.editButtonText : styles.disabledButtonText,
              ]}
            >
              Edit
            </Text>
          </TouchableOpacity>

          {/* View Completion Button */}
          {canViewCompletion && (
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => onViewCompletion(request)}
            >
              <Ionicons name="eye-outline" size={18} color={Colors.textWhite} />
              <Text style={[styles.actionButtonText, styles.viewButtonText]}>
                View
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default RequestCard;
