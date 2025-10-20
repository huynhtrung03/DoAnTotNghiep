import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import UserHomeScreen from '../screens/user/home';
import SearchScreen from '../screens/user/SearchScreen';
import CartScreen from '../screens/user/CartScreen';
import HistoryScreen from '../screens/user/HistoryScreen';
import UserScreen from '../screens/user/UserScreen';

const Tab = createBottomTabNavigator();

// Animated Tab Icon Component
const AnimatedTabIcon = ({ 
  name, 
  focusedName, 
  color, 
  size, 
  focused 
}: { 
  name: string; 
  focusedName: string; 
  color: string; 
  size: number; 
  focused: boolean; 
}) => {
  const scale = useSharedValue(focused ? 1.2 : 1);
  const opacity = useSharedValue(focused ? 1 : 0.7);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.2 : 1, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(focused ? 1 : 0.7, { duration: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons 
        name={focused ? focusedName : name as any} 
        size={size} 
        color={color} 
      />
    </Animated.View>
  );
};

// Animated Tab Label Component
const AnimatedTabLabel = ({ 
  label, 
  color, 
  focused 
}: { 
  label: string; 
  color: string; 
  focused: boolean; 
}) => {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const opacity = useSharedValue(focused ? 1 : 0.8);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.1 : 1, {
      damping: 12,
      stiffness: 100,
    });
    opacity.value = withTiming(focused ? 1 : 0.8, { duration: 200 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.tabLabel, { color }, animatedStyle]}>
      {label}
    </Animated.Text>
  );
};

// Enhanced Tab Bar with Ripple Effect
const EnhancedTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

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
            <Animated.View style={styles.tabContent}>
              {options.tabBarIcon && options.tabBarIcon({
                color: isFocused ? '#3B82F6' : '#6B7280',
                size: 24,
                focused: isFocused,
              })}
              {options.tabBarLabel && options.tabBarLabel({
                color: isFocused ? '#3B82F6' : '#6B7280',
                focused: isFocused,
              })}
            </Animated.View>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function AppTabs() {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: '#fff',
					borderTopWidth: 1,
					borderTopColor: '#E5E7EB',
					paddingBottom: 8,
					paddingTop: 8,
					height: 70,
					elevation: 8,
					shadowColor: '#000',
					shadowOffset: { width: 0, height: -2 },
					shadowOpacity: 0.1,
					shadowRadius: 8,
				},
				tabBarActiveTintColor: '#3B82F6',
				tabBarInactiveTintColor: '#6B7280',
				tabBarItemStyle: {
					paddingVertical: 4,
				},
				tabBarShowLabel: true,
			}}
		>
			<Tab.Screen 
				name="Home" 
				component={UserHomeScreen}
				options={{
					tabBarLabel: ({ color, focused }) => (
						<AnimatedTabLabel label="Home" color={color} focused={focused} />
					),
					tabBarIcon: ({ color, size, focused }) => (
						<AnimatedTabIcon 
							name="home-outline" 
							focusedName="home"
							color={color} 
							size={size} 
							focused={focused} 
						/>
					),
				}}
			/>
			<Tab.Screen 
				name="Search" 
				component={SearchScreen}
				options={{
					tabBarLabel: ({ color, focused }) => (
						<AnimatedTabLabel label="Search" color={color} focused={focused} />
					),
					tabBarIcon: ({ color, size, focused }) => (
						<AnimatedTabIcon 
							name="search-outline" 
							focusedName="search"
							color={color} 
							size={size} 
							focused={focused} 
						/>
					),
				}}
			/>
			<Tab.Screen 
				name="Cart" 
				component={CartScreen}
				options={{
					tabBarLabel: ({ color, focused }) => (
						<AnimatedTabLabel label="Cart" color={color} focused={focused} />
					),
					tabBarIcon: ({ color, size, focused }) => (
						<AnimatedTabIcon 
							name="heart-outline" 
							focusedName="heart"
							color={color} 
							size={size} 
							focused={focused} 
						/>
					),
				}}
			/>
			<Tab.Screen 
				name="History" 
				component={HistoryScreen}
				options={{
					tabBarLabel: ({ color, focused }) => (
						<AnimatedTabLabel label="History" color={color} focused={focused} />
					),
					tabBarIcon: ({ color, size, focused }) => (
						<AnimatedTabIcon 
							name="time-outline" 
							focusedName="time"
							color={color} 
							size={size} 
							focused={focused} 
						/>
					),
				}}
			/>
			<Tab.Screen 
				name="User" 
				component={UserScreen}
				options={{
					tabBarLabel: ({ color, focused }) => (
						<AnimatedTabLabel label="User" color={color} focused={focused} />
					),
					tabBarIcon: ({ color, size, focused }) => (
						<AnimatedTabIcon 
							name="person-outline" 
							focusedName="person"
							color={color} 
							size={size} 
							focused={focused} 
						/>
					),
				}}
			/>
		</Tab.Navigator>
	);
}

const styles = StyleSheet.create({
	tabLabel: {
		fontSize: 12,
		fontWeight: '600',
		marginTop: 4,
	},
	tabBarContainer: {
		flexDirection: 'row',
		backgroundColor: '#fff',
		borderTopWidth: 1,
		borderTopColor: '#E5E7EB',
		paddingBottom: 8,
		paddingTop: 8,
		height: 70,
		elevation: 8,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
	},
	tabButton: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 4,
	},
	tabContent: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});