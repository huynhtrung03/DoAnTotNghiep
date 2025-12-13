import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '../../../../styles/colors';

interface TheKPICardProps {
  tieuDe: string;
  giaTri: number | string;
  tenIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  mauIcon: string;
}

export const TheKPICard: React.FC<TheKPICardProps> = ({
  tieuDe,
  giaTri,
  tenIcon,
  mauIcon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.noiDung}>
        <View style={[styles.vienIcon, { backgroundColor: mauIcon + '15' }]}>
          <MaterialCommunityIcons name={tenIcon} size={20} color={mauIcon} />
        </View>
        <Text style={styles.giaTri}>{giaTri}</Text>
        <Text style={styles.tieuDe}>{tieuDe}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  noiDung: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  vienIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  giaTri: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tieuDe: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
