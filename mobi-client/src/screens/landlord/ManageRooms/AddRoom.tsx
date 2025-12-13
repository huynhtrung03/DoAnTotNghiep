import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../../../colors/colors';
import { useNavigation } from '@react-navigation/native';
import { createRoom } from '../../../services/RoomService';
import { getProfileById } from '../../../services/ProfileService';

// Import steps components
import Step1MediaAndName from './steps/Step1MediaAndName';
import Step2Location from './steps/Step2Location';
import Step3Details from './steps/Step3Details';
import Step4Package from './steps/Step4Package';
import Step5Summary from './steps/Step5Summary';

// Progress indicator component
import StepperIndicator from './components/StepperIndicator';

const { height, width } = Dimensions.get('window');

export interface RoomFormData {
  // Step 1
  title: string;
  images: any[];
  videos: any[];
  videoUploadProgress: { [key: string]: number };

  // Step 2
  provinceId: number | null;
  provinceName: string;
  districtId: number | null;
  districtName: string;
  wardId: number | null;
  wardName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;

  // Step 3
  width: number | null;
  height: number | null;
  electricPrice: number | null;
  waterPrice: number | null;
  monthlyPrice: number | null;
  deposit: number | null;
  maxTenants: number;
  convenients: string[];

  // Step 4
  typePostId: string | null;
  startDate: Date | null;
  endDate: Date | null;
  expectedCost: number | null;

  // Step 5
  description: string;
}

const INITIAL_FORM_DATA: RoomFormData = {
  title: '',
  images: [],
  videos: [],
  videoUploadProgress: {},

  provinceId: null,
  provinceName: '',
  districtId: null,
  districtName: '',
  wardId: null,
  wardName: '',
  address: '',
  latitude: null,
  longitude: null,

  width: null,
  height: null,
  electricPrice: null,
  waterPrice: null,
  monthlyPrice: null,
  deposit: null,
  maxTenants: 1,
  convenients: [],

  typePostId: null,
  startDate: null,
  endDate: null,
  expectedCost: null,

  description: '',
};

type StepNumber = 1 | 2 | 3 | 4 | 5;

