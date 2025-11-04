/**
 * Route Detail Screen
 * Shows route information and list of stops
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { fetchRouteStops } from '../../lib/api';
import { useFavoritesStore } from '../../lib/stores/favoritesStore';
import { RouteBadge } from '../../components/RouteBadge';
import { StopCard } from '../../components/StopCard';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/Colors';

export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [selectedDirection, setSelectedDirection] = useState<string>('0');

  // Fetch route stops
  const {
    data: routeData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['routeStops', id],
    queryFn: () => fetchRouteStops(id || ''),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Favorites
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id || ''));
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const handleToggleFavorite = useCallback(() => {
    if (!id || !routeData) return;

    if (isFavorite) {
      removeFavorite(id);
    } else {
      addFavorite(id, 'route', routeData.route.longName || routeData.route.shortName);
    }
  }, [id, isFavorite, routeData, addFavorite, removeFavorite]);

  const handleStopPress = useCallback((stopId: string) => {
    router.push(`/stop/${stopId}`);
  }, []);

  // Get stops for selected direction
  const currentStops = routeData?.directions?.find(
    (dir) => dir.directionId === selectedDirection
  )?.stops || [];

  const routeInfo = routeData?.route;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: routeInfo?.shortName || `Route ${id}`,
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerRight: () => (
            <Pressable
              onPress={handleToggleFavorite}
              style={styles.favoriteButton}
              accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              accessibilityRole="button"
            >
              <Text style={styles.favoriteIcon}>{isFavorite ? '★' : '☆'}</Text>
            </Pressable>
          ),
        }}
      />

      {/* Loading state */}
      {isLoading && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Error state */}
      {isError && (
        <EmptyState
          icon="⚠️"
          title="Unable to load route"
          subtitle={error?.message || 'Please try again later'}
        />
      )}

      {/* Route content */}
      {!isLoading && !isError && routeData && (
        <ScrollView style={styles.scrollView}>
          {/* Route header */}
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <View style={styles.routeInfo}>
              <RouteBadge
                shortName={routeInfo?.shortName || id || ''}
                color={routeInfo?.color}
                textColor={routeInfo?.textColor}
                size="large"
              />
              <View style={styles.routeText}>
                <Text style={[styles.routeName, { color: colors.text }]} allowFontScaling>
                  {routeInfo?.longName || routeInfo?.shortName || `Route ${id}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Direction switcher */}
          {routeData?.directions && routeData.directions.length > 1 && (
            <View style={[styles.directionSwitcher, { backgroundColor: colors.surface }]}>
              {routeData.directions.map((dir) => (
                <Pressable
                  key={dir.directionId}
                  style={[
                    styles.directionButton,
                    {
                      backgroundColor:
                        selectedDirection === dir.directionId ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedDirection(dir.directionId)}
                  accessibilityRole="button"
                  accessibilityLabel={`Show ${dir.name} stops`}
                  accessibilityState={{ selected: selectedDirection === dir.directionId }}
                >
                  <Text
                    style={[
                      styles.directionText,
                      {
                        color:
                          selectedDirection === dir.directionId
                            ? colors.background
                            : colors.text,
                      },
                    ]}
                    allowFontScaling
                  >
                    {dir.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Stops list */}
          <View style={styles.stopsContainer}>
            <Text
              style={[styles.sectionTitle, { color: colors.text }]}
              accessibilityRole="header"
              allowFontScaling
            >
              Stops ({currentStops.length})
            </Text>
            {currentStops.map((stop, index) => (
              <StopCard
                key={`${stop.id}-${index}`}
                id={stop.id}
                name={stop.name}
                code={stop.code}
                onPress={() => handleStopPress(stop.id)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeText: {
    flex: 1,
  },
  routeName: {
    fontSize: 20,
    fontWeight: '700',
  },
  favoriteButton: {
    padding: 8,
    marginRight: 8,
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#FFA500',
  },
  directionSwitcher: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  directionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  directionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopsContainer: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
});
