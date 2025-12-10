import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResidentData, ResidentService } from '../../../../services/ResidentService';
import { ContractService } from '../../../../services/ContractService';
import { ResidentCard } from './ResidentCard';
import { ResidentDetailModal } from './ResidentDetailModal';
import { ResidentEditModal } from './ResidentEditModal';
import { FilterModal, FilterOptions } from './FilterModal';
import {
  residentScreenStyles,
  Spacing,
  Typography,
} from './styles';

interface ExtendedResidentData extends Omit<ResidentData, 'fullName' | 'idNumber' | 'relationship' | 'contractId' | 'startDate' | 'status'> {
  id?: string;
  fullName?: string;
  idNumber?: string;
  contractId?: string;
  relationship?: string;
  status?: 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'REJECTED';
  note?: string;
  startDate: string;
  endDate?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  roomTitle?: string;
  contractName?: string;
  landlordName?: string;
  monthlyRent?: number;
}

interface Contract {
  id: string;
  roomTitle: string;
  contractName?: string;
  landlordName?: string;
  monthlyRent?: number;
}

/**
 * ResidentScreen - Mobile-first resident management screen
 * Features:
 * - Infinite scroll with FlatList
 * - Search bar + Filter button
 * - Pull-to-refresh
 * - Swipe actions on cards (Edit/Delete)
 * - Bottom sheet modals (Detail, Edit, Filter)
 * - Empty state with call-to-action
 */
