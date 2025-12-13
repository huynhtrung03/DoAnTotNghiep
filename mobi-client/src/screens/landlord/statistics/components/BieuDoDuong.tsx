import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, G, Rect } from 'react-native-svg';
import Colors from '../../../../colors/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32; // Padding 16px mỗi bên
const CHART_HEIGHT = 300;
const PADDING = { top: 40, right: 20, bottom: 40, left: 45 };

interface DuLieuBieuDo {
  ngay: string;
  chiPhiBaoTri: number;
  chiPhiDangBai: number;
}

interface BieuDoDuongProps {
  duLieu: DuLieuBieuDo[];
  tieuDe: string;
}

export const BieuDoDuong: React.FC<BieuDoDuongProps> = ({ duLieu, tieuDe }) => {
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

  // Tính toán kích thước vùng vẽ
  const vungVeRong = CHART_WIDTH - PADDING.left - PADDING.right;
  const vungVeCao = CHART_HEIGHT - PADDING.top - PADDING.bottom;

  // Tìm giá trị max để scale
  const giaTriMax = Math.max(
    ...duLieu.map((d) => Math.max(d.chiPhiBaoTri, d.chiPhiDangBai)),
    1
  );

  // Tính toán điểm trên biểu đồ
  const tinhDiem = (index: number, giaTri: number) => {
    const x = PADDING.left + (index / (duLieu.length - 1 || 1)) * vungVeRong;
    const y = PADDING.top + vungVeCao - (giaTri / giaTriMax) * vungVeCao;
    return { x, y };
  };

  // Tạo đường path cho từng loại chi phí
  const taoDuongPath = (layGiaTri: (d: DuLieuBieuDo) => number) => {
    return duLieu
      .map((d, i) => {
        const diem = tinhDiem(i, layGiaTri(d));
        return `${i === 0 ? 'M' : 'L'} ${diem.x} ${diem.y}`;
      })
      .join(' ');
  };

  // Tính toán các điểm cho trục Y
  const soLuongDiemY = 5;
  const cacDiemY = Array.from({ length: soLuongDiemY }, (_, i) => {
    const giaTri = (giaTriMax / (soLuongDiemY - 1)) * i;
    const y = PADDING.top + vungVeCao - (i / (soLuongDiemY - 1)) * vungVeCao;
    return { giaTri, y };
  });

  // Định dạng số
  const dinhDangSo = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  // Chọn nhãn trục X để tránh chồng chéo
  const soLuongNhanX = Math.min(duLieu.length, 6);
  const buocNhan = Math.ceil(duLieu.length / soLuongNhanX);

  return (
    <View style={styles.container}>
      <Text style={styles.tieuDe}>{tieuDe}</Text>
      
      {/* Chú thích */}
      <View style={styles.chuThich}>
        <View style={styles.mucChuThich}>
          <View style={[styles.dauChuThich, { backgroundColor: '#0ea5e9' }]} />
          <Text style={styles.textChuThich}>Chi phí bảo trì</Text>
        </View>
        <View style={styles.mucChuThich}>
          <View style={[styles.dauChuThich, { backgroundColor: '#07c53d' }]} />
          <Text style={styles.textChuThich}>Chi phí đăng bài</Text>
        </View>
      </View>

      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        {/* Lưới ngang */}
        {cacDiemY.map((diem, i) => (
          <G key={`grid-${i}`}>
            <Line
              x1={PADDING.left}
              y1={diem.y}
              x2={CHART_WIDTH - PADDING.right}
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
              {dinhDangSo(diem.giaTri)}
            </SvgText>
          </G>
        ))}

        {/* Trục X */}
        <Line
          x1={PADDING.left}
          y1={CHART_HEIGHT - PADDING.bottom}
          x2={CHART_WIDTH - PADDING.right}
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

        {/* Nhãn trục X */}
        {duLieu.map((d, i) => {
          if (i % buocNhan !== 0 && i !== duLieu.length - 1) return null;
          const diem = tinhDiem(i, 0);
          return (
            <SvgText
              key={`label-${i}`}
              x={diem.x}
              y={CHART_HEIGHT - PADDING.bottom + 20}
              fontSize="10"
              fill={Colors.textSecondary}
              textAnchor="middle"
            >
              {d.ngay.substring(5)}
            </SvgText>
          );
        })}

        {/* Đường biểu đồ - Chi phí bảo trì */}
        <G>
          {duLieu.map((d, i) => {
            if (i === 0) return null;
            const diemTruoc = tinhDiem(i - 1, duLieu[i - 1].chiPhiBaoTri);
            const diemHienTai = tinhDiem(i, d.chiPhiBaoTri);
            return (
              <Line
                key={`line-maintenance-${i}`}
                x1={diemTruoc.x}
                y1={diemTruoc.y}
                x2={diemHienTai.x}
                y2={diemHienTai.y}
                stroke="#0ea5e9"
                strokeWidth="2"
              />
            );
          })}
          {duLieu.map((d, i) => {
            const diem = tinhDiem(i, d.chiPhiBaoTri);
            return (
              <Circle
                key={`dot-maintenance-${i}`}
                cx={diem.x}
                cy={diem.y}
                r="4"
                fill="#0ea5e9"
              />
            );
          })}
        </G>

        {/* Đường biểu đồ - Chi phí đăng bài */}
        <G>
          {duLieu.map((d, i) => {
            if (i === 0) return null;
            const diemTruoc = tinhDiem(i - 1, duLieu[i - 1].chiPhiDangBai);
            const diemHienTai = tinhDiem(i, d.chiPhiDangBai);
            return (
              <Line
                key={`line-posting-${i}`}
                x1={diemTruoc.x}
                y1={diemTruoc.y}
                x2={diemHienTai.x}
                y2={diemHienTai.y}
                stroke="#07c53d"
                strokeWidth="2"
              />
            );
          })}
          {duLieu.map((d, i) => {
            const diem = tinhDiem(i, d.chiPhiDangBai);
            return (
              <Circle
                key={`dot-posting-${i}`}
                cx={diem.x}
                cy={diem.y}
                r="4"
                fill="#07c53d"
              />
            );
          })}
        </G>
      </Svg>
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
    gap: 20,
  },
  mucChuThich: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dauChuThich: {
    width: 16,
    height: 3,
    borderRadius: 2,
  },
  textChuThich: {
    fontSize: 11,
    color: Colors.textSecondary,
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
