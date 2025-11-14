import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ContractService, ContractData } from '../../../../services/ContractService';
import { ContractDisplayData, statusMap, ContractStatus } from './types';
import { styles } from './styles';
import ContractCard from './components/ContractCard';
import Colors from '../../../../styles/colors';

const MyContracts = () => {
  const navigation = useNavigation();

  // ===== STATE =====
  const [contracts, setContracts] = useState<ContractDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Filter
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContractStatus | null>(null);

  // ===== HELPERS =====
  const transformContractData = (contract: ContractData): ContractDisplayData => {
    // TODO: Fetch room/landlord details from API
    // Hiện tại chỉ hiển thị ID, sau này có thể populate data
    return {
      ...contract,
      status: contract.status as ContractStatus, // Cast to specific type
      roomTitle: `Room #${contract.roomId.substring(0, 8)}`,
      landlordName: `Landlord #${contract.landlordId.substring(0, 8)}`,
      contractName: `Contract #${contract.id.substring(0, 8)}`,
      tenantName: `Tenant #${contract.tenantId.substring(0, 8)}`,
    };
  };

  // ===== FETCH DATA =====
  const fetchContracts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      console.log('📋 Đang lấy danh sách hợp đồng...');

      // Lấy userId từ AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        throw new Error('Vui lòng đăng nhập để xem hợp đồng');
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.id;

      // Gọi API
      const data = await ContractService.getByTenant(userId);
      
      // Transform data để hiển thị
      const displayData = data.map(transformContractData);
      
      console.log(`✅ Đã lấy ${displayData.length} hợp đồng`);
      setContracts(displayData);
      setError(null);
    } catch (err: any) {
      console.error('❌ Lỗi khi lấy hợp đồng:', err.message);
      setError(err.message || 'Không thể tải danh sách hợp đồng');
      setContracts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  // ===== REFRESH =====
  const onRefresh = useCallback(() => {
    fetchContracts(true);
  }, [fetchContracts]);

  // ===== FILTER CONTRACTS =====
  const filteredContracts = contracts.filter((contract) => {
    // Search filter
    const matchesSearch =
      (contract.roomTitle?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (contract.landlordName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      (contract.contractName?.toLowerCase() || '').includes(searchText.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === null || contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ===== CALCULATE STATS =====
  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === 0).length,
    terminated: contracts.filter((c) => c.status === 1).length,
    expired: contracts.filter((c) => c.status === 2).length,
    pending: contracts.filter((c) => c.status === 3).length,
  };

  // ===== HANDLERS =====
  const handleViewDetail = (contract: ContractDisplayData) => {
    console.log('👁️ Xem chi tiết hợp đồng:', contract.id);
    // TODO: Navigate to detail screen
    Alert.alert(
      'Chi tiết hợp đồng',
      `Hợp đồng: ${contract.contractName}\nPhòng: ${contract.roomTitle}\nTrạng thái: ${statusMap[contract.status].text}\nChức năng đang phát triển...`
    );
  };

  const handleFilterByStatus = (status: ContractStatus | null) => {
    setStatusFilter(status);
    console.log('🔍 Lọc theo trạng thái:', status !== null ? statusMap[status].text : 'All');
  };

  // ===== RENDER ITEM =====
  const renderItem = ({ item }: { item: ContractDisplayData }) => (
    <ContractCard contract={item} onPress={handleViewDetail} />
  );

  // ===== RENDER EMPTY =====
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>
          {searchText || statusFilter !== null
            ? 'Không tìm thấy hợp đồng phù hợp'
            : 'Chưa có hợp đồng nào'}
        </Text>
      </View>
    );
  };

  // ===== RENDER LOADING =====
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>Đang tải hợp đồng...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER ERROR =====
  if (error && contracts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hợp Đồng Của Tôi</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== RENDER =====
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" translucent={false} />
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hợp Đồng Của Tôi</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Tổng</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#52c41a' }]}>{stats.active}</Text>
          <Text style={styles.statLabel}>Đang thuê</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#fa8c16' }]}>{stats.expired}</Text>
          <Text style={styles.statLabel}>Hết hạn</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#f5222d' }]}>{stats.terminated}</Text>
          <Text style={styles.statLabel}>Đã kết thúc</Text>
        </View>
      </View>

      {/* Search & Filter */}
      <View style={styles.searchBar}>
        {/* Search Input */}
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm hợp đồng..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />

        {/* Status Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {/* All */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === null && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(null)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === null && styles.filterButtonTextActive,
              ]}
            >
              Tất cả ({stats.total})
            </Text>
          </TouchableOpacity>

          {/* Active */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 0 && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(0)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 0 && styles.filterButtonTextActive,
              ]}
            >
              Đang thuê ({stats.active})
            </Text>
          </TouchableOpacity>

          {/* Pending */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 3 && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(3)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 3 && styles.filterButtonTextActive,
              ]}
            >
              Chờ xử lý ({stats.pending})
            </Text>
          </TouchableOpacity>

          {/* Expired */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 2 && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(2)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 2 && styles.filterButtonTextActive,
              ]}
            >
              Hết hạn ({stats.expired})
            </Text>
          </TouchableOpacity>

          {/* Terminated */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 1 && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(1)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === 1 && styles.filterButtonTextActive,
              ]}
            >
              Đã kết thúc ({stats.terminated})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredContracts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.content}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1890ff']}
          />
        }
      />
    </SafeAreaView>
  );
};

export default MyContracts;
