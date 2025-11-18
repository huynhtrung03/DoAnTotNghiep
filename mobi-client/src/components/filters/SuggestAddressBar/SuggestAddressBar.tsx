import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface SuggestAddressBarProps {
  onChange?: (address: {
    specificAddress?: string;
    province?: string;
    district?: string;
    ward?: string;
    searchAddress: string;
  }) => void;
  initialValue?: {
    specificAddress?: string;
    province?: string;
    district?: string;
    ward?: string;
  };
  showSaveButton?: boolean;
  onSaveSuccess?: () => void;
}

interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  loading?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  error = "",
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState<SelectOption[]>(options);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <View style={styles.selectContainer}>
      <TouchableOpacity
        style={[
          styles.selectButton,
          error ? styles.selectButtonError : styles.selectButtonNormal,
          disabled && styles.selectButtonDisabled,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
      >
        <Text style={[styles.selectText, selectedOption ? styles.selectTextSelected : styles.selectTextPlaceholder]}>
          {loading ? "Loading..." : selectedOption?.label || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-up" : "chevron-down"}
          size={16}
          color={isOpen ? "#3B82F6" : "#9CA3AF"}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {placeholder}</Text>
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
            </View>

            <ScrollView style={styles.optionsContainer}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionItem,
                      option.value === value && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(option)}
                  >
                    <Text style={[
                      styles.optionText,
                      option.value === value && styles.optionTextSelected,
                    ]}>
                      {option.label}
                    </Text>
                    {option.value === value && (
                      <Ionicons name="checkmark" size={16} color="#3B82F6" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search" size={32} color="#D1D5DB" />
                  <Text style={styles.noResultsText}>No results found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={12} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

export default function SuggestAddressBar({
  initialValue,
  showSaveButton = false,
  onChange,
  onSaveSuccess,
}: SuggestAddressBarProps) {
  // Form state
  const [formData, setFormData] = useState({
    specificAddress: initialValue?.specificAddress || "",
    province: initialValue?.province || "",
    district: initialValue?.district || "",
    ward: initialValue?.ward || "",
  });

  // Data states
  const [provinces, setProvinces] = useState<SelectOption[]>([]);
  const [districts, setDistricts] = useState<SelectOption[]>([]);
  const [wards, setWards] = useState<SelectOption[]>([]);

  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);

  // Mock data for provinces (replace with actual API call)
  useEffect(() => {
    const mockProvinces: SelectOption[] = [
      { label: "Hồ Chí Minh", value: "1" },
      { label: "Hà Nội", value: "2" },
      { label: "Đà Nẵng", value: "3" },
      { label: "Cần Thơ", value: "4" },
      { label: "Hải Phòng", value: "5" },
    ];
    setProvinces(mockProvinces);
  }, []);

  const showMessage = (type: "success" | "error" | "warning", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.province) newErrors.province = "Please select a province/city";
    if (!formData.district) newErrors.district = "Please select a district";
    if (!formData.ward) newErrors.ward = "Please select a ward";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "specificAddress") {
      const streetOnly = value ? value.split(",")[0].trim() : "";
      setFormData((prev) => ({ ...prev, specificAddress: streetOnly }));
      if (errors.specificAddress) {
        setErrors((prev) => ({ ...prev, specificAddress: "" }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProvinceChange = async (provinceId: string) => {
    handleInputChange("province", provinceId);
    setFormData((prev) => ({ ...prev, district: "", ward: "" }));
    setDistricts([]);
    setWards([]);

    if (!provinceId) return;

    setLoadingDistricts(true);
    try {
      // Mock districts data (replace with actual API call)
      const mockDistricts: SelectOption[] = [
        { label: "Quận 1", value: "1" },
        { label: "Quận 2", value: "2" },
        { label: "Quận 3", value: "3" },
        { label: "Quận 4", value: "4" },
        { label: "Quận 5", value: "5" },
      ];
      setDistricts(mockDistricts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    } finally {
      setLoadingDistricts(false);
    }
  };

  const handleDistrictChange = async (districtId: string) => {
    handleInputChange("district", districtId);
    setFormData((prev) => ({ ...prev, ward: "" }));
    setWards([]);

    if (!districtId) return;

    setLoadingWards(true);
    try {
      // Mock wards data (replace with actual API call)
      const mockWards: SelectOption[] = [
        { label: "Phường 1", value: "1" },
        { label: "Phường 2", value: "2" },
        { label: "Phường 3", value: "3" },
        { label: "Phường 4", value: "4" },
        { label: "Phường 5", value: "5" },
      ];
      setWards(mockWards);
    } catch (error) {
      console.error("Error fetching wards:", error);
    } finally {
      setLoadingWards(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (!navigator.geolocation) {
        Alert.alert('Error', 'Geolocation is not supported by this device');
        return;
      }

      setIsGettingLocation(true);
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Mock address for demo (replace with actual reverse geocoding API)
      const mockAddress = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
      handleInputChange("specificAddress", mockAddress);
      showMessage("success", "Location found successfully!");
      
    } catch (error: any) {
      console.error("Error getting location:", error);
      
      if (error.code === 1) {
        Alert.alert('Permission denied', 'Location permission is required');
      } else if (error.code === 2) {
        Alert.alert('Error', 'Unable to determine current location');
      } else if (error.code === 3) {
        Alert.alert('Error', 'Timeout while getting location');
      } else {
        Alert.alert('Error', 'Failed to get current location');
      }
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showMessage("error", "Please fill in all address information!");
      return;
    }

    setIsSaving(true);

    try {
      const selectedProvince = provinces.find((p) => p.value === formData.province);
      const selectedDistrict = districts.find((d) => d.value === formData.district);
      const selectedWard = wards.find((w) => w.value === formData.ward);

      const addressParts = [];
      if (formData.specificAddress) addressParts.push(formData.specificAddress);
      if (selectedWard) addressParts.push(selectedWard.label);
      if (selectedDistrict) addressParts.push(selectedDistrict.label);
      if (selectedProvince) addressParts.push(selectedProvince.label);
      const searchAddress = addressParts.join(", ");

      // Save to AsyncStorage
      await AsyncStorage.setItem('searchAddress', searchAddress);

      // Call onChange callback
      if (onChange) {
        onChange({
          specificAddress: formData.specificAddress,
          province: selectedProvince?.label,
          district: selectedDistrict?.label,
          ward: selectedWard?.label,
          searchAddress,
        });
      }

      if (onSaveSuccess) onSaveSuccess();
      showMessage("success", "Address saved successfully!");
    } catch (error) {
      console.error("Error saving address:", error);
      showMessage("error", "Failed to save address!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Message Toast */}
      {message && (
        <View style={[
          styles.messageToast,
          message.type === "success" && styles.messageSuccess,
          message.type === "error" && styles.messageError,
          message.type === "warning" && styles.messageWarning,
        ]}>
          <View style={styles.messageContent}>
            <Ionicons
              name={
                message.type === "success" ? "checkmark-circle" :
                message.type === "error" ? "close-circle" : "warning"
              }
              size={20}
              color={
                message.type === "success" ? "#10B981" :
                message.type === "error" ? "#EF4444" : "#F59E0B"
              }
            />
            <Text style={styles.messageText}>{message.text}</Text>
            <TouchableOpacity onPress={() => setMessage(null)}>
              <Ionicons name="close" size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={true}>
        <View style={styles.content}>
          {/* Address Input with Location Button */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="home-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.textInput}
                placeholder="Enter specific address (house number, street name)..."
                value={formData.specificAddress}
                onChangeText={(value) => handleInputChange("specificAddress", value)}
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={styles.locationButton}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="location" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Location Selects */}
          <View style={styles.selectsContainer}>
            <View style={styles.selectWrapper}>
              <CustomSelect
                options={provinces}
                value={formData.province}
                onChange={handleProvinceChange}
                placeholder="Select Province/City"
                error={errors.province}
              />
            </View>

            <View style={styles.selectWrapper}>
              <CustomSelect
                options={districts}
                value={formData.district}
                onChange={handleDistrictChange}
                placeholder="Select District"
                disabled={districts.length === 0}
                loading={loadingDistricts}
                error={errors.district}
              />
            </View>

            <View style={styles.selectWrapper}>
              <CustomSelect
                options={wards}
                value={formData.ward}
                onChange={(value) => handleInputChange("ward", value)}
                placeholder="Select Ward"
                disabled={wards.length === 0}
                loading={loadingWards}
                error={errors.ward}
              />
            </View>
          </View>

          {/* Action Buttons */}
          {showSaveButton && (
            <TouchableOpacity
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Searching...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search" size={16} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Search</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    maxHeight: 400, // Giới hạn chiều cao để có thể cuộn
  },
  scrollView: {
    maxHeight: 400, // Đảm bảo ScrollView có thể cuộn
  },
  content: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  locationButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  selectsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  selectWrapper: {
    flex: 1,
  },
  selectContainer: {
    marginBottom: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectButtonNormal: {
    borderColor: '#E5E7EB',
  },
  selectButtonError: {
    borderColor: '#EF4444',
  },
  selectButtonDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB',
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  selectTextSelected: {
    color: '#111827',
  },
  selectTextPlaceholder: {
    color: '#9CA3AF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  optionsContainer: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1D4ED8',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  messageToast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  messageSuccess: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  messageError: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  messageWarning: {
    backgroundColor: '#FFFBEB',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});
