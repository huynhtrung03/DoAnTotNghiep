import React, { useEffect, useState } from 'react';
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
import Constants from 'expo-constants';
import MapView, { PROVIDER_GOOGLE, UrlTile, Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../styles/screens/SearchScreen.styles';
import SuggestAddressBar from '../../components/filter/SuggestAddressBar';
import RoomsList from '../../components/rooms';

// --- RoomCard Component (Tách riêng để dễ quản lý) ---
const RoomCard = ({ room }: { room: any }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}>
      {/* Image with VIP Badge */}
      <Image source={{ uri: room.image }} style={styles.cardImage} />
      {room.isVip && (
        <View style={styles.vipBadge}>
          <Ionicons name="star" size={12} color="#FFFFFF" />
          <Text style={styles.vipBadgeText}>VIP</Text>
        </View>
      )}

      {/* Card Content */}
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {room.title}
        </Text>

        {/* Address & Area */}
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>
            {room.address}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={14} color="#6B7280" />
          <Text style={styles.infoText}>{room.area} m²</Text>
        </View>
      </View>

      {/* Card Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>
          {formatPrice(room.price)}
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
  const extra: any =
    (Constants as any).expoConfig?.extra ??
    (Constants as any).manifest?.extra ??
    {};
  const { NEXT_PUBLIC_GOONG_API_KEY, NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } = extra as {
    NEXT_PUBLIC_GOONG_API_KEY?: string;
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?: string;
  };
  
  if (__DEV__) {
    // Log once to verify keys are available at runtime
    // eslint-disable-next-line no-console
    console.log('Map tokens loaded:', {
      hasGoong: Boolean(NEXT_PUBLIC_GOONG_API_KEY),
    });
  }
  
  // Không cần useEffect cho Goong với react-native-maps
  // Goong tiles sẽ được load trực tiếp qua UrlTile component
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'all'>('search');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(true);
  
  // LỖI 2: Biến 'region' này không được sử dụng. Thư viện expo-maps dùng 'cameraPosition'.
  // Đã XÓA: const [region, setRegion] = useState(...)

  const [cameraPosition, setCameraPosition] = useState({
    center: {
      latitude: 10.7769,
      longitude: 106.7009,
    },
    zoom: 15,
  });

  const handleAddressChange = (address: { searchAddress: string }) => {
    if (address.searchAddress) {
      performSearch(address.searchAddress);
    }
  };

  const performSearch = async (searchQuery: string) => {
    setIsSearching(true);
    setLastQuery(searchQuery);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResults = [
        {
          id: '1',
          title: `Phòng trọ cao cấp gần ${searchQuery}`,
          price: 5000000,
          address: searchQuery,
          area: 25,
          image: `https://picsum.photos/seed/${Math.random()}/400/300`,
          isVip: true,
        },
        {
          id: '2',
          title: `Căn hộ mini tiện nghi tại ${searchQuery}`,
          price: 7500000,
          address: searchQuery,
          area: 35,
          image: `https://picsum.photos/seed/${Math.random()}/400/300`,
          isVip: false,
        },
        {
          id: '3',
          title: `Studio giá rẻ cho sinh viên khu vực ${searchQuery}`,
          price: 3200000,
          address: searchQuery,
          area: 20,
          image: `https://picsum.photos/seed/${Math.random()}/400/300`,
          isVip: false,
        },
      ];

      setSearchResults(mockResults);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tìm kiếm phòng trọ');
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchResults([]);
    setLastQuery('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.header}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text style={styles.headerTitle}>Tìm Kiếm</Text>
          <TouchableOpacity
            onPress={() => setIsCollapsed(!isCollapsed)}
            style={styles.collapseToggle}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isCollapsed ? 'chevron-down' : 'chevron-up'}
              size={18}
              color="#2563EB"
            />
            <Text style={styles.collapseToggleText}>
              {isCollapsed ? 'Mở tìm kiếm' : 'Thu gọn'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!isCollapsed && (
        <View style={styles.searchContainer}>
          <SuggestAddressBar
            showSaveButton={true}
            onChange={handleAddressChange}
          />
        </View>
      )}

      {!isCollapsed && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'search' && styles.activeTab]}
            onPress={() => setActiveTab('search')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'search' && styles.activeTabText,
              ]}
            >
              🔍 Tìm kiếm
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'all' && styles.activeTabText,
              ]}
            >
              🏠 Tất cả phòng
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isCollapsed ? (
        <View style={styles.mapContainer}>
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: cameraPosition.center.latitude,
              longitude: cameraPosition.center.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onRegionChangeComplete={(region) => {
              setCameraPosition({
                center: {
                  latitude: region.latitude,
                  longitude: region.longitude,
                },
                zoom: 15,
              });
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
            onMapReady={() => {
              console.log('Goong Map ready');
              setIsMapLoading(false);
            }}
          >
            {/* Goong Map Tiles */}
            {NEXT_PUBLIC_GOONG_API_KEY && (
              <UrlTile
                urlTemplate={`https://tiles.goong.io/assets/goong_map_web/{z}/{x}/{y}.png?api_key=${NEXT_PUBLIC_GOONG_API_KEY}`}
                maximumZ={19}
                flipY={false}
                zIndex={-1}
              />
            )}
          </MapView>
          {isMapLoading && (
            <View style={styles.mapLoadingOverlay}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={styles.mapLoadingText}>Đang tải bản đồ Goong...</Text>
            </View>
          )}
        </View>
      ) : activeTab === 'search' ? (
        <ScrollView style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
            </View>
          ) : searchResults.length > 0 ? (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>
                  Kết quả cho '{lastQuery}'
                </Text>
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
              <Ionicons
                name="search-circle-outline"
                size={80}
                color="#D1D5DB"
              />
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