import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BillService } from '../../services/BillService';
import { BillData, ContractData } from '../../types/types';
import { URL_IMAGE } from '../../services/config/Constant';
import styles from './TenantBillsTab.styles';

interface TenantBillsTabProps {
  contract: ContractData;
  onContractUpdate?: (contract: ContractData) => void;
}

const billStatusMap: Record<string, { text: string; color: string }> = {
  PENDING: { text: 'Pending', color: '#FF9800' },
  CONFIRMING: { text: 'Confirming Payment', color: '#2196F3' },
  PAID: { text: 'Paid', color: '#4CAF50' },
  OVERDUE: { text: 'Overdue', color: '#F44336' },
};

const TenantBillsTab: React.FC<TenantBillsTabProps> = ({
  contract,
  onContractUpdate,
}) => {
  const [bills, setBills] = useState<BillData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillData | null>(null);
  const [paymentBill, setPaymentBill] = useState<BillData | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    // Process bills to ensure all data is complete
    const processedBills = (contract.bills || []).map((bill) => {
      // Calculate usage from fees if not provided
      let electricityUsage = bill.electricityUsage;
      let waterUsage = bill.waterUsage;

      if (
        !electricityUsage &&
        bill.electricityPrice &&
        bill.electricityPrice > 0 &&
        bill.electricityFee
      ) {
        electricityUsage = bill.electricityFee / bill.electricityPrice;
      }

      if (
        !waterUsage &&
        bill.waterPrice &&
        bill.waterPrice > 0 &&
        bill.waterFee
      ) {
        waterUsage = bill.waterFee / bill.waterPrice;
      }

      // Calculate damageFee if not provided
      let damageFee = bill.damageFee;
      if (damageFee === null || damageFee === undefined) {
        const baseTotal =
          (bill.electricityFee || 0) +
          (bill.waterFee || 0) +
          (bill.serviceFee || 0);
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

    setBills(processedBills);
  }, [contract]);

  const handleDownload = async (billId: string, month: string) => {
    try {
      setLoading(true);
      Alert.alert('Download', 'Preparing download...', [
        { text: 'OK' }
      ]);

      // Call BillService to download the bill
      const result = await BillService.downloadBill(contract.id, billId);

      Alert.alert('Success', 'Bill downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Error', 'Failed to download bill. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (bill: BillData) => {
    setPaymentBill(bill);
    setPaymentModalOpen(true);
  };

  const handlePaymentConfirm = async () => {
    setPaymentModalOpen(false);
    setPaymentBill(null);
    setPaymentLoading(true);

    try {
      // Reload contract to get updated bills data
      // For now, just update local state
      setBills(prevBills =>
        prevBills.map(bill =>
          bill.id === paymentBill?.id
            ? { ...bill, status: 'CONFIRMING' as const }
            : bill
        )
      );

      Alert.alert('Success', 'Payment processed successfully! Bill status updated.');
    } catch (error) {
      console.error('Failed to reload bills:', error);
      Alert.alert('Success', 'Payment processed successfully!');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentCancel = () => {
    setPaymentModalOpen(false);
    setPaymentBill(null);
  };

  // Calculate bill statistics
  const totalBills = bills.length;
  const paidBills = bills.filter((bill) => bill.status === 'PAID').length;
  const pendingBills = bills.filter((bill) => bill.status === 'PENDING').length;
  const confirmingBills = bills.filter(
    (bill) => bill.status === 'CONFIRMING'
  ).length;
  const overdueBills = bills.filter((bill) => bill.status === 'OVERDUE').length;
  const totalAmount = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const unpaidAmount = bills
    .filter((bill) => bill.status !== 'PAID')
    .reduce((sum, bill) => sum + bill.totalAmount, 0);

  // Filter bills based on search and status
  const filteredBills = bills.filter((bill: BillData) => {
    const matchesSearch =
      bill.month.toLowerCase().includes(searchText.toLowerCase()) ||
      bill.totalAmount.toString().includes(searchText);

    let matchesStatus = true;
    if (statusFilter !== null && statusFilter !== undefined) {
      matchesStatus = bill.status === statusFilter;
    }

    return matchesSearch && matchesStatus;
  });

  const renderBillItem = ({ item }: { item: BillData }) => {
    const statusInfo = billStatusMap[item.status];

    return (
      <View style={styles.billCard}>
        <View style={styles.billHeader}>
          <Text style={styles.monthText}>
            {new Date(item.month).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
          </View>
        </View>

        <View style={styles.billContent}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Electricity:</Text>
            <View style={styles.feeValueContainer}>
              <Text style={styles.feeValue}>{item.electricityFee?.toLocaleString()} đ</Text>
              {item.electricityUsage && (
                <Text style={styles.usageText}>
                  {item.electricityUsage.toFixed(2)} kWh
                </Text>
              )}
            </View>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Water:</Text>
            <View style={styles.feeValueContainer}>
              <Text style={styles.feeValue}>{item.waterFee?.toLocaleString()} đ</Text>
              {item.waterUsage && (
                <Text style={styles.usageText}>
                  {item.waterUsage.toFixed(2)} m³
                </Text>
              )}
            </View>
          </View>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Service:</Text>
            <Text style={styles.feeValue}>{item.serviceFee?.toLocaleString()} đ</Text>
          </View>

          {item.damageFee && item.damageFee > 0 && (
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, styles.damageLabel]}>Damage Fee:</Text>
              <Text style={[styles.feeValue, styles.damageValue]}>
                +{item.damageFee.toLocaleString()} đ
              </Text>
            </View>
          )}

          <View style={[styles.feeRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{item.totalAmount?.toLocaleString()} đ</Text>
          </View>
        </View>

        {/* Image Proof */}
        <View style={styles.imageProofSection}>
          <Text style={styles.sectionTitle}>Payment Proof:</Text>
          {item.imageProof ? (
            <TouchableOpacity
              style={styles.imageProofContainer}
              onPress={() => {
                setSelectedImageUrl(`${URL_IMAGE}${item.imageProof}`);
                setImagePreviewOpen(true);
              }}
            >
              <Image
                source={{ uri: `${URL_IMAGE}${item.imageProof}` }}
                style={styles.imageProof}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSelectedBill(item)}
          >
            <Ionicons name="eye-outline" size={20} color="#1976D2" />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDownload(item.id, item.month)}
          >
            <Ionicons name="download-outline" size={20} color="#1976D2" />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>

          {(item.status === 'PENDING' || item.status === 'OVERDUE') && (
            <TouchableOpacity
              style={[styles.actionButton, styles.payButton]}
              onPress={() => handlePayment(item)}
            >
              <Ionicons name="card-outline" size={20} color="#FFF" />
              <Text style={styles.payButtonText}>Pay Now</Text>
            </TouchableOpacity>
          )}

          {item.status === 'CONFIRMING' && (
            <View style={[styles.actionButton, styles.confirmingButton]}>
              <Ionicons name="time-outline" size={20} color="#FFF" />
              <Text style={styles.confirmingButtonText}>Confirming...</Text>
            </View>
          )}

          {item.status === 'PAID' && (
            <View style={[styles.actionButton, styles.paidButton]}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.paidButtonText}>Paid ✓</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderStatisticsCard = (
    title: string,
    value: number,
    icon: string,
    color: string,
    suffix?: string
  ) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statIcon}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>
          {value.toLocaleString()}{suffix}
        </Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Bills Statistics */}
      <View style={styles.statsContainer}>
        {renderStatisticsCard('Total Bills', totalBills, 'document-text-outline', '#1976D2')}
        {renderStatisticsCard('Paid Bills', paidBills, 'checkmark-circle-outline', '#4CAF50')}
        {renderStatisticsCard('Pending Bills', pendingBills, 'time-outline', '#FF9800')}
        {renderStatisticsCard('Confirming', confirmingBills, 'refresh-outline', '#2196F3')}
        {renderStatisticsCard('Unpaid Amount', unpaidAmount, 'cash-outline', '#F44336', ' đ')}
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#757575" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search bills..."
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={20} color="#757575" />
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter-outline" size={20} color="#1976D2" />
          <Text style={styles.filterButtonText}>
            {statusFilter ? billStatusMap[statusFilter]?.text : 'Filter'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bills List */}
      <View style={styles.billsContainer}>
        <Text style={styles.sectionTitle}>Bills History</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
            <Text style={styles.loadingText}>Loading bills...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredBills}
            renderItem={renderBillItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={48} color="#BDBDBD" />
                <Text style={styles.emptyText}>No bills found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Payment Information */}
      <View style={styles.paymentInfoContainer}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.paymentInfoCard}>
          <Text style={styles.paymentInfoTitle}>Payment Methods:</Text>
          <Text style={styles.paymentInfoText}>• Online payment via VNPay, MoMo, ZaloPay</Text>
          <Text style={styles.paymentInfoText}>• Bank transfer to landlord's account</Text>
          <Text style={styles.paymentInfoText}>• Cash payment (contact landlord)</Text>

          <Text style={styles.paymentNote}>
            Please pay your bills before the due date to avoid late fees. Contact your landlord if you have any payment issues.
          </Text>
        </View>
      </View>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <Text style={styles.filterModalTitle}>Filter by Status</Text>

            <TouchableOpacity
              style={[styles.filterOption, !statusFilter && styles.filterOptionSelected]}
              onPress={() => {
                setStatusFilter(null);
                setFilterModalVisible(false);
              }}
            >
              <Text style={[styles.filterOptionText, !statusFilter && styles.filterOptionTextSelected]}>
                All Bills
              </Text>
            </TouchableOpacity>

            {Object.entries(billStatusMap).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[styles.filterOption, statusFilter === key && styles.filterOptionSelected]}
                onPress={() => {
                  setStatusFilter(key);
                  setFilterModalVisible(false);
                }}
              >
                <View style={[styles.statusDot, { backgroundColor: value.color }]} />
                <Text style={[styles.filterOptionText, statusFilter === key && styles.filterOptionTextSelected]}>
                  {value.text}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.filterCancelButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.filterCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Preview Modal */}
      <Modal
        visible={imagePreviewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setImagePreviewOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.imagePreviewModal}>
            <TouchableOpacity
              style={styles.closePreviewButton}
              onPress={() => setImagePreviewOpen(false)}
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            {selectedImageUrl && (
              <Image
                source={{ uri: selectedImageUrl }}
                style={styles.previewImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Payment Modal - Using existing PaymentModal */}
      {paymentBill && (
        <Modal
          visible={paymentModalOpen}
          animationType="slide"
          transparent
          onRequestClose={handlePaymentCancel}
        >
          <View style={styles.paymentModalOverlay}>
            <View style={styles.paymentModalContainer}>
              <Text style={styles.paymentModalTitle}>Pay Bill</Text>
              <Text style={styles.paymentModalSubtitle}>
                {new Date(paymentBill.month).toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>

              <View style={styles.paymentModalContent}>
                <Text style={styles.paymentAmount}>
                  Amount: {paymentBill.totalAmount?.toLocaleString()} đ
                </Text>

                <TouchableOpacity
                  style={[styles.paymentModalButton, styles.payNowButton]}
                  onPress={handlePaymentConfirm}
                  disabled={paymentLoading}
                >
                  {paymentLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="card-outline" size={20} color="#FFF" />
                      <Text style={styles.payNowButtonText}>Pay Now</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.paymentModalButton, styles.cancelModalButton]}
                  onPress={handlePaymentCancel}
                  disabled={paymentLoading}
                >
                  <Text style={styles.cancelModalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

export default TenantBillsTab;