import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ContractDisplayData, statusMap } from '../types';
import { styles } from '../styles';
import Colors from '../../../../../colors/colors';

interface ContractCardProps {
  contract: ContractDisplayData;
  onPress: (contract: ContractDisplayData) => void;
  userRole?: 'Landlords' | 'Users' | null;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onPress, userRole }) => {
  // ===== FORMAT DATE =====
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // ===== FORMAT MONEY =====
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('vi-VN');
  };

  // ===== GET STATUS INFO =====
  const statusInfo = statusMap[contract.status];

  return (
    <View style={styles.contractCard}>
      {/* Header: Room title + Status */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {contract.roomTitle || 'Unknown Room'}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
          <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
      </View>

      {/* Info rows */}
      <View>
        {/* Landlord/Tenant */}
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.infoLabel}>
            {userRole === 'Landlords' ? 'Người thuê:' : 'Chủ trọ:'}
          </Text>
          <Text style={styles.infoValue}>
            {userRole === 'Landlords' ? (contract.tenantName || 'N/A') : (contract.landlordName || 'N/A')}
          </Text>
        </View>

        {/* Start Date */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.infoLabel}>Ngày bắt đầu:</Text>
          <Text style={styles.infoValue}>{formatDate(contract.startDate)}</Text>
        </View>

        {/* End Date */}
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.infoLabel}>Ngày kết thúc:</Text>
          <Text style={styles.infoValue}>{formatDate(contract.endDate)}</Text>
        </View>

        {/* Monthly Rent */}
        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} style={{ marginRight: 6 }} />
          <Text style={styles.infoLabel}>Tiền thuê:</Text>
          <Text style={styles.rentValue}>{formatMoney(contract.monthlyRent)} vnđ/tháng</Text>
        </View>
      </View>

      {/* Footer: Contract name + View button */}
      <View style={styles.cardFooter}>
        <Text style={styles.contractName} numberOfLines={1}>
          {contract.contractName || 'No Contract Name'}
        </Text>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onPress(contract)}
          activeOpacity={0.7}
        >
          <Text style={styles.viewButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ContractCard;
