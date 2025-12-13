import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Colors from '../../../../colors/colors';

interface BoLocNgayThangProps {
  hienThi: boolean;
  dongModal: () => void;
  ngayBatDau: Date | null;
  ngayKetThuc: Date | null;
  thayDoiNgayBatDau: (ngay: Date) => void;
  thayDoiNgayKetThuc: (ngay: Date) => void;
  apDung: () => void;
  xoaBoLoc: () => void;
}

export const BoLocNgayThang: React.FC<BoLocNgayThangProps> = ({
  hienThi,
  dongModal,
  ngayBatDau,
  ngayKetThuc,
  thayDoiNgayBatDau,
  thayDoiNgayKetThuc,
  apDung,
  xoaBoLoc,
}) => {
  const [hienThiChonNgayBatDau, setHienThiChonNgayBatDau] = useState(false);
  const [hienThiChonNgayKetThuc, setHienThiChonNgayKetThuc] = useState(false);

  const dinhDangNgay = (ngay: Date | null) => {
    if (!ngay) return 'Chọn tháng';
    return `${ngay.getMonth() + 1}/${ngay.getFullYear()}`;
  };

  const xuLyChonNgayBatDau = (event: any, ngayDuocChon?: Date) => {
    setHienThiChonNgayBatDau(Platform.OS === 'ios');
    if (ngayDuocChon) {
      thayDoiNgayBatDau(ngayDuocChon);
    }
  };

  const xuLyChonNgayKetThuc = (event: any, ngayDuocChon?: Date) => {
    setHienThiChonNgayKetThuc(Platform.OS === 'ios');
    if (ngayDuocChon) {
      thayDoiNgayKetThuc(ngayDuocChon);
    }
  };

  return (
    <Modal
      visible={hienThi}
      transparent={true}
      animationType="slide"
      onRequestClose={dongModal}
    >
      <TouchableOpacity
        style={styles.nenModal}
        activeOpacity={1}
        onPress={dongModal}
      >
        <View style={styles.noiDungModal}>
          <TouchableOpacity activeOpacity={1}>
            {/* Thanh kéo */}
            <View style={styles.thanhKeo} />

            {/* Tiêu đề */}
            <View style={styles.tieuDe}>
              <Text style={styles.textTieuDe}>Lọc theo thời gian</Text>
              <TouchableOpacity onPress={dongModal}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Nội dung */}
            <View style={styles.noiDung}>
              {/* Tháng bắt đầu */}
              <View style={styles.nhomNhap}>
                <Text style={styles.nhan}>Tháng bắt đầu</Text>
                <TouchableOpacity
                  style={styles.nutChonNgay}
                  onPress={() => setHienThiChonNgayBatDau(true)}
                >
                  <MaterialCommunityIcons
                    name="calendar-month"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.textNgay}>{dinhDangNgay(ngayBatDau)}</Text>
                </TouchableOpacity>
              </View>

              {/* Tháng kết thúc */}
              <View style={styles.nhomNhap}>
                <Text style={styles.nhan}>Tháng kết thúc</Text>
                <TouchableOpacity
                  style={styles.nutChonNgay}
                  onPress={() => setHienThiChonNgayKetThuc(true)}
                >
                  <MaterialCommunityIcons
                    name="calendar-month"
                    size={20}
                    color={Colors.primary}
                  />
                  <Text style={styles.textNgay}>{dinhDangNgay(ngayKetThuc)}</Text>
                </TouchableOpacity>
              </View>

              {/* Ghi chú */}
              <View style={styles.ghiChu}>
                <MaterialCommunityIcons
                  name="information"
                  size={16}
                  color={Colors.info}
                />
                <Text style={styles.textGhiChu}>
                  Chỉ có thể chọn tối đa 12 tháng
                </Text>
              </View>

              {/* Các nút hành động */}
              <View style={styles.cacNutHanhDong}>
                <TouchableOpacity
                  style={styles.nutXoa}
                  onPress={() => {
                    xoaBoLoc();
                    dongModal();
                  }}
                >
                  <Text style={styles.textNutXoa}>Xóa bộ lọc</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.nutApDung}
                  onPress={() => {
                    apDung();
                    dongModal();
                  }}
                >
                  <Text style={styles.textNutApDung}>Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Pickers */}
            {hienThiChonNgayBatDau && (
              <DateTimePicker
                value={ngayBatDau || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={xuLyChonNgayBatDau}
              />
            )}

            {hienThiChonNgayKetThuc && (
              <DateTimePicker
                value={ngayKetThuc || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={xuLyChonNgayKetThuc}
              />
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  nenModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  noiDungModal: {
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  thanhKeo: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  tieuDe: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  textTieuDe: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  noiDung: {
    padding: 20,
  },
  nhomNhap: {
    marginBottom: 20,
  },
  nhan: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  nutChonNgay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
  },
  textNgay: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  ghiChu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.info + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  textGhiChu: {
    fontSize: 12,
    color: Colors.info,
    flex: 1,
  },
  cacNutHanhDong: {
    flexDirection: 'row',
    gap: 12,
  },
  nutXoa: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  textNutXoa: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  nutApDung: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  textNutApDung: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textWhite,
  },
});
