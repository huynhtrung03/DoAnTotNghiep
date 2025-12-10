import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Modal,
  Pressable,
  Text,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { ResidentData } from '../../../../services/ResidentService';
import { residentEditModalStyles, Spacing } from './styles';

interface ImageFile {
  uri: string;
  type: string;
  name: string;
}

interface FormState {
  contractId: string;
  fullName: string;
  idNumber: string;
  relationship: string;
  startDate: Date;
  endDate: Date;
  note: string;
}

interface ImageState {
  frontImageUri: string;
  backImageUri: string;
  frontImageFile: ImageFile | null;
  backImageFile: ImageFile | null;
}

const DEFAULT_FORM_STATE: FormState = {
  contractId: '',
  fullName: '',
  idNumber: '',
  relationship: 'Bản thân',
  startDate: new Date(),
  endDate: new Date(),
  note: '',
};


interface Contract {
  id: string;
  roomTitle: string;
  contractName?: string;
}

interface ResidentEditModalProps {
  visible: boolean;
  resident?: ResidentData | null;
  isLoading?: boolean;
  onClose: () => void;
  onSubmit: (
    data: ResidentData,
    frontImageUri?: string,
    backImageUri?: string,
    frontImageFileName?: string,
    backImageFileName?: string
  ) => Promise<void>;
  availableContracts?: Contract[];
  contractsLoading?: boolean;
}

const RELATIONSHIPS = [
  'Bản thân',
  'Vợ/Chồng',
  'Con',
  'Bố/Mẹ',
  'Anh/Em',
  'Bạn bè',
  'Khác',
];



/**
 * Helper function to determine MIME type from file extension
 */
const getMimeTypeFromExtension = (extension: string): string => {
  const mimeTypes: { [key: string]: string } = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
  };
  return mimeTypes[extension] || 'image/jpeg';
};

/**
 * FormField - Reusable form field wrapper
 */
const FormField: React.FC<{
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}> = ({ label, required = false, error, children }) => (
  <View style={residentEditModalStyles.formField}>
    <View style={{ flexDirection: 'row' }}>
      <Text
        style={residentEditModalStyles.label}
      >
        {label}
      </Text>
      {required && <Text style={residentEditModalStyles.required}>*</Text>}
    </View>
    {children}
    {error && <Text style={residentEditModalStyles.errorText}>{error}</Text>}
  </View>
);

/**
 * TextInputField - Text input wrapper
 */
const TextInputField: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  multiline?: boolean;
  maxLength?: number;
  isLoading?: boolean;
}> = ({
  label,
  value,
  onChangeText,
  placeholder,
  required = false,
  error,
  multiline = false,
  maxLength,
  isLoading = false,
}) => (
  <FormField label={label} required={required} error={error}>
    <TextInput
      style={[
        multiline
          ? residentEditModalStyles.textArea
          : residentEditModalStyles.textInput,
        error && residentEditModalStyles.textInputError,
      ]}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      maxLength={maxLength}
      editable={!isLoading}
    />
    {multiline && maxLength && (
      <Text style={residentEditModalStyles.characterCount}>
        {value.length}/{maxLength}
      </Text>
    )}
  </FormField>
);

/**
 * ImageUploadField - Image upload and preview
 */
const ImageUploadField: React.FC<{
  label: string;
  imageUri: string;
  type: 'front' | 'back';
  onRemove: () => void;
  onPickImage: (type: 'front' | 'back') => void;
  onCameraCapture: (type: 'front' | 'back') => void;
}> = ({
  label,
  imageUri,
  type,
  onRemove,
  onPickImage,
  onCameraCapture,
}) => (
  <View style={residentEditModalStyles.imageContainer}>
    <Text
      style={residentEditModalStyles.imageLabel}
    >
      {label}
    </Text>
    {imageUri ? (
      <View style={residentEditModalStyles.imagePreview}>
        <Image
          source={{ uri: imageUri }}
          style={residentEditModalStyles.imagePreviewImage}
          resizeMode="cover"
        />
        <Pressable
          style={residentEditModalStyles.imageRemoveButton}
          onPress={onRemove}
        >
          <Ionicons name="close" size={14} color="#FFFFFF" />
        </Pressable>
      </View>
    ) : (
      <Pressable
        style={residentEditModalStyles.imageUploadButton}
        onPress={() => {
          Alert.alert('Chọn nguồn', 'Chọn cách để thêm ảnh', [
            {
              text: 'Chụp ảnh',
              onPress: () => onCameraCapture(type),
            },
            {
              text: 'Thư viện',
              onPress: () => onPickImage(type),
            },
            {
              text: 'Hủy',
              style: 'cancel',
            },
          ]);
        }}
      >
        <Ionicons name="camera" size={32} color="#9CA3AF" />
        <Text
          style={residentEditModalStyles.imageUploadText}
        >
          {label}
        </Text>
      </Pressable>
    )}
  </View>
);

