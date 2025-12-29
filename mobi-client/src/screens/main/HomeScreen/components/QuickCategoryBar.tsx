import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface QuickCategoryBarProps {
  categories: Category[];
  selectedId?: string;
  onCategoryPress: (id: string) => void;
}

const QuickCategoryBar: React.FC<QuickCategoryBarProps> = ({
  categories,
  selectedId,
  onCategoryPress,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((category) => {
          const isSelected = category.id === selectedId;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.chip,
                isSelected && styles.chipSelected,
              ]}
              onPress={() => onCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={category.icon}
                size={16}
                color={isSelected ? '#FFFFFF' : '#6B7280'}
              />
              <Text
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },

  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  chipSelected: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },

  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },

  chipTextSelected: {
    color: '#FFFFFF',
  },
});

export default QuickCategoryBar;
