import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Image,
  Animated,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCompareStore } from '../../stores/CompareStore';
import { useNavigation } from '@react-navigation/native';
import { URL_IMAGE } from '../../services/Constant';

export default function CompareFloatingButton() {
  const { items, clearItems, removeItem } = useCompareStore();
  const navigation = useNavigation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation liên tục cho FAB
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Animation khi mở/đóng
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isExpanded ? 1 : 1,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(fadeAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isExpanded]);

  if (items.length === 0) return null;

  const handleCompare = () => {
    if (items.length === 2) {
      navigation.navigate('CompareRooms' as never);
      setIsExpanded(false);
    }
  };

  const handleClear = () => {
    clearItems();
    setIsExpanded(false);
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleRemoveItem = (roomId: string) => {
    removeItem(roomId);
    if (items.length <= 1) {
      setIsExpanded(false);
    }
  };

  // Trạng thái Thu gọn - FAB Button với thiết kế mới
  const CollapsedButton = () => (
    <Animated.View 
      style={[
        styles.fabShadowContainer,
        {
          transform: [{ scale: pulseAnim }],
        }
      ]}
    >
      <Pressable 
        style={styles.fabContainer} 
        onPress={handleToggle}
        android_ripple={{ color: 'rgba(255,255,255,0.3)', radius: 35 }}
      >
        <LinearGradient 
          colors={['#667EEA', '#764BA2', '#F093FB']} 
          style={styles.fabCircle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glow effect layer */}
          <View style={styles.glowLayer} />
          
          {/* Icon */}
          <View style={styles.fabContent}>
            <MaterialCommunityIcons name="scale-balance" size={26} color="white" />
          </View>
        </LinearGradient>
      </Pressable>

      {/* Badge - nằm ngoài Pressable để không bị overflow clip */}
      {items.length > 0 && (
        <View style={styles.badge}>
          <LinearGradient
            colors={['#FF3B30', '#FF6B6B']}
            style={styles.badgeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.badgeText}>{items.length}</Text>
          </LinearGradient>
        </View>
      )}
    </Animated.View>
  );

  // Trạng thái Mở rộng - Card chi tiết
  const ExpandedCard = () => (
    <Animated.View 
      style={[
        styles.expandedCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="scale-balance" size={20} color="#007AFF" />
          <Text style={styles.cardTitle}>So sánh ({items.length}/2)</Text>
        </View>
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Danh sách phòng */}
      <View style={styles.roomsList}>
        {items.map((item, index) => {
          const imageUri = item.room.images?.[0]?.url 
            ? `${URL_IMAGE}${item.room.images[0].url.startsWith('/') ? item.room.images[0].url.slice(1) : item.room.images[0].url}` 
            : 'https://via.placeholder.com/80x60.png?text=No+Image';

          return (
            <View key={item.room.id} style={styles.roomItemCard}>
              <Image 
                source={{ uri: imageUri }} 
                style={styles.roomThumbnail}
                resizeMode="cover"
              />
              <View style={styles.roomInfo}>
                <Text style={styles.roomTitle} numberOfLines={2}>
                  {item.room.title}
                </Text>
                <Text style={styles.roomPrice}>
                  {(item.room.priceMonth / 1000000).toFixed(1)}tr/tháng
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleRemoveItem(item.room.id)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Placeholder nếu chưa đủ 2 phòng */}
        {items.length < 2 && (
          <View style={styles.placeholderCard}>
            <Ionicons name="add-circle-outline" size={32} color="#D1D5DB" />
            <Text style={styles.placeholderText}>Chọn thêm 1 phòng</Text>
          </View>
        )}
      </View>

      {/* Footer - Action Buttons */}
      <View style={styles.cardFooter}>
        <TouchableOpacity 
          onPress={handleToggle}
          style={styles.collapseButton}
        >
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
          <Text style={styles.collapseText}>Thu gọn</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleCompare}
          disabled={items.length < 2}
          style={[
            styles.compareActionButton,
            items.length < 2 && styles.compareActionButtonDisabled
          ]}
        >
          <Text style={[
            styles.compareActionText,
            items.length < 2 && styles.compareActionTextDisabled
          ]}>
            {items.length < 2 ? 'Chọn thêm phòng' : 'So sánh ngay'}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color={items.length < 2 ? '#9CA3AF' : 'white'} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <>
      {/* Overlay khi expanded */}
      {isExpanded && (
        <Modal
          transparent
          visible={isExpanded}
          animationType="fade"
          onRequestClose={() => setIsExpanded(false)}
        >
          <Pressable 
            style={styles.overlay} 
            onPress={() => setIsExpanded(false)}
          >
            <View style={styles.expandedContainer}>
              <ExpandedCard />
            </View>
          </Pressable>
        </Modal>
      )}

      {/* FAB Button - luôn hiển thị */}
      <View style={styles.floatingPosition}>
        <CollapsedButton />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  // Vị trí floating chung
  floatingPosition: {
    position: 'absolute',
    bottom: 150, 
    right: 20,
    zIndex: 9999,
  },

  // FAB Shadow Container - cho pulse animation
  fabShadowContainer: {
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },

  // FAB Button - Trạng thái Thu gọn
  fabContainer: {
    borderRadius: 35,
    overflow: 'hidden',
  },
  fabCircle: {
    width: 60,
    height: 60,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  // Glow effect layer
  glowLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 35,
  },

  // FAB Content wrapper
  fabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Badge
  badge: {
    position: 'absolute',
    top: -3,
    right: -0,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  badgeGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Overlay
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  // Expanded Card Container
  expandedContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 100,
  },

  // Card mở rộng
  expandedCard: {
    width: 340,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },

  // Header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },

  // Danh sách phòng
  roomsList: {
    gap: 12,
    marginBottom: 16,
  },
  roomItemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  roomThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
  },
  roomInfo: {
    flex: 1,
    gap: 4,
  },
  roomTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    lineHeight: 18,
  },
  roomPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  removeButton: {
    padding: 4,
  },

  // Placeholder
  placeholderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    flex: 1,
  },
  collapseText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  compareActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    flex: 2,
  },
  compareActionButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  compareActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  compareActionTextDisabled: {
    color: '#9CA3AF',
  },
});