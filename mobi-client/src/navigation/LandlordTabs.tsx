import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import màn hình cho Landlord
import DashboardScreen from '../screens/landlord/dashboard/DashboardScreen';
import PaymentHistoryScreen from '../screens/landlord/paymenthistory/PaymentHistoryScreen';
import UserScreen from '../screens/user/UserScreen';
import MesengerScreen from '../screens/mesenger/MesengerScreen';
import Colors, { withOpacity } from '../styles/colors';

const Tab = createBottomTabNavigator();

// Placeholder Component
const PlaceholderScreen = ({ title, icon }: { title: string; icon: string }) => {
  return (
    <SafeAreaView style={styles.placeholderContainer} edges={['top']}>
      <View style={styles.placeholderContent}>
        <View style={styles.placeholderIconContainer}>
          <Ionicons name={icon as any} size={64} color={Colors.primary} />
        </View>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderSubtitle}>Chức năng đang phát triển...</Text>
      </View>
    </SafeAreaView>
  );
};

// Các màn hình placeholder
const RoomManagementScreen = () => (
  <PlaceholderScreen title="Quản lý phòng trọ" icon="home" />
);

const ContractManagementScreen = () => (
  <PlaceholderScreen title="Quản lý hợp đồng" icon="document-text" />
);

const FinanceScreen = () => <PaymentHistoryScreen />;

// Get gradient colors for each tab
const getTabGradient = (index: number) => {
  const gradients = [
    Colors.gradients.blue,     // Dashboard
    Colors.gradients.green,    // Rooms
    Colors.gradients.purple,   // Contracts
    Colors.gradients.orange,   // Finance
    Colors.gradients.green,    // Messages
    Colors.gradients.pink,     // Profile
  ];
  return gradients[index] || Colors.gradients.blue;
};

// Tab Icon Component
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

export default function LandlordTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Tổng quan" focused={focused} tabIndex={0} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="grid-outline" 
              focusedName="grid"
              size={size} 
              focused={focused}
              tabIndex={0}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Rooms" 
        component={RoomManagementScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Phòng trọ" focused={focused} tabIndex={1} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="home-outline" 
              focusedName="home"
              size={size} 
              focused={focused}
              tabIndex={1}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Contracts" 
        component={ContractManagementScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Hợp đồng" focused={focused} tabIndex={2} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="document-text-outline" 
              focusedName="document-text"
              size={size} 
              focused={focused}
              tabIndex={2}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Finance" 
        component={FinanceScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Tài chính" focused={focused} tabIndex={3} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="wallet-outline" 
              focusedName="wallet"
              size={size} 
              focused={focused}
              tabIndex={3}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MesengerScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Tin nhắn" focused={focused} tabIndex={4} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="chatbubble-outline" 
              focusedName="chatbubble"
              size={size} 
              focused={focused}
              tabIndex={4}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="LandlordProfile" 
        component={UserScreen}
        options={{
          tabBarLabel: ({ focused }) => (
            <TabLabel label="Cá nhân" focused={focused} tabIndex={5} />
          ),
          tabBarIcon: ({ size, focused }) => (
            <TabIcon 
              name="person-outline" 
              focusedName="person"
              size={size} 
              focused={focused}
              tabIndex={5}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  // Placeholder styles
  placeholderContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: withOpacity(Colors.primary, 0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Tab bar styles
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