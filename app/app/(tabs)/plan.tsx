/**
 * Trip Planner Tab Screen
 * Plan trips between two stops with route options
 */

import { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  useColorScheme,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyStops } from '../../lib/api';
import { EmptyState } from '../../components/EmptyState';
import { RouteBadge } from '../../components/RouteBadge';
import { Colors } from '../../constants/Colors';
import { LOCATION } from '../../constants/Config';
import type { TripOption, TripStep, NearbyStop } from '../../types/api';

// Mock trip generator (TODO: Replace with real trip planning API)
function generateTripOptions(from: NearbyStop, to: NearbyStop): TripOption[] {
  const now = new Date();
  
  return [
    {
      id: '1',
      departureTime: new Date(now.getTime() + 5 * 60000).toISOString(),
      arrivalTime: new Date(now.getTime() + 25 * 60000).toISOString(),
      duration: 20,
      walkingDistance: 300, // in meters
      transfers: 0,
      steps: [
        {
          type: 'walk',
          from: from.name,
          to: 'Nearby Stop',
          duration: 5,
          distance: 200,
        },
        {
          type: 'bus',
          from: 'Nearby Stop',
          to: to.name,
          routeId: '1',
          routeName: 'Route 1',
          routeColor: '#E87722',
          duration: 12,
          stops: 4,
        },
        {
          type: 'walk',
          to: to.name,
          duration: 3,
          distance: 100,
        },
      ],
    },
  ];
}

