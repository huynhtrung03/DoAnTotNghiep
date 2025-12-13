/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Colors from '../../../styles/colors';
import {
  getAllKPICounts,
  getAllStatistics,
  validateDateRange,
  formatDateForAPI,
  type MaintenanceStatistics,
  type FeePostRoomStatistics,
  type RevenueStatistics,
} from '../../../services/LandLordStatisticsService';
import { TheKPICard } from './components/TheKPICard';
import { BieuDoDuong } from './components/BieuDoDuong';
import { BieuDoCot } from './components/BieuDoCot';
import { BoLocNgayThang } from './components/BoLocNgayThang';

export default function StatisticsDashboardScreen() {
  // States cho dữ liệu
  const [idChuNha, setIdChuNha] = useState<string>('');
  const [tongPhongDaDang, setTongPhongDaDang] = useState(0);
  const [tongPhongDaThue, setTongPhongDaThue] = useState(0);
  const [tongLuotXem, setTongLuotXem] = useState(0);
  const [tongLuotYeuThich, setTongLuotYeuThich] = useState(0);
  const [duLieuBaoTri, setDuLieuBaoTri] = useState<MaintenanceStatistics | null>(null);
  const [duLieuDangBai, setDuLieuDangBai] = useState<FeePostRoomStatistics | null>(null);
  const [duLieuDoanhThu, setDuLieuDoanhThu] = useState<RevenueStatistics | null>(null);

  // States cho bộ lọc
  const [ngayBatDau, setNgayBatDau] = useState<Date | null>(null);
  const [ngayKetThuc, setNgayKetThuc] = useState<Date | null>(null);
  const [hienThiBoLoc, setHienThiBoLoc] = useState(false);
  const [loiNgay, setLoiNgay] = useState('');

  // States cho UI
  const [dangTai, setDangTai] = useState(true);
  const [dangLamMoi, setDangLamMoi] = useState(false);

  // Lấy ID chủ nhà từ token
  useEffect(() => {
    const layIdChuNha = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (accessToken) {
          const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
          setIdChuNha(tokenPayload.id);
          console.log('✅ [StatsDashboard] Landlord ID:', tokenPayload.id);
        }
      } catch (error) {
        console.error('❌ [StatsDashboard] Lỗi khi lấy ID chủ nhà:', error);
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể lấy thông tin người dùng',
        });
      }
    };
    layIdChuNha();
  }, []);

  // Lấy dữ liệu KPI
  const layDuLieuKPI = async (landlordId: string) => {
    try {
      console.log('📊 [StatsDashboard] Fetching KPI data...');
      const kpiData = await getAllKPICounts(landlordId);

      setTongPhongDaDang(kpiData.postedRooms.count);
      setTongPhongDaThue(kpiData.rentedRooms.count);
      setTongLuotXem(kpiData.viewedRooms.count);
      setTongLuotYeuThich(kpiData.favoritedRooms.count);

      console.log('✅ [StatsDashboard] KPI data loaded:', {
        posted: kpiData.postedRooms.count,
        rented: kpiData.rentedRooms.count,
        viewed: kpiData.viewedRooms.count,
        favorited: kpiData.favoritedRooms.count,
      });
    } catch (error) {
      console.error('❌ [StatsDashboard] Lỗi khi lấy dữ liệu KPI:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải dữ liệu KPI',
      });
    }
  };

  // Lấy dữ liệu biểu đồ
  const layDuLieuBieuDo = async (landlordId: string, startDate?: string, endDate?: string) => {
    try {
      console.log('📊 [StatsDashboard] Fetching chart data...', { startDate, endDate });
      const statsData = await getAllStatistics(landlordId, startDate, endDate);

      // Log raw data to see actual structure
      console.log('📊 Raw maintenance data:', JSON.stringify(statsData.maintenance, null, 2));
      console.log('📊 Raw fee post room data:', JSON.stringify(statsData.feePostRoom, null, 2));
      console.log('📊 Raw revenue data:', JSON.stringify(statsData.revenue, null, 2));

      setDuLieuBaoTri(statsData.maintenance);
      setDuLieuDangBai(statsData.feePostRoom);
      setDuLieuDoanhThu(statsData.revenue);

      console.log('✅ [StatsDashboard] Chart data loaded');
    } catch (error) {
      console.error('❌ [StatsDashboard] Lỗi khi lấy dữ liệu biểu đồ:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải dữ liệu thống kê',
      });
    }
  };

  // Lấy tất cả dữ liệu
  const layTatCaDuLieu = async (lamMoi = false) => {
    if (!idChuNha) return;

    if (lamMoi) {
      setDangLamMoi(true);
    } else {
      setDangTai(true);
    }

    try {
      let startDateStr: string | undefined;
      let endDateStr: string | undefined;

      if (ngayBatDau && ngayKetThuc) {
        startDateStr = formatDateForAPI(ngayBatDau);
        endDateStr = formatDateForAPI(ngayKetThuc);
        console.log('📅 [StatsDashboard] Date range:', { startDateStr, endDateStr });
      }

      await Promise.all([
        layDuLieuKPI(idChuNha),
        layDuLieuBieuDo(idChuNha, startDateStr, endDateStr),
      ]);

      console.log('✅ [StatsDashboard] All data loaded successfully');
    } catch (error) {
      console.error('❌ [StatsDashboard] Lỗi khi lấy dữ liệu:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tải dữ liệu',
      });
    } finally {
      setDangTai(false);
      setDangLamMoi(false);
    }
  };

  // Lấy dữ liệu khi có ID chủ nhà
  useEffect(() => {
    if (idChuNha) {
      layTatCaDuLieu();
    }
  }, [idChuNha, ngayBatDau, ngayKetThuc]);

  // Xử lý áp dụng bộ lọc
  const xuLyApDungBoLoc = () => {
    if (!ngayBatDau || !ngayKetThuc) {
      setLoiNgay('Vui lòng chọn cả ngày bắt đầu và kết thúc');
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng chọn cả ngày bắt đầu và kết thúc',
      });
      return;
    }

    // Validate date range using service helper
    const startDateStr = formatDateForAPI(ngayBatDau);
    const endDateStr = formatDateForAPI(ngayKetThuc);
    const validation = validateDateRange(startDateStr, endDateStr);

    if (!validation.valid) {
      setLoiNgay(validation.error || 'Khoảng thời gian không hợp lệ');
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: validation.error,
      });
      return;
    }

    setLoiNgay('');
    setHienThiBoLoc(false);
    // Dữ liệu sẽ được tải lại tự động qua useEffect
  };

  // Xóa bộ lọc
  const xuLyXoaBoLoc = () => {
    setNgayBatDau(null);
    setNgayKetThuc(null);
    setLoiNgay('');
    setHienThiBoLoc(false);
  };

  // Kết hợp dữ liệu cho biểu đồ đường
  const duLieuBieuDoDuong = useMemo(() => {
    const duLieuKetHop: { [key: string]: { ngay: string; chiPhiBaoTri: number; chiPhiDangBai: number } } = {};

    // Thêm dữ liệu bảo trì (duLieuBaoTri là mảng trực tiếp)
    duLieuBaoTri?.forEach((item) => {
      duLieuKetHop[item.date] = {
        ngay: item.date,
        chiPhiBaoTri: item.cost || 0,
        chiPhiDangBai: 0,
      };
    });

    // Thêm dữ liệu đăng bài (duLieuDangBai là mảng trực tiếp)
    duLieuDangBai?.forEach((item) => {
      if (duLieuKetHop[item.date]) {
        duLieuKetHop[item.date].chiPhiDangBai = item.cost || 0;
      } else {
        duLieuKetHop[item.date] = {
          ngay: item.date,
          chiPhiBaoTri: 0,
          chiPhiDangBai: item.cost || 0,
        };
      }
    });

    const ketQua = Object.values(duLieuKetHop).sort(
      (a, b) => new Date(a.ngay).getTime() - new Date(b.ngay).getTime()
    );
    
    console.log('📈 Dữ liệu biểu đồ đường đã xử lý:', JSON.stringify(ketQua, null, 2));
    return ketQua;
  }, [duLieuBaoTri, duLieuDangBai]);

  // Dữ liệu cho biểu đồ cột
  const duLieuBieuDoCot = useMemo(() => {
    // duLieuDoanhThu là mảng trực tiếp
    if (!duLieuDoanhThu || duLieuDoanhThu.length === 0) {
      console.log('⚠️ Không có dữ liệu doanh thu cho biểu đồ cột');
      return [];
    }
    
    const ketQua = duLieuDoanhThu
      .map((item) => ({
        ngay: item.date,
        doanhThu: item.revenue || 0,
      }))
      .sort((a, b) => new Date(a.ngay).getTime() - new Date(b.ngay).getTime());
    
    console.log('📊 Dữ liệu biểu đồ cột đã xử lý:', JSON.stringify(ketQua, null, 2));
    return ketQua;
  }, [duLieuDoanhThu]);

  // Định dạng hiển thị khoảng thời gian
  const hienThiKhoangThoiGian = () => {
    if (!ngayBatDau || !ngayKetThuc) {
      return '12 tháng gần nhất';
    }
    const thangBD = ngayBatDau.getMonth() + 1;
    const namBD = ngayBatDau.getFullYear();
    const thangKT = ngayKetThuc.getMonth() + 1;
    const namKT = ngayKetThuc.getFullYear();
    return `${thangBD}/${namBD} - ${thangKT}/${namKT}`;
  };

  if (dangTai) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.vungTai}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.textDangTai}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.tieuDeHeader}>Thống kê</Text>
          <Text style={styles.moTaHeader}>Tổng quan các chỉ số và xu hướng</Text>
        </View>
        <TouchableOpacity
          style={styles.nutBoLoc}
          onPress={() => setHienThiBoLoc(true)}
        >
          <MaterialCommunityIcons name="filter-variant" size={20} color={Colors.primary} />
          <Text style={styles.textBoLoc}>{hienThiKhoangThoiGian()}</Text>
        </TouchableOpacity>
      </View>

      {/* Nội dung cuộn */}
      <ScrollView
        style={styles.noiDungCuon}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dangLamMoi}
            onRefresh={() => layTatCaDuLieu(true)}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Lưới KPI 2x2 */}
        <View style={styles.luoiKPI}>
          <View style={styles.hangKPI}>
            <View style={styles.cotKPI}>
              <TheKPICard
                tieuDe="Phòng đã đăng"
                giaTri={tongPhongDaDang}
                tenIcon="home-city"
                mauIcon="#3B82F6"
              />
            </View>
            <View style={styles.cotKPI}>
              <TheKPICard
                tieuDe="Phòng đã thuê"
                giaTri={tongPhongDaThue}
                tenIcon="home-heart"
                mauIcon="#10B981"
              />
            </View>
          </View>
          <View style={styles.hangKPI}>
            <View style={styles.cotKPI}>
              <TheKPICard
                tieuDe="Lượt xem"
                giaTri={tongLuotXem}
                tenIcon="eye"
                mauIcon="#F59E0B"
              />
            </View>
            <View style={styles.cotKPI}>
              <TheKPICard
                tieuDe="Lượt yêu thích"
                giaTri={tongLuotYeuThich}
                tenIcon="heart"
                mauIcon="#EF4444"
              />
            </View>
          </View>
        </View>

        {/* Debug Info
        <View style={{ padding: 16, backgroundColor: Colors.backgroundLight, margin: 16, borderRadius: 8 }}>
          <Text style={{ color: Colors.textPrimary, fontWeight: '600', marginBottom: 8 }}>Debug Info:</Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            Biểu đồ đường: {duLieuBieuDoDuong.length} điểm dữ liệu
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            Biểu đồ cột: {duLieuBieuDoCot.length} điểm dữ liệu
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            Bảo trì: {duLieuBaoTri?.length || 0} ngày
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            Đăng bài: {duLieuDangBai?.length || 0} ngày
          </Text>
          <Text style={{ color: Colors.textSecondary, fontSize: 12 }}>
            Doanh thu: {duLieuDoanhThu?.length || 0} ngày
          </Text>
        </View> */}

        {/* Biểu đồ đường */}
        <BieuDoDuong
          duLieu={duLieuBieuDoDuong}
          tieuDe="Chi phí bảo trì & đăng bài (theo tháng)"
        />

        {/* Biểu đồ cột */}
        <BieuDoCot
          duLieu={duLieuBieuDoCot}
          tieuDe="Doanh thu (theo tháng)"
        />

        {/* Khoảng trắng cuối */}
        <View style={styles.khoangTrangCuoi} />
      </ScrollView>

      {/* Bottom Sheet bộ lọc */}
      <BoLocNgayThang
        hienThi={hienThiBoLoc}
        dongModal={() => setHienThiBoLoc(false)}
        ngayBatDau={ngayBatDau}
        ngayKetThuc={ngayKetThuc}
        thayDoiNgayBatDau={setNgayBatDau}
        thayDoiNgayKetThuc={setNgayKetThuc}
        apDung={xuLyApDungBoLoc}
        xoaBoLoc={xuLyXoaBoLoc}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tieuDeHeader: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  moTaHeader: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  nutBoLoc: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  textBoLoc: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  noiDungCuon: {
    flex: 1,
  },
  luoiKPI: {
    padding: 16,
    gap: 12,
  },
  hangKPI: {
    flexDirection: 'row',
    gap: 12,
  },
  cotKPI: {
    flex: 1,
  },
  vungTai: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  textDangTai: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  khoangTrangCuoi: {
    height: 20,
  },
});