/**
 * ContractSelector - Memoized contract selector modal
 */
const ContractSelector: React.FC<{
  visible: boolean;
  contracts: Contract[];
  loading: boolean;
  selectedId: string;
  onSelect: (contractId: string) => void;
  onClose: () => void;
}> = ({ visible, contracts, loading, selectedId, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable
      style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
      }}
      onPress={onClose}
    >
      <Pressable
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '70%',
        }}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Handle Bar */}
        <View
          style={{
            alignSelf: 'center',
            width: 40,
            height: 4,
            backgroundColor: '#D1D5DB',
            borderRadius: 2,
            marginTop: Spacing.md,
            marginBottom: Spacing.md,
          }}
        />

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: '#E5E7EB',
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#111827',
            }}
          >
            Chọn hợp đồng
          </Text>
          <Pressable onPress={onClose}>
            <Ionicons
              name="close-circle"
              size={24}
              color="#6B7280"
            />
          </Pressable>
        </View>

        <ScrollView nestedScrollEnabled scrollEventThrottle={16}>
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#3B82F6"
              style={{ marginTop: Spacing.xxl }}
            />
          ) : contracts.length > 0 ? (
            contracts.map((contract) => (
              <Pressable
                key={contract.id}
                style={{
                  paddingHorizontal: Spacing.lg,
                  paddingVertical: Spacing.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: '#E5E7EB',
                  backgroundColor:
                    selectedId === contract.id
                      ? '#DBEAFE'
                      : 'transparent',
                }}
                onPress={() => {
                  onSelect(contract.id);
                  onClose();
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: Spacing.xs,
                      }}
                    >
                      {contract.roomTitle}
                    </Text>
                    {contract.contractName && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#6B7280',
                        }}
                      >
                        {contract.contractName}
                      </Text>
                    )}
                  </View>
                  {selectedId === contract.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#10B981"
                    />
                  )}
                </View>
              </Pressable>
            ))
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                paddingVertical: Spacing.xxl,
              }}
            >
              <Text style={{ color: "#6B7280" }}>
                KhÃ´ng cÃ³ há»£p Ä‘á»“ng nÃ o
              </Text>
            </View>
          )}
        </ScrollView>
      </Pressable>
    </Pressable>
  </Modal>
);

/**
 * RelationshipSelector - Memoized relationship selector modal
 */
