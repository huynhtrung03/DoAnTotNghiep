import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RentalHistoryItemProps, BookingStatus } from '../../types/rental';
import { URL_IMAGE } from '../../services/config/Constant';
import styles from './RentalHistoryItem.styles';

const RentalHistoryItem: React.FC<RentalHistoryItemProps> = ({
  item,
  onPressRequest,
  onPressPayment,
  onPressImage,
}) => {
  const getStatusInfo = () => {
    const today = new Date();
    const rentalDate = new Date(item.rentalDate);
    const expiresDate = new Date(item.expires);

    switch (item.status) {
      case BookingStatus.PENDING:
        return {
          text: 'Pending',
          color: '#FFA500',
          icon: 'time-outline' as const,
          bgColor: '#FFF3E0',
        };
      case BookingStatus.CONFIRMED:
        return {
          text: 'Confirmed',
          color: '#2196F3',
          icon: 'checkmark-circle-outline' as const,
          bgColor: '#E3F2FD',
        };
      case BookingStatus.CANCELLED:
        return {
          text: 'Cancelled',
          color: '#F44336',
          icon: 'close-circle-outline' as const,
          bgColor: '#FFEBEE',
        };
      case BookingStatus.REJECTED:
        return {
          text: 'Rejected',
          color: '#9E9E9E',
          icon: 'ban-outline' as const,
          bgColor: '#F5F5F5',
        };
      case BookingStatus.RENTING:
        if (today < rentalDate) {
          return {
            text: 'Upcoming',
            color: '#00BCD4',
            icon: 'calendar-outline' as const,
            bgColor: '#E0F7FA',
          };
        } else if (today >= rentalDate && today <= expiresDate) {
          return {
            text: 'Renting',
            color: '#4CAF50',
            icon: 'home-outline' as const,
            bgColor: '#E8F5E9',
          };
        } else {
          return {
            text: 'Expired',
            color: '#757575',
            icon: 'alert-circle-outline' as const,
            bgColor: '#EEEEEE',
          };
        }
      default:
        return {
          text: 'Unknown',
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
          <Text style={styles.infoLabel}>Landlord:</Text>
          <Text style={styles.infoValue}>{item.name_landlord}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#757575" />
          <Text style={styles.infoLabel}>Phone:</Text>
          <Text style={styles.infoValue}>{item.phone_landlord}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#757575" />
          <Text style={styles.infoLabel}>Address:</Text>
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
            <Text style={styles.detailLabel}>Start Date</Text>
            <Text style={styles.detailValue}>{item.rentalDate}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={16} color="#F44336" />
            <Text style={styles.detailLabel}>End Date</Text>
            <Text style={styles.detailValue}>{item.expires}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#4CAF50" />
            <Text style={styles.detailLabel}>Tenants</Text>
            <Text style={styles.detailValue}>{item.tenants} person(s)</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailItem}>
            <Ionicons name="cash-outline" size={16} color="#FF9800" />
            <Text style={styles.detailLabel}>Monthly Price</Text>
            <Text style={styles.detailValue}>{item.price}</Text>
          </View>
        </View>
      </View>

      {/* Image Proof */}
      {item.imageProof && (
        <View style={styles.imageSection}>
          <Text style={styles.imageSectionTitle}>Payment Proof:</Text>
          <TouchableOpacity
            onPress={() => onPressImage(`${URL_IMAGE}${item.imageProof.startsWith('/') ? item.imageProof.slice(1) : item.imageProof}`)}
            style={styles.imageContainer}
          >
            <Image
              source={{ uri: `${URL_IMAGE}${item.imageProof.startsWith('/') ? item.imageProof.slice(1) : item.imageProof}` }}
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
          <Text style={styles.uploadButtonText}>Upload Payment Proof</Text>
        </TouchableOpacity>
      )}

      {/* Availability Tag */}
      {item.isRemoved === 1 && (
        <View style={styles.removedBadge}>
          <Ionicons name="warning-outline" size={16} color="#F44336" />
          <Text style={styles.removedText}>Removed by owner</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {canSendRequest && (
          <TouchableOpacity
            style={[styles.actionButton, styles.requestButton]}
            onPress={() => onPressRequest(item.idRoom)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Send Request</Text>
          </TouchableOpacity>
        )}

        {item.status === BookingStatus.PENDING && (
          <TouchableOpacity
            style={[styles.actionButton, styles.paymentButton]}
            onPress={() => onPressPayment(item.key)}
          >
            <Ionicons name="card-outline" size={20} color="#FFF" />
            <Text style={styles.actionButtonText}>Make Payment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default RentalHistoryItem;
