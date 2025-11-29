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
import { ContractService } from '../../../../services/ContractService';
import { ContractDisplayData, statusMap, ContractStatus } from './types';
import { ContractData } from '../../../../types/types';
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
  const [sortField, setSortField] = useState<'startDate' | 'endDate' | 'monthlyRent' | 'status' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination (chủ yếu cho landlord)
  const [pageSize] = useState(50); // Tăng pageSize để load nhiều hơn

  // User role state
  const [userRole, setUserRole] = useState<'Landlords' | 'Users' | null>(null);

  // ===== HELPERS =====
  const transformContractData = (contract: ContractData): ContractDisplayData => {
    // Ensure status is valid ContractStatus, default to 0 if invalid
    const validStatus: ContractStatus = ([0, 1, 2, 3] as ContractStatus[]).includes(contract.status as ContractStatus) 
      ? contract.status as ContractStatus 
      : 0;
    
    // Use actual names from API if available, otherwise fallback to ID-based display
    const roomTitle = contract.roomTitle && !contract.roomTitle.startsWith('#') 
      ? contract.roomTitle 
      : `Room #${contract.roomId.substring(0, 8)}`;
    
    const landlordName = contract.landlordName && !contract.landlordName.startsWith('#') && !contract.landlordName.includes('Landlord #')
      ? contract.landlordName 
      : `Landlord #${contract.landlordId.substring(0, 8)}`;
    
    const tenantName = contract.tenantName && !contract.tenantName.startsWith('#') && !contract.tenantName.includes('Tenant #')
      ? contract.tenantName 
      : `Tenant #${contract.tenantId.substring(0, 8)}`;
    
    const contractName = contract.contractName && !contract.contractName.startsWith('#') && !contract.contractName.includes('Contract #')
      ? contract.contractName 
      : `Contract #${contract.id.substring(0, 8)}`;
    
    return {
      ...contract,
      status: validStatus,
      roomTitle,
      landlordName,
      contractName,
      tenantName,
    };
  };

  // ===== FETCH DATA =====
  const fetchContracts = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      console.log(' Đang lấy danh sách hợp đồng...');

      // Lấy userData từ AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      if (!userDataStr) {
        throw new Error('Vui lòng đăng nhập để xem hợp đồng');
      }

      const userData = JSON.parse(userDataStr);
      const userId = userData.id;
      const userRoles = userData.roles || [];

      // Xác định role chính
      const isLandlord = userRoles.includes('Landlords');
      const isUser = userRoles.includes('Users');
      const primaryRole = isLandlord ? 'Landlords' : 'Users';
      setUserRole(primaryRole);

      console.log(' User ID:', userId, 'Roles:', userRoles, 'Primary Role:', primaryRole);

      let data: ContractData[] = [];

      // Kiểm tra role để gọi API phù hợp
      if (userRoles.includes('Landlords')) {
        // Landlord: lấy hợp đồng với pageSize lớn
        console.log(' Landlord mode - fetching contracts by landlord');
        const response = await ContractService.getByLandlord(userId, 0, pageSize);
        data = response.content || [];
      } else {
        // Tenant/User: lấy hợp đồng của tenant
        console.log('‍ Tenant mode - fetching contracts by tenant');
        data = await ContractService.getByTenant(userId);
      }

      // Transform data để hiển thị
      const displayData = data.map(transformContractData);
      
      console.log(` Đã lấy ${displayData.length} hợp đồng`);
      setContracts(displayData);
      setError(null);
    } catch (err: any) {
      console.error(' Lỗi khi lấy hợp đồng:', err.message);
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
  const filteredContracts = contracts
    .filter((contract) => {
      // Search filter
      const matchesSearch =
        (contract.roomTitle?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (contract.landlordName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (contract.contractName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
        (contract.tenantName?.toLowerCase() || '').includes(searchText.toLowerCase());

      // Status filter
      const matchesStatus =
        statusFilter === null || contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue: any, bValue: any;

      switch (sortField) {
        case 'startDate':
        case 'endDate':
          aValue = new Date(a[sortField]).getTime();
          bValue = new Date(b[sortField]).getTime();
          break;
        case 'monthlyRent':
          aValue = a.monthlyRent;
          bValue = b.monthlyRent;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // ===== CALCULATE STATS =====
  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === 0 as ContractStatus).length,
    terminated: contracts.filter((c) => c.status === 1 as ContractStatus).length,
    expired: contracts.filter((c) => c.status === 2 as ContractStatus).length,
    pending: contracts.filter((c) => c.status === 3 as ContractStatus).length,
  };

  // ===== HANDLERS =====
  const handleViewDetail = (contract: ContractDisplayData) => {
    console.log('️ Navigate to contract detail:', contract.id);
    (navigation as any).navigate('Users/ContractDetail', { contract });
  };

  const handleFilterByStatus = (status: ContractStatus | null) => {
    setStatusFilter(status);
    console.log(' Lọc theo trạng thái:', status !== null ? statusMap[status].text : 'All');
  };

  // ===== RENDER ITEM =====
  const renderItem = ({ item }: { item: ContractDisplayData }) => (
    <ContractCard contract={item} onPress={handleViewDetail} userRole={userRole} />
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
        <Text style={styles.headerTitle}>
          {userRole === 'Landlords' ? 'Hợp Đồng Quản Lý' : 'Hợp Đồng Của Tôi'}
        </Text>
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
              statusFilter === (0 as ContractStatus) && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(0 as ContractStatus)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === (0 as ContractStatus) && styles.filterButtonTextActive,
              ]}
            >
              Đang thuê ({stats.active})
            </Text>
          </TouchableOpacity>

          {/* Pending */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === (3 as ContractStatus) && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(3 as ContractStatus)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === (3 as ContractStatus) && styles.filterButtonTextActive,
              ]}
            >
              Chờ xử lý ({stats.pending})
            </Text>
          </TouchableOpacity>

          {/* Expired */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === (2 as ContractStatus) && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(2 as ContractStatus)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === (2 as ContractStatus) && styles.filterButtonTextActive,
              ]}
            >
              Hết hạn ({stats.expired})
            </Text>
          </TouchableOpacity>

          {/* Terminated */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === (1 as ContractStatus) && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterByStatus(1 as ContractStatus)}
          >
            <Text
              style={[
                styles.filterButtonText,
                statusFilter === (1 as ContractStatus) && styles.filterButtonTextActive,
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