const AddRoom: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [formData, setFormData] = useState<RoomFormData>(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bankCheckPassed, setBankCheckPassed] = useState(false);
  const [showBankWarning, setShowBankWarning] = useState(false);
  const [loadingBankCheck, setLoadingBankCheck] = useState(true);
  const navigation = useNavigation();

  // Skip bank check - backend will validate on submit
  useEffect(() => {
    // Allow user to proceed directly to form
    // Backend will check bank account when submitting
    setBankCheckPassed(true);
    setLoadingBankCheck(false);
  }, []);

  const handleUpdateFormData = useCallback((updates: Partial<RoomFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleNextStep = () => {
    // Validate current step before moving to next
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((currentStep + 1) as StepNumber);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as StepNumber);
    }
  };

  const validateStep = (step: StepNumber): boolean => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập tên phòng');
          return false;
        }
        if (formData.images.length === 0 && formData.videos.length === 0) {
          Alert.alert('Lỗi', 'Vui lòng thêm ít nhất một hình ảnh hoặc video');
          return false;
        }
        return true;

      case 2:
        if (!formData.provinceId || !formData.districtId || !formData.wardId) {
          Alert.alert('Lỗi', 'Vui lòng chọn đầy đủ Tỉnh/Quận/Phường');
          return false;
        }
        if (!formData.address.trim()) {
          Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ cụ thể');
          return false;
        }
        return true;

      case 3:
        if (
          formData.width === null ||
          formData.height === null ||
          formData.electricPrice === null ||
          formData.waterPrice === null ||
          formData.monthlyPrice === null ||
          formData.deposit === null
        ) {
          Alert.alert('Lỗi', 'Vui lòng điền đủ thông tin kỹ thuật');
          return false;
        }
        return true;

      case 4:
        if (!formData.typePostId) {
          Alert.alert('Lỗi', 'Vui lòng chọn gói tin đăng');
          return false;
        }
        if (!formData.startDate || !formData.endDate) {
          Alert.alert('Lỗi', 'Vui lòng chọn thời gian đăng');
          return false;
        }
        return true;

      case 5:
        return true;

      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep(5)) {
        return;
      }

      setIsSubmitting(true);

      // Get userId from AsyncStorage
      const userDataJson = await AsyncStorage.getItem('userData');
      const userData = userDataJson ? JSON.parse(userDataJson) : null;
      const userId = userData?.id;

      if (!userId) {
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
        setIsSubmitting(false);
        return;
      }

      // Prepare room data - match backend field names exactly
      const roomPayload = {
        title: formData.title,
        description: formData.description,
        address: {
          street: formData.address,
          wardId: formData.wardId,
        },
        roomWidth: formData.width,
        roomLength: formData.height,
        elecPrice: formData.electricPrice,
        waterPrice: formData.waterPrice,
        priceMonth: formData.monthlyPrice,
        priceDeposit: formData.deposit,
        maxPeople: formData.maxTenants,
        convenientIds: formData.convenients.map(id => parseInt(id)), // Convert strings to numbers
        typepostId: formData.typePostId,
        postStartDate: formData.startDate?.toISOString(),
        postEndDate: formData.endDate?.toISOString(),
        userId: userId,
      };

      console.log('📦 [handleSubmit] Submitting room payload:', roomPayload);

      // Call API to create room
      const response = await createRoom(formData.images, roomPayload);

      console.log('✅ [handleSubmit] Room created successfully:', response);

      Alert.alert('Thành công', 'Phòng được tạo thành công', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back or reset form
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ [handleSubmit] Error creating room:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo phòng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingBankCheck) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang kiểm tra...</Text>
      </View>
    );
  }

  if (!bankCheckPassed) {
    return (
      <Modal
        visible={showBankWarning}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.bankWarningOverlay}>
          <View style={styles.bankWarningBox}>
            <Text style={styles.bankWarningTitle}>Tài khoản ngân hàng bắt buộc</Text>
            <Text style={styles.bankWarningText}>
              Bạn cần thêm thông tin tài khoản ngân hàng trước khi đăng phòng cho thuê.
              Vui lòng cập nhật trong phần Hồ sơ cá nhân.
            </Text>
            <TouchableOpacity
              style={styles.bankWarningButton}
              onPress={() => {
                navigation.navigate('Profile' as never);
              }}
            >
              <Text style={styles.bankWarningButtonText}>Đi tới Hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  const renderStepContent = () => {
    const commonProps = {
      formData,
      onUpdate: handleUpdateFormData,
    };

    switch (currentStep) {
      case 1:
        return <Step1MediaAndName {...commonProps} />;
      case 2:
        return <Step2Location {...commonProps} />;
      case 3:
        return <Step3Details {...commonProps} />;
      case 4:
        return <Step4Package {...commonProps} />;
      case 5:
        return <Step5Summary {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Stepper Header */}
      <StepperIndicator currentStep={currentStep} totalSteps={5} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Content */}
        <View style={styles.stepContent}>{renderStepContent()}</View>

        {/* Loading Overlay */}
        {isSubmitting && (
          <Modal transparent animationType="fade" visible={isSubmitting}>
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Đang xử lý...</Text>
            </View>
          </Modal>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handlePrevStep}
            disabled={isSubmitting}
          >
            <Text style={styles.secondaryButtonText}>Quay lại</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            (isSubmitting || (currentStep === 5 && formData.images.length === 0)) &&
              styles.buttonDisabled,
          ]}
          onPress={currentStep === 5 ? handleSubmit : handleNextStep}
          disabled={isSubmitting || (currentStep === 5 && formData.images.length === 0)}
        >
          <Text style={styles.buttonText}>
            {currentStep === 5 ? 'Tạo phòng' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: Colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundLight,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bankWarningOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bankWarningBox: {
    marginHorizontal: 20,
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.backgroundLight,
    borderRadius: 12,
  },
  bankWarningTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  bankWarningText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 20,
  },
  bankWarningButton: {
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  bankWarningButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default AddRoom;
