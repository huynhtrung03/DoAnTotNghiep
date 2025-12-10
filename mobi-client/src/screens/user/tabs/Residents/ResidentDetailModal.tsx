import React from 'react';
import {
  View,
  Modal,
  Pressable,
  Text,
  ScrollView,
  Image,
  SafeAreaView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ResidentData } from '../../../../services/ResidentService';
import { residentDetailModalStyles, ResidentColors, Spacing } from './styles';

interface ResidentDetailModalProps {
  visible: boolean;
  resident: ResidentData | null;
  roomTitle?: string;
  contractName?: string;
  landlordName?: string;
  monthlyRent?: number;
  onClose: () => void;
  onEdit: () => void;
}

/**
 * ResidentDetailModal - Bottom sheet modal for viewing resident details
 * Features:
 * - Header with resident name and edit button
 * - Key/value info display (name, ID, relationship, status, dates)
 * - Contract information section
 * - Dual ID card images (front/back)
 * - Notes/ghi chú in highlight box
 * - Read-only display
 */
export const ResidentDetailModal: React.FC<ResidentDetailModalProps> = ({
  visible,
  resident,
  roomTitle,
  contractName,
  landlordName,
  monthlyRent,
  onClose,
  onEdit,
}) => {
  if (!resident) return null;

  const getStatusLabel = (status?: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Đang hoạt động';
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'INACTIVE':
        return 'Không hoạt động';
      case 'REJECTED':
        return 'Bị từ chối';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE':
        return ResidentColors.active;
      case 'PENDING':
        return ResidentColors.pending;
      case 'INACTIVE':
        return ResidentColors.inactive;
      case 'REJECTED':
        return ResidentColors.rejected;
      default:
        return ResidentColors.inactive;
    }
  };

  const statusColor = getStatusColor(resident.status);

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const InfoItem: React.FC<{
    label: string;
    value: string | React.ReactNode;
  }> = ({ label, value }) => (
    <View style={residentDetailModalStyles.infoItem}>
      <Text
        style={residentDetailModalStyles.infoLabel}
      >
        {label}
      </Text>
      <Text
        style={residentDetailModalStyles.infoValue}
      >
        {typeof value === 'string' ? value : ''}
      </Text>
      {typeof value !== 'string' && value}
    </View>
  );

  const StatusTag: React.FC = () => (
    <View
      style={[
        residentDetailModalStyles.infoTag,
        {
          backgroundColor: statusColor.bg,
          borderColor: statusColor.border,
        },
      ]}
    >
      <Text
        style={[
          residentDetailModalStyles.infoTagText,
          { color: statusColor.text },
        ]}
      >
        {getStatusLabel(resident.status)}
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
        ]}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
        />

        <View
          style={residentDetailModalStyles.container}
        >
          {/* Handle Bar */}
          <View
            style={residentDetailModalStyles.handleBar}
          />

          {/* Header */}
          <View
            style={residentDetailModalStyles.header}
          >
            <Text
              style={residentDetailModalStyles.headerTitle}
              numberOfLines={1}
            >
              {resident.fullName}
            </Text>
            <Pressable
              style={residentDetailModalStyles.editButton}
              onPress={() => {
                onEdit();
                onClose();
              }}
            >
              <Ionicons
                name="pencil"
                size={18}
                color="#1E40AF"
              />
            </Pressable>
          </View>

          {/* Scroll Content */}
          <ScrollView
            contentContainerStyle={residentDetailModalStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Personal Information Section */}
            <View style={residentDetailModalStyles.section}>
              <Text
                style={residentDetailModalStyles.sectionTitle}
              >
                Thông tin cá nhân
              </Text>
              <View style={residentDetailModalStyles.infoGrid}>
                <View style={residentDetailModalStyles.infoRow}>
                  <InfoItem label="Số CMND" value={resident.idNumber} />
                  <InfoItem label="Mối quan hệ" value={resident.relationship} />
                </View>
                <View style={residentDetailModalStyles.infoRow}>
                  <InfoItem label="Trạng thái" value={<StatusTag />} />
                </View>
              </View>
            </View>

            {/* Date Information Section */}
            <View style={residentDetailModalStyles.section}>
              <Text
                style={residentDetailModalStyles.sectionTitle}
              >
                Khoảng thời gian
              </Text>
              <View style={residentDetailModalStyles.infoGrid}>
                <View style={residentDetailModalStyles.infoRow}>
                  <InfoItem
                    label="Ngày bắt đầu"
                    value={formatDate(resident.startDate)}
                  />
                  <InfoItem
                    label="Ngày kết thúc"
                    value={resident.endDate ? formatDate(resident.endDate) : 'Chưa xác định'}
                  />
                </View>
              </View>
            </View>

            {/* Contract Information Section */}
            {(roomTitle || contractName || landlordName || monthlyRent) && (
              <View style={residentDetailModalStyles.section}>
                <Text
                  style={residentDetailModalStyles.sectionTitle}
                >
                  Thông tin hợp đồng
                </Text>
                <View style={residentDetailModalStyles.infoGrid}>
                  {roomTitle && (
                    <View style={residentDetailModalStyles.infoRow}>
                      <InfoItem label="Tên phòng" value={roomTitle} />
                    </View>
                  )}
                  {contractName && (
                    <View style={residentDetailModalStyles.infoRow}>
                      <InfoItem label="Hợp đồng" value={contractName} />
                    </View>
                  )}
                  {landlordName && (
                    <View style={residentDetailModalStyles.infoRow}>
                      <InfoItem label="Chủ nhà" value={landlordName} />
                    </View>
                  )}
                  {monthlyRent && (
                    <View style={residentDetailModalStyles.infoRow}>
                      <InfoItem
                        label="Tiền thuê"
                        value={`${monthlyRent.toLocaleString('vi-VN')}₫`}
                      />
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ID Card Images Section */}
            {(resident.frontImageUrl || resident.backImageUrl) && (
              <View style={residentDetailModalStyles.imageGallery}>
                <Text
                  style={residentDetailModalStyles.sectionTitle}
                >
                  Ảnh CMND
                </Text>
                <View style={residentDetailModalStyles.imageRow}>
                  {resident.frontImageUrl && (
                    <View style={residentDetailModalStyles.imageContainer}>
                      <View style={residentDetailModalStyles.imageThumbnail}>
                        <Image
                          source={{ uri: resident.frontImageUrl }}
                          style={residentDetailModalStyles.imageThumbnailImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text
                        style={residentDetailModalStyles.imageThumbnailLabel}
                      >
                        Mặt trước
                      </Text>
                    </View>
                  )}
                  {resident.backImageUrl && (
                    <View style={residentDetailModalStyles.imageContainer}>
                      <View style={residentDetailModalStyles.imageThumbnail}>
                        <Image
                          source={{ uri: resident.backImageUrl }}
                          style={residentDetailModalStyles.imageThumbnailImage}
                          resizeMode="cover"
                        />
                      </View>
                      <Text
                        style={residentDetailModalStyles.imageThumbnailLabel}
                      >
                        Mặt sau
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Note Section */}
            {resident.note && (
              <View style={residentDetailModalStyles.section}>
                <Text
                  style={residentDetailModalStyles.sectionTitle}
                >
                  Ghi chú
                </Text>
                <View
                  style={residentDetailModalStyles.highlightBox}
                >
                  <Text
                    style={residentDetailModalStyles.highlightBoxText}
                  >
                    {resident.note}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer Button */}
          <View
            style={residentDetailModalStyles.footer}
          >
            <Pressable
              style={[
                residentDetailModalStyles.button,
                residentDetailModalStyles.buttonClose,
              ]}
              onPress={onClose}
            >
              <Text
                style={residentDetailModalStyles.buttonCloseText}
              >
                Đóng
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
