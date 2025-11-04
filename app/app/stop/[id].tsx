/**
 * Stop Detail Screen
 * Shows real-time departures for a specific stop
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  useColorScheme,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { useStopDepartures } from '../../lib/hooks/useStopDepartures';
import { useFavoritesStore } from '../../lib/stores/favoritesStore';
import { PredictionRow } from '../../components/PredictionRow';
import { PredictionRowSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/Colors';
import { processPredictions } from '../../lib/utils/smoothing';
import { getRelativeTime } from '../../lib/utils/time';

export default function StopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const isFocused = useIsFocused();

  const [previousPredictions, setPreviousPredictions] = useState<any[]>([]);

  // Fetch departures (polls every 10s when focused)
  const {
    data: departuresData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useStopDepartures(id || '', { enabled: isFocused && !!id });

  // Favorites
  const isFavorite = useFavoritesStore((state) => state.isFavorite(id || ''));
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleToggleFavorite = useCallback(() => {
    if (!id || !departuresData) return;

    if (isFavorite) {
      removeFavorite(id);
    } else {
      addFavorite(id, 'stop', departuresData.stopName || `Stop ${id}`);
    }
  }, [id, isFavorite, departuresData, addFavorite, removeFavorite]);

  // Process predictions with smoothing
  const predictions = departuresData?.predictions
    ? processPredictions(departuresData.predictions, previousPredictions)
    : [];

  // Update previous predictions for next render
  if (predictions.length > 0 && predictions !== previousPredictions) {
    setPreviousPredictions(predictions);
  }

  // Stop info
  const stopName = departuresData?.stopName || `Stop ${id}`;
  const lastUpdated = departuresData?.lastUpdated
    ? getRelativeTime(departuresData.lastUpdated)
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: stopName,
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Stop header info */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.stopName, { color: colors.text }]} allowFontScaling>
            {stopName}
          </Text>
          <Text style={[styles.stopId, { color: colors.textSecondary }]} allowFontScaling>
            Stop #{id}
          </Text>
          {lastUpdated && (
            <Text style={[styles.lastUpdated, { color: colors.textSecondary }]} allowFontScaling>
              Updated {lastUpdated}
            </Text>
          )}
        </View>

        {/* Loading state */}
        {isLoading && (
          <View>
            <PredictionRowSkeleton />
            <PredictionRowSkeleton />
            <PredictionRowSkeleton />
          </View>
        )}

        {/* Error state */}
        {isError && (
          <EmptyState
            icon="⚠️"
            title="Unable to load departures"
            subtitle={error?.message || 'Please try again later'}
          />
        )}

        {/* Predictions list */}
        {!isLoading && !isError && predictions.length > 0 && (
          <View style={styles.predictionsContainer}>
            <Text
              style={[styles.sectionTitle, { color: colors.text }]}
              accessibilityRole="header"
              allowFontScaling
            >
              Next Departures
            </Text>
            {predictions.slice(0, 10).map((prediction, index) => (
              <PredictionRow key={`${prediction.routeId}-${prediction.headsign}-${index}`} prediction={prediction} />
            ))}
          </View>
        )}

        {/* Empty state */}
        {!isLoading && !isError && predictions.length === 0 && (
          <EmptyState
            icon="🚌"
            title="No departures"
            subtitle="No buses are scheduled to depart from this stop right now."
          />
        )}
      </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  stopName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  stopId: {
    fontSize: 14,
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 12,
  },
  favoriteButton: {
    padding: 8,
    marginRight: 8,
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#FFA500',
  },
  predictionsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
