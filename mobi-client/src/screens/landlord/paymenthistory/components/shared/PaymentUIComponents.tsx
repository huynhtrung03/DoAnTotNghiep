import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InfoBannerProps {
  message: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface WarningBoxProps {
  title: string;
  message: string;
}

/**
 * Info banner component
 */
export const InfoBanner: React.FC<InfoBannerProps> = ({
  message,
  iconName = 'information-circle',
  iconColor = '#1976D2',
  backgroundColor = '#E3F2FD',
  textColor = '#1976D2',
}) => {
  return (
    <View style={[styles.infoBanner, { backgroundColor }]}>
      <Ionicons name={iconName} size={20} color={iconColor} />
      <Text style={[styles.infoBannerText, { color: textColor }]}>{message}</Text>
    </View>
  );
};

/**
 * Warning box component
 */
export const WarningBox: React.FC<WarningBoxProps> = ({ title, message }) => {
  return (
    <View style={styles.warningBox}>
      <Ionicons name="warning" size={20} color="#F57C00" />
      <View style={styles.warningContent}>
        <Text style={styles.warningTitle}>{title}</Text>
        <Text style={styles.warningText}>{message}</Text>
      </View>
    </View>
  );
};

/**
 * Payment method badge component
 */
export const PaymentMethodBadge: React.FC = () => {
  return (
    <View style={styles.methodBadge}>
      <Ionicons
        name="logo-electron"
        size={20}
        color="#2E7D32"
        style={{ marginRight: 8 }}
      />
      <View style={styles.methodBadgeContent}>
        <Text style={styles.methodBadgeTitle}>Zalo Pay</Text>
        <Text style={styles.methodBadgeDescription}>Ví điện tử Zalo Pay</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoBannerText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 10,
    flex: 1,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#F57C00',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E65100',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#F57C00',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
  methodBadgeContent: {
    flex: 1,
  },
  methodBadgeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  methodBadgeDescription: {
    fontSize: 12,
    color: '#558B2F',
  },
});
