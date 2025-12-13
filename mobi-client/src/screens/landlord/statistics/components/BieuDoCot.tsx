import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Line } from 'react-native-svg';
import Colors from '../../../../colors/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;
const CHART_HEIGHT = 300;
const PADDING = { top: 40, right: 20, bottom: 50, left: 50 };

interface DuLieuDoanhThu {
  ngay: string;
  doanhThu: number;
}

interface BieuDoCotProps {
  duLieu: DuLieuDoanhThu[];
  tieuDe: string;
}

export const BieuDoCot: React.FC<BieuDoCotProps> = ({ duLieu, tieuDe }) => {
  if (!duLieu || duLieu.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.tieuDe}>{tieuDe}</Text>
        <View style={styles.khongCoDuLieu}>
          <Text style={styles.textKhongCoDuLieu}>Không có dữ liệu</Text>
        </View>
      </View>
    );
  }

  // Tính toán kích thước
  const vungVeRong = CHART_WIDTH - PADDING.left - PADDING.right;
  const vungVeCao = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // Tìm giá trị max
  const doanhThuMax = Math.max(...duLieu.map((d) => d.doanhThu), 1);

  // Tính chiều rộng cột
  const chieuRongCot = vungVeRong / duLieu.length;
  const chieuRongCotThucTe = Math.min(chieuRongCot * 0.7, 40);
  const khoangCach = (chieuRongCot - chieuRongCotThucTe) / 2;

  // Tính toán các điểm cho trục Y
  const soLuongDiemY = 5;
  const cacDiemY = Array.from({ length: soLuongDiemY }, (_, i) => {
    const giaTri = (doanhThuMax / (soLuongDiemY - 1)) * i;
    const y = PADDING.top + vungVeCao - (i / (soLuongDiemY - 1)) * vungVeCao;
    return { giaTri, y };
  });

  // Định dạng số tiền
  const dinhDangTien = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  // Tính toán chiều rộng scroll nếu có nhiều dữ liệu
  const chieuRongToiThieu = Math.max(
    CHART_WIDTH,
    duLieu.length * 60 + PADDING.left + PADDING.right
  );
  const coTheoCuon = chieuRongToiThieu > CHART_WIDTH;

  const NoiDungBieuDo = () => (
    <Svg width={chieuRongToiThieu} height={CHART_HEIGHT}>
      {/* Lưới ngang */}
      {cacDiemY.map((diem, i) => (
        <G key={`grid-${i}`}>
          <Line
            x1={PADDING.left}
            y1={diem.y}
            x2={chieuRongToiThieu - PADDING.right}
            y2={diem.y}
            stroke={Colors.border}
            strokeWidth="1"
            strokeDasharray="3,3"
          />
          <SvgText
            x={PADDING.left - 8}
            y={diem.y + 4}
            fontSize="10"
            fill={Colors.textSecondary}
            textAnchor="end"
          >
            {dinhDangTien(diem.giaTri)}
          </SvgText>
        </G>
      ))}

      {/* Trục X */}
      <Line
        x1={PADDING.left}
        y1={CHART_HEIGHT - PADDING.bottom}
        x2={chieuRongToiThieu - PADDING.right}
        y2={CHART_HEIGHT - PADDING.bottom}
        stroke={Colors.border}
        strokeWidth="2"
      />

      {/* Trục Y */}
      <Line
        x1={PADDING.left}
        y1={PADDING.top}
        x2={PADDING.left}
        y2={CHART_HEIGHT - PADDING.bottom}
        stroke={Colors.border}
        strokeWidth="2"
      />

      {/* Các cột */}
      {duLieu.map((d, i) => {
        const chieuCaoCot = (d.doanhThu / doanhThuMax) * vungVeCao;
        const x = PADDING.left + i * chieuRongCot + khoangCach;
        const y = CHART_HEIGHT - PADDING.bottom - chieuCaoCot;

        return (
          <G key={`bar-${i}`}>
            {/* Cột */}
            <Rect
              x={x}
              y={y}
              width={chieuRongCotThucTe}
              height={chieuCaoCot}
              fill="#8b5cf6"
              rx={6}
              ry={6}
            />
            
            {/* Nhãn trục X */}
            <SvgText
              x={x + chieuRongCotThucTe / 2}
              y={CHART_HEIGHT - PADDING.bottom + 20}
              fontSize="10"
              fill={Colors.textSecondary}
              textAnchor="middle"
              transform={`rotate(-45, ${x + chieuRongCotThucTe / 2}, ${CHART_HEIGHT - PADDING.bottom + 20})`}
            >
              {d.ngay.substring(5)}
            </SvgText>

            {/* Giá trị trên cột (nếu đủ cao) */}
            {chieuCaoCot > 30 && (
              <SvgText
                x={x + chieuRongCotThucTe / 2}
                y={y - 5}
                fontSize="10"
                fill={Colors.textPrimary}
                textAnchor="middle"
                fontWeight="600"
              >
                {dinhDangTien(d.doanhThu)}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.tieuDe}>{tieuDe}</Text>
      
      {/* Chú thích */}
      <View style={styles.chuThich}>
        <View style={styles.mucChuThich}>
          <View style={[styles.dauChuThich, { backgroundColor: '#8b5cf6' }]} />
          <Text style={styles.textChuThich}>Doanh thu</Text>
        </View>
      </View>

      {coTheoCuon ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={styles.vungCuon}
        >
          <NoiDungBieuDo />
        </ScrollView>
      ) : (
        <NoiDungBieuDo />
      )}
      
      {coTheoCuon && (
        <Text style={styles.goiYCuon}>← Vuốt ngang để xem thêm →</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 16,
  },
  tieuDe: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  chuThich: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mucChuThich: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dauChuThich: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  textChuThich: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  vungCuon: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  goiYCuon: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  khongCoDuLieu: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textKhongCoDuLieu: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