export default function ResidentScreen() {
  // Data state
  const [residents, setResidents] = useState<ExtendedResidentData[]>([]);
  const [contractMap, setContractMap] = useState<{ [key: string]: Contract }>({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Modal state
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ExtendedResidentData | null>(null);
  const [editVisible, setEditVisible] = useState(false);
  const [editingResident, setEditingResident] = useState<ExtendedResidentData | null>(null);
  const [filterVisible, setFilterVisible] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    relationships: [],
    statuses: [],
  });

  // Loading states
  const [editLoading, setEditLoading] = useState(false);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [availableContracts, setAvailableContracts] = useState<Contract[]>([]);

  // User state
  const [userId, setUserId] = useState<string>('');

  // ============================================================================
  // INITIALIZATION & DATA LOADING
  // ============================================================================

  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    try {
      console.log('🔍 ResidentScreen.initializeScreen - Starting...');
      
      // Cố gắng lấy userId từ nhiều nguồn
      let storedUserId = await AsyncStorage.getItem('userId');
      console.log(`🔍 Kiểm tra 'userId': ${storedUserId}`);
      
      // Nếu không có userId, thử lấy từ userData
      if (!storedUserId) {
        const userDataStr = await AsyncStorage.getItem('userData');
        console.log(`🔍 Kiểm tra 'userData': ${userDataStr ? 'found' : 'not found'}`);
        
        if (userDataStr) {
          try {
            const userData = JSON.parse(userDataStr);
            storedUserId = userData.id || userData.userId;
            console.log(`✅ Tìm thấy userId từ userData: ${storedUserId}`);
          } catch (parseError) {
            console.error('❌ Lỗi parse userData:', parseError);
          }
        }
      }

      // Nếu vẫn không có, thử lấy từ userProfile
      if (!storedUserId) {
        const userProfileStr = await AsyncStorage.getItem('userProfile');
        console.log(`🔍 Kiểm tra 'userProfile': ${userProfileStr ? 'found' : 'not found'}`);
        
        if (userProfileStr) {
          try {
            const userProfile = JSON.parse(userProfileStr);
            storedUserId = userProfile.id;
            console.log(`✅ Tìm thấy userId từ userProfile: ${storedUserId}`);
          } catch (parseError) {
            console.error('❌ Lỗi parse userProfile:', parseError);
          }
        }
      }

      if (storedUserId) {
        console.log(`✅ Đã lấy được userId: ${storedUserId}`);
        setUserId(storedUserId);
        await loadContracts(storedUserId);
        await loadResidents(storedUserId);
      } else {
        console.error('❌ Không tìm thấy userId trong AsyncStorage');
        console.log('💾 Các key hiện có trong AsyncStorage:');
        
        // Debug: log all keys
        const allKeys = await AsyncStorage.getAllKeys();
        for (const key of allKeys) {
          const value = await AsyncStorage.getItem(key);
          if (key.includes('user') || key.includes('User')) {
            console.log(`  ${key}: ${value ? value.substring(0, 100) + '...' : 'null'}`);
          }
        }
        
        Alert.alert(
          'Lỗi',
          'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.',
          [
            {
              text: 'Đóng',
              onPress: () => {
                // Clear all stored data and return to login
                AsyncStorage.multiRemove(['userId', 'userData', 'userProfile', 'accessToken']);
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('❌ Lỗi khởi tạo màn hình:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Chi tiết: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadResidents = async (tenantId: string) => {
    try {
      console.log(`🔍 ResidentScreen.loadResidents - tenantId: ${tenantId}`);
      const data = await ResidentService.getByTenant(tenantId);
      
      // Enrich residents with contract details
      const enrichedResidents = data.map(resident => ({
        ...resident,
        roomTitle: contractMap[resident.contractId]?.roomTitle || 'Phòng không xác định',
        contractName: contractMap[resident.contractId]?.contractName,
        landlordName: contractMap[resident.contractId]?.landlordName,
        monthlyRent: contractMap[resident.contractId]?.monthlyRent,
      }));
      
      console.log(`✅ Tải danh sách cư dân thành công - Số lượng: ${enrichedResidents.length}`);
      setResidents(enrichedResidents);
      setHasMore(false); // For now, load all at once. Pagination can be added later
    } catch (error) {
      console.error('❌ Lỗi tải danh sách cư dân:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách cư dân');
    }
  };

  const loadContracts = async (tenantId: string) => {
    try {
      console.log(`🔍 ResidentScreen.loadContracts - tenantId: ${tenantId}`);
      setContractsLoading(true);
      
      // Fetch contracts from API using ContractService
      const contractsData = await ContractService.getByTenant(tenantId);
      
      // Build contract map and list
      const contracts: { [key: string]: Contract } = {};
      const contractList: Contract[] = [];
      
      for (const contract of contractsData) {
        const contractObj: Contract = {
          id: contract.id,
          roomTitle: contract.roomTitle || 'Phòng không xác định',
          contractName: contract.contractName,
          landlordName: contract.landlordName,
          monthlyRent: contract.monthlyRent,
        };
        
        contracts[contract.id] = contractObj;
        contractList.push(contractObj);
      }
      
      setContractMap(contracts);
      setAvailableContracts(contractList);
      console.log(`✅ Tải danh sách hợp đồng thành công - Số lượng: ${contractList.length}`);
    } catch (error) {
      console.error('❌ Lỗi tải danh sách hợp đồng:', error);
    } finally {
      setContractsLoading(false);
    }
  };

  // ============================================================================
  // SEARCH & FILTER
  // ============================================================================

  const filteredResidents = useCallback(() => {
    return residents.filter((resident) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        resident.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.idNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.roomTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resident.note?.toLowerCase().includes(searchQuery.toLowerCase());

      // Relationship filter
      const matchesRelationship =
        filters.relationships.length === 0 ||
        (resident.relationship && filters.relationships.includes(resident.relationship));

      // Status filter
      const matchesStatus =
        filters.statuses.length === 0 ||
        filters.statuses.includes(resident.status || '');

      return matchesSearch && matchesRelationship && matchesStatus;
    });
  }, [residents, searchQuery, filters]);

  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({ relationships: [], statuses: [] });
  };

  // ============================================================================
  // RESIDENT ACTIONS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadResidents(userId);
      await loadContracts(userId);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    // Implement pagination if needed
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    // Load more logic here
    setIsLoadingMore(false);
  };

  const handleSelectResident = (resident: ExtendedResidentData) => {
    setSelectedResident(resident);
    setDetailVisible(true);
  };

  const handleEditResident = (resident: ExtendedResidentData) => {
    setEditingResident(resident);
    setEditVisible(true);
  };

  const handleDeleteResident = (resident: ExtendedResidentData) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa cư dân "${resident.fullName}" không?\n\nHành động này không thể hoàn tác.`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!resident.id || !resident.contractId) {
                Alert.alert('Lỗi', 'Không thể xóa cư dân: thiếu thông tin');
                return;
              }
              await ResidentService.deleteResident(resident.contractId, resident.id);
              Alert.alert('Thành công', 'Xóa cư dân thành công');
              await loadResidents(userId);
            } catch (error: any) {
              console.error('❌ Lỗi xóa cư dân:', error);
              const errorMessage = error?.message || 'Không thể xóa cư dân';
              Alert.alert('Lỗi', errorMessage);
            }
          },
        },
      ]
    );
  };

  const handleSubmitEditResident = async (
    data: ResidentData,
    frontImageUri?: string,
    backImageUri?: string,
    frontImageFileName?: string,
    backImageFileName?: string
  ) => {
    try {
      setEditLoading(true);

      if (editingResident?.id) {
        // Update existing resident
        await ResidentService.updateResident(
          data.contractId,
          editingResident.id,
          data,
          frontImageUri,
          backImageUri,
          frontImageFileName,
          backImageFileName
        );
        Alert.alert('Thành công', 'Cập nhật cư dân thành công');
      } else {
        // Create new resident
        await ResidentService.createResident(
          data.contractId,
          data,
          frontImageUri,
          backImageUri,
          frontImageFileName,
          backImageFileName
        );
        Alert.alert('Thành công', 'Thêm cư dân thành công');
      }

      await loadResidents(userId);
      setEditVisible(false);
      setEditingResident(null);
    } catch (error) {
      console.error('❌ Lỗi lưu cư dân:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin cư dân');
      throw error;
    } finally {
      setEditLoading(false);
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderHeader = () => (
    <View style={residentScreenStyles.header}>
      <View style={residentScreenStyles.headerContent}>
        <View style={residentScreenStyles.headerLeft}>
          <Text style={residentScreenStyles.headerTitle}>
            Cư dân
          </Text>
          <Text style={residentScreenStyles.headerSubtitle}>
            {filteredResidents().length} cư dân
          </Text>
        </View>
        {/* Add Button in Header */}
        <Pressable
          style={residentScreenStyles.headerAddButton}
          onPress={() => {
            setEditingResident(null);
            setEditVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={residentScreenStyles.searchBar}>
      <View style={residentScreenStyles.searchContainer}>
        <View style={residentScreenStyles.searchInputContainer}>
          <Ionicons
            name="search"
            size={18}
            style={residentScreenStyles.searchIcon}
          />
          <TextInput
            style={residentScreenStyles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color="#9CA3AF"
              />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[
            residentScreenStyles.filterButton,
            (filters.relationships.length > 0 || filters.statuses.length > 0) &&
              residentScreenStyles.filterButtonActive,
          ]}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons
            name="funnel"
            size={20}
            color={filters.relationships.length > 0 || filters.statuses.length > 0 ? '#FFFFFF' : '#4B5563'}
          />
        </Pressable>
      </View>
    </View>
  );

  const renderResidentCard = ({ item }: { item: ExtendedResidentData }) => (
    <ResidentCard
      resident={item as ResidentData}
      roomTitle={item.roomTitle || 'Phòng không xác định'}
      onPress={() => handleSelectResident(item)}
      onEdit={() => handleEditResident(item)}
      onDelete={() => handleDeleteResident(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={residentScreenStyles.emptyContainer}>
      <Text style={residentScreenStyles.emptyIcon}>📋</Text>
      <Text
        style={[
          residentScreenStyles.emptyTitle,
        ]}
      >
        Không có cư dân
      </Text>
      <Text
        style={[
          residentScreenStyles.emptyMessage,
        ]}
      >
        {searchQuery || filters.relationships.length > 0 || filters.statuses.length > 0
          ? 'Không tìm thấy kết quả phù hợp'
          : 'Bạn chưa thêm cư dân nào. Hãy thêm cư dân mới bằng cách bấm nút +'}
      </Text>
      {(searchQuery || filters.relationships.length > 0 || filters.statuses.length > 0) && (
        <Pressable
          style={residentScreenStyles.emptyButton}
          onPress={handleClearSearch}
        >
          <Text style={residentScreenStyles.emptyButtonText}>
            Xóa bộ lọc
          </Text>
        </Pressable>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={residentScreenStyles.loadingContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text
          style={[
            residentScreenStyles.loadingText,
          ]}
        >
          Đang tải...
        </Text>
      </View>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[
          residentScreenStyles.container,
        ]}
      >
        <View style={residentScreenStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text
            style={[
              residentScreenStyles.loadingText,
            ]}
          >
            Đang tải dữ liệu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const displayedResidents = filteredResidents();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[
        residentScreenStyles.container,
      ]}
    >
      {renderHeader()}
      {renderSearchBar()}

      <FlatList
        data={displayedResidents}
        renderItem={renderResidentCard}
        keyExtractor={(item) => item.id || `${item.contractId}-${item.idNumber}`}
        contentContainerStyle={residentScreenStyles.listContentContainer}
        style={residentScreenStyles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            progressBackgroundColor='#FFFFFF'
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        scrollIndicatorInsets={{ right: 1 }}
        showsVerticalScrollIndicator={true}
      />

      {/* Modals */}
      <ResidentDetailModal
        visible={detailVisible}
        resident={selectedResident as ResidentData | null}
        roomTitle={selectedResident?.roomTitle}
        contractName={selectedResident?.contractName}
        landlordName={selectedResident?.landlordName}
        monthlyRent={selectedResident?.monthlyRent}
        onClose={() => {
          setDetailVisible(false);
          setSelectedResident(null);
        }}
        onEdit={() => {
          setDetailVisible(false);
          setEditingResident(selectedResident);
          setEditVisible(true);
        }}
      />

      <ResidentEditModal
        visible={editVisible}
        resident={editingResident as ResidentData | null | undefined}
        isLoading={editLoading}
        onClose={() => {
          setEditVisible(false);
          setEditingResident(null);
        }}
        onSubmit={handleSubmitEditResident}
        availableContracts={availableContracts}
        contractsLoading={contractsLoading}
      />

      <FilterModal
        visible={filterVisible}
        currentFilters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={handleFilterApply}
      />
    </SafeAreaView>
  );
}
