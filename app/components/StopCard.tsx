/**
 * Stop card component
 * Displays stop information in a list (name, distance, routes)
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { RouteBadge } from './RouteBadge';
import { formatDistance } from '../lib/utils/geo';
import { useRouter } from 'expo-router';

interface StopCardProps {
  stopId: string;
  stopName: string;
  distance?: number; // meters
  routes?: Array<{ id: string; shortName: string; color: string }>;
  onPress?: () => void;
}

export function StopCard({
  stopId,
  stopName,
  distance,
  routes = [],
  onPress,
}: StopCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/stop/${stopId}`);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.backgroundSecondary },
        pressed && { opacity: 0.7 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${stopName}${distance ? `, ${formatDistance(distance)} away` : ''}${routes.length > 0 ? `, routes ${routes.map((r) => r.shortName).join(', ')}` : ''}`}
      accessibilityHint="Double tap to view stop details"
    >
      {/* Stop icon */}
      <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
        <Text style={styles.icon}>🚏</Text>
      </View>

      {/* Stop details */}
      <View style={styles.details}>
        <Text style={[styles.stopName, { color: colors.text }]} numberOfLines={1}>
          {stopName}
        </Text>
        
        {distance !== undefined && (
          <Text style={[styles.distance, { color: colors.textSecondary }]}>
            {formatDistance(distance)}
          </Text>
        )}

        {/* Route badges */}
        {routes.length > 0 && (
          <View style={styles.routesContainer}>
            {routes.slice(0, 4).map((route) => (
              <RouteBadge
                key={route.id}
                shortName={route.shortName}
                color={route.color}
                textColor="#FFFFFF"
                size="small"
              />
            ))}
            {routes.length > 4 && (
              <Text style={[styles.moreText, { color: colors.textSecondary }]}>
                +{routes.length - 4} more
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Chevron */}
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    gap: 12,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  details: {
    flex: 1,
    gap: 4,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
  },
  distance: {
    fontSize: 14,
  },
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  moreText: {
    fontSize: 12,
    alignSelf: 'center',
  },
  chevron: {
    fontSize: 28,
    fontWeight: '300',
  },
});

