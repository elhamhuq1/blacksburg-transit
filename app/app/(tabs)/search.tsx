/**
 * Search Tab Screen
 * Search for stops and routes
 */

import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  useColorScheme,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoutes } from '../../lib/hooks/useRoutes';
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyStops } from '../../lib/api';
import { StopCard } from '../../components/StopCard';
import { RouteBadge } from '../../components/RouteBadge';
import { EmptyState } from '../../components/EmptyState';
import { useFavoritesStore } from '../../lib/stores/favoritesStore';
import { Colors } from '../../constants/Colors';
import { LOCATION } from '../../constants/Config';

export default function SearchScreen() {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all routes
  const { data: routes, isLoading: routesLoading } = useRoutes();

  // Fetch nearby stops (we'll use this as our "all stops" for now)
  const { data: stopsData, isLoading: stopsLoading } = useQuery({
    queryKey: ['nearbyStops', LOCATION.DEFAULT.LAT, LOCATION.DEFAULT.LON],
    queryFn: () =>
      fetchNearbyStops(LOCATION.DEFAULT.LAT, LOCATION.DEFAULT.LON, 5000), // 5km radius to get most stops
    staleTime: 5 * 60 * 1000,
  });

  const stops = stopsData?.stops || [];

  // Fuzzy search logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { routes: [], stops: [] };
    }

    const query = searchQuery.toLowerCase().trim();

    // Search routes
    const matchedRoutes = (routes || []).filter(
      (route) =>
        route?.shortName?.toLowerCase().includes(query) ||
        route?.longName?.toLowerCase().includes(query)
    );

    // Search stops
    const matchedStops = stops.filter(
      (stop) =>
        stop?.name?.toLowerCase().includes(query) ||
        stop?.code?.toLowerCase().includes(query) ||
        stop?.id?.toLowerCase().includes(query)
    );

    return {
      routes: matchedRoutes.slice(0, 10),
      stops: matchedStops.slice(0, 20),
    };
  }, [searchQuery, routes, stops]);

  const handleStopPress = useCallback((stopId: string) => {
    router.push(`/stop/${stopId}`);
  }, []);

  const handleRoutePress = useCallback((routeShortName: string) => {
    router.push(`/route/${routeShortName}`);
  }, []);

  const isLoading = routesLoading || stopsLoading;
  const hasResults = searchResults.routes.length > 0 || searchResults.stops.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
      </View>

      {/* Search input */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search stops or routes..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          accessibilityLabel="Search input"
          accessibilityHint="Enter stop name, code, or route number"
          allowFontScaling
        />
        {searchQuery.length > 0 && (
          <Text
            style={[styles.clearButton, { color: colors.textSecondary }]}
            onPress={() => setSearchQuery('')}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            ✕
          </Text>
        )}
      </View>

      {/* Loading state */}
      {isLoading && searchQuery.trim() && (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Search results */}
      {!isLoading && searchQuery.trim() && (
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          {/* Routes results */}
          {searchResults.routes.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.text }]}
                accessibilityRole="header"
                allowFontScaling
              >
                Routes ({searchResults.routes.length})
              </Text>
              {searchResults.routes.map((route, index) => (
                <View
                  key={route.shortName || `route-${index}`}
                  style={[styles.routeItem, { backgroundColor: colors.surface }]}
                  onTouchEnd={() => handleRoutePress(route.shortName)}
                  accessibilityRole="button"
                  accessibilityLabel={`Route ${route.shortName} ${route.longName}`}
                >
                  <RouteBadge
                    shortName={route.shortName}
                    color={route.color}
                    textColor={route.textColor}
                    size="medium"
                  />
                  <Text
                    style={[styles.routeName, { color: colors.text }]}
                    numberOfLines={1}
                    allowFontScaling
                  >
                    {route.longName}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Stops results */}
          {searchResults.stops.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[styles.sectionTitle, { color: colors.text }]}
                accessibilityRole="header"
                allowFontScaling
              >
                Stops ({searchResults.stops.length})
              </Text>
              {searchResults.stops.map((stop) => (
                <StopCard
                  key={stop.id}
                  id={stop.id}
                  name={stop.name}
                  code={stop.code}
                  distance={stop.distance}
                  routes={stop.routes}
                  onPress={() => handleStopPress(stop.id)}
                />
              ))}
            </View>
          )}

          {/* No results */}
          {!hasResults && (
            <EmptyState
              icon="🔍"
              title="No results found"
              subtitle={`No stops or routes match "${searchQuery}"`}
            />
          )}
        </ScrollView>
      )}

      {/* Empty state (no search) */}
      {!searchQuery.trim() && (
        <EmptyState
          icon="🔍"
          title="Search for stops or routes"
          subtitle="Enter a stop name, code, or route number to get started"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchIcon: {
    fontSize: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  clearButton: {
    fontSize: 20,
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
});
