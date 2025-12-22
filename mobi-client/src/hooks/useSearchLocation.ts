import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import pointInPolygon from 'point-in-polygon';
import MapboxGL from '@rnmapbox/maps';
import { getRoomsInBounds } from '../services/RoomService';
import { cityBoundariesData } from '../data/cityBoundaries';
import Constants from 'expo-constants';

// Parse GeoJSON và tạo CITY_BOUNDARIES từ file
const CITY_BOUNDARIES: Record<string, number[][][]> = {};

// Load boundaries từ GeoJSON
if (cityBoundariesData && cityBoundariesData.features) {
  cityBoundariesData.features.forEach((feature: any) => {
    const cityName = feature.properties?.ten_tinh;
    if (cityName && feature.geometry?.coordinates) {
      const multiPolygonCoordinates = feature.geometry.coordinates;
      
      const polygons: number[][][] = [];
      multiPolygonCoordinates.forEach((polygonGroup: any) => {
        if (polygonGroup && polygonGroup[0]) {
          polygons.push(polygonGroup[0]);
        }
      });
      
      if (polygons.length > 0) {
        CITY_BOUNDARIES[cityName] = polygons;
      }
    }
  });
}

if (__DEV__) {
  //console.log(' Loaded city boundaries:', Object.keys(CITY_BOUNDARIES).length, 'cities');
}

// Hàm xác định thành phố dựa trên tọa độ
export const detectCity = (latitude: number, longitude: number): string | null => {
  const point = [longitude, latitude];
  
  for (const [cityName, polygons] of Object.entries(CITY_BOUNDARIES)) {
    for (const polygon of polygons) {
      if (pointInPolygon(point, polygon)) {
        if (__DEV__) {
          //console.log(` Phát hiện thành phố: "${cityName}" tại [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`);
        }
        return cityName;
      }
    }
  }
  
  if (__DEV__) {
    //console.log(`️ Không xác định được thành phố tại [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`);
  }
  return null;
};

// Hàm tính kích thước icon dựa trên zoom level
export const getMarkerScale = (zoom: number): number => {
  const minZoom = 10;
  const maxZoom = 20;
  const minScale = 0.5;
  const maxScale = 1.8;
  
  const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
  const scale = minScale + ((clampedZoom - minZoom) / (maxZoom - minZoom)) * (maxScale - minScale);
  
  return scale;
};