const RelationshipSelector: React.FC<{
  visible: boolean;
  selected: string;
  onSelect: (relationship: string) => void;
  onClose: () => void;
}> = ({ visible, selected, onSelect, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <Pressable
      style={{
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
      onPress={onClose}
    >
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
          maxHeight: '50%',
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            marginBottom: Spacing.md,
            color: '#111827',
          }}
        >
          Chọn mối quan hệ
        </Text>
        <ScrollView>
          {RELATIONSHIPS.map((rel) => (
            <Pressable
              key={rel}
              style={{
                paddingVertical: Spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: '#E5E7EB',
              }}
              onPress={() => {
                onSelect(rel);
                onClose();
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: '#111827',
                  }}
                >
                  {rel}
                </Text>
                {selected === rel && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Pressable>
  </Modal>
);



/**
 * ResidentEditModal - Main component for adding/editing residents
 * Architecture:
 * - Separates form state and UI state for better performance
 * - Memoizes child components to prevent unnecessary re-renders
 * - Uses useCallback for event handlers to maintain reference stability
 * - Filters form state updates to only trigger when modal is visible and resident changes
 */
export const ResidentEditModal: React.FC<ResidentEditModalProps> = ({
  visible,
  resident,
  isLoading = false,
  onClose,
  onSubmit,
  availableContracts = [],
  contractsLoading = false,
}) => {
  const isEditMode = !!resident;

  // Form state - separated into logical groups
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [imageState, setImageState] = useState<ImageState>({
    frontImageUri: '',
    backImageUri: '',
    frontImageFile: null,
    backImageFile: null,
  });

  // UI state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showContractSelector, setShowContractSelector] = useState(false);
  const [showRelationshipSelector, setShowRelationshipSelector] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Pan responder for drag to dismiss
  const panResponder = useMemo(() =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, { dy }) => Math.abs(dy) > 10,
      onPanResponderMove: () => {},
      onPanResponderRelease: (evt, { dy }) => {
        if (dy > 100) {
          onClose();
        }
      },
    }),
    [onClose]
  );

  // Initialize form when modal opens or resident changes
  useEffect(() => {
    if (!visible) return;

    if (isEditMode && resident) {
      setFormState({
        contractId: resident.contractId || '',
        fullName: resident.fullName || '',
        idNumber: resident.idNumber || '',
        relationship: resident.relationship || 'Bản thân',
        startDate: new Date(resident.startDate),
        endDate: new Date(resident.endDate || new Date()),
        note: resident.note || '',
      });
      setImageState({
        frontImageUri: resident.frontImageUrl || '',
        backImageUri: resident.backImageUrl || '',
        frontImageFile: null,
        backImageFile: null,
      });
    } else {
      setFormState(DEFAULT_FORM_STATE);
      setImageState({
        frontImageUri: '',
        backImageUri: '',
        frontImageFile: null,
        backImageFile: null,
      });
    }
    setErrors({});
  }, [visible, resident?.id, isEditMode]);

  // Form field update handlers with useCallback for performance
  const updateFormField = useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Image handlers
  const handlePickImage = useCallback(async (type: 'front' | 'back') => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName =
          asset.fileName ||
          asset.uri.split('/').pop() ||
          `image_${Date.now()}.jpg`;
        const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
        const mimeType = getMimeTypeFromExtension(fileExtension);

        const fileData: ImageFile = {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        };

        setImageState((prev) => ({
          ...prev,
          ...(type === 'front'
            ? { frontImageUri: asset.uri, frontImageFile: fileData }
            : { backImageUri: asset.uri, backImageFile: fileData }),
        }));
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
      console.error('Error picking image:', error);
    }
  }, []);

  const handleCameraCapture = useCallback(async (type: 'front' | 'back') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = `${type}_id_${Date.now()}.jpg`;
        const mimeType = 'image/jpeg';

        const fileData: ImageFile = {
          uri: asset.uri,
          type: mimeType,
          name: fileName,
        };

        setImageState((prev) => ({
          ...prev,
          ...(type === 'front'
            ? { frontImageUri: asset.uri, frontImageFile: fileData }
            : { backImageUri: asset.uri, backImageFile: fileData }),
        }));
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể Chụp ảnh. Vui lòng thử lại.');
      console.error('Error capturing image:', error);
    }
  }, []);

  const handleRemoveImage = useCallback((type: 'front' | 'back') => {
    setImageState((prev) => ({
      ...prev,
      ...(type === 'front'
        ? { frontImageUri: '', frontImageFile: null }
        : { backImageUri: '', backImageFile: null }),
    }));
  }, []);

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formState.contractId) newErrors.contractId = 'Vui lòng chọn hợp đồng';
    if (!formState.fullName.trim())
      newErrors.fullName = 'Vui lòng nhập họ tên';
    if (!formState.idNumber.trim()) newErrors.idNumber = 'Vui lòng nhập số CMND';
    if (!formState.relationship)
      newErrors.relationship = 'Vui lòng chọn mối quan hệ';
    if (!formState.startDate) newErrors.startDate = 'Vui lÃ²ng chá»n ngÃ y báº¯t Ä‘áº§u';
    if (!formState.endDate) newErrors.endDate = 'Vui lÃ²ng chá»n ngÃ y káº¿t thÃºc';
    if (formState.startDate >= formState.endDate)
      newErrors.dates = 'NgÃ y káº¿t thÃºc pháº£i sau ngÃ y báº¯t Ä‘áº§u';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formState]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const formattedData: ResidentData = {
        contractId: formState.contractId,
        fullName: formState.fullName,
        idNumber: formState.idNumber,
        relationship: formState.relationship,
        startDate: formState.startDate.toISOString().split('T')[0],
        endDate: formState.endDate.toISOString().split('T')[0],
        note: formState.note,
        status: resident?.status,
      };

      await onSubmit(
        formattedData,
        imageState.frontImageFile?.uri,
        imageState.backImageFile?.uri,
        imageState.frontImageFile?.name,
        imageState.backImageFile?.name
      );

      setFormState(DEFAULT_FORM_STATE);
      setImageState({
        frontImageUri: '',
        backImageUri: '',
        frontImageFile: null,
        backImageFile: null,
      });
      setErrors({});
      onClose();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      
      // Parse error message from API response
      let errorMessage = 'Không thể lưu thông tin. Vui lòng thử lại.';
      
      if (error?.message) {
        // Handle array of messages
        if (Array.isArray(error.message)) {
          errorMessage = error.message.join('\n');
        } else if (typeof error.message === 'string') {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Lỗi', errorMessage);
    }
  }, [formState, imageState, resident?.status, onSubmit, onClose, validateForm]);

  // Memoize selected values
  const selectedContract = useMemo(
    () => availableContracts.find((c) => c.id === formState.contractId),
    [availableContracts, formState.contractId]
  );


  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[residentEditModalStyles.overlay]}>
        <View
          style={[
            residentEditModalStyles.container,
            { flex: 1, flexDirection: 'column' },
          ]}
        >
          {/* Handle Bar */}
          <View
            style={[
              residentEditModalStyles.handleBar,
            ]}
            {...panResponder.panHandlers}
          />

          {/* Header */}
          <View
            style={[
              residentEditModalStyles.header,
,
            ]}
          >
            <View>
              <Text
                style={[
                  residentEditModalStyles.headerTitle,
,
                ]}
              >
                {isEditMode ? 'Sửa cư dân' : 'Thêm cư dân'}
              </Text>
              <Text
                style={[
                  residentEditModalStyles.headerSubtitle,
,
                ]}
              >
                {isEditMode
                  ? 'Cập nhật thông tin cư dân'
                  : 'Thêm thông tin cư dân mới'}
              </Text>
            </View>
          </View>

          {/* Scroll Content */}
          <ScrollView
            contentContainerStyle={residentEditModalStyles.scrollContent}
            showsVerticalScrollIndicator={true}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          >
            {/* Contract Selection */}
            <View style={residentEditModalStyles.section}>
              <FormField
                label="Hợp đồng"
                required
                error={errors.contractId}

              >
                <Pressable
                  style={[
                    residentEditModalStyles.selectorButton,
                    errors.contractId && residentEditModalStyles.textInputError,
                  ]}
                  onPress={() => setShowContractSelector(true)}
                  disabled={isLoading || contractsLoading}
                >
                  <Text
                    style={[
                      selectedContract
                        ? residentEditModalStyles.selectorText
                        : residentEditModalStyles.selectorPlaceholder,
                    ]}
                  >
                    {selectedContract
                      ? `${selectedContract.roomTitle} - ${
                          selectedContract.contractName || ''
                        }`
                      : 'Chọn hợp đồng...'}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color="#6B7280"
                  />
                </Pressable>

                <ContractSelector
                  visible={showContractSelector}
                  contracts={availableContracts}
                  loading={contractsLoading}
                  selectedId={formState.contractId}

                  onSelect={(contractId) => updateFormField('contractId', contractId)}
                  onClose={() => setShowContractSelector(false)}
                />
              </FormField>
            </View>

            {/* Personal Information Section */}
            <View style={residentEditModalStyles.section}>
              <Text
                style={[
                  residentEditModalStyles.sectionLabel,
,
                ]}
              >
                Thông tin cá nhân
              </Text>

              <TextInputField
                label="Họ tên"
                value={formState.fullName}
                onChangeText={(value) => updateFormField('fullName', value)}
                placeholder="Nhập họ tên..."
                required
                error={errors.fullName}
                isLoading={isLoading}

              />

              <TextInputField
                label="Số CMND"
                value={formState.idNumber}
                onChangeText={(value) => updateFormField('idNumber', value)}
                placeholder="Nhập số CMND..."
                required
                error={errors.idNumber}
                isLoading={isLoading}

              />

              {/* Relationship Selector */}
              <FormField
                label="Mối quan hệ"
                required
                error={errors.relationship}

              >
                <Pressable
                  style={[
                    residentEditModalStyles.selectorButton,
                  ]}
                  onPress={() => setShowRelationshipSelector(true)}
                  disabled={isLoading}
                >
                  <Text
                    style={[
                      residentEditModalStyles.selectorText,
                    ]}
                  >
                    {formState.relationship}
                  </Text>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color="#6B7280"
                  />
                </Pressable>

                <RelationshipSelector
                  visible={showRelationshipSelector}
                  selected={formState.relationship}
                  onSelect={(rel) => updateFormField('relationship', rel)}
                  onClose={() => setShowRelationshipSelector(false)}
                />
              </FormField>
            </View>

            {/* Date Section */}
            <View style={residentEditModalStyles.section}>
              <Text
                style={[
                  residentEditModalStyles.sectionLabel,
,
                ]}
              >
                Khoảng thời gian
              </Text>

              <View style={residentEditModalStyles.dateRow}>
                <View style={residentEditModalStyles.dateField}>
                  <FormField
                    label="Ngày bắt đầu"
                    required
                    error={errors.startDate}

                  >
                    <Pressable
                      style={[
                        residentEditModalStyles.dateButton,
,
                      ]}
                      onPress={() => setShowStartDatePicker(true)}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          residentEditModalStyles.dateButtonText,
