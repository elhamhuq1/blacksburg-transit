/**
 * Route Detail Screen
 * Shows list of stops for a specific route
 */

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useRoutes } from '../../lib/hooks/useRoutes';
import { useRouteStops } from '../../lib/hooks/useRouteStops';
import { useFavoritesStore } from '../../lib/stores/favoritesStore';
import { RouteBadge } from '../../components/RouteBadge';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { FavoriteButton } from '../../components/FavoriteButton';
import { LoadingSkeletonList } from '../../components/LoadingSkeleton';
import type { RouteStop } from '../../types/api';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  // Fetch route info
  const { data: routes } = useRoutes();
  const route = routes?.find((r) => r.id === id);

  // Fetch route stops
  const {
    data: routeStops,
    isLoading,
    isError,
    error,
  } = useRouteStops(id);

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const isRouteFavorite = isFavorite(id);

  const handleToggleFavorite = () => {
    if (isRouteFavorite) {
      removeFavorite(id);
    } else {
      addFavorite(id, 'route', route?.longName || `Route ${id}`);
    }
  };

  const handleStopPress = (stopId: string) => {
    router.push(`/stop/${stopId}`);
  };

  const renderStop = ({ item: stop }: { item: RouteStop }) => (
    <Pressable
      onPress={() => handleStopPress(stop.stopId)}
      style={({ pressed }) => [
        styles.stopItem,
        { backgroundColor: colors.backgroundSecondary },
        pressed && { opacity: 0.7 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Stop ${stop.sequence}: ${stop.stopName}`}
      accessibilityHint="Double tap to view stop details"
    >
      <View style={[styles.sequenceBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.sequenceText}>{stop.sequence}</Text>
      </View>
      <View style={styles.stopDetails}>
        <Text style={[styles.stopName, { color: colors.text }]} numberOfLines={2}>
          {stop.stopName}
        </Text>
        {stop.stopCode && (
          <Text style={[styles.stopCode, { color: colors.textSecondary }]}>
            Stop #{stop.stopCode}
          </Text>
        )}
      </View>
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: route?.longName || `Route ${id}`,
          headerShown: true,
          headerRight: () => (
            <FavoriteButton
              isFavorite={isRouteFavorite}
              onToggle={handleToggleFavorite}
            />
          ),
        }}
      />

      {/* Error banner */}
      {isError && (
        <ErrorBanner
          message={
            error instanceof Error
              ? error.message
              : 'Failed to load route stops.'
          }
          type="error"
        />
      )}

      {/* Route header */}
      {route && (
        <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
          <RouteBadge
            shortName={route.shortName}
            color={route.color}
            textColor={route.textColor}
            size="large"
          />
          <View style={styles.headerText}>
            <Text style={[styles.routeName, { color: colors.text }]}>
              {route.longName}
            </Text>
            {route.description && (
              <Text style={[styles.routeDescription, { color: colors.textSecondary }]}>
                {route.description}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Loading state */}
      {isLoading && !routeStops && (
        <LoadingSkeletonList count={10} />
      )}

      {/* Stops list */}
      {!isLoading && routeStops && (
        <FlatList
          data={routeStops.stops}
          renderItem={renderStop}
          keyExtractor={(item) => item.stopId}
          ListEmptyComponent={
            <EmptyState
              icon="🚏"
              title="No stops found"
              subtitle="This route has no stops configured."
            />
          }
          contentContainerStyle={
            routeStops.stops.length === 0 && styles.emptyListContent
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
  },
  routeDescription: {
    fontSize: 14,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    gap: 12,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    // Elevation for Android
    elevation: 1,
  },
  sequenceBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequenceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '500',
  },
  stopCode: {
    fontSize: 12,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
  emptyListContent: {
    flex: 1,
  },
});

