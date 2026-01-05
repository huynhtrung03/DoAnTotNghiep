import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, SafeAreaView, Dimensions, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCompareStore } from '../../stores/CompareStore';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../colors/colors';
import { formatPrice } from '../../utils/format';
import { URL_IMAGE } from '../../services/Constant';
import BookingButton from '../../components/rooms/BookingModal/BookingButton';

const { width } = Dimensions.get('window');

// Colors palette update
const THEME = {
  primary: '#667EEA',
  background: '#F9FAFB',
  card: '#FFFFFF',
  textMain: '#1F2937',
  textSub: '#6B7280',
  border: '#E5E7EB',
  highlight: '#EEF2FF',
  success: '#10B981',
  error: '#EF4444',
  orange: '#F59E0B',
};

const CONVENIENCE_MAP: Record<string, string> = {
  'furnished': 'Nội thất',
  'washing_machine': 'Máy giặt',
  'no_curfew': 'Giờ giấc tự do',
  'mezzanine': 'Gác lửng',
  'fridge': 'Tủ lạnh',
  'kitchen_shelf': 'Kệ bếp',
  'aircon': 'Máy lạnh',
  'private_entry': 'Lối đi riêng',
  'elevator': 'Thang máy',
  'security_24h': 'An ninh 24h',
  'garage': 'Nhà xe',
};

// Helper to determine better value
// type: 'min' (lower better), 'max' (higher better)
const getBetterIndex = (val1: number | undefined, val2: number | undefined, type: 'min' | 'max') => {
  if (val1 === undefined || val2 === undefined || val1 === val2) return -1;
  if (type === 'min') return val1 < val2 ? 0 : 1;
  return val1 > val2 ? 0 : 1;
};

