import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RequestModalProps } from '../../types/rental';
import { createRequest } from '../../services/Requirements';
import { createRequestNotification } from '../../services/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './RequestModal.styles';

const RequestModal: React.FC<RequestModalProps> = ({
  visible,
  roomId,
  onClose,
  onSuccess,
}) => {
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    fileName: string;
    type: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Cần cấp quyền',
          'Vui lòng cấp quyền truy cập thư viện ảnh để tải lên hình ảnh.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedImage({
          uri: asset.uri,
          fileName: asset.uri.split('/').pop() || 'request-image.jpg',
          type: asset.type === 'image' ? 'image/jpeg' : 'image/jpeg',
        });
      }
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể chọn ảnh');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Lỗi xác thực', 'Vui lòng nhập mô tả');
      return;
    }

    if (!roomId) {
      Alert.alert('Lỗi', 'Thiếu ID phòng');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 RequestModal - Starting submit');
      console.log('🚀 RequestModal - roomId:', roomId);
      console.log('🚀 RequestModal - description:', description);
      
      // Get user ID from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      console.log('🚀 RequestModal - userDataStr:', userDataStr);
      
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      console.log('🚀 RequestModal - userData:', JSON.stringify(userData, null, 2));
      
      const userId = userData?.id;
      console.log('🚀 RequestModal - userId:', userId);

      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }

      const requestData = {
        userId: userId,
        roomId: roomId,
        description: description.trim(),
      };
      console.log('🚀 RequestModal - requestData:', JSON.stringify(requestData, null, 2));
      console.log('🚀 RequestModal - selectedImage:', selectedImage ? JSON.stringify(selectedImage, null, 2) : 'null');

      // Create request with optional image
      console.log('🚀 RequestModal - Calling createRequest...');
      const result = await createRequest(
        requestData,
        selectedImage?.uri,
        selectedImage?.fileName,
        selectedImage?.type
      );
      console.log('✅ RequestModal - createRequest success:', JSON.stringify(result, null, 2));

      // Send notification to landlord
      console.log('🚀 RequestModal - Sending notification...');
      await createRequestNotification(
        roomId,
        userId,
        `Yêu cầu mới: ${description.slice(0, 50)}${description.length > 50 ? '...' : ''}`
      );
      console.log('✅ RequestModal - Notification sent');

      Alert.alert('Thành công', 'Yêu cầu của bạn đã được gửi thành công!', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
            onSuccess();
          },
        },
      ]);
    } catch (error: any) {
      console.error('❌ RequestModal - Error:', error);
      console.error('❌ RequestModal - Error message:', error.message);
      console.error('❌ RequestModal - Error stack:', error.stack);
      Alert.alert('Lỗi', error.message || 'Không thể tạo yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription('');
    setSelectedImage(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Gửi yêu cầu mới</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#757575" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Description Input */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Ionicons name="document-text-outline" size={16} color="#1976D2" />{' '}
                Mô tả *
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Mô tả yêu cầu hoặc vấn đề của bạn (ví dụ: điều hòa hỏng, rò rỉ nước, v.v.)"
                placeholderTextColor="#BDBDBD"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {description.length} / 500 ký tự
              </Text>
            </View>

            {/* Image Upload */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Ionicons name="image-outline" size={16} color="#1976D2" />{' '}
                Đính kèm hình ảnh (Tùy chọn)
              </Text>

              {selectedImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setSelectedImage(null)}
                  >
                    <Ionicons name="close-circle" size={28} color="#F44336" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.changeImageButton}
                    onPress={handlePickImage}
                  >
                    <Ionicons name="repeat-outline" size={20} color="#1976D2" />
                    <Text style={styles.changeImageText}>Đổi ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="camera-outline" size={40} color="#1976D2" />
                  <Text style={styles.uploadButtonText}>
                    Nhấn để thêm ảnh (tùy chọn)
                  </Text>
                  <Text style={styles.uploadHint}>
                    Hình ảnh giúp chủ nhà hiểu rõ vấn đề hơn
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionsTitle}>Mẹo để được phản hồi nhanh:</Text>
                <Text style={styles.instructionsText}>
                  • Mô tả cụ thể vấn đề{'\n'}
                  • Nêu mức độ khẩn cấp{'\n'}
                  • Đính kèm ảnh nếu có{'\n'}
                  • Đề xuất thời gian ưa thích để giải quyết
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.submitButton,
                (loading || !description.trim()) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || !description.trim()}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.submitButtonText}>Đang gửi...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default RequestModal;
