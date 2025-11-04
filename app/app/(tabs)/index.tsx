/**
 * Near Me Tab Screen
 * Shows nearby stops based on user's location
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useNearbyStops } from '../../lib/hooks/useNearbyStops';
import { StopCard } from '../../components/StopCard';
import { StopCardSkeleton } from '../../components/LoadingSkeleton';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/Colors';

export default function NearMeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Fetch nearby stops (hook handles location automatically)
  const {
    data: stopsData,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useNearbyStops();

  const requestLocationPermission = useCallback(async () => {
    setIsRequestingPermission(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted');
      if (status === 'granted') {
        refetch();
      }
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setLocationPermission(false);
    } finally {
      setIsRequestingPermission(false);
    }
  }, [refetch]);

  const handleStopPress = useCallback((stopId: string) => {
    router.push(`/stop/${stopId}`);
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const stops = stopsData?.stops || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Near Me</Text>
      </View>

      {/* Permission prompt */}
      {locationPermission === false && (
        <View style={styles.centerContent}>
          <EmptyState
            icon="📍"
            title="Location Permission Required"
            subtitle="Grant location access to see nearby stops"
            action={
              <Pressable
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={requestLocationPermission}
                disabled={isRequestingPermission}
                accessibilityRole="button"
                accessibilityLabel="Grant location permission"
              >
                {isRequestingPermission ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.buttonText, { color: colors.background }]} allowFontScaling>
                    Grant Permission
                  </Text>
                )}
              </Pressable>
            }
          />
        </View>
      )}

      {/* Loading state */}
      {isLoading && locationPermission !== false && (
        <ScrollView style={styles.scrollView}>
          <StopCardSkeleton />
          <StopCardSkeleton />
          <StopCardSkeleton />
        </ScrollView>
      )}

      {/* Error state */}
      {isError && locationPermission !== false && (
        <EmptyState
          icon="⚠️"
          title="Unable to load nearby stops"
          subtitle={error?.message || 'Please try again later'}
        />
      )}

      {/* Stops list */}
      {!isLoading && !isError && locationPermission !== false && (
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
          {stops.length > 0 ? (
            <>
              <Text
                style={[styles.sectionTitle, { color: colors.text }]}
                accessibilityRole="header"
                allowFontScaling
              >
                Nearby Stops ({stops.length})
              </Text>
              {stops.map((stop) => (
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
            </>
          ) : (
            <EmptyState
              icon="🚌"
              title="No nearby stops"
              subtitle="There are no bus stops within 800m of your location"
            />
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