export default function PlanTripScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromLocation, setFromLocation] = useState<NearbyStop | null>(null);
  const [toLocation, setToLocation] = useState<NearbyStop | null>(null);
  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [tripOptions, setTripOptions] = useState<TripOption[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripOption | null>(null);

  // Fetch stops for autocomplete
  const { data: stopsData, isLoading: isLoadingStops } = useQuery({
    queryKey: ['nearbyStops', LOCATION.DEFAULT.LAT, LOCATION.DEFAULT.LON],
    queryFn: () => fetchNearbyStops(LOCATION.DEFAULT.LAT, LOCATION.DEFAULT.LON, 5000),
    staleTime: 5 * 60 * 1000,
  });

  const stops = stopsData?.stops || [];

  // Filter stops based on query
  const filteredFromStops = useMemo(() => {
    if (!fromQuery.trim()) return stops.slice(0, 30);
    const query = fromQuery.toLowerCase();
    return stops.filter(
      (stop) =>
        stop?.name?.toLowerCase().includes(query) ||
        stop?.id?.toLowerCase().includes(query)
    ).slice(0, 30);
  }, [fromQuery, stops]);

  const filteredToStops = useMemo(() => {
    if (!toQuery.trim()) return stops.slice(0, 30);
    const query = toQuery.toLowerCase();
    return stops.filter(
      (stop) =>
        stop?.name?.toLowerCase().includes(query) ||
        stop?.id?.toLowerCase().includes(query)
    ).slice(0, 30);
  }, [toQuery, stops]);

  const handleFromSelect = useCallback((stop: NearbyStop) => {
    setFromLocation(stop);
    setFromQuery(stop.name);
    setShowFromModal(false);
  }, []);

  const handleToSelect = useCallback((stop: NearbyStop) => {
    setToLocation(stop);
    setToQuery(stop.name);
    setShowToModal(false);
  }, []);

  const swapLocations = useCallback(() => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
    setFromQuery(toLocation?.name || '');
    setToQuery(temp?.name || '');
  }, [fromLocation, toLocation]);

  const handlePlanTrip = useCallback(() => {
    if (fromLocation && toLocation) {
      const options = generateTripOptions(fromLocation, toLocation);
      setTripOptions(options);
      setSelectedTrip(null);
    }
  }, [fromLocation, toLocation]);

  const formatTime = useCallback((isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }, []);

  // Detail view for selected trip
  if (selectedTrip) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Pressable
            style={styles.backButton}
            onPress={() => setSelectedTrip(null)}
            accessibilityRole="button"
            accessibilityLabel="Back to options"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
            <Text style={[styles.backText, { color: colors.text }]} allowFontScaling>
              Back
            </Text>
          </Pressable>
          <View style={styles.tripSummary}>
            <Text style={[styles.tripDuration, { color: colors.text }]} allowFontScaling>
              {selectedTrip.duration} min trip
            </Text>
            <Text style={[styles.tripTime, { color: colors.textSecondary }]} allowFontScaling>
              Departs {formatTime(selectedTrip.departureTime)}
            </Text>
          </View>
        </View>

        {/* Trip Steps */}
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.stepsContent}>
          {selectedTrip.steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              {index < selectedTrip.steps.length - 1 && (
                <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
              )}
              <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.stepContent}>
                  <View
                    style={[
                      styles.stepIcon,
                      step.type === 'walk' && { backgroundColor: colors.textSecondary + '20' },
                      step.type === 'bus' && { backgroundColor: step.routeColor },
                      step.type === 'transfer' && { backgroundColor: colors.accent + '20' },
                    ]}
                  >
                    {step.type === 'walk' && <Ionicons name="walk" size={20} color={colors.textSecondary} />}
                    {step.type === 'bus' && <Ionicons name="bus" size={20} color="#FFFFFF" />}
                    {step.type === 'transfer' && <Ionicons name="swap-horizontal" size={20} color={colors.accent} />}
                  </View>
                  <View style={styles.stepDetails}>
                    {step.type === 'walk' && (
                      <>
                        <Text style={[styles.stepTitle, { color: colors.text }]} allowFontScaling>
                          Walk {step.duration} min
                        </Text>
                        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]} allowFontScaling>
                          {step.from && `From ${step.from} `}
                          {step.to && `to ${step.to}`}
                        </Text>
                        {step.distance && (
                          <Text style={[styles.stepInfo, { color: colors.textSecondary }]} allowFontScaling>
                            {(step.distance / 1609).toFixed(2)} mi
                          </Text>
                        )}
                      </>
                    )}
                    {step.type === 'bus' && (
                      <>
                        <Text style={[styles.stepTitle, { color: colors.text }]} allowFontScaling>
                          {step.routeName}
                        </Text>
                        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]} allowFontScaling>
                          {step.from} → {step.to}
                        </Text>
                        <View style={styles.stepBadges}>
                          <View style={[styles.stepBadge, { backgroundColor: colors.background }]}>
                            <Text style={[styles.stepBadgeText, { color: colors.text }]} allowFontScaling>
                              {step.duration} min
                            </Text>
                          </View>
                          <View style={[styles.stepBadge, { backgroundColor: colors.background }]}>
                            <Text style={[styles.stepBadgeText, { color: colors.text }]} allowFontScaling>
                              {step.stops} stops
                            </Text>
                          </View>
                        </View>
                      </>
                    )}
                    {step.type === 'transfer' && (
                      <>
                        <Text style={[styles.stepTitle, { color: colors.text }]} allowFontScaling>
                          Transfer
                        </Text>
                        <Text style={[styles.stepSubtitle, { color: colors.textSecondary }]} allowFontScaling>
                          Wait {step.duration} min
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Plan Your Trip</Text>

        {/* From Input */}
        <Pressable
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowFromModal(true)}
        >
          <Ionicons name="navigate" size={20} color={colors.primary} />
          <Text
            style={[styles.inputText, fromLocation ? { color: colors.text } : { color: colors.textSecondary }]}
            numberOfLines={1}
            allowFontScaling
          >
            {fromLocation ? fromLocation.name : 'From (current location)'}
          </Text>
        </Pressable>

        {/* Swap Button */}
        <View style={styles.swapContainer}>
          <Pressable
            style={[styles.swapButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={swapLocations}
            accessibilityRole="button"
            accessibilityLabel="Swap locations"
          >
            <Ionicons name="swap-vertical" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* To Input */}
        <Pressable
          style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={() => setShowToModal(true)}
        >
          <Ionicons name="location" size={20} color={colors.accent} />
          <Text
            style={[styles.inputText, toLocation ? { color: colors.text } : { color: colors.textSecondary }]}
            numberOfLines={1}
            allowFontScaling
          >
            {toLocation ? toLocation.name : 'To (destination)'}
          </Text>
        </Pressable>

        {/* Plan Trip Button */}
        <Pressable
          style={[
            styles.planButton,
            {
              backgroundColor: fromLocation && toLocation ? colors.primary : colors.border,
            },
          ]}
          onPress={handlePlanTrip}
          disabled={!fromLocation || !toLocation}
          accessibilityRole="button"
          accessibilityLabel="Find routes"
        >
          <Ionicons name="search" size={20} color={colors.background} />
          <Text style={[styles.planButtonText, { color: colors.background }]} allowFontScaling>
            Find Routes
          </Text>
        </Pressable>
      </View>

      {/* Trip Options */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.optionsContent}>
        {tripOptions.length === 0 ? (
          <EmptyState
            icon="🧭"
            title="Plan your trip"
            subtitle="Enter your starting point and destination to see available routes"
          />
        ) : (
          tripOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.optionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setSelectedTrip(option)}
              accessibilityRole="button"
              accessibilityLabel={`Trip option: ${option.duration} minutes`}
              android_ripple={{ color: colors.primary + '20' }}
            >
              <View style={styles.optionHeader}>
                <View style={styles.optionDuration}>
                  <Ionicons name="time-outline" size={16} color={colors.text} />
                  <Text style={[styles.optionDurationText, { color: colors.text }]} allowFontScaling>
                    {option.duration} min
                  </Text>
                </View>
                <View style={[styles.transfersBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.transfersBadgeText, { color: colors.background }]} allowFontScaling>
                    {option.transfers === 0 ? 'Direct' : `${option.transfers} transfer${option.transfers > 1 ? 's' : ''}`}
                  </Text>
                </View>
              </View>
              <View style={styles.optionTimes}>
                <Text style={[styles.optionTime, { color: colors.textSecondary }]} allowFontScaling>
                  {formatTime(option.departureTime)}
                </Text>
                <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} />
                <Text style={[styles.optionTime, { color: colors.textSecondary }]} allowFontScaling>
                  {formatTime(option.arrivalTime)}
                </Text>
              </View>
              <View style={styles.optionWalking}>
                <Ionicons name="walk" size={14} color={colors.textSecondary} />
                <Text style={[styles.optionWalkingText, { color: colors.textSecondary }]} allowFontScaling>
                  {(option.walkingDistance / 1609).toFixed(2)} mi walking
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      {/* From Location Modal */}
      <Modal
        visible={showFromModal}
        animationType="slide"
        onRequestClose={() => setShowFromModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Pressable 
              onPress={() => setShowFromModal(false)} 
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]} allowFontScaling>
              Select Starting Location
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search stops..."
              placeholderTextColor={colors.textSecondary}
              value={fromQuery}
              onChangeText={setFromQuery}
              autoFocus
              allowFontScaling
            />
          </View>
          <ScrollView style={styles.modalList}>
            {filteredFromStops.map((stop) => (
              <Pressable
                key={stop.id}
                style={[styles.stopItem, { borderBottomColor: colors.border }]}
                onPress={() => handleFromSelect(stop)}
                accessibilityRole="button"
              >
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopName, { color: colors.text }]} allowFontScaling>
                    {stop.name}
                  </Text>
                  <Text style={[styles.stopCode, { color: colors.textSecondary }]} allowFontScaling>
                    Stop #{stop.id}
                  </Text>
                </View>
              </Pressable>
            ))}
            {filteredFromStops.length === 0 && !isLoadingStops && (
              <View style={styles.emptyList}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]} allowFontScaling>
                  {fromQuery.trim() ? 'No stops found' : 'Loading stops...'}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* To Location Modal */}
      <Modal
        visible={showToModal}
        animationType="slide"
        onRequestClose={() => setShowToModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Pressable 
              onPress={() => setShowToModal(false)} 
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={colors.text} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.text }]} allowFontScaling>
              Select Destination
            </Text>
            <View style={{ width: 28 }} />
          </View>
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search stops..."
              placeholderTextColor={colors.textSecondary}
              value={toQuery}
              onChangeText={setToQuery}
              autoFocus
              allowFontScaling
            />
          </View>
          <ScrollView style={styles.modalList}>
            {filteredToStops.map((stop) => (
              <Pressable
                key={stop.id}
                style={[styles.stopItem, { borderBottomColor: colors.border }]}
                onPress={() => handleToSelect(stop)}
                accessibilityRole="button"
              >
                <Ionicons name="location-outline" size={20} color={colors.accent} />
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopName, { color: colors.text }]} allowFontScaling>
                    {stop.name}
                  </Text>
                  <Text style={[styles.stopCode, { color: colors.textSecondary }]} allowFontScaling>
                    Stop #{stop.id}
                  </Text>
                </View>
              </Pressable>
            ))}
            {filteredToStops.length === 0 && !isLoadingStops && (
              <View style={styles.emptyList}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]} allowFontScaling>
                  {toQuery.trim() ? 'No stops found' : 'Loading stops...'}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backText: {
    fontSize: 17,
  },
  tripSummary: {
    marginBottom: 12,
  },
  tripDuration: {
    fontSize: 24,
    fontWeight: '700',
  },
  tripTime: {
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  swapContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  swapButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    marginTop: 4,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  optionsContent: {
    padding: 16,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionDurationText: {
    fontSize: 18,
    fontWeight: '600',
  },
  transfersBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  transfersBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  optionTimes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  optionTime: {
    fontSize: 14,
  },
  optionWalking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionWalkingText: {
    fontSize: 14,
  },
  stepsContent: {
    padding: 16,
  },
  stepContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  stepLine: {
    position: 'absolute',
    left: 20,
    top: 48,
    bottom: -16,
    width: 2,
  },
  stepCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  stepContent: {
    flexDirection: 'row',
    gap: 12,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDetails: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  stepInfo: {
    fontSize: 13,
  },
  stepBadges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  stepBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    margin: 16,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  modalList: {
    flex: 1,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  stopCode: {
    fontSize: 13,
  },
  emptyList: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});
