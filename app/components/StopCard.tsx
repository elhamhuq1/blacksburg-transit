/**
 * Stop card component
 * Displays stop name, distance, and routes for list views
 */

import { View, Text, StyleSheet, Pressable, useColorScheme } from 'react-native';
import { RouteBadge } from './RouteBadge';
import { Colors } from '../constants/Colors';
import { formatDistance } from '../lib/utils/geo';

interface StopCardProps {
  id: string;
  name: string;
  code?: string;
  distance?: number; // in meters
  routes?: string[];
  onPress?: () => void;
}

export function StopCard({ id, name, code, distance, routes, onPress }: StopCardProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Stop ${name}${code ? `, code ${code}` : ''}${distance ? `, ${formatDistance(distance)} away` : ''}`}
    >
      {/* Header: Stop name and distance */}
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text
            style={[styles.name, { color: colors.text }]}
            numberOfLines={1}
            allowFontScaling
          >
            {name}
          </Text>
          {code && (
            <Text
              style={[styles.code, { color: colors.textSecondary }]}
              allowFontScaling
            >
              #{code}
            </Text>
          )}
        </View>

        {distance !== undefined && (
          <Text
            style={[styles.distance, { color: colors.textSecondary }]}
            allowFontScaling
          >
            {formatDistance(distance)}
          </Text>
        )}
      </View>

      {/* Routes badges */}
      {routes && routes.length > 0 && (
        <View style={styles.routesContainer}>
          {routes.slice(0, 5).map((route, index) => (
            <RouteBadge
              key={`${route}-${index}`}
              shortName={route}
              size="small"
            />
          ))}
          {routes.length > 5 && (
            <Text
              style={[styles.moreRoutes, { color: colors.textSecondary }]}
              allowFontScaling
            >
              +{routes.length - 5} more
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  code: {
    fontSize: 13,
  },
  distance: {
    fontSize: 14,
    fontWeight: '500',
  },
  routesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  moreRoutes: {
    fontSize: 12,
    marginLeft: 4,
  },
});
