import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Image as RNImage,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../../../colors/colors';
import { BillData, ContractData } from '../../../../../types/types';
import { BillService } from '../../../../../services/BillService';
import { styles } from './TenantBillsTab.styles';
import BillDetailModal from './BillDetailModal';
import BillPaymentModal from './BillPaymentModal';

interface TenantBillsTabProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}

const billStatusMap: Record<string, { text: string; color: string; icon: string }> = {
  PENDING: { text: 'Pending', color: '#FFA500', icon: 'clock-outline' },
  CONFIRMING: { text: 'Confirming', color: '#1976D2', icon: 'sync' },
  PAID: { text: 'Paid', color: '#4CAF50', icon: 'check-circle' },
  OVERDUE: { text: 'Overdue', color: '#D32F2F', icon: 'alert-circle' },
};

const TenantBillsTab: React.FC<TenantBillsTabProps> = ({ contract, onContractUpdate }) => {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Process bills data
  const processBills = useCallback((rawBills: BillData[]) => {
    return (rawBills || []).map((bill) => {
      let electricityUsage = bill.electricityUsage;
      let waterUsage = bill.waterUsage;

      if (!electricityUsage && bill.electricityPrice && bill.electricityPrice > 0 && bill.electricityFee) {
        electricityUsage = bill.electricityFee / bill.electricityPrice;
      }

      if (!waterUsage && bill.waterPrice && bill.waterPrice > 0 && bill.waterFee) {
        waterUsage = bill.waterFee / bill.waterPrice;
      }

      let damageFee = bill.damageFee;
      if (damageFee === null || damageFee === undefined) {
        const baseTotal = (bill.electricityFee || 0) + (bill.waterFee || 0) + (bill.serviceFee || 0);
        const calculatedDamageFee = (bill.totalAmount || 0) - baseTotal;
        damageFee = calculatedDamageFee > 0 ? calculatedDamageFee : 0;
      }

      return {
        ...bill,
        damageFee,
        electricityUsage,
        waterUsage,
      };
    });
  }, []);

  // Load bills on component mount
  useEffect(() => {
    const initialBills = processBills(contract.bills || []);
    setBills(initialBills);
    setLoading(false);
  }, [contract, processBills]);

  // Refresh bills
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const updatedBills = await BillService.getByContract(contract.id);
      setBills(processBills(updatedBills));
    } catch (error) {
      console.error('Error refreshing bills:', error);
      Alert.alert('Error', 'Failed to refresh bills');
    } finally {
      setRefreshing(false);
    }
  }, [contract.id, processBills]);

  // Handle payment
  const handlePayment = useCallback((bill: BillData) => {
    setSelectedBill(bill);
    setPaymentModalOpen(true);
  }, []);

  // Handle payment confirmation
  const handlePaymentConfirm = useCallback(async () => {
    setPaymentModalOpen(false);
    setPaymentLoading(true);

    try {
      // Reload bills after payment
      const updatedBills = await BillService.getByContract(contract.id);
      setBills(processBills(updatedBills));
      Alert.alert('Success', 'Payment processed successfully! Bill status updated.');
      setSelectedBill(null);
    } catch (error) {
      console.error('Error reloading bills:', error);
      Alert.alert('Success', 'Payment processed successfully!');
    } finally {
      setPaymentLoading(false);
    }
  }, [contract.id, processBills]);

  // Filter bills
  const filteredBills = bills.filter((bill: BillData) => {
    const matchesSearch =
      bill.month.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.totalAmount.toString().includes(searchText);

    let matchesStatus = true;
    if (statusFilter) {
      matchesStatus = bill.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalBills = bills.length;
  const paidBills = bills.filter((b) => b.status === 'PAID').length;
  const pendingBills = bills.filter((b) => b.status === 'PENDING').length;
  const overdueBills = bills.filter((b) => b.status === 'OVERDUE').length;
  const totalAmount = bills.reduce((sum, b) => sum + b.totalAmount, 0);
  const unpaidAmount = bills
    .filter((b) => b.status !== 'PAID')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading bills...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Statistics Cards */}
      <View style={styles.statisticsContainer}>
        <StatisticCard
          icon="receipt"
          label="Total Bills"
          value={totalBills.toString()}
          color={Colors.primary}
        />
        <StatisticCard
          icon="check-circle"
          label="Paid"
          value={paidBills.toString()}
          color="#4CAF50"
        />
        <StatisticCard
          icon="clock-outline"
          label="Pending"
          value={pendingBills.toString()}
          color="#FFA500"
        />
        <StatisticCard
          icon="alert-circle"
          label="Overdue"
          value={overdueBills.toString()}
          color="#D32F2F"
        />
      </View>

      {/* Amount Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryAmount}>{totalAmount.toLocaleString()} đ</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={styles.summaryLabel}>Unpaid Amount</Text>
            <Text style={[styles.summaryAmount, { color: '#D32F2F' }]}>
              {unpaidAmount.toLocaleString()} đ
            </Text>
          </View>
        </View>
      </View>

      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              statusFilter === null && styles.filterChipActive,
            ]}
            onPress={() => setStatusFilter(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                statusFilter === null && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {Object.entries(billStatusMap).map(([status, info]) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterChip,
                statusFilter === status && styles.filterChipActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <MaterialCommunityIcons
                name={info.icon as any}
                size={14}
                color={statusFilter === status ? '#FFF' : info.color}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === status && styles.filterChipTextActive,
                  { color: statusFilter === status ? '#FFF' : info.color },
                ]}
              >
                {info.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bills List */}
      <View style={styles.billsContainer}>
        {filteredBills.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={48} color="#BDBDBD" />
            <Text style={styles.emptyText}>No bills found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBills}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <BillCard
                bill={item}
                onViewDetail={() => {
                  setSelectedBill(item);
                  setDetailModalOpen(true);
                }}
                onPayment={() => handlePayment(item)}
                onViewImage={(imageUrl) => {
                  setSelectedImageUrl(imageUrl);
                  setImagePreviewOpen(true);
                }}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
      </View>

      {/* Modals */}
      <BillDetailModal
        open={detailModalOpen}
        bill={selectedBill}
        contract={contract}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedBill(null);
        }}
      />

      <BillPaymentModal
        open={paymentModalOpen}
        bill={selectedBill}
        contract={contract}
        loading={paymentLoading}
        onConfirm={handlePaymentConfirm}
        onCancel={() => {
          setPaymentModalOpen(false);
          setSelectedBill(null);
        }}
      />

      {/* Image Preview Modal */}
      <Modal visible={imagePreviewOpen} transparent onRequestClose={() => setImagePreviewOpen(false)}>
        <View style={styles.imagePreviewContainer}>
          <TouchableOpacity
            style={styles.imagePreviewClose}
            onPress={() => setImagePreviewOpen(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
          {selectedImageUrl && (
            <RNImage style={styles.previewImage} source={{ uri: selectedImageUrl }} />
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

/**
 * Statistic Card Component
 */
interface StatisticCardProps {
  icon: string;
  label: string;
  value: string;
  color: string;
}

const StatisticCard: React.FC<StatisticCardProps> = ({ icon, label, value, color }) => (
  <View style={styles.statisticCard}>
    <View style={[styles.statisticIconContainer, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.statisticValue}>{value}</Text>
    <Text style={styles.statisticLabel}>{label}</Text>
  </View>
);

/**
 * Bill Card Component
 */
interface BillCardProps {
  bill: BillData;
  onViewDetail: () => void;
  onPayment: () => void;
  onViewImage: (url: string) => void;
}

const BillCard: React.FC<BillCardProps> = ({ bill, onViewDetail, onPayment, onViewImage }) => {
  const statusInfo = billStatusMap[bill.status];
  const canPay = bill.status === 'PENDING' || bill.status === 'OVERDUE';

  const formatMonth = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.billCard}>
      {/* Bill Header */}
      <View style={styles.billHeader}>
        <View style={styles.billInfo}>
          <Text style={styles.billMonth}>{formatMonth(bill.month)}</Text>
          <Text style={styles.billAmount}>{bill.totalAmount.toLocaleString()} đ</Text>
        </View>
        <View
          style={[
            styles.billStatusBadge,
            { backgroundColor: `${statusInfo.color}20` },
          ]}
        >
          <MaterialCommunityIcons
            name={statusInfo.icon as any}
            size={16}
            color={statusInfo.color}
            style={{ marginRight: 4 }}
          />
          <Text style={[styles.billStatusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Bill Details Grid */}
      <View style={styles.billDetails}>
        <BillDetailItem
          icon="lightning-bolt"
          label="Electricity"
          value={`${bill.electricityFee.toLocaleString()} đ`}
          subtext={
            bill.electricityUsage && bill.electricityPrice
              ? `${bill.electricityUsage.toFixed(2)} kWh`
              : undefined
          }
          color="#FFC107"
        />
        <BillDetailItem
          icon="water"
          label="Water"
          value={`${bill.waterFee.toLocaleString()} đ`}
          subtext={
            bill.waterUsage && bill.waterPrice
              ? `${bill.waterUsage.toFixed(2)} m³`
              : undefined
          }
          color="#2196F3"
        />
        <BillDetailItem
          icon="home-circle"
          label="Service"
          value={`${bill.serviceFee.toLocaleString()} đ`}
          color="#4CAF50"
        />
        {bill.damageFee && bill.damageFee > 0 && (
          <BillDetailItem
            icon="alert-circle"
            label="Damage"
            value={`${bill.damageFee.toLocaleString()} đ`}
            color="#D32F2F"
          />
        )}
      </View>

      {/* Bill Note */}
      {bill.note && (
        <View style={styles.billNote}>
          <MaterialCommunityIcons name="note-text" size={14} color="#9E9E9E" />
          <Text style={styles.billNoteText}>{bill.note}</Text>
        </View>
      )}

      {/* Image Proof */}
      {bill.imageProof && (
        <TouchableOpacity
          style={styles.billImageProof}
          onPress={() => onViewImage(bill.imageProof!)}
        >
          <MaterialCommunityIcons name="image" size={16} color={Colors.primary} />
          <Text style={styles.billImageProofText}>View Payment Proof</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      <View style={styles.billActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={onViewDetail}
        >
          <MaterialCommunityIcons name="eye-outline" size={16} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Details</Text>
        </TouchableOpacity>

        {canPay && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={onPayment}
          >
            <MaterialCommunityIcons name="credit-card" size={16} color="#FFF" />
            <Text style={[styles.actionButtonText, { color: '#FFF' }]}>Pay Now</Text>
          </TouchableOpacity>
        )}

        {bill.status === 'CONFIRMING' && (
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonDisabled]} disabled>
            <MaterialCommunityIcons name="sync" size={16} color="#BDBDBD" />
            <Text style={[styles.actionButtonText, { color: '#BDBDBD' }]}>Confirming...</Text>
          </TouchableOpacity>
        )}

        {bill.status === 'PAID' && (
          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSuccess]} disabled>
            <MaterialCommunityIcons name="check-circle" size={16} color="#4CAF50" />
            <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Paid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

/**
 * Bill Detail Item Component
 */
interface BillDetailItemProps {
  icon: string;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}

const BillDetailItem: React.FC<BillDetailItemProps> = ({ icon, label, value, subtext, color }) => (
  <View style={styles.billDetailItem}>
    <View style={[styles.detailIcon, { backgroundColor: `${color}20` }]}>
      <MaterialCommunityIcons name={icon as any} size={18} color={color} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
      {subtext && <Text style={styles.detailSubtext}>{subtext}</Text>}
    </View>
  </View>
);

export default TenantBillsTab;
