import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FloatingSearchBarProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onFocus?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

const FloatingSearchBar: React.FC<FloatingSearchBarProps & { 
  onSubmit?: () => void;
  suggestions?: any[];
  onSuggestionPress?: (item: any) => void;
}> = ({
  value,
  onChangeText,
  onFocus,
  onFilterPress,
  onSubmit,
  suggestions = [],
  onSuggestionPress,
  placeholder = 'Tìm phòng trọ, khu vực...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
        />

        <TouchableOpacity 
          style={styles.filterButton}
          onPress={onFilterPress}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={20} color="#667EEA" />
        </TouchableOpacity>
      </View>

      {/* Suggestions Dropdown */}
      {value && value.length > 0 && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.suggestionItem}
              onPress={() => onSuggestionPress && onSuggestionPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.suggestionIconContainer}>
                <Ionicons name="home-outline" size={16} color="#667EEA" />
              </View>
              <View style={styles.suggestionContent}>
                <Text style={styles.suggestionTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.suggestionAddress} numberOfLines={1}>
                  {item.address?.street}, {item.address?.ward?.name}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginTop: -24, // Overlap with header
    marginBottom: 16,
    zIndex: 50, // Above content, below floating buttons
    elevation: 50, // For Android
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },

  searchIcon: {
    marginRight: 12,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },

  filterButton: {
    marginLeft: 8,
    padding: 4,
  },

  // Dropdown styles
  suggestionsContainer: {
    position: 'absolute',
    top: 70, // Height of search bar + margin
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    // Shadow for popup
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  
  suggestionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  suggestionContent: {
    flex: 1,
  },
  
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  
  suggestionAddress: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default FloatingSearchBar;
