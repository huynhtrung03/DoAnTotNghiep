import React from 'react';
import { View, Text, Image, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RequirementDetail } from '../../../../../services/Requirements';
import { styles, RequestColors } from '../styles';

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
        return { 
          text: 'Chờ xử lý', 
          bg: RequestColors.pending.bg,
          textColor: RequestColors.pending.text,
          border: RequestColors.pending.border,
          icon: 'time-outline' as const,
        };
      case 1:
        return { 
          text: 'Đã hoàn thành', 
          bg: RequestColors.completed.bg,
          textColor: RequestColors.completed.text,
          border: RequestColors.completed.border,
          icon: 'checkmark-circle' as const,
        };
      case 2:
        return { 
          text: 'Bị từ chối', 
          bg: RequestColors.rejected.bg,
          textColor: RequestColors.rejected.text,
          border: RequestColors.rejected.border,
          icon: 'close-circle' as const,
        };
      default:
        return { 
          text: 'Không xác định', 
          bg: '#F5F5F5',
          textColor: '#9CA3AF',
          border: '#E5E7EB',
          icon: 'help-circle' as const,
        };
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
    <Pressable 
      style={({ pressed }) => [
        styles.requestCard,
        pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
      ]}
      onPress={() => canViewCompletion && onViewCompletion(request)}
      disabled={!canViewCompletion}
    >
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardRoomName} numberOfLines={2}>
            {request.roomTitle || 'Phòng không xác định'}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />
            <Text style={[styles.cardDate, { marginLeft: 4 }]}>
              {formatDate(request.createdDate)}
            </Text>
          </View>
        </View>
        
        {/* Status Badge */}
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: statusInfo.bg,
            borderColor: statusInfo.border,
          }
        ]}>
          <Ionicons name={statusInfo.icon} size={14} color={statusInfo.textColor} />
          <Text style={[styles.statusBadgeText, { color: statusInfo.textColor }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        {/* Thumbnail */}
        <View style={styles.cardThumbnail}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.cardThumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.cardThumbnailPlaceholder}>
              <Ionicons name="image-outline" size={32} color="#D1D5DB" />
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardDescription} numberOfLines={3}>
            {request.description}
          </Text>
        </View>
      </View>

      {/* Card Footer - Actions */}
      <View style={styles.cardFooter}>
        {/* Edit Button */}
        <TouchableOpacity
          style={[
            styles.cardActionButton,
            canEdit ? styles.editButton : styles.disabledButton,
          ]}
          onPress={() => onEdit(request)}
          disabled={!canEdit}
        >
          <Ionicons 
            name="create-outline" 
            size={16} 
            color={canEdit ? '#1976D2' : '#BDBDBD'} 
          />
          <Text
            style={canEdit ? styles.editButtonText : styles.disabledButtonText}
          >
            Chỉnh sửa
          </Text>
        </TouchableOpacity>

        {/* View Completion Button */}
        {canViewCompletion && (
          <TouchableOpacity
            style={[styles.cardActionButton, styles.viewButton]}
            onPress={() => onViewCompletion(request)}
          >
            <Ionicons name="eye-outline" size={16} color="#7B1FA2" />
            <Text style={styles.viewButtonText}>
              Xem chi tiết
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
};

export default RequestCard;
