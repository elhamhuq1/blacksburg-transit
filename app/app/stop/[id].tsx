/**
 * Stop Detail Screen
 * Shows real-time departures for a specific stop
 */

import { useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useStopDepartures } from '../../lib/hooks/useStopDepartures';
import { useFavoritesStore } from '../../lib/stores/favoritesStore';
import { PredictionRow } from '../../components/PredictionRow';
import { EmptyState } from '../../components/EmptyState';
import { ErrorBanner } from '../../components/ErrorBanner';
import { FavoriteButton } from '../../components/FavoriteButton';
import { LoadingSkeletonList } from '../../components/LoadingSkeleton';
import { smoothPredictions } from '../../lib/utils/smoothing';
import type { Prediction } from '../../types/api';

export default function StopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    data: stopData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useStopDepartures(id);

  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const isStopFavorite = isFavorite(id);

  // Smooth and sort predictions
  const smoothedPredictions = stopData?.predictions
    ? smoothPredictions(stopData.predictions, { maxMinutes: 60, dedupe: true })
    : [];

  const handleToggleFavorite = () => {
    if (isStopFavorite) {
      removeFavorite(id);
    } else {
      addFavorite(id, 'stop', stopData?.stopName || `Stop ${id}`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: stopData?.stopName || `Stop ${id}`,
          headerShown: true,
          headerRight: () => (
            <FavoriteButton
              isFavorite={isStopFavorite}
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
              : 'Failed to load departures. Pull to refresh.'
          }
          type="error"
        />
      )}

      {/* Stop header */}
      {stopData && (
        <View style={[styles.header, { backgroundColor: colors.backgroundSecondary }]}>
          <Text style={[styles.stopId, { color: colors.textSecondary }]}>
            Stop #{id}
          </Text>
          {stopData.lastUpdated && (
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
              Updated {new Date(stopData.lastUpdated).toLocaleTimeString()}
            </Text>
          )}
        </View>
      )}

      {/* Loading state */}
      {isLoading && !stopData && (
        <LoadingSkeletonList count={5} />
      )}

      {/* Departures list */}
      {!isLoading && stopData && (
        <FlatList
          data={smoothedPredictions}
          renderItem={({ item }) => <PredictionRow prediction={item} />}
          keyExtractor={(item, index) => `${item.routeId}-${item.headsign}-${index}`}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="🚌"
              title="No upcoming departures"
              subtitle="There are no buses scheduled for this stop right now. Pull down to refresh."
            />
          }
          contentContainerStyle={
            smoothedPredictions.length === 0 && styles.emptyListContent
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
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  stopId: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 12,
  },
  emptyListContent: {
    flex: 1,
  },
});

