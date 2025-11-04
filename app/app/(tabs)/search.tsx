/**
 * Search Tab Screen
 * Allows users to search for stops and routes
 */

import { useState, useMemo } from 'react';
import {
  FlatList,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useRoutes } from '../../lib/hooks/useRoutes';
import { StopCard } from '../../components/StopCard';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSkeletonList } from '../../components/LoadingSkeleton';
import { RouteBadge } from '../../components/RouteBadge';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Import React for useEffect
import React from 'react';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const { data: routes, isLoading } = useRoutes();

  // Fuzzy search logic
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim() || !routes) {
      return { routes: [], stops: [] };
    }

    const query = debouncedQuery.toLowerCase();

    // Search routes
    const filteredRoutes = routes.filter(
      (route) =>
        route.shortName.toLowerCase().includes(query) ||
        route.longName.toLowerCase().includes(query) ||
        route.description?.toLowerCase().includes(query)
    );

    // For MVP, we don't have a stops database yet
    // This will be populated when we add the nearby stops API
    const filteredStops: any[] = [];

    return { routes: filteredRoutes, stops: filteredStops };
  }, [debouncedQuery, routes]);

  const handleRoutePress = (routeId: string) => {
    router.push(`/route/${routeId}`);
  };

  const sections = useMemo(() => {
    const result = [];
    
    if (searchResults.routes.length > 0) {
      result.push({
        title: 'Routes',
        data: searchResults.routes,
        type: 'routes' as const,
      });
    }
    
    if (searchResults.stops.length > 0) {
      result.push({
        title: 'Stops',
        data: searchResults.stops,
        type: 'stops' as const,
      });
    }
    
    return result;
  }, [searchResults]);

  const renderRouteItem = (route: any) => (
    <Pressable
      onPress={() => handleRoutePress(route.id)}
      style={({ pressed }) => [
        styles.routeItem,
        { backgroundColor: colors.backgroundSecondary },
        pressed && { opacity: 0.7 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Route ${route.shortName}: ${route.longName}`}
      accessibilityHint="Double tap to view route details"
    >
      <RouteBadge
        shortName={route.shortName}
        color={route.color}
        textColor={route.textColor}
        size="medium"
      />
      <View style={styles.routeDetails}>
        <Text style={[styles.routeName, { color: colors.text }]} numberOfLines={1}>
          {route.longName}
        </Text>
        {route.description && (
          <Text style={[styles.routeDescription, { color: colors.textSecondary }]} numberOfLines={1}>
            {route.description}
          </Text>
        )}
      </View>
      <Text style={[styles.chevron, { color: colors.textSecondary }]}>›</Text>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search header */}
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search</Text>
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
          placeholder="Search routes or stops..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessible
          accessibilityLabel="Search input"
          accessibilityHint="Type to search for routes or stops"
        />
      </View>

      {/* Results */}
      {isLoading && <LoadingSkeletonList count={5} />}

      {!isLoading && !searchQuery.trim() && (
        <EmptyState
          icon="🔍"
          title="Search for routes or stops"
          subtitle="Enter a route name, number, or stop name to get started."
        />
      )}

      {!isLoading && searchQuery.trim() && sections.length === 0 && (
        <EmptyState
          icon="❌"
          title="No results found"
          subtitle={`No routes or stops match "${searchQuery}"`}
        />
      )}

      {!isLoading && sections.length > 0 && (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={({ item, section }) => {
            if (section.type === 'routes') {
              return renderRouteItem(item);
            }
            // Stops will be handled later
            return null;
          }}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {section.title}
              </Text>
            </View>
          )}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    padding: 16,
    paddingTop: 60, // Account for status bar
    gap: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  searchInput: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sectionHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  routeItem: {
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
  routeDetails: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '500',
  },
  routeDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  chevron: {
    fontSize: 24,
    fontWeight: '300',
  },
});

