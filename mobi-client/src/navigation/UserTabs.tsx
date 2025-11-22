import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserHomeScreen from '../screens/main/HomeScreen/home';
import SearchScreen from '../screens/main/SearchScreen/SearchScreen';
import FavoritedScreen from '../screens/favorites/FavoritesScreen/FavoritedScreen';
import MessengerScreen from '../screens/mesenger/MesengerScreen';
import UserStackNavigator from './UserStackNavigator';
import Colors, { withOpacity } from '../styles/colors';
import { useFavoriteStore } from '../stores/FavoriteStore';
import { getAllFavoriteIds } from '../services/favorites/FavoriteService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

// Get gradient colors for each tab
const getTabGradient = (index: number) => {
  const gradients = [
    Colors.gradients.blue,     // Home
    Colors.gradients.purple,   // Search
    Colors.gradients.pink,     // Favorites
    Colors.gradients.orange,   // Messages
    Colors.gradients.green,    // User
  ];
  return gradients[index] || Colors.gradients.blue;
};

// Tab Icon Component with Gradient Background
const TabIcon = ({ 
  name, 
  focusedName, 
  size, 
  focused,
  tabIndex,
}: { 
  name: string; 
  focusedName: string; 
  size: number; 
  focused: boolean;
  tabIndex: number;
}) => {
  const gradient = getTabGradient(tabIndex);

  if (focused) {
    return (
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Ionicons 
            name={focusedName as any} 
            size={size} 
            color={Colors.textWhite} 
          />
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.iconContainerInactive}>
      <Ionicons 
        name={name as any} 
        size={size - 2} 
        color={Colors.textSecondary} 
      />
    </View>
  );
};

// Tab Label Component
const TabLabel = ({ 
  label, 
  focused,
  tabIndex,
}: { 
  label: string; 
  focused: boolean;
  tabIndex: number;
}) => {
  if (!focused) return null;

  const gradient = getTabGradient(tabIndex);

  return (
    <Text style={[styles.tabLabel, { color: gradient[0] }]}>
      {label}
    </Text>
  );
};

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBarContainer}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={styles.tabContent}>
                {options.tabBarIcon && options.tabBarIcon({
                  size: 26,
                  focused: isFocused,
                  tabIndex: index,
                })}
                {options.tabBarLabel && options.tabBarLabel({
                  focused: isFocused,
                  tabIndex: index,
                })}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default function UserTabs() {
  const { setFavoriteRoomIds, setLoading, isInitialized } = useFavoriteStore();

  // Load favorites khi app khởi động
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        // Kiểm tra đăng nhập
        const token = await AsyncStorage.getItem('accessToken');
        if (!token) {
          console.log('⚠️ User not logged in, skipping favorites load');
          setFavoriteRoomIds([]);
          return;
        }

        // Chỉ load nếu chưa khởi tạo
        if (!isInitialized) {
          // console.log('🔄 Loading all favorite IDs...');
          setLoading(true);
          const favoriteIds = await getAllFavoriteIds();
          // console.log(`✅ Loaded ${favoriteIds.length} favorites into store`);
          setFavoriteRoomIds(favoriteIds);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error loading favorites in UserTabs:', error);
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={UserHomeScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Trang chủ" focused={focused} tabIndex={0} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="home-outline" 
              focusedName="home"
              size={size} 
              focused={focused}
              tabIndex={0}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Tìm kiếm" focused={focused} tabIndex={1} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="search-outline" 
              focusedName="search"
              size={size} 
              focused={focused}
              tabIndex={1}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritedScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Yêu thích" focused={focused} tabIndex={2} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="heart-outline" 
              focusedName="heart"
              size={size} 
              focused={focused}
              tabIndex={2}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessengerScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Tin nhắn" focused={focused} tabIndex={3} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="chatbubble-outline" 
              focusedName="chatbubble"
              size={size} 
              focused={focused}
              tabIndex={3}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="User" 
        component={UserStackNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Cá nhân" focused={focused} tabIndex={4} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="person-outline" 
              focusedName="person"
              size={size} 
              focused={focused}
              tabIndex={4}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundLight,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 12,
    paddingHorizontal: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 20,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderTopWidth: 1,
    borderTopColor: withOpacity(Colors.border, 0.5),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 60,
  },
  iconContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerInactive: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withOpacity(Colors.backgroundDark, 0.5),
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});