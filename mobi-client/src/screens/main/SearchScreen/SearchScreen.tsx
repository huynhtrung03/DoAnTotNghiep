import React, { useState, useEffect } from 'react';
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
  TextInput,
} from 'react-native';
import Constants from 'expo-constants';
import MapboxGL from '@rnmapbox/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import styles from '../../../styles/screens/user/SearchScreen.styles';
import { useSearchLocation, getMarkerScale } from '../../../hooks/useSearchLocation';
import SearchRoomCard from '../../../components/rooms/SearchRoomCard/SearchRoomCard';

export default function SearchScreen() {
  const extra: any = (Constants as any).expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {};
  const { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } = extra as { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?: string };

  // ✅ Sử dụng custom hook
  const {
    userLocation,
    currentCity,
    roomsOnMap,
    isLoadingRooms,
    currentZoom,
    cameraPosition,
    isMapLoading,
    currentMapCenterRef,
    goToCurrentLocation,
    searchRoomsAtCurrentMapCenter,
    handleMapIdle,
    setIsMapLoading,
    searchAddressByText,
    addressSuggestions,
    isLoadingSuggestions,
    getAddressSuggestions,
    selectAddressSuggestion,
    setAddressSuggestions,
  } = useSearchLocation();

  useEffect(() => {
    if (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      MapboxGL.setAccessToken(NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN);
      if (__DEV__) console.log('✅ Mapbox token set.');
    } else {
      console.error('❌ Mapbox Access Token không tìm thấy!');
    }
  }, [NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN]);

  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'newest' | 'nearest'>('newest');
  const [filterVisible, setFilterVisible] = useState(false);
  const cameraRef = React.useRef<MapboxGL.Camera>(null);
  const mapRef = React.useRef<MapboxGL.MapView>(null);
  const [searchAddress, setSearchAddress] = useState('');

  // ✅ Hàm sắp xếp danh sách phòng
  const getSortedRooms = () => {
    const roomsCopy = [...roomsOnMap];

    switch (sortBy) {
      case 'price-asc':
        // Giá thấp → cao
        return roomsCopy.sort((a, b) => {
          const priceA = a.priceMonth || a.price || 0;
          const priceB = b.priceMonth || b.price || 0;
          return priceA - priceB;
        });

      case 'price-desc':
        // Giá cao → thấp
        return roomsCopy.sort((a, b) => {
          const priceA = a.priceMonth || a.price || 0;
          const priceB = b.priceMonth || b.price || 0;
          return priceB - priceA;
        });

      case 'nearest':
        // Gần nhất (dựa vào user location)
        if (!userLocation) return roomsCopy;
        
        return roomsCopy.sort((a, b) => {
          const latA = a.lat || a.latitude || 0;
          const lngA = a.lng || a.longitude || 0;
          const latB = b.lat || b.latitude || 0;
          const lngB = b.lng || b.longitude || 0;

          // Tính khoảng cách Euclidean đơn giản
          const distanceA = Math.sqrt(
            Math.pow(latA - userLocation.latitude, 2) + 
            Math.pow(lngA - userLocation.longitude, 2)
          );
          const distanceB = Math.sqrt(
            Math.pow(latB - userLocation.latitude, 2) + 
            Math.pow(lngB - userLocation.longitude, 2)
          );

          return distanceA - distanceB;
        });

      case 'newest':
      default:
        // Mới nhất - ưu tiên VIP, sau đó giữ nguyên thứ tự từ API
        return roomsCopy.sort((a, b) => {
          const isVipA = a.isVip || a.postType?.toLowerCase().includes('vip');
          const isVipB = b.isVip || b.postType?.toLowerCase().includes('vip');
          
          if (isVipA && !isVipB) return -1;
          if (!isVipA && isVipB) return 1;
          return 0; // Giữ nguyên thứ tự gốc
        });
    }
  };

  // Tạo GeoJSON từ roomsOnMap
  const createGeoJSONFromRooms = () => {
    const features = roomsOnMap.map((room, index) => {
      const longitude = room.lng || room.longitude || room.coordinates?.longitude;
      const latitude = room.lat || room.latitude || room.coordinates?.latitude;
      
      if (!longitude || !latitude) {
        return null;
      }

      const roomId = room.id || room.roomId || `room-${index}`;
      const price = room.priceMonth || room.price || room.roomPrice || 0;
      const priceInMillions = (price / 1_000_000).toFixed(1);
      const postType = room.postType?.toLowerCase() || '';
      
      // Xác định icon type dựa vào postType
      let iconType = 'normal';
      if (postType.includes('vip')) {
        iconType = 'vip';
      } else if (postType.includes('premium') || postType.includes('pro')) {
        iconType = 'premium';
      } else if (postType.includes('hot') || postType.includes('nổi bật')) {
        iconType = 'hot';
      }

      return {
        type: 'Feature',
        id: roomId,
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        properties: {
          price: priceInMillions,
          iconType: iconType,
          roomId: roomId,
        },
      };
    }).filter(Boolean);

    return {
      type: 'FeatureCollection',
      features: features,
    };
  };

  const renderMarkers = () => {
    const geoJSON = createGeoJSONFromRooms();
    
    return (
      <>
        <MapboxGL.Images
          images={{
            'home-icon-vip': require('../../../../assets/images/icon/G-home.png'),
            'home-icon-normal': require('../../../../assets/images/icon/R-home.png'),
          }}
        />
        <MapboxGL.ShapeSource
          id="roomsSource"
          shape={geoJSON as any}>
          {/* Layer cho VIP - màu vàng với G-home icon */}
          <MapboxGL.SymbolLayer
            id="roomMarkersVip"
            filter={['==', ['get', 'iconType'], 'vip']}
            style={{
              iconImage: 'home-icon-vip',
              iconSize: 0.08,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              textField: ['concat', ['get', 'price'], 'tr'],
              textSize: 10,
              textFont: ['Open Sans Bold', 'Arial Unicode MS Bold'],
              textOffset: [0, 1.5],
              textAnchor: 'top',
              textColor: '#FFD700',
              textHaloColor: '#FFFFFF',
              textHaloWidth: 1.5,
            }}
          />
          {/* Layer cho Premium - màu tím với R-home icon */}
          <MapboxGL.SymbolLayer
            id="roomMarkersPremium"
            filter={['==', ['get', 'iconType'], 'premium']}
            style={{
              iconImage: 'home-icon-normal',
              iconSize: 0.06,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              textField: ['concat', ['get', 'price'], 'tr'],
              textSize: 10,
              textFont: ['Open Sans Bold', 'Arial Unicode MS Bold'],
              textOffset: [0, 1.5],
              textAnchor: 'top',
              textColor: '#9333EA',
              textHaloColor: '#FFFFFF',
              textHaloWidth: 1.5,
            }}
          />
          {/* Layer cho Hot - màu đỏ với R-home icon */}
          <MapboxGL.SymbolLayer
            id="roomMarkersHot"
            filter={['==', ['get', 'iconType'], 'hot']}
            style={{
              iconImage: 'home-icon-normal',
              iconSize: 0.06,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              textField: ['concat', ['get', 'price'], 'tr'],
              textSize: 10,
              textFont: ['Open Sans Bold', 'Arial Unicode MS Bold'],
              textOffset: [0, 1.5],
              textAnchor: 'top',
              textColor: '#EF4444',
              textHaloColor: '#FFFFFF',
              textHaloWidth: 1.5,
            }}
          />
          {/* Layer cho Normal - màu xanh với R-home icon */}
          <MapboxGL.SymbolLayer
            id="roomMarkersNormal"
            filter={['==', ['get', 'iconType'], 'normal']}
            style={{
              iconImage: 'home-icon-normal',
              iconSize: 0.06,
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              textField: ['concat', ['get', 'price'], 'tr'],
              textSize: 10,
              textFont: ['Open Sans Bold', 'Arial Unicode MS Bold'],
              textOffset: [0, 1.5],
              textAnchor: 'top',
              textColor: '#2563EB',
              textHaloColor: '#FFFFFF',
              textHaloWidth: 1.5,
            }}
          />
        </MapboxGL.ShapeSource>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Modern Header */}
      <View style={styles.modernHeader}>
        {/* Search Bar - Always visible */}
        <View style={styles.modernSearchContainer}>
          <View style={styles.modernSearchBar}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              style={styles.modernSearchInput}
              placeholder={currentCity ? `Tìm phòng ở ${currentCity}` : 'Tìm phòng trọ...'}
              placeholderTextColor="#9CA3AF"
              value={searchAddress}
              onChangeText={(text) => {
                setSearchAddress(text);
                getAddressSuggestions(text);
              }}
              returnKeyType="search"
              onSubmitEditing={() => {
                searchAddressByText(searchAddress, cameraRef, mapRef);
                setAddressSuggestions([]);
              }}
            />
            {searchAddress.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchAddress('');
                  setAddressSuggestions([]);
                }}
                style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Advanced Filter Button */}
          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={() => setFilterVisible(!filterVisible)}
            activeOpacity={0.7}>
            <Ionicons 
              name="options-outline" 
              size={22} 
              color={filterVisible ? '#2563EB' : '#6B7280'} 
            />
          </TouchableOpacity>
        </View>

        {/* View Toggle Tabs */}
        <View style={styles.modernTabContainer}>
          <TouchableOpacity
            style={[styles.modernTab, activeTab === 'map' && styles.modernTabActive]}
            onPress={() => setActiveTab('map')}
            activeOpacity={0.7}>
            <Ionicons 
              name="map" 
              size={18} 
              color={activeTab === 'map' ? '#2563EB' : '#6B7280'} 
            />
            <Text style={[
              styles.modernTabText, 
              activeTab === 'map' && styles.modernTabTextActive
            ]}>
              Bản đồ
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modernTab, activeTab === 'list' && styles.modernTabActive]}
            onPress={() => setActiveTab('list')}
            activeOpacity={0.7}>
            <Ionicons 
              name="grid" 
              size={18} 
              color={activeTab === 'list' ? '#2563EB' : '#6B7280'} 
            />
            <Text style={[
              styles.modernTabText, 
              activeTab === 'list' && styles.modernTabTextActive
            ]}>
              Danh sách
            </Text>
          </TouchableOpacity>

          {/* Room Count Badge */}
          <View style={styles.modernRoomCount}>
            <Ionicons name="home" size={14} color="#FFFFFF" />
            <Text style={styles.modernRoomCountText}>
              {roomsOnMap.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Address Suggestions Dropdown */}
      {addressSuggestions.length > 0 && (
        <View style={styles.modernSuggestionsContainer}>
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
            style={styles.suggestionsScrollView}>
            {isLoadingSuggestions ? (
              <View style={styles.modernSuggestionItem}>
                <ActivityIndicator size="small" color="#2563EB" />
                <Text style={styles.modernSuggestionText}>Đang tìm kiếm...</Text>
              </View>
            ) : (
              addressSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={suggestion.id || index}
                  style={styles.modernSuggestionItem}
                  onPress={() => {
                    setSearchAddress(suggestion.place_name);
                    selectAddressSuggestion(suggestion, cameraRef, mapRef);
                  }}
                  activeOpacity={0.7}>
                  <View style={styles.suggestionIconContainer}>
                    <Ionicons name="location" size={18} color="#2563EB" />
                  </View>
                  <View style={styles.suggestionTextContainer}>
                    <Text style={styles.modernSuggestionTitle} numberOfLines={1}>
                      {suggestion.text}
                    </Text>
                    <Text style={styles.modernSuggestionSubtitle} numberOfLines={1}>
                      {suggestion.place_name}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* Tab: Bản đồ */}
      {activeTab === 'map' && (
        <View style={styles.mapContainer}>
          <MapboxGL.MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            styleURL={MapboxGL.StyleURL.Street}
            onDidFinishLoadingMap={() => {
              console.log('✅ Map loaded');
              setIsMapLoading(false);
            }}
            onRegionDidChange={() => handleMapIdle(mapRef)}
            logoEnabled
            attributionEnabled
            compassEnabled
            scaleBarEnabled={false}
          >
            <MapboxGL.Camera
              ref={cameraRef}
              defaultSettings={{
                centerCoordinate: [cameraPosition.center.longitude, cameraPosition.center.latitude],
                zoomLevel: cameraPosition.zoom,
              }}
            />

            <MapboxGL.UserLocation
              visible
              animated
            />

            {roomsOnMap.length > 0 && renderMarkers()}
          </MapboxGL.MapView>

          {/* Floating Action Buttons */}
          <View style={styles.mapControlsContainer}>
            {/* Current Location Button */}
            <TouchableOpacity
              style={styles.modernMapButton}
              onPress={() => goToCurrentLocation(cameraRef)}
              activeOpacity={0.8}>
              <Ionicons name="locate" size={22} color="#2563EB" />
            </TouchableOpacity>

            {/* Refresh/Search at Location Button */}
            <TouchableOpacity
              style={[styles.modernMapButton, styles.primaryButton]}
              onPress={() => searchRoomsAtCurrentMapCenter(mapRef)}
              activeOpacity={0.8}
              disabled={isLoadingRooms}>
              {isLoadingRooms ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search" size={18} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Tìm ở đây</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {isMapLoading && (
            <View style={styles.modernMapLoadingOverlay}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.modernLoadingText}>Đang tải bản đồ...</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Tab: Danh sách */}
      {activeTab === 'list' && (
        <View style={styles.modernListContainer}>
          {/* Quick Filter Chips */}
          <View style={styles.modernFilterBar}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterChipsContainer}>
              <TouchableOpacity
                style={[styles.modernFilterChip, sortBy === 'newest' && styles.modernFilterChipActive]}
                onPress={() => setSortBy('newest')}
                activeOpacity={0.7}>
                <Ionicons 
                  name="time" 
                  size={16} 
                  color={sortBy === 'newest' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.modernFilterChipText, 
                  sortBy === 'newest' && styles.modernFilterChipTextActive
                ]}>
                  Mới nhất
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modernFilterChip, sortBy === 'price-asc' && styles.modernFilterChipActive]}
                onPress={() => setSortBy('price-asc')}
                activeOpacity={0.7}>
                <Ionicons 
                  name="trending-up" 
                  size={16} 
                  color={sortBy === 'price-asc' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.modernFilterChipText, 
                  sortBy === 'price-asc' && styles.modernFilterChipTextActive
                ]}>
                  Giá thấp
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modernFilterChip, sortBy === 'price-desc' && styles.modernFilterChipActive]}
                onPress={() => setSortBy('price-desc')}
                activeOpacity={0.7}>
                <Ionicons 
                  name="trending-down" 
                  size={16} 
                  color={sortBy === 'price-desc' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.modernFilterChipText, 
                  sortBy === 'price-desc' && styles.modernFilterChipTextActive
                ]}>
                  Giá cao
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modernFilterChip, sortBy === 'nearest' && styles.modernFilterChipActive]}
                onPress={() => setSortBy('nearest')}
                activeOpacity={0.7}>
                <Ionicons 
                  name="navigate" 
                  size={16} 
                  color={sortBy === 'nearest' ? '#FFFFFF' : '#6B7280'} 
                />
                <Text style={[
                  styles.modernFilterChipText, 
                  sortBy === 'nearest' && styles.modernFilterChipTextActive
                ]}>
                  Gần nhất
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Rooms Grid/List */}
          <ScrollView 
            style={styles.roomsScrollView}
            contentContainerStyle={styles.roomsScrollContent}
            showsVerticalScrollIndicator={false}>
            {isLoadingRooms ? (
              <View style={styles.modernLoadingContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.modernLoadingSubtext}>Đang tải danh sách phòng...</Text>
              </View>
            ) : roomsOnMap.length > 0 ? (
              getSortedRooms().map((room, index) => (
                <SearchRoomCard 
                  key={room.id || `room-${index}`} 
                  room={room}
                />
              ))
            ) : (
              <View style={styles.modernEmptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>Không tìm thấy phòng</Text>
                <Text style={styles.emptySubtitle}>
                  Di chuyển bản đồ hoặc thay đổi bộ lọc để tìm phòng phù hợp
                </Text>
                <TouchableOpacity 
                  style={styles.emptyActionButton}
                  onPress={() => setActiveTab('map')}
                  activeOpacity={0.8}>
                  <Text style={styles.emptyActionButtonText}>Xem bản đồ</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}