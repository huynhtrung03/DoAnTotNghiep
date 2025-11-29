import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserRoles } from '../../../lib/auth';
import {
  getTransactionsByUserIdPaginated,
  getTransactionsByUserIdAndDateRange,
} from '../../../services/PaymentServive';
import { landlordService } from '../../../services/LandlordService';
import Colors from '../../../styles/colors';
import PaymentStats from './components/PaymentStats';
import PaymentFilter from './components/PaymentFilter';
import PaymentPagination from './components/PaymentPagination';
import AccountBalanceCard from './components/AccountBalanceCard';
import { useFocusEffect } from '@react-navigation/native';

interface Transaction {
  id: string;
  amount: number;
  transactionType: number; // 0: out, 1: in
  status: number; // 0: failed, 1: success
  transactionDate: string;
  description: string;
  transactionCode: string;
  bankTransactionName: string;
}

interface PaymentStatsData {
  successCount: number;
  failedCount: number;
  totalIn: number;
  totalOut: number;
}

interface FilterOptions {
  status: 'all' | 'success' | 'failed';
  startDate: string;
  endDate: string;
}

const PaymentHistoryScreen: React.FC = () => {
  // console.log(' PaymentHistoryScreen - Component rendered');

  const [isLandlord, setIsLandlord] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStatsData>({
    successCount: 0,
    failedCount: 0,
    totalIn: 0,
    totalOut: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    startDate: '',
    endDate: '',
  });
  const [landlordInfo, setLandlordInfo] = useState<any>(null);
  const [accountBalance, setAccountBalance] = useState<number>(0);

  // console.log(' PaymentHistoryScreen - State initialized:', {
  //   isLandlord,
  //   loading,
  //   transactionsCount: transactions.length,
  //   currentPage,
  //   totalRecords,
  //   landlordInfo: !!landlordInfo
  // });

  // Check if user is landlord
  useEffect(() => {
    // console.log(' PaymentHistoryScreen - useEffect checkUserRole triggered');
    const checkUserRole = async () => {
      try {
        // console.log(' PaymentHistoryScreen - Checking user roles...');
        const roles = await getUserRoles();
        // console.log('PaymentHistoryScreen - User roles:', roles);
        // Check for both 'LANDLORD' and 'Landlords' to handle different naming conventions
        const isUserLandlord = roles.includes('LANDLORD') || roles.includes('Landlords');
        // console.log('PaymentHistoryScreen - Is landlord:', isUserLandlord);
        setIsLandlord(isUserLandlord);

        if (!isUserLandlord) {
          // console.log(' PaymentHistoryScreen - User is not landlord, showing access denied');
          Alert.alert(
            'Truy cập bị từ chối',
            'Chỉ chủ nhà mới có thể truy cập trang này.',
            [{ text: 'OK' }]
          );
        } else {
          // console.log(' PaymentHistoryScreen - User is landlord, proceeding...');
        }
      } catch (error) {
        console.error(' PaymentHistoryScreen - Error checking user role:', error);
        setIsLandlord(false);
      }
    };

    checkUserRole();
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async (page: number = 1, filterOptions?: FilterOptions, isRefresh: boolean = false) => {
    // console.log(' PaymentHistoryScreen - loadTransactions called with:', { page, filterOptions, isRefresh });

    try {
      // console.log(' PaymentHistoryScreen - Setting loading to true');
      // Only set loading for initial load, not refresh
      if (!isRefresh) {
        setLoading(true);
      }
      // API uses page=0 for first page
      const apiPage = page - 1;
      // console.log('PaymentHistoryScreen - Loading transactions for page:', page, '-> API page:', apiPage);
      let data;

      if (filterOptions && (filterOptions.startDate || filterOptions.endDate)) {
        // console.log(' PaymentHistoryScreen - Using date range filter');
        // Filter by date range
        const startDate = filterOptions.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = filterOptions.endDate || new Date().toISOString().split('T')[0];
        // console.log('PaymentHistoryScreen - Filtering by date range:', startDate, 'to', endDate);
        data = await getTransactionsByUserIdAndDateRange(startDate, endDate, apiPage, pageSize);
      } else {
        // console.log(' PaymentHistoryScreen - Getting all transactions');
        // Get all transactions
        // console.log('PaymentHistoryScreen - Getting all transactions');
        data = await getTransactionsByUserIdPaginated(apiPage, pageSize);
      }

      // console.log(' PaymentHistoryScreen - API response received:', data);

      // Filter by status if needed
      let filteredTransactions = Array.isArray(data.transactions) ? data.transactions : [];
      // console.log(' PaymentHistoryScreen - Raw transactions count:', filteredTransactions.length);

      if (filterOptions && filterOptions.status !== 'all') {
        const statusFilter = filterOptions.status === 'success' ? 1 : 0;
        filteredTransactions = filteredTransactions.filter((t: Transaction) => t.status === statusFilter);
        // console.log('PaymentHistoryScreen - Filtered by status:', filterOptions.status, '->', filteredTransactions.length, 'transactions');
      }

      // console.log(' PaymentHistoryScreen - Setting state with:', {
      //   transactionsCount: filteredTransactions.length,
      //   totalRecords: data.totalRecords,
      //   currentPage: page,
      //   hasNewData: filteredTransactions.length !== transactions.length
      // });

      setTransactions(filteredTransactions);
      setTotalRecords(data.totalRecords || filteredTransactions.length || 0);
      setCurrentPage(page);

      // console.log(' PaymentHistoryScreen - State updated successfully:', {
      //   transactionsCount: filteredTransactions.length,
      //   totalRecords: data.totalRecords || filteredTransactions.length || 0,
      //   currentPage: page
      // });

      // Calculate stats
      // console.log(' PaymentHistoryScreen - Calculating stats...');
      calculateStats(filteredTransactions);
    } catch (error: any) {
      console.error(' PaymentHistoryScreen - Error loading transactions:', error);
      console.error(' PaymentHistoryScreen - Error details:', {
        message: error.message,
        status: error.status,
        response: error.response
      });
      const errorMessage = error.message || 'Không thể tải dữ liệu giao dịch';
      // console.log(' PaymentHistoryScreen - Showing error alert:', errorMessage);
      Alert.alert('Lỗi', errorMessage + '. Vui lòng thử lại.');
      // Only reset data on initial load error, preserve data on refresh error
      if (!isRefresh) {
        // console.log('️ PaymentHistoryScreen - Resetting data due to initial load error');
        setTransactions([]);
        setTotalRecords(0);
        setStats({
          successCount: 0,
          failedCount: 0,
          totalIn: 0,
          totalOut: 0,
        });
        setAccountBalance(0);
      } else {
        // console.log(' PaymentHistoryScreen - Preserving existing data due to refresh error');
      }
    } finally {
      // console.log(' PaymentHistoryScreen - loadTransactions completed, setting loading to false, refreshing to false');
      // console.log(' PaymentHistoryScreen - Final state:', {
      //   loading: false,
      //   refreshing: false,
      //   transactionsCount: transactions.length
      // });
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  // Calculate payment statistics
  const calculateStats = (transactionList: Transaction[]) => {
    // console.log(' PaymentHistoryScreen - calculateStats called with', transactionList.length, 'transactions');

    const statsData: PaymentStatsData = {
      successCount: 0,
      failedCount: 0,
      totalIn: 0,
      totalOut: 0,
    };

    transactionList.forEach((transaction, index) => {
      if (transaction.status === 1) {
        statsData.successCount++;
      } else {
        statsData.failedCount++;
      }

      if (transaction.transactionType === 1) {
        statsData.totalIn += transaction.amount;
      } else {
        statsData.totalOut += transaction.amount;
      }

      // Log every 10th transaction to avoid spam
      // if (index % 10 === 0 || index === transactionList.length - 1) {
      //   console.log(` PaymentHistoryScreen - Processed ${index + 1}/${transactionList.length} transactions`);
      // }
    });

    // console.log(' PaymentHistoryScreen - Final stats calculated:', statsData);
    setStats(statsData);

    // Calculate account balance (total in - total out)
    const balance = statsData.totalIn - statsData.totalOut;
    // console.log(' PaymentHistoryScreen - Account balance calculated:', balance);
    setAccountBalance(balance);
  };

  // Handle filter apply
  const handleFilterApply = (newFilters: FilterOptions) => {
    // console.log(' PaymentHistoryScreen - Filter apply triggered:', newFilters);
    setFilters(newFilters);
    loadTransactions(1, newFilters, false);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    // console.log(' PaymentHistoryScreen - Page change to:', page);
    loadTransactions(page, filters, false);
  };

  // Handle deposit
  const handleDeposit = () => {
    // console.log(' PaymentHistoryScreen - Deposit completed, refreshing data...');
    // Refresh transactions and balance after successful deposit
    loadTransactions(1, filters, false);
  };

  // Handle refresh
  const handleRefresh = () => {
    // console.log(' PaymentHistoryScreen - Refresh triggered, current filters:', filters);
    // console.log(' PaymentHistoryScreen - Current transactions count:', transactions.length);
    setRefreshing(true);
    loadTransactions(1, filters, true);
  };

  // Render payment item
  const renderPaymentItem = ({ item }: { item: Transaction }) => {
    const formatCurrency = (amount: number) => {
      return amount.toLocaleString('vi-VN') + '₫';
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <View style={styles.paymentRow}>
        {/* Type */}
        <View style={styles.cell}>
          <View style={[
            styles.typeBadge,
            {
              backgroundColor: item.transactionType === 1 ? '#E8F5E9' : '#FFEBEE'
            }
          ]}>
            <Text style={[
              styles.typeText,
              {
                color: item.transactionType === 1 ? '#4CAF50' : '#F44336'
              }
            ]}>
              {item.transactionType === 1 ? 'VÀO' : 'RA'}
            </Text>
          </View>
        </View>

        {/* Amount */}
        <View style={styles.cell}>
          <Text style={[
            styles.amount,
            {
              color: item.transactionType === 1 ? Colors.success : Colors.error
            }
          ]}>
            {formatCurrency(item.amount)}
          </Text>
        </View>

        {/* Status */}
        <View style={styles.cell}>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: item.status === 1 ? '#E8F5E9' : '#FFEBEE'
            }
          ]}>
            <Text style={[
              styles.statusText,
              {
                color: item.status === 1 ? '#4CAF50' : '#F44336'
              }
            ]}>
              {item.status === 1 ? 'Thành công' : 'Thất bại'}
            </Text>
          </View>
        </View>

        {/* Date */}
        <View style={styles.cell}>
          <Text style={styles.dateText}>{formatDate(item.transactionDate)}</Text>
        </View>

        {/* Description */}
        <View style={styles.cell}>
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description || 'Không có mô tả'}
          </Text>
        </View>
      </View>
    );
  };

  // Initial load
  useEffect(() => {
    // console.log(' PaymentHistoryScreen - Initial load useEffect triggered, isLandlord:', isLandlord);

    const fetchLandlordInfo = async () => {
      try {
        // console.log(' PaymentHistoryScreen - Fetching landlord info...');
        // Get userId from JWT token (same as DashboardScreen)
        const accessToken = await AsyncStorage.getItem('accessToken');
        // console.log(' PaymentHistoryScreen - Access token exists:', !!accessToken);

        if (accessToken) {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          const userId = tokenPayload.id;
          // console.log('PaymentHistoryScreen - User ID from JWT:', userId);

          // console.log(' PaymentHistoryScreen - Calling landlordService.getLandlordById...');
          const info = await landlordService.getLandlordById(userId);
          // console.log(' PaymentHistoryScreen - Landlord info fetched:', info);
          setLandlordInfo(info);
        } else {
          // console.warn('️ PaymentHistoryScreen - No access token found');
        }
      } catch (error) {
        console.error(' PaymentHistoryScreen - Error fetching landlord info:', error);
      }
    };

    if (isLandlord === true) {
      // console.log(' PaymentHistoryScreen - User is landlord, loading data...');
      // console.log(' PaymentHistoryScreen - Page reload/load triggered, calling loadTransactions');
      loadTransactions(1, undefined, false);
      fetchLandlordInfo();
    } else {
      // console.log('️ PaymentHistoryScreen - User is not landlord yet, waiting...');
    }
  }, [isLandlord, loadTransactions]);

  // Reload data when screen comes back into focus (after payment)
  useFocusEffect(
    useCallback(() => {
      // console.log(' PaymentHistoryScreen - Screen focused, checking if payment was completed...');
      // This will trigger when returning from PaymentWebView
      // We can add logic here to check if payment was successful
      // For now, just reload data to ensure fresh state
      if (isLandlord === true) {
        // console.log(' PaymentHistoryScreen - Reloading data after potential payment completion');
        loadTransactions(1, filters, false);
      }
    }, [isLandlord, filters, loadTransactions])
  );

  // Show loading while checking role
  if (isLandlord === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Deny access if not landlord
  if (isLandlord === false) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Truy cập bị từ chối</Text>
          <Text style={styles.accessDeniedText}>
            Chỉ chủ nhà mới có thể truy cập trang lịch sử thanh toán.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={() => (
            <View>
              {/* Compact Header */}
              <View style={styles.compactHeader}>
                <Text style={styles.compactTitle}>Lịch sử thanh toán</Text>
                {landlordInfo && (
                  <Text style={styles.compactSubtitle}>
                    {landlordInfo.fullName || landlordInfo.landlordProfile?.fullName}
                  </Text>
                )}
              </View>

              {/* Payment Statistics */}
              <PaymentStats stats={stats} totalRecords={totalRecords} />

              {/* Account Balance Card */}
              <AccountBalanceCard
                balance={accountBalance}
                onDeposit={handleDeposit}
              />

              {/* Payment Filter */}
              <PaymentFilter
                filter={filters.status}
                setFilter={(status) => setFilters(prev => ({ ...prev, status }))}
                startDate={filters.startDate}
                endDate={filters.endDate}
                setStartDate={(startDate) => setFilters(prev => ({ ...prev, startDate }))}
                setEndDate={(endDate) => setFilters(prev => ({ ...prev, endDate }))}
                onFilter={() => handleFilterApply(filters)}
              />

              {/* Compact Table Header */}
              <View style={styles.compactTableHeader}>
                <Text style={styles.compactTableTitle}>Giao dịch ({totalRecords})</Text>
              </View>
            </View>
          )}
          renderItem={renderPaymentItem}
          ListEmptyComponent={() => (
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Không có giao dịch nào</Text>
              </View>
            ) : null
          )}
          ListFooterComponent={() => (
            transactions.length > 0 ? (
              <PaymentPagination
                currentPage={currentPage}
                totalRecords={totalRecords}
                pageSize={pageSize}
                onChange={handlePageChange}
              />
            ) : null
          )}
          contentContainerStyle={styles.flatListContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.backgroundLight,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  compactHeader: {
    padding: 12,
    backgroundColor: Colors.backgroundLight,
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  compactSubtitle: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  accessDeniedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 12,
  },
  accessDeniedText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  tableHeader: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  compactTableHeader: {
    marginBottom: 12,
  },
  compactTableTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 6,
    marginBottom: 6,
  },
  headerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 6,
    marginBottom: 6,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  amount: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 2,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 11,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    marginTop: 8,
  },
  flatListContent: {
    paddingBottom: 12,
  },
});

export default PaymentHistoryScreen;