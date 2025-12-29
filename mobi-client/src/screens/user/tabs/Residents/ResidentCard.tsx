import React, { useRef } from 'react';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ResidentData } from '../../../../services/ResidentService';
import { residentCardStyles, ResidentColors, Spacing } from './styles';

interface ResidentCardProps {
  resident: ResidentData;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  roomTitle?: string;
}

/**
 * ResidentCard - Minimalist card component for displaying resident information
 * Features:
 * - Header: Full name + Relationship tag
 * - Info: Room title + Status badge
 * - ID: ID number with icon
 * - Actions: Swipe left to reveal Edit/Delete buttons
 */
export const ResidentCard: React.FC<ResidentCardProps> = ({
  resident,
  onPress,
  onEdit,
  onDelete,
  roomTitle,
}) => {
  const panX = useRef(new Animated.Value(0)).current;
  const [showActions, setShowActions] = React.useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow swiping left (negative dx)
        if (gestureState.dx < 0) {
          panX.setValue(Math.max(gestureState.dx, -100));
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -40) {
          // Swipe left - show actions
          Animated.spring(panX, {
            toValue: -100,
            useNativeDriver: false,
          }).start();
          setShowActions(true);
        } else {
          // Reset
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: false,
          }).start();
          setShowActions(false);
        }
      },
    })
  ).current;

  const handleReset = () => {
    Animated.spring(panX, {
      toValue: 0,
      useNativeDriver: false,
    }).start();
    setShowActions(false);
  };

  const getStatusInfo = (
    status?: string
  ): {
    badge: string;
    text: string;
    bgColor: string;
    textColor: string;
    icon: string;
  } => {
    switch (status) {
      case 'ACTIVE':
        return {
          badge: 'Đang hoạt động',
          text: 'active',
          bgColor: ResidentColors.active.bg,
          textColor: ResidentColors.active.text,
          icon: '✔',
        };
      case 'PENDING':
        return {
          badge: 'Chờ xác nhận',
          text: 'pending',
          bgColor: ResidentColors.pending.bg,
          textColor: ResidentColors.pending.text,
          icon: '●',
        };
      case 'INACTIVE':
        return {
          badge: 'Không hoạt động',
          text: 'inactive',
          bgColor: ResidentColors.inactive.bg,
          textColor: ResidentColors.inactive.text,
          icon: '-',
        };
      case 'REJECTED':
        return {
          badge: 'Bị từ chối',
          text: 'rejected',
          bgColor: ResidentColors.rejected.bg,
          textColor: ResidentColors.rejected.text,
          icon: '×',
        };
      default:
        return {
          badge: 'Không xác định',
          text: 'unknown',
          bgColor: '#F3F4F6',
          textColor: '#6B7280',
          icon: '?',
        };
    }
  };

  const statusInfo = getStatusInfo(resident.status);

  // Get dynamic styles
  const containerStyle = [
    residentCardStyles.container,
  ];

  const headerRowStyle = [residentCardStyles.headerRow];
  const fullNameStyle = [
    residentCardStyles.fullName,
  ];
  const infoRowStyle = [residentCardStyles.infoRow];
  const roomTitleStyle = [
    residentCardStyles.roomTitle,
  ];
  const statusBadgeStyle = [
    residentCardStyles.statusBadge,
    {
      backgroundColor: statusInfo.bgColor,
      borderColor: statusInfo.bgColor,
    },
  ];
  const idRowStyle = [
    residentCardStyles.idRow,
  ];

  return (
    <View style={containerStyle}>
      {/* Swipe Actions Background */}
      {showActions && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              flexDirection: 'row',
              justifyContent: 'flex-end',
              paddingHorizontal: Spacing.md,
              backgroundColor: '#F3F4F6',
              borderRadius: 12,
            },
          ]}
        >
          <Pressable
            style={[residentCardStyles.actionButton, residentCardStyles.editButton]}
            onPress={() => {
              handleReset();
              onEdit?.();
            }}
          >
            <Ionicons name="pencil" size={14} color="#1E40AF" />
            <Text style={residentCardStyles.editButtonText}>Sửa</Text>
          </Pressable>
          <Pressable
            style={[residentCardStyles.actionButton, residentCardStyles.deleteButton]}
            onPress={() => {
              handleReset();
              onDelete?.();
            }}
          >
            <Ionicons name="trash" size={14} color="#7F1D1D" />
            <Text style={residentCardStyles.deleteButtonText}>Xóa</Text>
          </Pressable>
        </View>
      )}

      {/* Swipeable Content */}
      <Animated.View
        style={[
          {
            transform: [{ translateX: panX }],
          },
          residentCardStyles.pressable,
        ]}
        {...panResponder.panHandlers}
      >
        <Pressable
          style={({ pressed }) => [
            residentCardStyles.pressable,
            pressed && residentCardStyles.pressableActive,
          ]}
          onPress={() => {
            if (!showActions) {
              onPress?.();
            } else {
              handleReset();
            }
          }}
        >
          <View style={residentCardStyles.content}>
            {/* Header Row: Name + Relationship */}
            <View style={headerRowStyle}>
              <Text style={fullNameStyle} numberOfLines={1}>
                {resident.fullName}
              </Text>
              <View style={residentCardStyles.relationshipTag}>
                <Text style={residentCardStyles.relationshipTagText}>
                  {resident.relationship}
                </Text>
              </View>
              <Pressable
                style={residentCardStyles.cardDeleteButton}
                onPress={() => {
                  handleReset();
                  onDelete?.();
                }}
              >
                <Ionicons name="trash" size={16} color="#EF4444" />
              </Pressable>
            </View>

            {/* Info Row: Room + Status */}
            <View style={infoRowStyle}>
              <Text style={roomTitleStyle} numberOfLines={1}>
                {roomTitle || 'Phòng không xác định'}
              </Text>
              <View style={statusBadgeStyle}>
                <Text style={[residentCardStyles.statusIcon, { color: statusInfo.textColor }]}>
                  {statusInfo.icon}
                </Text>
                <Text
                  style={[
                    residentCardStyles.statusBadgeText,
                    { color: statusInfo.textColor },
                  ]}
                >
                  {statusInfo.badge}
                </Text>
              </View>
            </View>

            {/* ID Number Row */}
            <View style={idRowStyle}>
              <Ionicons
                name="card"
                size={16}
                color="#6B7280"
                style={{ marginRight: Spacing.sm }}
              />
              <Text style={residentCardStyles.idNumber}>
                {resident.idNumber}
              </Text>
              {showActions && (
                <Text style={residentCardStyles.swipeHintText}>
                  ← Vuốt tiếp tục
                </Text>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
};
