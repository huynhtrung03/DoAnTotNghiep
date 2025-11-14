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
import { createRequestNotification } from '../../services/statistics/NotificationService';
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
          'Permission Required',
          'Please grant camera roll permissions to upload images.'
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
      Alert.alert('Error', error.message || 'Failed to pick image');
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return;
    }

    if (!roomId) {
      Alert.alert('Error', 'Room ID is missing');
      return;
    }

    setLoading(true);
    try {
      // Get user ID from AsyncStorage
      const userDataStr = await AsyncStorage.getItem('userData');
      const userData = userDataStr ? JSON.parse(userDataStr) : null;
      const userId = userData?.id;

      if (!userId) {
        throw new Error('User ID not found');
      }

      const requestData = {
        userId: userId,
        roomId: roomId,
        description: description.trim(),
      };

      // Create request with optional image
      await createRequest(
        requestData,
        selectedImage?.uri,
        selectedImage?.fileName,
        selectedImage?.type
      );

      // Send notification to landlord
      await createRequestNotification(
        roomId,
        userId,
        `New request: ${description.slice(0, 50)}${description.length > 50 ? '...' : ''}`
      );

      Alert.alert('Success', 'Your request has been sent successfully!', [
        {
          text: 'OK',
          onPress: () => {
            handleClose();
            onSuccess();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create request');
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
            <Text style={styles.title}>Send New Request</Text>
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
                Description *
              </Text>
              <TextInput
                style={styles.textArea}
                placeholder="Describe your request or issue (e.g., broken AC, water leakage, etc.)"
                placeholderTextColor="#BDBDBD"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {description.length} / 500 characters
              </Text>
            </View>

            {/* Image Upload */}
            <View style={styles.section}>
              <Text style={styles.label}>
                <Ionicons name="image-outline" size={16} color="#1976D2" />{' '}
                Attach Image (Optional)
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
                    <Text style={styles.changeImageText}>Change Image</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                >
                  <Ionicons name="camera-outline" size={40} color="#1976D2" />
                  <Text style={styles.uploadButtonText}>
                    Tap to add image (optional)
                  </Text>
                  <Text style={styles.uploadHint}>
                    Photos help landlord understand the issue better
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Ionicons name="information-circle-outline" size={20} color="#FF9800" />
              <View style={styles.instructionsContent}>
                <Text style={styles.instructionsTitle}>Tips for better response:</Text>
                <Text style={styles.instructionsText}>
                  • Be specific about the issue{'\n'}
                  • Mention the urgency level{'\n'}
                  • Include photos if applicable{'\n'}
                  • Suggest your preferred time for resolution
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
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
                  <Text style={styles.submitButtonText}>Sending...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#FFF" />
                  <Text style={styles.submitButtonText}>Send Request</Text>
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
