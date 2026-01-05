import React from 'react';
import { View, SafeAreaView, TouchableOpacity, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ContractCardDetail from './components/ContractCardDetail';
import { ContractDisplayData } from './types';
import { ContractData } from '../../../../types/types';

type ContractDetailRouteProp = RouteProp<{
  ContractDetail: {
    contract: ContractDisplayData;
  };
}, 'ContractDetail'>;

export default function ContractDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<ContractDetailRouteProp>();
  const { contract } = route.params;

  const handleContractUpdate = (updatedContract: ContractData) => {
    // Navigate back with updated data
    navigation.goBack();
    // You can pass updated data back if needed
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      {/* Custom Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0'
      }}>
        <TouchableOpacity onPress={handleClose} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#1976D2" />
        </TouchableOpacity>
        <Text style={{
          fontSize: 18,
          fontWeight: 'bold',
          color: '#1A1A1A',
          marginLeft: 16
        }}>
          Chi tiết hợp đồng
        </Text>
      </View>

      {/* Contract Detail Content */}
      <ContractCardDetail
        contract={contract}
        onContractUpdate={handleContractUpdate}
      />
    </SafeAreaView>
  );
}