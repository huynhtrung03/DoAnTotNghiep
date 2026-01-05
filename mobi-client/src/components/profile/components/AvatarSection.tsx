/**
 * AvatarSection Component
 * 
 * Component hiển thị avatar của user và cho phép thay đổi ảnh
 * 
 * Features:
 * - Hiển thị avatar hoặc placeholder (nếu chưa có ảnh)
 * - Nút camera để chọn ảnh mới (chỉ khi đang edit)
 * - Circle avatar với border màu xanh
 */

import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarSectionProps } from '../types';
import { styles } from '../ProfileInformation.styles';

const AvatarSection: React.FC<AvatarSectionProps> = ({
  avatarUri,
  isEditing,
  onPickImage,
}) => {
  return (
    <View style={styles.avatarContainer}>
      <View style={styles.avatarWrapper}>
        {/* Avatar Image hoặc Placeholder */}
        {avatarUri ? (
          // Hiển thị avatar nếu có
          <Image
            source={{ uri: avatarUri }}
            style={styles.avatar}
          />
        ) : (
          // Hiển thị placeholder với icon user nếu chưa có avatar
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={48} color="#9CA3AF" />
          </View>
        )}

        {/* Nút Edit Avatar - chỉ hiển thị khi đang ở chế độ edit */}
        {isEditing && (
          <TouchableOpacity
            style={styles.avatarEditButton}
            onPress={onPickImage}
            activeOpacity={0.8}
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default AvatarSection;
