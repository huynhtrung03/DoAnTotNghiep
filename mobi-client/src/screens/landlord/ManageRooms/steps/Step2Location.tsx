import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../../colors/colors';
import TextInputWithLabel from '../components/TextInputWithLabel';
import { RoomFormData } from '../AddRoom';
import { getProvinces, getDistricts, getWards } from '../../../../services/AddressService';
import { Province, District, Ward } from '../../../../types/types';

interface Step2Props {
  formData: RoomFormData;
  onUpdate: (updates: Partial<RoomFormData>) => void;
}

const Step2Location: React.FC<Step2Props> = ({ formData, onUpdate }) => {
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showWardModal, setShowWardModal] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [searchProvinceText, setSearchProvinceText] = useState('');
  const [searchDistrictText, setSearchDistrictText] = useState('');
  const [searchWardText, setSearchWardText] = useState('');

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      console.log('🏙️ [Step2Location] Loading provinces...');
      const data = await getProvinces();
      setProvinces(data);
      console.log(`✅ [Step2Location] Loaded ${data.length} provinces`);
    } catch (error: any) {
      console.error('❌ [Step2Location] Failed to load provinces:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách tỉnh/thành phố');
    } finally {
      setLoadingProvinces(false);
    }
  };

  // Load districts when province changes
  useEffect(() => {
    if (formData.provinceId) {
      loadDistricts(formData.provinceId);
    }
  }, [formData.provinceId]);

  const loadDistricts = async (provinceId: number) => {
    try {
      setLoadingDistricts(true);
      console.log(`🏛️ [Step2Location] Loading districts for province: ${provinceId}`);
      const data = await getDistricts(provinceId.toString());
      setDistricts(data);
      console.log(`✅ [Step2Location] Loaded ${data.length} districts`);
      // Reset district and ward selections
      onUpdate({
        districtId: null,
        districtName: '',
        wardId: null,
        wardName: '',
      });
    } catch (error: any) {
      console.error('❌ [Step2Location] Failed to load districts:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách quận/huyện');
    } finally {
      setLoadingDistricts(false);
    }
  };

  // Load wards when district changes
  useEffect(() => {
    if (formData.districtId) {
      loadWards(formData.districtId);
    }
  }, [formData.districtId]);

  const loadWards = async (districtId: number) => {
    try {
      setLoadingWards(true);
      console.log(`🏘️ [Step2Location] Loading wards for district: ${districtId}`);
      const data = await getWards(districtId.toString());
      setWards(data);
      console.log(`✅ [Step2Location] Loaded ${data.length} wards`);
      // Reset ward selection
      onUpdate({ wardId: null, wardName: '' });
    } catch (error: any) {
      console.error('❌ [Step2Location] Failed to load wards:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phường/xã');
    } finally {
      setLoadingWards(false);
    }
  };

  const handleSelectProvince = (province: Province) => {
    onUpdate({
      provinceId: province.id,
      provinceName: province.name,
    });
    setShowProvinceModal(false);
    setSearchProvinceText('');
  };

  const handleSelectDistrict = (district: District) => {
    onUpdate({
      districtId: district.id,
      districtName: district.name,
    });
    setShowDistrictModal(false);
    setSearchDistrictText('');
  };

  const handleSelectWard = (ward: Ward) => {
    onUpdate({
      wardId: ward.id,
      wardName: ward.name,
    });
    setShowWardModal(false);
    setSearchWardText('');
  };

  const filteredProvinces = provinces.filter((p) =>
    p.name.toLowerCase().includes(searchProvinceText.toLowerCase())
  );

  const filteredDistricts = districts.filter((d) =>
    d.name.toLowerCase().includes(searchDistrictText.toLowerCase())
  );

  const filteredWards = wards.filter((w) =>
    w.name.toLowerCase().includes(searchWardText.toLowerCase())
  );

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    items: any[],
    selectedValue: string,
    onSelect: (item: any) => void,
    searchText: string,
    onSearchChange: (text: string) => void,
    title: string,
    isLoading: boolean
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{title}</Text>
            <View style={{ width: 24 }} />
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
            value={searchText}
            onChangeText={onSearchChange}
            placeholderTextColor={Colors.textTertiary}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    item.id === (selectedValue || null) && styles.pickerItemSelected,
                  ]}
                  onPress={() => onSelect(item)}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      item.id === (selectedValue || null) &&
                        styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vị trí phòng</Text>

      {/* Province Picker */}
        <TouchableOpacity
          style={[
            styles.pickerButton,
            loadingProvinces && styles.pickerButtonDisabled,
          ]}
          onPress={() => !loadingProvinces && setShowProvinceModal(true)}
          disabled={loadingProvinces}
        >
          <View style={styles.pickerButtonContent}>
            <Text style={styles.pickerButtonLabel}>Tỉnh/Thành phố</Text>
            <Text
              style={[
                styles.pickerButtonValue,
                !formData.provinceName && styles.placeholderText,
              ]}
            >
              {loadingProvinces ? 'Đang tải...' : formData.provinceName || 'Chọn Tỉnh'}
            </Text>
          </View>
          <MaterialIcons 
            name="expand-more" 
            size={20} 
            color={loadingProvinces ? Colors.textTertiary : Colors.textSecondary} 
          />
        </TouchableOpacity>

        {/* District Picker */}
        <TouchableOpacity
          style={[
            styles.pickerButton,
            !formData.provinceId && styles.pickerButtonDisabled,
          ]}
          onPress={() => formData.provinceId && setShowDistrictModal(true)}
          disabled={!formData.provinceId}
        >
          <View style={styles.pickerButtonContent}>
            <Text style={styles.pickerButtonLabel}>Quận/Huyện</Text>
            <Text
              style={[
                styles.pickerButtonValue,
                !formData.districtName && styles.placeholderText,
              ]}
            >
              {formData.districtName || 'Chọn Quận/Huyện'}
            </Text>
          </View>
          <MaterialIcons
            name="expand-more"
            size={20}
            color={!formData.provinceId ? Colors.textTertiary : Colors.textSecondary}
          />
        </TouchableOpacity>

        {/* Ward Picker */}
        <TouchableOpacity
          style={[
            styles.pickerButton,
            !formData.districtId && styles.pickerButtonDisabled,
          ]}
          onPress={() => formData.districtId && setShowWardModal(true)}
          disabled={!formData.districtId}
        >
          <View style={styles.pickerButtonContent}>
            <Text style={styles.pickerButtonLabel}>Phường/Xã</Text>
            <Text
              style={[
                styles.pickerButtonValue,
                !formData.wardName && styles.placeholderText,
              ]}
            >
              {formData.wardName || 'Chọn Phường/Xã'}
            </Text>
          </View>
          <MaterialIcons
            name="expand-more"
            size={20}
            color={!formData.districtId ? Colors.textTertiary : Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Specific Address */}
      <View style={styles.section}>
        <TextInputWithLabel
          label="Địa chỉ cụ thể"
          placeholder="Ví dụ: 123 Đường Lê Lợi"
          value={formData.address}
          onChangeText={(address) => onUpdate({ address })}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Location Info Message */}
      {formData.provinceName && formData.districtName && formData.wardName && (
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color={Colors.info} />
          <Text style={styles.infoText}>
            Vị trí đã chọn: {formData.provinceName}, {formData.districtName},{' '}
            {formData.wardName}
          </Text>
        </View>
      )}

      {/* Province Modal */}
      {renderPickerModal(
        showProvinceModal,
        () => setShowProvinceModal(false),
        filteredProvinces,
        formData.provinceId?.toString() || '',
        handleSelectProvince,
        searchProvinceText,
        setSearchProvinceText,
        'Tỉnh/Thành phố',
        loadingProvinces
      )}

      {/* District Modal */}
      {renderPickerModal(
        showDistrictModal,
        () => setShowDistrictModal(false),
        filteredDistricts,
        formData.districtId?.toString() || '',
        handleSelectDistrict,
        searchDistrictText,
        setSearchDistrictText,
        'Quận/Huyện',
        loadingDistricts
      )}

      {/* Ward Modal */}
      {renderPickerModal(
        showWardModal,
        () => setShowWardModal(false),
        filteredWards,
        formData.wardId?.toString() || '',
        handleSelectWard,
        searchWardText,
        setSearchWardText,
        'Phường/Xã',
        loadingWards
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
    marginBottom: 12,
  },
  pickerButtonDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.backgroundDark,
  },
  pickerButtonContent: {
    flex: 1,
  },
  pickerButtonLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
    marginBottom: 4,
  },
  pickerButtonValue: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  placeholderText: {
    color: Colors.textTertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '85%',
    backgroundColor: Colors.backgroundLight,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  searchInput: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    fontSize: 14,
  },
  loadingContainer: {
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  pickerItemSelected: {
    backgroundColor: `${Colors.primary}10`,
  },
  pickerItemText: {
    fontSize: 15,
    color: Colors.textPrimary,
  },
  pickerItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: `${Colors.info}10`,
    borderRadius: 8,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.info,
    lineHeight: 18,
  },
});

export default Step2Location;