export default function CompareRoomsScreen() {
  const { items, clearItems } = useCompareStore();
  const navigation = useNavigation<any>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClearAll = () => {
    clearItems();
    navigation.goBack();
  };

  // Helper to extract convenience names safely
  const convenienceList = useMemo(() => {
    if (items.length < 2) return [];
    
    const set1 = new Set(items[0].room.convenients?.map(c => c.name) || []);
    const set2 = new Set(items[1].room.convenients?.map(c => c.name) || []);
    
    // Combine unique amenities
    return Array.from(new Set([...set1, ...set2])).sort();
  }, [items]);

  const getTranslatedConvenience = (key: string) => {
    return CONVENIENCE_MAP[key] || key;
  };

  // Analysis Logic
  const analysis = useMemo(() => {
    if (items.length < 2) return null;
    const r1 = items[0].room;
    const r2 = items[1].room;

    const priceBetter = getBetterIndex(r1.priceMonth, r2.priceMonth, 'min');
    const areaBetter = getBetterIndex(r1.area, r2.area, 'max');
    const conv1Count = r1.convenients?.length || 0;
    const conv2Count = r2.convenients?.length || 0;
    const convBetter = getBetterIndex(conv1Count, conv2Count, 'max');
    const elecBetter = getBetterIndex(r1.elecPrice, r2.elecPrice, 'min');
    const waterBetter = getBetterIndex(r1.waterPrice, r2.waterPrice, 'min');
    
    // Calculate size (Length * Width)
    const size1 = (r1.roomLength || 0) * (r1.roomWidth || 0);
    const size2 = (r2.roomLength || 0) * (r2.roomWidth || 0);
    const sizeBetter = getBetterIndex(size1, size2, 'max');

    return {
        priceBetter,
        areaBetter,
        convBetter,
        elecBetter,
        waterBetter,
        sizeBetter,
        r1Advantages: [
            priceBetter === 0 && 'Giá thuê thấp hơn',
            areaBetter === 0 && 'Diện tích lớn hơn',
            sizeBetter === 0 && 'Kích thước lớn hơn',
            convBetter === 0 && 'Nhiều tiện nghi hơn',
            elecBetter === 0 && 'Giá điện rẻ hơn',
            waterBetter === 0 && 'Giá nước rẻ hơn'
        ].filter(Boolean),
        r2Advantages: [
            priceBetter === 1 && 'Giá thuê thấp hơn',
            areaBetter === 1 && 'Diện tích lớn hơn',
            sizeBetter === 1 && 'Kích thước lớn hơn',
            convBetter === 1 && 'Nhiều tiện nghi hơn',
            elecBetter === 1 && 'Giá điện rẻ hơn',
            waterBetter === 1 && 'Giá nước rẻ hơn'
        ].filter(Boolean)
    };
  }, [items]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.card} />
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={THEME.textMain} />
        </Pressable>
        <Text style={styles.headerTitle}>So sánh phòng</Text>
        <Pressable onPress={handleClearAll} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Xóa tất cả</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {items.length === 2 ? (
          <View style={styles.compareWrapper}>
            
            {/* 1. ROOM IMAGES & TITLES HEADER - Fixed Top Rows */}
            <View style={styles.desktopRow}>
              {/* Left Column Label Space */}
              <View style={styles.labelColumnPlaceholder} />
              
              {/* Room 1 */}
              <View style={styles.roomHeaderCol}>
                <Image 
                  source={{ 
                    uri: items[0].room.images?.[0]?.url 
                      ? `${URL_IMAGE}${items[0].room.images[0].url.startsWith('/') ? items[0].room.images[0].url.slice(1) : items[0].room.images[0].url}`
                      : 'https://via.placeholder.com/200x150' 
                  }} 
                  style={styles.roomImage}
                />
                <Text style={styles.roomTitle} numberOfLines={2}>
                  {items[0].room.title}
                </Text>
              </View>
              
              {/* Room 2 */}
              <View style={styles.roomHeaderCol}>
                <Image 
                  source={{ 
                    uri: items[1].room.images?.[0]?.url 
                      ? `${URL_IMAGE}${items[1].room.images[0].url.startsWith('/') ? items[1].room.images[0].url.slice(1) : items[1].room.images[0].url}`
                      : 'https://via.placeholder.com/200x150' 
                  }} 
                  style={styles.roomImage}
                />
                <Text style={styles.roomTitle} numberOfLines={2}>
                  {items[1].room.title}
                </Text>
              </View>
            </View>

            {/* 2. BOOKING BUTTONS ROW */}
            <View style={styles.desktopRow}>
               <View style={styles.labelColumn}><Text style={styles.rowLabel}>Hành động</Text></View>
               <View style={styles.valueCol}>
                  <BookingButton room={items[0].room} />
               </View>
               <View style={styles.valueCol}>
                  <BookingButton room={items[1].room} />
               </View>
            </View>

            {/* SYSTEM ANALYTICS */}
            {analysis && (
              <View style={styles.systemReviewContainer}>
                <View style={styles.systemReviewHeader}>
                  <Ionicons name="analytics" size={20} color={THEME.primary} />
                  <Text style={styles.systemReviewTitle}>Đánh giá từ hệ thống</Text>
                </View>
                
                <View style={styles.desktopRow}>
                    <View style={styles.labelColumnPlaceholder} />
                    <View style={styles.analysisCol}>
                        {analysis.r1Advantages.length > 0 ? (
                            analysis.r1Advantages.map((adv: any, i) => (
                                <View key={i} style={styles.advTag}>
                                    <Ionicons name="thumbs-up" size={12} color={THEME.success} style={{marginRight: 4}} />
                                    <Text style={styles.advText}>{adv}</Text>
                                </View>
                            ))
                        ) : (
                           <Text style={styles.neutralText}>--</Text>
                        )}
                    </View>
                    <View style={styles.analysisCol}>
                         {analysis.r2Advantages.length > 0 ? (
                            analysis.r2Advantages.map((adv: any, i) => (
                                <View key={i} style={styles.advTag}>
                                    <Ionicons name="thumbs-up" size={12} color={THEME.success} style={{marginRight: 4}} />
                                    <Text style={styles.advText}>{adv}</Text>
                                </View>
                            ))
                        ) : (
                           <Text style={styles.neutralText}>--</Text>
                        )}
                    </View>
                </View>
              </View>
            )}

            {/* 3. COMPARISON DETAILS */}
            <View style={styles.sectionDivider} />

            {/* Helper Component for Rows */}
            <CompareRow 
              label="Giá thuê" 
              value1={formatPrice(items[0].room.priceMonth || 0)}
              value2={formatPrice(items[1].room.priceMonth || 0)}
              betterIndex={analysis?.priceBetter}
              highlight
            />
            <CompareRow 
              label="Diện tích" 
              value1={`${items[0].room.area || 0} m²`}
              value2={`${items[1].room.area || 0} m²`}
              betterIndex={analysis?.areaBetter}
              highlight
            />
             <CompareRow 
              label="Kích thước" 
              value1={`${items[0].room.roomLength ?? '-'}m x ${items[0].room.roomWidth ?? '-'}m`}
              value2={`${items[1].room.roomLength ?? '-'}m x ${items[1].room.roomWidth ?? '-'}m`}
              betterIndex={analysis?.sizeBetter}
              highlight
            />
            <CompareRow 
              label="Số người" 
              value1={`${items[0].room.maxPeople ?? '-'} người`}
              value2={`${items[1].room.maxPeople ?? '-'} người`}
            />
            <CompareRow 
              label="Giá điện" 
              value1={items[0].room.elecPrice ? `${items[0].room.elecPrice.toLocaleString('vi-VN')}đ/kWh` : 'Theo hóa đơn'}
              value2={items[1].room.elecPrice ? `${items[1].room.elecPrice.toLocaleString('vi-VN')}đ/kWh` : 'Theo hóa đơn'}
              betterIndex={analysis?.elecBetter}
              highlight
            />
            <CompareRow 
              label="Giá nước" 
              value1={items[0].room.waterPrice ? `${items[0].room.waterPrice.toLocaleString('vi-VN')}đ/m³` : 'Theo hóa đơn'}
              value2={items[1].room.waterPrice ? `${items[1].room.waterPrice.toLocaleString('vi-VN')}đ/m³` : 'Theo hóa đơn'}
              betterIndex={analysis?.waterBetter}
              highlight
            />
            <CompareRow 
              label="Địa chỉ" 
              value1={`${items[0].room.address?.street}, ${items[0].room.address?.ward?.name}`}
              value2={`${items[1].room.address?.street}, ${items[1].room.address?.ward?.name}`}
              isLongText
            />

            {/* 4. UTILITIES / AMENITIES */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tiện nghi & Dịch vụ</Text>
            </View>
            
            {convenienceList.map((name, idx) => {
              const has1 = items[0].room.convenients?.some(c => c.name === name);
              const has2 = items[1].room.convenients?.some(c => c.name === name);
              
              return (
                <View key={idx} style={[styles.desktopRow, styles.rowBorder]}>
                  <View style={styles.labelColumn}>
                    <Text style={styles.rowLabel}>{getTranslatedConvenience(name)}</Text>
                  </View>
                  <View style={styles.valueColCenter}>
                     <Ionicons 
                        name={has1 ? 'checkmark-circle' : 'close-circle-outline'} 
                        size={22} 
                        color={has1 ? THEME.success : THEME.textSub} 
                     />
                  </View>
                  <View style={styles.valueColCenter}>
                      <Ionicons 
                        name={has2 ? 'checkmark-circle' : 'close-circle-outline'} 
                        size={22} 
                        color={has2 ? THEME.success : THEME.textSub} 
                     />
                  </View>
                </View>
              );
            })}

             {/* 5. VIEW DETAIL BUTTONS */}
             <View style={[styles.desktopRow, {marginTop: 20}]}>
               <View style={styles.labelColumnPlaceholder} />
               <View style={styles.valueCol}>
                  <Pressable 
                    onPress={() => navigation.navigate('RoomDetail', { roomId: items[0].room.id })}
                    style={styles.detailButton}
                  >
                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                  </Pressable>
               </View>
               <View style={styles.valueCol}>
                  <Pressable 
                    onPress={() => navigation.navigate('RoomDetail', { roomId: items[1].room.id })}
                    style={styles.detailButton}
                  >
                    <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                  </Pressable>
               </View>
            </View>

          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="git-compare-outline" size={64} color={THEME.textSub} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyTitle}>Chưa đủ phòng để so sánh</Text>
            <Text style={styles.emptySubtitle}>
              Vui lòng chọn 2 phòng để bắt đầu so sánh
            </Text>
            <Pressable onPress={handleBack} style={styles.backToHomeButton}>
              <Text style={styles.backToHomeButtonText}>Quay lại danh sách</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component for a comparison row
const CompareRow = ({ label, value1, value2, highlight, isLongText, betterIndex }: any) => {
  const isDiff = value1 !== value2;
  const rowStyle = [styles.desktopRow, styles.rowBorder, highlight && isDiff && styles.diffRow];
  
  return (
    <View style={rowStyle}>
      <View style={styles.labelColumn}>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <View style={styles.valueCol}>
        <Text style={[
          styles.valueText, 
          betterIndex === 0 ? styles.betterValue : null
        ]}>
            {value1}
        </Text>
      </View>
      <View style={styles.valueCol}>
        <Text style={[
          styles.valueText, 
          betterIndex === 1 ? styles.betterValue : null
        ]}>
            {value2}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: THEME.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backButton: { padding: 8 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.textMain,
  },
  clearButton: { padding: 8 },
  clearButtonText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  compareWrapper: {
    backgroundColor: THEME.card,
    margin: 10,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  desktopRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'stretch', // Ensure columns stretch to match height
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: THEME.border, // Very light divider
    paddingVertical: 12,
  },
  diffRow: {
    backgroundColor: '#F3F4F6',
  },
  labelColumn: {
    width: '26%', // Fixed width for labels
    justifyContent: 'center',
    paddingRight: 8,
  },
  labelColumnPlaceholder: {
    width: '26%',
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.textSub,
  },
  valueCol: {
    width: '37%', // Remaining space split by 2 (approx 74%)
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  valueColCenter: {
    width: '37%',
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomHeaderCol: {
    width: '37%',
    paddingHorizontal: 6,
    alignItems: 'center',
    paddingBottom: 16,
  },
  roomImage: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#E5E7EB',
  },
  roomTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textMain,
    textAlign: 'center',
    lineHeight: 20,
  },
  valueText: {
    fontSize: 14,
    color: THEME.textMain,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '700',
    // color: THEME.primary, // Removed as per request
  },
  sectionDivider: {
    height: 12,
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textMain,
  },
  detailButton: {
    borderWidth: 1,
    borderColor: THEME.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: THEME.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    color: THEME.textMain,
  },
  emptySubtitle: {
    marginTop: 8,
    color: THEME.textSub,
    textAlign: 'center',
    marginBottom: 24,
  },
  backToHomeButton: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToHomeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  systemReviewContainer: {
    marginVertical: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  systemReviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  systemReviewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.primary,
  },
  analysisCol: {
    width: '37%', // Must match valueCol
    paddingHorizontal: 4,
    marginLeft: 2, // Fine tune alignment
  },
  advTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  advText: {
    fontSize: 10,
    color: THEME.textMain,
    fontWeight: '500',
  },
  neutralText: {
    fontSize: 12,
    color: THEME.textSub,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  betterValue: {
    color: THEME.success,
    fontWeight: '700',
  }
});
