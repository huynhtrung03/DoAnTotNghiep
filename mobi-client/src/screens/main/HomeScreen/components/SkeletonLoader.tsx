import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  type?: 'card' | 'horizontal-card' | 'carousel';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'card', count = 3 }) => {
  const opacity = useSharedValue(0.3);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (type === 'carousel') {
    return (
      <View style={styles.carouselContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <Animated.View key={index} style={[styles.carouselCard, animatedStyle]}>
            <View style={styles.carouselImage} />
            <View style={styles.carouselInfo}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: '60%' }]} />
            </View>
          </Animated.View>
        ))}
      </View>
    );
  }

  if (type === 'horizontal-card') {
    return (
      <View style={styles.listContainer}>
        {Array.from({ length: count }).map((_, index) => (
          <Animated.View key={index} style={[styles.horizontalCard, animatedStyle]}>
            <View style={styles.horizontalImage} />
            <View style={styles.horizontalInfo}>
              <View style={styles.skeletonLine} />
              <View style={[styles.skeletonLine, { width: '40%', marginTop: 8 }]} />
              <View style={[styles.skeletonLine, { width: '70%', marginTop: 8 }]} />
            </View>
          </Animated.View>
        ))}
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  carouselContainer: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 4,
    gap: 16,
    marginBottom: 24,
  },

  carouselCard: {
    width: width * 0.75,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },

  carouselImage: {
    width: '100%',
    height: '70%',
    backgroundColor: '#D1D5DB',
  },

  carouselInfo: {
    padding: 16,
  },

  listContainer: {
    paddingHorizontal: 20,
  },

  horizontalCard: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    height: 120,
  },

  horizontalImage: {
    width: 120,
    height: 120,
    backgroundColor: '#D1D5DB',
  },

  horizontalInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },

  skeletonLine: {
    height: 12,
    backgroundColor: '#D1D5DB',
    borderRadius: 6,
    width: '100%',
  },
});

export default SkeletonLoader;