,
                        ]}
                      >
                        {formState.startDate.toLocaleDateString('vi-VN')}
                      </Text>
                    </Pressable>
                  </FormField>
                </View>

                <View style={residentEditModalStyles.dateField}>
                  <FormField
                    label="Ngày kêt thúc"
                    required
                    error={errors.endDate}

                  >
                    <Pressable
                      style={[
                        residentEditModalStyles.dateButton,
,
                      ]}
                      onPress={() => setShowEndDatePicker(true)}
                      disabled={isLoading}
                    >
                      <Text
                        style={[
                          residentEditModalStyles.dateButtonText,
,
                        ]}
                      >
                        {formState.endDate.toLocaleDateString('vi-VN')}
                      </Text>
                    </Pressable>
                  </FormField>
                </View>
              </View>

              {errors.dates && (
                <Text style={residentEditModalStyles.errorText}>
                  {errors.dates}
                </Text>
              )}

              {/* Date Pickers */}
              {showStartDatePicker && (
                <DateTimePicker
                  value={formState.startDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) updateFormField('startDate', selectedDate);
                    setShowStartDatePicker(false);
                  }}
                />
              )}

              {showEndDatePicker && (
                <DateTimePicker
                  value={formState.endDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) updateFormField('endDate', selectedDate);
                    setShowEndDatePicker(false);
                  }}
                />
              )}
            </View>

            {/* Image Upload Section */}
            <View style={residentEditModalStyles.imageSection}>
              <Text
                style={[
                  residentEditModalStyles.sectionLabel,
,
                ]}
              >
                Ảnh CMND
              </Text>
              <View style={residentEditModalStyles.imageRow}>
                <ImageUploadField
                  label="Mặt trước"
                  imageUri={imageState.frontImageUri}
                  type="front"
                  onRemove={() => handleRemoveImage('front')}
                  onPickImage={handlePickImage}
                  onCameraCapture={handleCameraCapture}

                />
                <ImageUploadField
                  label="Mặt sau"
                  imageUri={imageState.backImageUri}
                  type="back"
                  onRemove={() => handleRemoveImage('back')}
                  onPickImage={handlePickImage}
                  onCameraCapture={handleCameraCapture}

                />
              </View>
            </View>

            {/* Note Section */}
            <View style={residentEditModalStyles.section}>
              <TextInputField
                label="Ghi chú"
                value={formState.note}
                onChangeText={(value) => updateFormField('note', value)}
                placeholder="Nhập ghi chú..."
                multiline
                maxLength={500}
                isLoading={isLoading}

              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View
            style={[
              residentEditModalStyles.footer,
,
            ]}
          >
            <Pressable
              style={[
                residentEditModalStyles.button,
                residentEditModalStyles.buttonCancel,
,
                isLoading && residentEditModalStyles.buttonLoading,
              ]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text
                style={[
                  residentEditModalStyles.buttonCancelText,
,
                ]}
              >
                Hủy
              </Text>
            </Pressable>

            <Pressable
              style={[
                residentEditModalStyles.button,
                residentEditModalStyles.buttonSubmit,
                isLoading && residentEditModalStyles.buttonLoading,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={residentEditModalStyles.buttonSubmitText}>
                    {isEditMode ? 'Cập nhật' : 'Thêm mới'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

