import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../../../colors/colors';
import TextInputWithLabel from '../components/TextInputWithLabel';
import { RoomFormData } from '../AddRoom';
import { Video } from 'expo-av';

const { width } = Dimensions.get('window');
const GRID_COLS = 3;
const ITEM_SIZE = (width - 64) / GRID_COLS;

interface Step1Props {
  formData: RoomFormData;
  onUpdate: (updates: Partial<RoomFormData>) => void;
}

const Step1MediaAndName: React.FC<Step1Props> = ({ formData, onUpdate }) => {
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newImages = [
        ...formData.images,
        {
          uri: asset.uri,
          type: 'image/jpeg',
          name: `image_${Date.now()}.jpg`,
        },
      ];
      onUpdate({ images: newImages });
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Bạn cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const newVideos = [
        ...formData.videos,
        {
          uri: asset.uri,
          type: 'video/mp4',
          name: `video_${Date.now()}.mp4`,
          uploadProgress: 0,
        },
      ];
      onUpdate({ videos: newVideos });
    }
  };

  const removeMedia = (index: number, type: 'image' | 'video') => {
    if (type === 'image') {
      const newImages = formData.images.filter((_, i) => i !== index);
      onUpdate({ images: newImages });
    } else {
      const newVideos = formData.videos.filter((_, i) => i !== index);
      onUpdate({ videos: newVideos });
    }
  };

  const renderMediaItem = ({ item, index, type }: any) => {
    if (!item || !item.uri) {
      console.warn('⚠️ Invalid media item:', item);
      return null;
    }

    const isVideo = type === 'video';
    const progress = formData.videoUploadProgress[item.uri] || 0;

    return (
      <View style={styles.mediaItem}>
        <TouchableOpacity
          style={styles.mediaContainer}
          onPress={() => {
            if (isVideo) {
              setSelectedMedia(item);
              setMediaType('video');
            } else {
              setSelectedMedia(item);
              setMediaType('image');
            }
          }}
        >
          {!isVideo ? (
            <Image
              source={{ uri: item.uri }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.videoThumbnail}>
              <MaterialIcons name="video-library" size={32} color={Colors.primary} />
            </View>
          )}

          {isVideo && progress > 0 && progress < 100 && (
            <View style={styles.uploadProgressContainer}>
              <View style={[styles.uploadProgressBar, { width: `${progress}%` }]} />
              <Text style={styles.uploadProgressText}>{progress}%</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeMedia(index, type)}
        >
          <MaterialIcons name="close" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>
    );
  };

  const allMedia = [
    ...formData.images.filter(img => img && img.uri).map((img, idx) => ({ ...img, index: idx, type: 'image' })),
    ...formData.videos.filter(vid => vid && vid.uri).map((vid, idx) => ({ ...vid, index: idx, type: 'video' })),
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Media Grid Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ảnh & Video ({allMedia.length})</Text>
        <Text style={styles.sectionDescription}>
          Chọn ít nhất 1 ảnh hoặc video. Ảnh đầu tiên sẽ là ảnh bìa.
        </Text>

        <View style={styles.mediaGrid}>
          {allMedia.map((item, index) => (
            <View key={`${item.type}-${index}`}>
              {renderMediaItem({ item, index, type: item.type })}
            </View>
          ))}

          {allMedia.length < 12 && (
            <View style={styles.addMediaButtonsContainer}>
              <TouchableOpacity style={styles.addMediaButton} onPress={pickImage}>
                <MaterialIcons name="image" size={32} color={Colors.primary} />
                <Text style={styles.addMediaButtonText}>Ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.addMediaButton} onPress={pickVideo}>
                <MaterialIcons name="videocam" size={32} color={Colors.primary} />
                <Text style={styles.addMediaButtonText}>Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Room Name Section */}
      <View style={styles.section}>
        <TextInputWithLabel
          label="Tên phòng"
          placeholder="Ví dụ: Phòng 20m² gần công viên"
          value={formData.title}
          onChangeText={(title) => onUpdate({ title })}
          maxLength={100}
        />
        <Text style={styles.charCounter}>
          {formData.title.length}/100
        </Text>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={!!selectedMedia && !!selectedMedia.uri}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMedia(null)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedMedia(null)}
          >
            <MaterialIcons name="close" size={28} color={Colors.textWhite} />
          </TouchableOpacity>

          {selectedMedia && mediaType === 'image' ? (
            <Image
              source={{ uri: selectedMedia.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : selectedMedia && mediaType === 'video' ? (
            <Video
              source={{ uri: selectedMedia.uri }}
              style={styles.previewVideo}
              useNativeControls
              isLooping
            />
          ) : null}
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaItem: {
    width: ITEM_SIZE,
    aspectRatio: 1,
  },
  mediaContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundDark,
  },
  uploadProgressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.border,
  },
  uploadProgressBar: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  uploadProgressText: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -15,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textWhite,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addMediaButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  addMediaButton: {
    width: '100%',
    paddingVertical: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    marginBottom: 12,
  },
  addMediaButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  charCounter: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  previewImage: {
    width: '100%',
    height: '80%',
  },
  previewVideo: {
    width: '100%',
    height: '80%',
  },
});

export default Step1MediaAndName;
