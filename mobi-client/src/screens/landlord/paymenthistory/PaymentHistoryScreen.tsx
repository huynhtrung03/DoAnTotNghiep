import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
} from '../../../services/PaymentService';
import { landlordService } from '../../../services/LandlordService';
import Colors from '../../../colors/colors';
import PaymentStats from './components/PaymentStats';
import PaymentFilter from './components/PaymentFilter';
import PaymentPagination from './components/PaymentPagination';
import AccountBalanceCard from './components/AccountBalanceCard';
import PaymentTable from './components/PaymentTable';
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
  createdAt: string;
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

interface TransactionApiResponse {
  transactions: Transaction[];
  totalRecords: number;
}

const PaymentHistoryScreen: React.FC = () => {
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

  // Check if user is landlord
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const roles = await getUserRoles();
        const isUserLandlord = roles.includes('LANDLORD') || roles.includes('Landlords');
        setIsLandlord(isUserLandlord);

        if (!isUserLandlord) {
          Alert.alert(
            'Truy cập bị từ chối',
            'Chỉ chủ nhà mới có thể truy cập trang này.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsLandlord(false);
      }
    };

    checkUserRole();
  }, []);

  // Load transactions
  const loadTransactions = useCallback(async (page: number = 1, filterOptions?: FilterOptions, isRefresh: boolean = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      const apiPage = page - 1;
      let data: TransactionApiResponse;

      if (filterOptions && (filterOptions.startDate || filterOptions.endDate)) {
        const startDate = filterOptions.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const endDate = filterOptions.endDate || new Date().toISOString().split('T')[0];
        const response = await getTransactionsByUserIdAndDateRange(startDate, endDate, apiPage, pageSize);
        data = response as TransactionApiResponse;
      } else {
        const response = await getTransactionsByUserIdPaginated(apiPage, pageSize);
        data = response as TransactionApiResponse;
      }

      // Filter by status if needed
      let filteredTransactions = Array.isArray(data.transactions) ? data.transactions : [];

      if (filterOptions && filterOptions.status !== 'all') {
        const statusFilter = filterOptions.status === 'success' ? 1 : 0;
        filteredTransactions = filteredTransactions.filter((t: Transaction) => t.status === statusFilter);
      }

      setTransactions(filteredTransactions);
      setTotalRecords(data.totalRecords || filteredTransactions.length || 0);
      setCurrentPage(page);

      // Calculate stats
      calculateStats(filteredTransactions);
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      const errorMessage = error.message || 'Không thể tải dữ liệu giao dịch';
      Alert.alert('Lỗi', errorMessage + '. Vui lòng thử lại.');
      if (!isRefresh) {
        setTransactions([]);
        setTotalRecords(0);
        setStats({
          successCount: 0,
          failedCount: 0,
          totalIn: 0,
          totalOut: 0,
        });
        setAccountBalance(0);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pageSize]);

  // Calculate payment statistics
  const calculateStats = (transactionList: Transaction[]) => {
    const statsData: PaymentStatsData = {
      successCount: 0,
      failedCount: 0,
      totalIn: 0,
      totalOut: 0,
    };

    transactionList.forEach((transaction) => {
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
    });

    setStats(statsData);

    // Calculate account balance
    const balance = statsData.totalIn - statsData.totalOut;
    setAccountBalance(balance);
  };

  // Handle filter apply
  const handleFilterApply = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    loadTransactions(1, newFilters, false);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    loadTransactions(page, filters, false);
  };

  // Handle deposit
  const handleDeposit = () => {
    loadTransactions(1, filters, false);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions(1, filters, true);
  };

  // Initial load
  useEffect(() => {
    const fetchLandlordInfo = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (accessToken) {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          const userId = tokenPayload.id;

          const info = await landlordService.getLandlordById(userId);
          setLandlordInfo(info);
        }
      } catch (error) {
        console.error('Error fetching landlord info:', error);
      }
    };

    if (isLandlord === true) {
      loadTransactions(1, undefined, false);
      fetchLandlordInfo();
    }
  }, [isLandlord, loadTransactions]);

  // Reload data when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      if (isLandlord === true) {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.header} key="header">
          <Text style={styles.headerTitle}>Lịch sử thanh toán</Text>
          {landlordInfo && (
            <Text style={styles.headerSubtitle}>
              {landlordInfo.fullName || landlordInfo.landlordProfile?.fullName}
            </Text>
          )}
        </View>

        <View key="balance">
          <AccountBalanceCard
            balance={accountBalance}
            onDeposit={handleDeposit}
          />
        </View>

        <View key="stats">
          <PaymentStats stats={stats} totalRecords={totalRecords} />
        </View>

        <View key="filter">
          <PaymentFilter
            filter={filters.status}
            setFilter={(status) => setFilters(prev => ({ ...prev, status }))}
            startDate={filters.startDate}
            endDate={filters.endDate}
            setStartDate={(startDate) => setFilters(prev => ({ ...prev, startDate }))}
            setEndDate={(endDate) => setFilters(prev => ({ ...prev, endDate }))}
            onFilter={() => handleFilterApply(filters)}
          />
        </View>
      </View>

      {/* Scrollable Body */}
      {loading && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <View style={styles.scrollableBody}>
          <PaymentTable payments={transactions} />
          
          {transactions.length > 0 && (
            <PaymentPagination
              currentPage={currentPage}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onChange={handlePageChange}
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  stickyHeader: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  scrollableBody: {
    flex: 1,
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
});

export default PaymentHistoryScreen;