import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { RentalHistoryItemProps, BookingStatus, PaymentMethod } from '../../types/rental';
import { URL_IMAGE } from '../../services/Constant';
import PaymentList from '../payment/PaymentList';
import styles from './RentalHistoryItem.styles';

const RentalHistoryItem: React.FC<RentalHistoryItemProps> = ({
  item,
  onPressRequest,
  onPressPayment,
  onSelectPaymentMethod,
  onPressImage,
  onPressRoomDetail,
}) => {
  const navigation = useNavigation();
  const [showPaymentList, setShowPaymentList] = useState(false);

  const handleZaloPayPress = () => {
    setShowPaymentList(false);
    // @ts-ignore - Navigate to ZaloPayScreen
    navigation.navigate('ZaloPayScreen', {
      onSuccess: () => {
        // Payment successful, you may want to refresh the rental history
        console.log('ZaloPay payment successful for rental item:', item.key);
      }
    });
  };
  const getStatusInfo = () => {
    const today = new Date();
    const rentalDate = new Date(item.rentalDate);
    const expiresDate = new Date(item.expires);

    switch (item.status) {
      case BookingStatus.PENDING:
        return {
          text: 'Chờ xác nhận',
          color: '#FFA500',
          icon: 'time-outline' as const,
          bgColor: '#FFF3E0',
        };
      case BookingStatus.CONFIRMED:
        return {
          text: 'Đã xác nhận',
          color: '#2196F3',
          icon: 'checkmark-circle-outline' as const,
          bgColor: '#E3F2FD',
        };
      case BookingStatus.CANCELLED:
        return {
          text: 'Đã hủy',
          color: '#F44336',
          icon: 'close-circle-outline' as const,
          bgColor: '#FFEBEE',
        };
      case BookingStatus.REJECTED:
        return {
          text: 'Đã từ chối',
          color: '#9E9E9E',
          icon: 'ban-outline' as const,
          bgColor: '#F5F5F5',
        };
      case BookingStatus.RENTING:
        if (today < rentalDate) {
          return {
            text: 'Sắp tới',
            color: '#00BCD4',
            icon: 'calendar-outline' as const,
            bgColor: '#E0F7FA',
          };
        } else if (today >= rentalDate && today <= expiresDate) {
          return {
            text: 'Đang thuê',
            color: '#4CAF50',
            icon: 'home-outline' as const,
            bgColor: '#E8F5E9',
          };
        } else {
          return {
            text: 'Đã hết hạn',
            color: '#757575',
            icon: 'alert-circle-outline' as const,
            bgColor: '#EEEEEE',
          };
        }
      default:
        return {
          text: 'Không xác định',
          color: '#9E9E9E',
          icon: 'help-circle-outline' as const,
          bgColor: '#F5F5F5',
        };
    }
  };

  const statusInfo = getStatusInfo();
  const today = new Date();
  const isExpired = new Date(item.expires) < today;
  const canSendRequest = item.status === BookingStatus.RENTING && !isExpired;

  return (
    <View style={styles.container}>
      {/* Room Image */}
      {item.roomImage && (
        <TouchableOpacity
          onPress={() => onPressRoomDetail(item.idRoom)}
          style={styles.roomImageContainer}
        >
          <Image
            source={{ uri: `${URL_IMAGE}${item.roomImage.startsWith('/') ? item.roomImage.slice(1) : item.roomImage}` }}
            style={styles.roomImage}
            resizeMode="cover"
          />
          <View style={styles.roomImageOverlay}>
            <Ionicons name="expand-outline" size={20} color="#FFF" />
          </View>
        </TouchableOpacity>
      )}

      {/* Header: Room Name & Status */}
      <View style={styles.header}>
        <View style={styles.roomInfo}>
          <Ionicons name="home" size={20} color="#1976D2" />
          <Text style={styles.roomName} numberOfLines={1}>
            {item.room}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.bgColor },
          ]}
        >
          <Ionicons
            name={statusInfo.icon}
            size={14}
            color={statusInfo.color}
          />
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Landlord Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#757575" />
          <Text style={styles.infoLabel}>Chủ nhà:</Text>
          <Text style={styles.infoValue}>{item.name_landlord}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#757575" />
          <Text style={styles.infoLabel}>Điện thoại:</Text>
          <Text style={styles.infoValue}>{item.phone_landlord}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.infoLabel}>Địa chỉ:</Text>
          <Text style={styles.infoValue} numberOfLines={2}>
            {item.address}
          </Text>
        </View>
      </View>

      {/* Rental Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#1976D2" />
            <Text style={styles.detailLabel}>Ngày bắt đầu</Text>
            <Text style={styles.detailValue}>{item.rentalDate}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#F44336" />
            <Text style={styles.detailLabel}>Ngày kết thúc</Text>
            <Text style={styles.detailValue}>{item.expires}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#4CAF50" />
            <Text style={styles.detailLabel}>Số người thuê</Text>
            <Text style={styles.detailValue}>{item.tenants} người</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#FF9800" />
            <Text style={styles.detailLabel}>Giá thuê tháng</Text>
            <Text style={styles.detailValue}>{item.price}</Text>
          </View>
        </View>
      </View>

      {/* Image Proof */}
      {item.imageProof && (
        <View style={styles.imageSection}>
          <Text style={styles.imageSectionTitle}>Ảnh chứng minh thanh toán:</Text>
          <TouchableOpacity
            onPress={() => onPressImage(`${URL_IMAGE}${item.imageProof!.startsWith('/') ? item.imageProof!.slice(1) : item.imageProof!}`)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: `${URL_IMAGE}${item.imageProof!.startsWith('/') ? item.imageProof!.slice(1) : item.imageProof!}` }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Ionicons name="expand-outline" size={24} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {!item.imageProof && item.status === BookingStatus.CONFIRMED && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => onPressPayment(item.key)}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#1976D2" />
          <Text style={styles.uploadButtonText}>Tải lên ảnh thanh toán</Text>
        </TouchableOpacity>
      )}

      {/* Availability Tag */}
      {item.isRemoved === 1 && (
        <View style={styles.removedBadge}>
          <Ionicons name="warning-outline" size={16} color="#F44336" />
          <Text style={styles.removedText}>Đã bị xóa bởi chủ nhà</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {/* View Room Details Button - Always visible */}
        <TouchableOpacity
          style={[styles.actionButton, styles.detailButton]}
          onPress={() => onPressRoomDetail(item.idRoom)}
        >
          <Ionicons name="eye-outline" size={20} color="#FFF" />
          <Text style={styles.actionButtonText}>Xem chi tiết phòng</Text>
        </TouchableOpacity>

        {canSendRequest && (
          <TouchableOpacity
            style={[styles.actionButton, styles.requestButton]}
            onPress={() => onPressRequest(item.idRoom)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Gửi yêu cầu</Text>
          </TouchableOpacity>
        )}

        {item.status === BookingStatus.PENDING && (
          <TouchableOpacity
            style={[styles.actionButton, styles.paymentButton]}
            onPress={() => setShowPaymentList(true)}
          >
            <Ionicons name="card-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Payment List Popup */}
      <PaymentList
        visible={showPaymentList}
        onClose={() => setShowPaymentList(false)}
        onSelectMethod={(method) => {
          if (onSelectPaymentMethod) {
            onSelectPaymentMethod(item.key, method);
          } else {
            // Fallback to old behavior
            onPressPayment(item.key);
          }
          setShowPaymentList(false);
        }}
        onZaloPayPress={handleZaloPayPress}
      />
    </View>
  );
};

export default RentalHistoryItem;
