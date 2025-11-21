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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  RequirementsService,
  RequirementDetail,
  updateRequirementWithImage,
} from '../../../../../services/Requirements';
import { styles } from '../styles';

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
      setNewImageFile(null); // Reset khi mở modal mới
    }
  }, [request]);

  // ===== PICK IMAGE =====
  const handlePickImage = async () => {
    try {
      console.log('🖼️ Mở thư viện ảnh...');
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập',
          'Vui lòng cấp quyền truy cập thư viện ảnh'
        );
        return;
      }

      // Pick image
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
        
        console.log('✅ Đã chọn ảnh:', fileName);
      }
    } catch (error: any) {
      console.error('❌ Lỗi khi chọn ảnh:', error.message);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  // ===== REMOVE IMAGE =====
  const handleRemoveImage = () => {
    setNewImageFile(null);
    console.log('🗑️ Đã xóa ảnh mới');
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    // Validation
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
      console.log(`📤 Đang cập nhật yêu cầu ${request.id}...`);
      setUploading(true);

      // Case 1: Có ảnh mới → Upload ảnh
      if (newImageFile) {
        console.log('📷 Đang upload ảnh mới...');
        
        // Chuyển đổi sang File object (cần cho updateRequirementWithImage)
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
        
        console.log('✅ Đã cập nhật yêu cầu với ảnh mới');
      } 
      // Case 2: Chỉ cập nhật mô tả
      else {
        console.log('📝 Đang cập nhật mô tả...');
        await RequirementsService.updateRequirement(request.id, description.trim());
        console.log('✅ Đã cập nhật mô tả');
      }

      Alert.alert('Thành công', 'Request updated successfully!', [
        { text: 'OK', onPress: onSuccess },
      ]);
    } catch (error: any) {
      console.error('❌ Lỗi khi cập nhật yêu cầu:', error.message);
      Alert.alert('Lỗi', error.message || 'Failed to update request.');
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

  // ===== RENDER =====
  if (!request) return null;

  const currentImageUrl = getImageUrl(request.imageUrl);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Request</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              disabled={uploading}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.modalBody}>
            <View style={{ padding: 16 }}>
              {/* Room Name (Read-only) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Room Name</Text>
                <TextInput
                  style={[styles.input, styles.disabledInput]}
                  value={request.roomName || 'Phòng không xác định'}
                  editable={false}
                />
              </View>

              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Request Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter request description"
                  multiline
                  maxLength={500}
                  editable={!uploading}
                />
                <Text style={styles.characterCount}>
                  {description.length}/500 characters
                </Text>
              </View>

              {/* Current Image */}
              {currentImageUrl && !newImageFile && (
                <View style={styles.formGroup}>
                  <Text style={styles.currentImageLabel}>Current image:</Text>
                  <Image
                    source={{ uri: currentImageUrl }}
                    style={styles.currentImage}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Image Picker */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Update Image (Optional)</Text>
                
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={handlePickImage}
                  disabled={uploading}
                >
                  <Text>📷</Text>
                  <Text style={styles.imagePickerText}>
                    {newImageFile ? 'Select New Image' : 'Select New Image'}
                  </Text>
                </TouchableOpacity>

                {/* Preview New Image */}
                {newImageFile && (
                  <>
                    <View style={styles.newImageInfo}>
                      <Text style={styles.newImageText}>
                        New image selected: {newImageFile.name}
                      </Text>
                    </View>
                    
                    <Image
                      source={{ uri: newImageFile.uri }}
                      style={[styles.currentImage, { marginTop: 8 }]}
                      resizeMode="cover"
                    />
                    
                    <TouchableOpacity
                      style={{ marginTop: 8, padding: 8 }}
                      onPress={handleRemoveImage}
                      disabled={uploading}
                    >
                      <Text style={{ fontSize: 13, color: '#ff4d4f', textAlign: 'center' }}>
                        🗑️ Remove new image
                      </Text>
                    </TouchableOpacity>
                  </>
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
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleSubmit}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>Update Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditRequestModal;
