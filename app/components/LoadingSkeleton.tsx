/**
 * Loading skeleton component
 * Animated placeholder for loading states
 */

import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function LoadingSkeleton({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}: LoadingSkeletonProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
      accessibilityLabel="Loading"
      accessible
    />
  );
}

/**
 * Preset skeleton for a prediction row
 */
export function PredictionRowSkeleton() {
  return (
    <View style={styles.predictionRow} accessible={false}>
      <LoadingSkeleton width={40} height={24} borderRadius={6} />
      <View style={styles.predictionContent}>
        <LoadingSkeleton width="60%" height={16} />
        <LoadingSkeleton width="40%" height={14} style={{ marginTop: 6 }} />
      </View>
      <LoadingSkeleton width={50} height={16} />
    </View>
  );
}

/**
 * Preset skeleton for a stop card
 */
export function StopCardSkeleton() {
  return (
    <View style={styles.stopCard} accessible={false}>
      <View style={styles.stopCardHeader}>
        <LoadingSkeleton width="70%" height={18} />
        <LoadingSkeleton width={60} height={14} />
      </View>
      <View style={styles.stopCardFooter}>
        <LoadingSkeleton width={40} height={20} borderRadius={6} />
        <LoadingSkeleton width={40} height={20} borderRadius={6} style={{ marginLeft: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  predictionContent: {
    flex: 1,
  },
  stopCard: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  stopCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stopCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
