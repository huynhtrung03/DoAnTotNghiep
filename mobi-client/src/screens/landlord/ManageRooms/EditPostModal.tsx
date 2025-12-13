import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import DateTimePicker from '@react-native-community/datetimepicker';

import { getRoomById, updateRoom } from '../../../services/RoomService';
import { getPostTypes } from '../../../services/TypePostService';
import { getProvinces, getDistricts, getWards } from '../../../services/AddressService';
import { Colors } from '../../../styles/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EditPostModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string | null;
  onSuccess?: () => void;
}

interface FormData {
  title: string;
  description: string;
  priceMonth: string;
  priceDeposit: string;
  roomLength: string;
  roomWidth: string;
  elecPrice: string;
  waterPrice: string;
  maxPeople: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  convenients: string[];
  postStartDate: string;
  postEndDate: string;
}

export default function EditPostModal({
  visible,
  onClose,
  roomId,
  onSuccess,
}: EditPostModalProps) {
  const [loading, setLoading] = useState(false);
  const [roomData, setRoomData] = useState<any>(null);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [typePosts, setTypePosts] = useState<any[]>([]);
  const [convenients, setConvenients] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Refs to track if data has been fetched
  const initialDataFetchedRef = useRef(false);
  const roomDataLoadedRef = useRef(false);
  const addressLoadingRef = useRef({ districtId: '', wardId: '' });
  const isInitialLoadingRef = useRef(false);

  // Preset options for length/width (meters)
  const lengthPresets = [2, 2.5, 3, 3.5, 4, 4.5, 5];
  const widthPresets = [2, 2.5, 3, 3.5, 4, 4.5];

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priceMonth: '',
    priceDeposit: '',
    roomLength: '',
    roomWidth: '',
    elecPrice: '',
    waterPrice: '',
    maxPeople: '',
    address: '',
    province: '',
    district: '',
    ward: '',
    convenients: [],
    postStartDate: '',
    postEndDate: '',
  });

  // Fetch initial data (provinces, post types) - only once when modal opens
  useEffect(() => {
    if (!visible || initialDataFetchedRef.current) return;

    console.log('📋 [EditPostModal] Fetching initial data (provinces, types)');
    initialDataFetchedRef.current = true;

    const fetchInitialData = async () => {
      try {
        const [typepostsData, provincesData] = await Promise.all([
          getPostTypes(),
          getProvinces(),
        ]);

        setTypePosts(typepostsData);
        setProvinces(provincesData.map((p: any) => ({ label: p.name, value: p.id })));
        console.log('✅ [EditPostModal] Initial data loaded');
      } catch (error) {
        console.error('❌ [EditPostModal] Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();

    return () => {
      // Reset on modal close
      if (!visible) {
        initialDataFetchedRef.current = false;
      }
    };
  }, [visible]);

  // Fetch room data
  useEffect(() => {
    if (!roomId || !visible) return;

    console.log('🏠 [EditPostModal] Fetching room data for roomId:', roomId);
    roomDataLoadedRef.current = false;

    const fetchRoomData = async () => {
      setLoading(true);
      try {
        const data = await getRoomById(roomId);
        if (data) {
          console.log('✅ [EditPostModal] Room data loaded:', { 
            id: data.id, 
            title: data.title,
            province: data.address?.ward?.district?.province?.id,
            district: data.address?.ward?.district?.id,
            ward: data.address?.ward?.id
          });

          setRoomData(data);
          isInitialLoadingRef.current = true;
          
          // Initialize form data
          const provinceId = String(data.address?.ward?.district?.province?.id || '');
          const districtId = String(data.address?.ward?.district?.id || '');
          const wardId = String(data.address?.ward?.id || '');
          
          setFormData({
            title: data.title || '',
            description: data.description || '',
            priceMonth: String(data.priceMonth || ''),
            priceDeposit: String(data.priceDeposit || ''),
            roomLength: String(data.roomLength || ''),
            roomWidth: String(data.roomWidth || ''),
            elecPrice: String(data.elecPrice || ''),
            waterPrice: String(data.waterPrice || ''),
            maxPeople: String(data.maxPeople || ''),
            address: data.address?.street || '',
            province: provinceId,
            district: districtId,
            ward: wardId,
            convenients: data.convenients?.map((c: any) => c.id) || [],
            postStartDate: data.postStartDate ? new Date(data.postStartDate).toISOString().split('T')[0] : '',
            postEndDate: data.postEndDate ? new Date(data.postEndDate).toISOString().split('T')[0] : '',
          });

          roomDataLoadedRef.current = true;

          // Load address hierarchy AFTER setting form data
          if (provinceId && districtId) {
            console.log('📍 [EditPostModal] Loading address hierarchy...');
            await loadAddressHierarchy(provinceId, districtId, wardId);
          }

          setSelectedImages([]);
        }
      } catch (error) {
        console.error('❌ [EditPostModal] Error fetching room data:', error);
        Alert.alert('Error', 'Failed to load room data');
      } finally {
        setLoading(false);
        isInitialLoadingRef.current = false;
      }
    };

    fetchRoomData();
  }, [roomId, visible]);

  /**
   * Load address hierarchy - districts and wards in sequence
   * Prevent multiple API calls by checking addressLoadingRef
   */
  const loadAddressHierarchy = async (
    provinceId: string,
    districtId: string,
    wardId?: string
  ) => {
    try {
      // Load districts
      console.log(`📍 [loadAddressHierarchy] Loading districts for province: ${provinceId}`);
      const districtData = await getDistricts(provinceId);
      setDistricts(districtData.map((d: any) => ({ label: d.name, value: d.id })));

      // Load wards only if districtId is provided
      if (districtId) {
        // Skip if already loading the same district
        if (addressLoadingRef.current.districtId === districtId) {
          console.log(`⏭️ [loadAddressHierarchy] Already loading wards for district ${districtId}, skipping`);
          return;
        }

        addressLoadingRef.current.districtId = districtId;

        console.log(`📍 [loadAddressHierarchy] Loading wards for district: ${districtId}`);
        const wardData = await getWards(districtId);
        setWards(wardData.map((w: any) => ({ label: w.name, value: w.id })));
        console.log(`✅ [loadAddressHierarchy] Wards loaded: ${wardData.length}`);
      }
    } catch (error) {
      console.error('❌ [loadAddressHierarchy] Error loading address data:', error);
    }
  };

  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset) => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: asset.fileName || `image_${Date.now()}.jpg`,
        }));
        setSelectedImages([...selectedImages, ...newImages]);
      }
    } catch (error) {
      console.error('❌ [EditPostModal] Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleProvinceChange = async (provinceId: string) => {
    // Skip if provinceId is empty or null
    if (!provinceId) {
      console.log(`⏭️ [handleProvinceChange] Skipping - provinceId is empty`);
      return;
    }

    console.log(`📍 [handleProvinceChange] Province changed to: ${provinceId}`);
    setFormData((prev) => ({ ...prev, province: provinceId, district: '', ward: '' }));
    setDistricts([]);
    setWards([]);
    addressLoadingRef.current = { districtId: '', wardId: '' };
    setLoadingDistricts(true);

    try {
      const data = await getDistricts(provinceId);
      setDistricts(data.map((d: any) => ({ label: d.name, value: d.id })));
      console.log(`✅ [handleProvinceChange] Districts loaded: ${data.length}`);
    } catch (error) {
      console.error('❌ [handleProvinceChange] Failed to fetch districts:', error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    // Skip if in initial loading phase
    if (isInitialLoadingRef.current) {
      console.log(`⏭️ [handleDistrictChange] Skipping during initial load`);
      return;
    }

    // Skip if districtId is empty or null
    if (!districtId) {
      console.log(`⏭️ [handleDistrictChange] Skipping - districtId is empty`);
      setFormData((prev) => ({ ...prev, district: '', ward: '' }));
      setWards([]);
      addressLoadingRef.current = { districtId: '', wardId: '' };
      return;
    }

    console.log(`📍 [handleDistrictChange] District changed to: ${districtId}`);
    
    // Skip if already loading this district
    if (addressLoadingRef.current.districtId === districtId) {
      console.log(`⏭️ [handleDistrictChange] Already loading wards for district ${districtId}, skipping`);
      setFormData((prev) => ({ ...prev, district: districtId, ward: '' }));
      return;
    }

    setFormData((prev) => ({ ...prev, district: districtId, ward: '' }));
    setWards([]);
    addressLoadingRef.current.districtId = districtId;
    setLoadingWards(true);

    try {
      const data = await getWards(districtId);
      setWards(data.map((w: any) => ({ label: w.name, value: w.id })));
      console.log(`✅ [handleDistrictChange] Wards loaded: ${data.length}`);
    } catch (error) {
      console.error('❌ [handleDistrictChange] Failed to fetch wards:', error);
    } finally {
      setLoadingWards(false);
    }
  };

  const handleStartDateChange = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, postStartDate: dateString }));
  };

  const handleEndDateChange = (selectedDate: Date) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    setFormData((prev) => ({ ...prev, postEndDate: dateString }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title) {
      Alert.alert('Error', 'Please enter room title');
      return;
    }

    try {
      setLoading(true);

      if (!formData.province || !formData.district || !formData.ward) {
        Alert.alert('Error', 'Please select province, district, and ward');
        setLoading(false);
        return;
      }

      const roomPayload = {
        title: formData.title,
        description: formData.description,
        priceMonth: Number(formData.priceMonth),
        priceDeposit: Number(formData.priceDeposit),
        roomLength: Number(formData.roomLength),
        roomWidth: Number(formData.roomWidth),
        elecPrice: Number(formData.elecPrice),
        waterPrice: Number(formData.waterPrice),
        maxPeople: Number(formData.maxPeople),
        address: {
          street: formData.address,
          wardId: formData.ward,
        },
        convenientIds: formData.convenients,
        existingImages: roomData?.images?.map((img: any) => img.url) || null,
      };

      const formDataToSend = new FormData();
      
      // Add images if any
      if (selectedImages.length > 0) {
        selectedImages.forEach((image) => {
          formDataToSend.append('images', {
            uri: image.uri,
            type: image.type,
            name: image.name,
          } as any);
        });
      }

      formDataToSend.append('room', JSON.stringify(roomPayload));

      await updateRoom(roomId!, formDataToSend);

      Alert.alert('Success', 'Room updated successfully!');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Error updating room:', error);
      Alert.alert('Error', error.message || 'Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    console.log('❌ [handleClose] Closing edit modal');
    setFormData({
      title: '',
      description: '',
      priceMonth: '',
      priceDeposit: '',
      roomLength: '',
      roomWidth: '',
      elecPrice: '',
      waterPrice: '',
      maxPeople: '',
      address: '',
      province: '',
      district: '',
      ward: '',
      convenients: [],
      postStartDate: '',
      postEndDate: '',
    });
    setSelectedImages([]);
    setRoomData(null);
    
    // Reset refs for next modal open
    roomDataLoadedRef.current = false;
    isInitialLoadingRef.current = false;
    addressLoadingRef.current = { districtId: '', wardId: '' };
    
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        {/* Header */}
        <LinearGradient
          colors={Colors.gradients.blue}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingTop: 16,
            paddingBottom: 16,
            paddingHorizontal: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: 'white' }}>Chỉnh sửa phòng</Text>
          <TouchableOpacity onPress={handleClose}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Content */}
        {loading && !roomData ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Đang tải dữ liệu phòng...</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
            {/* Room Title */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Tiêu đề phòng *</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                }}
                placeholder="Nhập tiêu đề phòng"
                value={formData.title}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, title: text }))}
              />
            </View>

            {/* Images */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Hình ảnh phòng</Text>
              
              {/* Image Grid */}
              {selectedImages.length > 0 && (
                <View style={{ marginBottom: 12 }}>
                  <FlatList
                    data={selectedImages}
                    numColumns={3}
                    scrollEnabled={false}
                    renderItem={({ item, index }) => (
                      <View
                        style={{
                          width: '33.33%',
                          padding: 4,
                          aspectRatio: 1,
                        }}
                      >
                        <View style={{ flex: 1, position: 'relative' }}>
                          <Image
                            source={{ uri: item.uri }}
                            style={{ flex: 1, borderRadius: 8, backgroundColor: '#f0f0f0' }}
                          />
                          <TouchableOpacity
                            onPress={() => removeImage(index)}
                            style={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: 'rgba(255, 77, 79, 0.9)',
                              borderRadius: 12,
                              width: 24,
                              height: 24,
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <AntDesign name="close" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    keyExtractor={(_, index) => String(index)}
                  />
                </View>
              )}

              {/* Add Image Button */}
              <TouchableOpacity
                onPress={pickImages}
                style={{
                  borderWidth: 2,
                  borderColor: Colors.primary,
                  borderStyle: 'dashed',
                  borderRadius: 8,
                  padding: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f0f7ff',
                }}
              >
                <AntDesign name="plus" size={32} color={Colors.primary} />
                <Text style={{ color: Colors.primary, marginTop: 8, fontWeight: '600' }}>
                  Thêm hình ảnh
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>Mô tả</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
                placeholder="Nhập mô tả phòng"
                multiline
                value={formData.description}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              />
            </View>

            {/* Price Information */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>Thông tin giá</Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                    Giá thuê/tháng (₫)
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 14,
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.priceMonth}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, priceMonth: text }))}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                    Tiền cọc (₫)
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 14,
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.priceDeposit}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, priceDeposit: text }))}
                  />
                </View>
              </View>
            </View>

            {/* Room Dimensions */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>Kích thước phòng</Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                    Chiều dài (m)
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 14,
                    }}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={formData.roomLength}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, roomLength: text }))}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                    Chiều rộng (m)
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 14,
                    }}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    value={formData.roomWidth}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, roomWidth: text }))}
                  />
                </View>
              </View>
            </View>

            {/* Utilities */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>Tiện ích</Text>
              
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                    Điện (₫/kWh)
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 14,
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.elecPrice}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, elecPrice: text }))}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                    Nước (₫/m³)
                  </Text>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#ddd',
                      borderRadius: 8,
                      padding: 10,
                      fontSize: 14,
                    }}
                    placeholder="0"
                    keyboardType="numeric"
                    value={formData.waterPrice}
                    onChangeText={(text) => setFormData((prev) => ({ ...prev, waterPrice: text }))}
                  />
                </View>

                <View style={{ flex: 0.8 }}>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                    Số người tối đa
                  </Text>
                  <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' }}>
                    <RNPickerSelect
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, maxPeople: String(value) }))
                      }
                      items={[1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ label: String(n), value: n }))}
                      value={Number(formData.maxPeople) || undefined}
                      placeholder={{ label: 'Chọn...', value: null }}
                      style={{
                        inputIOS: { padding: 10, fontSize: 14 },
                        inputAndroid: { padding: 10, fontSize: 14 },
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Address Information */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>Địa chỉ</Text>
              
              {/* Province Select */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                  Tỉnh/Thành phố *
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' }}>
                  <RNPickerSelect
                    onValueChange={handleProvinceChange}
                    items={provinces}
                    value={formData.province || null}
                    placeholder={{ label: 'Chọn tỉnh/thành phố...', value: null }}
                    style={{
                      inputIOS: { padding: 12, fontSize: 14 },
                      inputAndroid: { padding: 12, fontSize: 14 },
                    }}
                  />
                </View>
              </View>

              {/* District Select */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                  Quận/Huyện *
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', opacity: formData.province ? 1 : 0.5 }}>
                  <RNPickerSelect
                    onValueChange={handleDistrictChange}
                    items={districts}
                    value={formData.district || null}
                    placeholder={{ label: 'Chọn quận/huyện...', value: null }}
                    disabled={!formData.province}
                    style={{
                      inputIOS: { padding: 12, fontSize: 14 },
                      inputAndroid: { padding: 12, fontSize: 14 },
                    }}
                  />
                </View>
              </View>

              {/* Ward Select */}
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                  Phường/Xã *
                </Text>
                <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', opacity: formData.district ? 1 : 0.5 }}>
                  <RNPickerSelect
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, ward: value }))}
                    items={wards}
                    value={formData.ward || null}
                    placeholder={{ label: 'Chọn phường/xã...', value: null }}
                    disabled={!formData.district}
                    style={{
                      inputIOS: { padding: 12, fontSize: 14 },
                      inputAndroid: { padding: 12, fontSize: 14 },
                    }}
                  />
                </View>
              </View>

              {/* Street Address */}
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 14,
                }}
                placeholder="Nhập địa chỉ đường phố"
                value={formData.address}
                onChangeText={(text) => setFormData((prev) => ({ ...prev, address: text }))}
              />
            </View>

            {/* Post Information */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>Thông tin bài đăng</Text>
              
              {roomData && (
                <View style={{ backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12 }}>
                  <View style={{ marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                      Loại bài đăng
                    </Text>
                    <View
                      style={{
                        backgroundColor: 'white',
                        borderWidth: 1,
                        borderColor: '#ddd',
                        borderRadius: 8,
                        padding: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    >
                  <View
                    style={{
                      backgroundColor: '#ff4d4f',
                      borderRadius: 4,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      marginRight: 8,
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                      {roomData?.typepost?.toUpperCase() || ''}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: Colors.textSecondary, flex: 1 }}>
                    {roomData?.typepost && typePosts.length > 0
                      ? (() => {
                          const matchingTypepost = typePosts.find(
                            (tp: any) => tp.name === roomData.typepost
                          );
                          return matchingTypepost
                            ? `${matchingTypepost.name} - ${matchingTypepost.pricePerDay?.toLocaleString(
                                'vi-VN'
                              )}₫/ngày`
                            : roomData.typepost;
                        })()
                      : 'Đang tải...'}
                  </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                        Ngày bắt đầu
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowStartDatePicker(true)}
                        style={{
                          borderWidth: 1,
                          borderColor: '#ddd',
                          borderRadius: 8,
                          padding: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#fff',
                        }}
                      >
                        <Text style={{ fontSize: 14, color: formData.postStartDate ? '#000' : '#999' }}>
                          {formData.postStartDate || 'Chọn ngày'}
                        </Text>
                        <Ionicons name="calendar" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: Colors.textSecondary, marginBottom: 4 }}>
                        Ngày kết thúc
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowEndDatePicker(true)}
                        style={{
                          borderWidth: 1,
                          borderColor: '#ddd',
                          borderRadius: 8,
                          padding: 12,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#fff',
                        }}
                      >
                        <Text style={{ fontSize: 14, color: formData.postEndDate ? '#000' : '#999' }}>
                          {formData.postEndDate || 'Chọn ngày'}
                        </Text>
                        <Ionicons name="calendar" size={18} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderWidth: 1,
                  borderColor: Colors.primary,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: Colors.primary, fontWeight: '600', fontSize: 16 }}>
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  backgroundColor: Colors.primary,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                    Cập nhật phòng
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Start Date Picker Modal */}
      {showStartDatePicker && (
        <DateTimePicker
          value={formData.postStartDate ? new Date(formData.postStartDate) : new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              const dateString = selectedDate.toISOString().split('T')[0];
              setFormData((prev) => ({ ...prev, postStartDate: dateString }));
            }
            setShowStartDatePicker(false);
          }}
        />
      )}

      {/* End Date Picker Modal */}
      {showEndDatePicker && (
        <DateTimePicker
          value={formData.postEndDate ? new Date(formData.postEndDate) : new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              const dateString = selectedDate.toISOString().split('T')[0];
              setFormData((prev) => ({ ...prev, postEndDate: dateString }));
            }
            setShowEndDatePicker(false);
          }}
        />
      )}
    </Modal>
  );
}
