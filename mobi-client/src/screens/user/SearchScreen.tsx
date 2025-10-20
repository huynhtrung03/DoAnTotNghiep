import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import SuggestAddressBar from '../../components/filter/SuggestAddressBar';
import RoomsList from '../../components/rooms';

// --- RoomCard Component (Tách riêng để dễ quản lý) ---
const RoomCard = ({ room }: { room: any }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {/* Image with VIP Badge */}
      <Image 
        source={{ uri: room.image }} 
        style={styles.cardImage} 
      />
      {room.isVip && (
        <View style={styles.vipBadge}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.vipBadgeText}>VIP</Text>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{room.title}</Text>
        
        {/* Address & Area */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>{room.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>{room.area} m²</Text>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>{formatPrice(room.price)}
          <Text style={styles.priceUnit}> / tháng</Text>
        </Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// --- Main Search Screen Component ---
export default function SearchScreen() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'search' | 'all'>('search');

  const handleAddressChange = (address: { searchAddress: string }) => {
    if (address.searchAddress) {
      performSearch(address.searchAddress);
    }
  };

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    setLastQuery(searchQuery);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults = [
        {
          id: "1",
          title: `Phòng trọ cao cấp gần ${searchQuery}`,
          price: 5000000,
          address: searchQuery,
          area: 25,
          image: `https://picsum.photos/seed/${Math.random()}/400/300`,
          isVip: true,
        },
        {
          id: "2", 
          title: `Căn hộ mini tiện nghi tại ${searchQuery}`,
          price: 7500000,
          address: searchQuery,
          area: 35,
          image: `https://picsum.photos/seed/${Math.random()}/400/300`,
          isVip: false,
        },
        {
          id: "3", 
          title: `Studio giá rẻ cho sinh viên khu vực ${searchQuery}`,
          price: 3200000,
          address: searchQuery,
          area: 20,
          image: `https://picsum.photos/seed/${Math.random()}/400/300`,
          isVip: false,
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tìm kiếm phòng trọ");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setLastQuery("");
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tìm Kiếm</Text>
      </View>

      <View style={styles.searchContainer}>
        <SuggestAddressBar
          showSaveButton={true}
          onChange={handleAddressChange}
        />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={() => setActiveTab('search')}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            🔍 Tìm kiếm
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            🏠 Tất cả phòng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on active tab */}
      {activeTab === 'search' ? (
        <ScrollView style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Kết quả cho '{lastQuery}'</Text>
                <TouchableOpacity onPress={clearSearch}>
                  <Text style={styles.clearButtonText}>Xóa</Text>
                </TouchableOpacity>
              </View>
              
              {searchResults.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-circle-outline" size={80} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Tìm kiếm phòng trọ</Text>
              <Text style={styles.emptySubtitle}>
                Nhập địa chỉ bạn muốn tìm để xem các phòng có sẵn.
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <RoomsList />
      )}
    </SafeAreaView>
  );
}

// --- StyleSheet ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6', // Lighter gray background for contrast
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  searchContainer: {
    backgroundColor: 'white',
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  resultsContainer: {
    flex: 1,
  },
  // --- States ---
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  loadingState: {
    marginTop: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  // --- Results Section ---
  resultsSection: {
    padding: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  // --- Card Styles ---
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden', // Ensures image corners are rounded
  },
  cardImage: {
    height: 180,
    width: '100%',
  },
  vipBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  detailsButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});