export const useSearchLocation = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [currentCity, setCurrentCity] = useState<string | null>(null);
  const [roomsOnMap, setRoomsOnMap] = useState<any[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(15);
  const [cameraPosition, setCameraPosition] = useState({
    center: { latitude: 13.9528067, longitude: 108.6565818 },
    zoom: 15,
  });
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentMapCenterRef = useRef({ latitude: 13.9528067, longitude: 108.6565818 });
  const suggestionDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy Mapbox Access Token
  const getMapboxToken = () => {
    const extra: any = (Constants as any).expoConfig?.extra ?? (Constants as any).manifest?.extra ?? {};
    return extra.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  };

  // Hàm geocoding - tìm tọa độ từ địa chỉ text
  const searchAddressByText = async (
    searchText: string,
    cameraRef: React.RefObject<MapboxGL.Camera | null>,
    mapRef: React.RefObject<MapboxGL.MapView | null>
  ) => {
    if (!searchText || searchText.trim().length < 3) {
      Alert.alert('Lỗi', 'Vui lòng nhập ít nhất 3 ký tự để tìm kiếm');
      return;
    }

    try {
      setIsLoadingRooms(true);
      const token = getMapboxToken();
      
      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy Mapbox Access Token');
        setIsLoadingRooms(false);
        return;
      }

      // Mapbox Geocoding API - ưu tiên khu vực Việt Nam
      const encodedQuery = encodeURIComponent(searchText);
      const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` +
        `access_token=${token}&` +
        `country=VN&` + // Giới hạn trong Việt Nam
        `limit=5&` +
        `language=vi`; // Ưu tiên tiếng Việt

      if (__DEV__) {
        //console.log(' Tìm kiếm địa chỉ:', searchText);
      }

      const response = await fetch(geocodingUrl);
      const data = await response.json();

      if (__DEV__) {
        //console.log(' Mapbox Geocoding Response:', data);
      }

      if (!data.features || data.features.length === 0) {
        Alert.alert(
          'Không tìm thấy',
          'Không tìm thấy địa chỉ phù hợp. Vui lòng thử lại với từ khóa khác.'
        );
        setIsLoadingRooms(false);
        return;
      }

      // Lấy kết quả đầu tiên (relevant nhất)
      const firstResult = data.features[0];
      const [longitude, latitude] = firstResult.center;
      const placeName = firstResult.place_name;

      if (__DEV__) {
        //console.log(' Tìm thấy vị trí:', { latitude, longitude, placeName });
      }

      // Di chuyển camera đến vị trí
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 15,
          animationDuration: 1500,
        });
      }

      // Cập nhật vị trí hiện tại
      currentMapCenterRef.current = { latitude, longitude };
      setCameraPosition({
        center: { latitude, longitude },
        zoom: 15,
      });

      // Phát hiện thành phố
      const detectedCity = detectCity(latitude, longitude);
      setCurrentCity(detectedCity);

      // Đợi animation hoàn thành rồi mới load phòng
      setTimeout(async () => {
        if (mapRef.current) {
          const bounds = await mapRef.current.getVisibleBounds();
          if (bounds && Array.isArray(bounds) && bounds.length === 2) {
            const [[minLng, minLat], [maxLng, maxLat]] = bounds;
            await fetchRoomsInBounds(minLat, minLng, maxLat, maxLng);
          }
        }
      }, 1600);

      if (__DEV__) {
        //console.log(' Di chuyển đến:', placeName);
      }

    } catch (error) {
      console.error(' Lỗi geocoding:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm địa chỉ. Vui lòng thử lại.');
      setIsLoadingRooms(false);
    }
  };

  // Hàm lấy gợi ý địa chỉ (autocomplete)
  const getAddressSuggestions = async (searchText: string) => {
    // Clear timer cũ
    if (suggestionDebounceRef.current) {
      clearTimeout(suggestionDebounceRef.current);
    }

    // Nếu text quá ngắn, xóa suggestions
    if (!searchText || searchText.trim().length < 2) {
      setAddressSuggestions([]);
      setIsLoadingSuggestions(false);
      return;
    }

    // Debounce 300ms
    setIsLoadingSuggestions(true);
    suggestionDebounceRef.current = setTimeout(async () => {
      try {
        const token = getMapboxToken();
        
        if (!token) {
          setIsLoadingSuggestions(false);
          return;
        }

        const encodedQuery = encodeURIComponent(searchText);
        const geocodingUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?` +
          `access_token=${token}&` +
          `country=VN&` +
          `limit=5&` +
          `language=vi&` +
          `types=place,locality,neighborhood,address,poi`; // Các loại địa điểm

        const response = await fetch(geocodingUrl);
        const data = await response.json();

        if (__DEV__) {
          //console.log(' Suggestions:', data.features?.length || 0);
        }

        if (data.features && data.features.length > 0) {
          setAddressSuggestions(data.features);
        } else {
          setAddressSuggestions([]);
        }
        
        setIsLoadingSuggestions(false);
      } catch (error) {
        console.error(' Lỗi lấy gợi ý:', error);
        setAddressSuggestions([]);
        setIsLoadingSuggestions(false);
      }
    }, 300);
  };

  // Hàm chọn 1 suggestion và di chuyển đến đó
  const selectAddressSuggestion = async (
    suggestion: any,
    cameraRef: React.RefObject<MapboxGL.Camera | null>,
    mapRef: React.RefObject<MapboxGL.MapView | null>
  ) => {
    try {
      setIsLoadingRooms(true);
      setAddressSuggestions([]); // Ẩn danh sách gợi ý

      const [longitude, latitude] = suggestion.center;
      const placeName = suggestion.place_name;

      if (__DEV__) {
        //console.log(' Chọn địa chỉ:', placeName);
      }

      // Di chuyển camera
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 15,
          animationDuration: 1500,
        });
      }

      currentMapCenterRef.current = { latitude, longitude };
      setCameraPosition({
        center: { latitude, longitude },
        zoom: 15,
      });

      const detectedCity = detectCity(latitude, longitude);
      setCurrentCity(detectedCity);

      // Load phòng sau khi di chuyển
      setTimeout(async () => {
        if (mapRef.current) {
          const bounds = await mapRef.current.getVisibleBounds();
          if (bounds && Array.isArray(bounds) && bounds.length === 2) {
            const [[minLng, minLat], [maxLng, maxLat]] = bounds;
            await fetchRoomsInBounds(minLat, minLng, maxLat, maxLng);
          }
        }
      }, 1600);

    } catch (error) {
      console.error(' Lỗi chọn địa chỉ:', error);
      setIsLoadingRooms(false);
    }
  };

  // Yêu cầu quyền truy cập vị trí khi component mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setLocationPermission(true);
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          
          setCameraPosition({
            center: { latitude, longitude },
            zoom: 15,
          });
          
          currentMapCenterRef.current = { latitude, longitude };
          
          // ✨ Detect city ngay khi lấy được location
          const detectedCity = detectCity(latitude, longitude);
          setCurrentCity(detectedCity);
          
          if (__DEV__) {
            //console.log(' Vị trí hiện tại:', { latitude, longitude });
            console.log('🏙️ Phát hiện thành phố:', detectedCity || 'Không xác định');
          }
        } else {
          Alert.alert(
            'Quyền truy cập vị trí',
            'Ứng dụng cần quyền truy cập vị trí để hiển thị vị trí của bạn trên bản đồ.'
          );
        }
      } catch (error) {
        console.error(' Lỗi lấy vị trí:', error);
      }
    })();
  }, []);

  // Cleanup debounce timer khi component unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (suggestionDebounceRef.current) {
        clearTimeout(suggestionDebounceRef.current);
      }
    };
  }, []);

  // Hàm lấy phòng theo vùng bản đồ hiển thị
  const fetchRoomsInBounds = async (minLat: number, minLng: number, maxLat: number, maxLng: number) => {
    try {
      setIsLoadingRooms(true);
      
      if (currentZoom < 8) {
        if (__DEV__) {
          //console.log(`️ Zoom level quá thấp (${currentZoom.toFixed(1)}), cần >= 8 để load phòng`);
        }
        setRoomsOnMap([]);
        setIsLoadingRooms(false);
        return;
      }
      
      const actualMinLat = Math.min(minLat, maxLat);
      const actualMaxLat = Math.max(minLat, maxLat);
      const actualMinLng = Math.min(minLng, maxLng);
      const actualMaxLng = Math.max(minLng, maxLng);
      
      // Tính kích thước khu vực (đơn vị: độ)
      // 1 độ latitude ≈ 111km
      // 1 độ longitude ≈ 111km * cos(latitude)
      const latDiff = actualMaxLat - actualMinLat;
      const lngDiff = actualMaxLng - actualMinLng;
      const centerLat = (actualMinLat + actualMaxLat) / 2;
      
      // Tính khoảng cách thực tế (km)
      const latDistanceKm = latDiff * 111;
      const lngDistanceKm = lngDiff * 111 * Math.cos(centerLat * Math.PI / 180);
      
      // Giới hạn tối đa: 111km x 111km
      const MAX_DISTANCE_KM = 111;
      
      if (__DEV__) {
        console.log(`📏 Kích thước khu vực: ${latDistanceKm.toFixed(1)}km x ${lngDistanceKm.toFixed(1)}km`);
      }
      
      // Nếu khu vực quá lớn, thu nhỏ về kích thước tối đa
      let finalMinLat = actualMinLat;
      let finalMaxLat = actualMaxLat;
      let finalMinLng = actualMinLng;
      let finalMaxLng = actualMaxLng;
      
      if (latDistanceKm > MAX_DISTANCE_KM || lngDistanceKm > MAX_DISTANCE_KM) {
        if (__DEV__) {
          console.log(`⚠️ Khu vực quá lớn! Thu nhỏ về ${MAX_DISTANCE_KM}km x ${MAX_DISTANCE_KM}km`);
        }
        
        // Thu nhỏ về kích thước tối đa, giữ nguyên tâm
        const maxLatDiff = MAX_DISTANCE_KM / 111;
        const maxLngDiff = MAX_DISTANCE_KM / (111 * Math.cos(centerLat * Math.PI / 180));
        
        if (latDistanceKm > MAX_DISTANCE_KM) {
          finalMinLat = centerLat - maxLatDiff / 2;
          finalMaxLat = centerLat + maxLatDiff / 2;
        }
        
        if (lngDistanceKm > MAX_DISTANCE_KM) {
          const centerLng = (actualMinLng + actualMaxLng) / 2;
          finalMinLng = centerLng - maxLngDiff / 2;
          finalMaxLng = centerLng + maxLngDiff / 2;
        }
        
        // Hiển thị thông báo cho user
        Alert.alert(
          'Khu vực quá lớn',
          `Khu vực bản đồ hiện tại (${latDistanceKm.toFixed(0)}km x ${lngDistanceKm.toFixed(0)}km) vượt quá giới hạn ${MAX_DISTANCE_KM}km.\n\nĐã thu nhỏ khu vực tìm kiếm. Vui lòng zoom in để xem chi tiết hơn.`,
          [{ text: 'OK' }]
        );
      }
  
      
      //  Gọi API với tham số đúng theo backend: (minLat, minLng, maxLat, maxLng)
      const data = await getRoomsInBounds(finalMinLat, finalMinLng, finalMaxLat, finalMaxLng);
      
      if (__DEV__) {
        //console.log(' API Response:', data);
      }
      
      // Check if data is an array (direct array response)
      if (data && Array.isArray(data)) {
        setRoomsOnMap(data);
        if (__DEV__) {
          //console.log(` Tìm thấy ${data.length} phòng trọ trong vùng bản đồ`);
          if (data.length > 0) {
            //console.log(' Phòng đầu tiên:', data[0]);
          }
        }
      } 
      // Check if data is an object with nested data array
      else if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as any).data)) {
        const nestedData = (data as any).data;
        setRoomsOnMap(nestedData);
        if (__DEV__) {
          //console.log(` Tìm thấy ${nestedData.length} phòng trọ (nested)`);
        }
      } 
      // No data found
      else {
        setRoomsOnMap([]);
        if (__DEV__) {
          //console.log('️ Không tìm thấy phòng trọ nào');
        }
      }
    } catch (error) {
      console.error(' Lỗi khi lấy danh sách phòng:', error);
      setRoomsOnMap([]);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  // Hàm quay về vị trí hiện tại
  const goToCurrentLocation = async (cameraRef: React.RefObject<MapboxGL.Camera | null>) => {
    try {
      if (!locationPermission) {
        Alert.alert(
          'Quyền truy cập vị trí',
          'Vui lòng cấp quyền truy cập vị trí trong Cài đặt để sử dụng tính năng này.'
        );
        return;
      }

      setIsMapLoading(true);

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      
      setUserLocation({ latitude, longitude });
      
      if (cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [longitude, latitude],
          zoomLevel: 16,
          animationDuration: 1500,
        });
      }

      setIsMapLoading(false);

      if (__DEV__) {
        //console.log(' Di chuyển đến vị trí:', { latitude, longitude });
      }
    } catch (error) {
      setIsMapLoading(false);
      console.error(' Lỗi lấy vị trí hiện tại:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng thử lại.');
    }
  };

  // Hàm tìm kiếm thủ công dựa vào tâm bản đồ hiện tại
  const searchRoomsAtCurrentMapCenter = async (mapRef: React.RefObject<MapboxGL.MapView | null>) => {
    try {
      if (!mapRef.current) return;

      const bounds = await mapRef.current.getVisibleBounds();
      if (!bounds || !Array.isArray(bounds) || bounds.length !== 2) return;

      const [[minLng, minLat], [maxLng, maxLat]] = bounds;
      
      if (__DEV__) {
        //console.log(' Tìm kiếm thủ công trong vùng bản đồ:', { minLat, minLng, maxLat, maxLng });
      }
      
      await fetchRoomsInBounds(minLat, minLng, maxLat, maxLng);
    } catch (error) {
      console.error(' Lỗi tìm kiếm thủ công:', error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm phòng. Vui lòng thử lại.');
    }
  };

  // Hàm xử lý khi map ngừng di chuyển
  const handleMapIdle = async (mapRef: React.RefObject<MapboxGL.MapView | null>) => {
    try {
      if (!mapRef.current) return;

      const bounds = await mapRef.current.getVisibleBounds();
      if (!bounds || !Array.isArray(bounds) || bounds.length !== 2) return;

      const [[minLng, minLat], [maxLng, maxLat]] = bounds;

      const center = await mapRef.current.getCenter();
      if (!center || !Array.isArray(center)) return;
      const [longitude, latitude] = center;

      const zoom = await mapRef.current.getZoom();
      if (zoom) {
        setCurrentZoom(zoom);
        if (__DEV__) {
          //console.log(' Zoom level:', zoom.toFixed(1));
        }
      }
      
      if (zoom && zoom < 8) {
        if (__DEV__) {
          //console.log('️ Zoom quá thấp, xóa marker');
        }
        setRoomsOnMap([]);
        return;
      }

      currentMapCenterRef.current = { latitude, longitude };
      
      const detectedCity = detectCity(latitude, longitude);
      setCurrentCity(detectedCity);

      if (__DEV__) {
        //console.log('️ Vùng bản đồ hiện tại:', { minLat, minLng, maxLat, maxLng });
        //console.log(' Tâm bản đồ:', { latitude, longitude });
        //console.log('️ Thành phố:', detectedCity || 'Không xác định');
      }

      const distance = Math.sqrt(
        Math.pow(latitude - cameraPosition.center.latitude, 2) +
        Math.pow(longitude - cameraPosition.center.longitude, 2)
      );

      if (distance > 0.005) {
        if (__DEV__) {
          //console.log('️ Map di chuyển, đợi 1s trước khi load phòng...');
        }

        setCameraPosition({
          center: { latitude, longitude },
          zoom: zoom || cameraPosition.zoom,
        });

        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        debounceTimerRef.current = setTimeout(() => {
          if (__DEV__) //console.log(' Load phòng trong vùng bản đồ mới');
          fetchRoomsInBounds(minLat, minLng, maxLat, maxLng);
        }, 1000);
      }
    } catch (error) {
      console.error(' Lỗi handleMapIdle:', error);
    }
  };

  return {
    // States
    userLocation,
    locationPermission,
    currentCity,
    roomsOnMap,
    isLoadingRooms,
    currentZoom,
    cameraPosition,
    isMapLoading,
    addressSuggestions,
    isLoadingSuggestions,
    
    // Refs
    currentMapCenterRef,
    
    // Functions
    fetchRoomsInBounds,
    goToCurrentLocation,
    searchRoomsAtCurrentMapCenter,
    handleMapIdle,
    setIsMapLoading,
    searchAddressByText,
    getAddressSuggestions,
    selectAddressSuggestion,
    setAddressSuggestions,
  };
};
