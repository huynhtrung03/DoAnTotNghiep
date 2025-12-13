// import { create } from 'zustand';

// interface Room {
//   id: string;
//   title: string;
//   price: number;
//   area: number;
//   district: string;
//   images: string[];
//   // Thêm các thuộc tính khác cần thiết
// }

// interface CompareState {
//   compareList: Room[];
//   addToCompare: (room: Room) => void;
//   removeFromCompare: (roomId: string) => void;
//   clearCompare: () => void;
//   isInCompare: (roomId: string) => boolean;
// }

// export const useCompareStore = create<CompareState>((set, get) => ({
//   compareList: [],
  
//   addToCompare: (room) =>
//     set((state) => {
//       if (state.compareList.length >= 2) {
//         // Thay thế phần tử đầu tiên nếu đã có 2 phòng
//         return { compareList: [state.compareList[1], room] };
//       }
//       if (!state.compareList.find(r => r.id === room.id)) {
//         return { compareList: [...state.compareList, room] };
//       }
//       return state;
//     }),
    
//   removeFromCompare: (roomId) =>
//     set((state) => ({
//       compareList: state.compareList.filter(room => room.id !== roomId)
//     })),
    
//   clearCompare: () => set({ compareList: [] }),
  
//   isInCompare: (roomId) => 
//     get().compareList.some(room => room.id === roomId),
// }));


import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCompareStore } from '../../stores/CompareStore';
import { useNavigation } from '@react-navigation/native';

export default function CompareFloatingButton() {
  const { items, clearItems } = useCompareStore();
  const navigation = useNavigation();

  if (items.length === 0) return null;

  const handleCompare = () => {
    if (items.length === 2) {
      navigation.navigate('CompareRooms' as never);
    }
  };

  const handleClear = () => {
    clearItems();
  };

  return (
    <View style={styles.container}>
      <View style={styles.floatingButton}>
        <View style={styles.content}>
          <Pressable onPress={handleClear} style={styles.closeButton}>
            <Ionicons name="close" size={16} color="white" />
          </Pressable>
          
          <Text style={styles.title}>So sánh phòng</Text>
          <Text style={styles.subtitle}>
            {items.length}/2 phòng được chọn
          </Text>
          
          <View style={styles.roomList}>
            {items.map((item, index) => (
              <View key={item.room.id} style={styles.roomItem}>
                <Text style={styles.roomText} numberOfLines={1}>
                  {item.room.title}
                </Text>
              </View>
            ))}
          </View>
          
          <Pressable 
            onPress={handleCompare}
            style={[
              styles.compareButton, 
              items.length < 2 && styles.compareButtonDisabled
            ]}
            disabled={items.length < 2}
          >
            <Text style={[
              styles.compareButtonText,
              items.length < 2 && styles.compareButtonTextDisabled
            ]}>
              {items.length < 2 ? 'Chọn thêm phòng' : 'So sánh ngay'}
            </Text>
            <Ionicons 
              name="arrow-forward" 
              size={16} 
              color={items.length < 2 ? '#666' : '#007AFF'} 
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 16,
    left: 16,
alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  floatingButton: {
    borderRadius: 16,
    padding: 16,
    // minWidth: 200,
    // maxWidth: 280,
    width: 260,
    backgroundColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 12,
  },
  roomList: {
    width: '100%',
    marginBottom: 12,
  },
  roomItem: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 4,
  },
  roomText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  compareButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  compareButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  compareButtonTextDisabled: {
    color: '#666',
  },
});