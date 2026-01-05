import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../../../colors/colors';
import { BillData, ContractData } from '../../../../../types/types';
import { styles } from './BillDetailModal.styles';

interface BillDetailModalProps {
  open: boolean;
  bill: BillData | null;
  contract: ContractData;
  onClose: () => void;
}

const BillDetailModal: React.FC<BillDetailModalProps> = ({
  open,
  bill,
  contract,
  onClose,
}) => {
  if (!bill) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: '#FFF3E0', text: '#F57C00' },
    CONFIRMING: { bg: '#E3F2FD', text: '#1976D2' },
    PAID: { bg: '#E8F5E9', text: '#388E3C' },
    OVERDUE: { bg: '#FFEBEE', text: '#D32F2F' },
  };

  const statusColor = statusColors[bill.status] || { bg: '#F5F5F5', text: '#9E9E9E' };

  return (
    <Modal visible={open} transparent animationType="slide">
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.content}>
          {/* Bill Header Section */}
          <View style={styles.section}>
            <View style={styles.billHeaderSection}>
              <View>
                <Text style={styles.billMonth}>{formatDate(bill.month)}</Text>
                <Text style={styles.billAmount}>{bill.totalAmount.toLocaleString()} đ</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor.bg },
                ]}
              >
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                  {bill.status}
                </Text>
              </View>
            </View>
          </View>

          {/* Contract Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contract Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contract</Text>
              <Text style={styles.infoValue}>{contract.contractName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Room</Text>
              <Text style={styles.infoValue}>{contract.roomTitle}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tenant</Text>
              <Text style={styles.infoValue}>{contract.tenantName}</Text>
            </View>
          </View>

          {/* Utility Charges */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Utility Charges</Text>

            {/* Electricity */}
            <View style={styles.chargeCard}>
              <View style={styles.chargeHeader}>
                <MaterialCommunityIcons
                  name="lightning-bolt"
                  size={20}
                  color="#FFC107"
                />
                <Text style={styles.chargeLabel}>Electricity</Text>
              </View>
              <View style={styles.chargeDetails}>
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeDescLabel}>Usage</Text>
                  <Text style={styles.chargeDescValue}>
                    {bill.electricityUsage?.toFixed(2) || 'N/A'} kWh
                  </Text>
                </View>
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeDescLabel}>Price</Text>
                  <Text style={styles.chargeDescValue}>
                    {bill.electricityPrice?.toLocaleString() || 'N/A'} đ/kWh
                  </Text>
                </View>
                <View style={styles.chargeDivider} />
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeTotalLabel}>Total</Text>
                  <Text style={styles.chargeTotalValue}>
                    {bill.electricityFee.toLocaleString()} đ
                  </Text>
                </View>
              </View>
            </View>

            {/* Water */}
            <View style={styles.chargeCard}>
              <View style={styles.chargeHeader}>
                <MaterialCommunityIcons
                  name="water"
                  size={20}
                  color="#2196F3"
                />
                <Text style={styles.chargeLabel}>Water</Text>
              </View>
              <View style={styles.chargeDetails}>
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeDescLabel}>Usage</Text>
                  <Text style={styles.chargeDescValue}>
                    {bill.waterUsage?.toFixed(2) || 'N/A'} m³
                  </Text>
                </View>
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeDescLabel}>Price</Text>
                  <Text style={styles.chargeDescValue}>
                    {bill.waterPrice?.toLocaleString() || 'N/A'} đ/m³
                  </Text>
                </View>
                <View style={styles.chargeDivider} />
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeTotalLabel}>Total</Text>
                  <Text style={styles.chargeTotalValue}>
                    {bill.waterFee.toLocaleString()} đ
                  </Text>
                </View>
              </View>
            </View>

            {/* Service Fee */}
            <View style={styles.chargeCard}>
              <View style={styles.chargeHeader}>
                <MaterialCommunityIcons
                  name="home-circle"
                  size={20}
                  color="#4CAF50"
                />
                <Text style={styles.chargeLabel}>Service Fee</Text>
              </View>
              <View style={styles.chargeDetails}>
                <View style={styles.chargeRow}>
                  <Text style={styles.chargeTotalLabel}>Amount</Text>
                  <Text style={styles.chargeTotalValue}>
                    {bill.serviceFee.toLocaleString()} đ
                  </Text>
                </View>
              </View>
            </View>

            {/* Damage Fee */}
            {bill.damageFee && bill.damageFee > 0 && (
              <View style={styles.chargeCard}>
                <View style={styles.chargeHeader}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={20}
                    color="#D32F2F"
                  />
                  <Text style={styles.chargeLabel}>Damage Fee</Text>
                </View>
                <View style={styles.chargeDetails}>
                  {bill.note && (
                    <>
                      <View style={styles.chargeRow}>
                        <Text style={styles.chargeDescLabel}>Description</Text>
                        <Text style={styles.chargeDescValue}>{bill.note}</Text>
                      </View>
                      <View style={styles.chargeDivider} />
                    </>
                  )}
                  <View style={styles.chargeRow}>
                    <Text style={styles.chargeTotalLabel}>Amount</Text>
                    <Text style={[styles.chargeTotalValue, { color: '#D32F2F' }]}>
                      {bill.damageFee.toLocaleString()} đ
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Total Amount */}
          <View style={styles.totalSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{bill.totalAmount.toLocaleString()} đ</Text>
            </View>
          </View>

          {/* Payment Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            <View style={styles.paymentInfo}>
              <View style={styles.paymentMethod}>
                <MaterialCommunityIcons
                  name="credit-card"
                  size={20}
                  color={Colors.primary}
                />
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentMethodLabel}>Online Payment</Text>
                  <Text style={styles.paymentMethodDesc}>
                    VNPay, MoMo, ZaloPay
                  </Text>
                </View>
              </View>
              <View style={styles.paymentMethod}>
                <MaterialCommunityIcons
                  name="bank"
                  size={20}
                  color={Colors.primary}
                />
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentMethodLabel}>Bank Transfer</Text>
                  <Text style={styles.paymentMethodDesc}>
                    To landlord's account
                  </Text>
                </View>
              </View>
              <View style={styles.paymentMethod}>
                <MaterialCommunityIcons
                  name="cash"
                  size={20}
                  color={Colors.primary}
                />
                <View style={styles.paymentContent}>
                  <Text style={styles.paymentMethodLabel}>Cash Payment</Text>
                  <Text style={styles.paymentMethodDesc}>
                    Contact landlord
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Notes */}
          {bill.note && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.noteCard}>
                <MaterialCommunityIcons
                  name="note-text"
                  size={16}
                  color="#FFC107"
                />
                <Text style={styles.noteText}>{bill.note}</Text>
              </View>
            </View>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
};

export default BillDetailModal;
