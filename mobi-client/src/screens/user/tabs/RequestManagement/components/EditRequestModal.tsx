import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  RequirementsService,
  RequirementDetail,
  updateRequirementWithImage,
} from '../../../../../services/Requirements';
import { styles, RequestColors } from '../styles';

interface EditRequestModalProps {
  visible: boolean;
  request: RequirementDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({
  visible,
  request,
  onClose,
  onSuccess,
}) => {
  // ===== STATE =====
  const [description, setDescription] = useState('');
  const [newImageFile, setNewImageFile] = useState<{uri: string; type: string; name: string} | null>(null);
  const [uploading, setUploading] = useState(false);

  // ===== SYNC REQUEST DATA =====
  useEffect(() => {
    if (request) {
      setDescription(request.description || '');
      setNewImageFile(null);
    }
  }, [request]);

  // ===== PICK IMAGE =====
  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = `requirement_${Date.now()}.jpg`;
        
        setNewImageFile({
          uri: asset.uri,
          type: 'image/jpeg',
          name: fileName,
        });
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  // ===== REMOVE IMAGE =====
  const handleRemoveImage = () => {
    setNewImageFile(null);
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập mô tả yêu cầu');
      return;
    }

    if (description.trim().length < 5) {
      Alert.alert('Mô tả quá ngắn', 'Vui lòng nhập ít nhất 5 ký tự');
      return;
    }

    if (description.trim().length > 500) {
      Alert.alert('Mô tả quá dài', 'Mô tả không được vượt quá 500 ký tự');
      return;
    }

    if (!request) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin yêu cầu');
      return;
    }

    try {
      setUploading(true);

      if (newImageFile) {
        const imageFile = {
          uri: newImageFile.uri,
          type: newImageFile.type,
          name: newImageFile.name,
        } as any;

        await updateRequirementWithImage(
          request.id,
          description.trim(),
          imageFile
        );
      } else {
        await RequirementsService.updateRequirement(request.id, description.trim());
      }

      Alert.alert('Thành công', 'Cập nhật yêu cầu thành công!', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật yêu cầu');
    } finally {
      setUploading(false);
    }
  };

  // ===== GET IMAGE URL =====
  const getImageUrl = (imageUrl?: string): string => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://res.cloudinary.com${imageUrl}`;
  };

  if (!request) return null;

  const currentImageUrl = getImageUrl(request.imageUrl);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable 
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa yêu cầu</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={uploading}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.modalContent}>
              {/* Room Name (Read-only) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phòng</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={request.roomTitle || 'Phòng không xác định'}
                  editable={false}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Mô tả yêu cầu <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Nhập mô tả chi tiết yêu cầu của bạn"
                  placeholderTextColor="#9CA3AF"
                  multiline
                  maxLength={500}
                  editable={!uploading}
                />
                <Text style={styles.characterCount}>
                  {description.length}/500 ký tự
                </Text>
              </View>

              {/* Current Image */}
              {currentImageUrl && !newImageFile && (
                <View style={styles.formGroup}>
                  <Text style={styles.currentImageLabel}>Ảnh hiện tại:</Text>
                  <Image
                    source={{ uri: currentImageUrl }}
                    style={styles.currentImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Image Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Cập nhật ảnh (Tùy chọn)</Text>
                
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handlePickImage}
                  disabled={uploading}
                >
                  <Ionicons name="camera" size={20} color={RequestColors.primary} />
                  <Text style={styles.imagePickerText}>
                    {newImageFile ? 'Chọn ảnh khác' : 'Chọn ảnh mới'}
                  </Text>
                </TouchableOpacity>

                {/* Preview New Image */}
                {newImageFile && (
                  <View style={{ marginTop: 12 }}>
                    <View style={styles.newImageInfo}>
                      <Text style={styles.newImageText}>
                        ✓ Đã chọn: {newImageFile.name}
                      </Text>
                    </View>
                    
                    <Image
                      source={{ uri: newImageFile.uri }}
                      style={[styles.currentImage, { marginTop: 8 }]}
                      resizeMode="cover"
                    />
                    
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={handleRemoveImage}
                      disabled={uploading}
                    >
                      <Text style={styles.removeImageText}>
                        Xóa ảnh đã chọn
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              disabled={uploading}
            >
              <Text style={styles.secondaryButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Cập nhật</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default EditRequestModal;
