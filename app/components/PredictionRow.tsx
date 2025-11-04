/**
 * Prediction row component
 * Displays a single departure prediction with route badge, headsign, and ETA
 */

import { StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';
import { RouteBadge } from './RouteBadge';
import { getETADisplayText } from '../lib/utils/smoothing';
import type { Prediction } from '../types/api';

interface PredictionRowProps {
  prediction: Prediction;
}

export function PredictionRow({ prediction }: PredictionRowProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const etaText = getETADisplayText(prediction.minutesUntilDeparture);
  const isApproaching = prediction.minutesUntilDeparture < 1;

  // Crowding indicator
  const crowdingEmoji = {
    low: '🟢',
    medium: '🟡',
    high: '🔴',
  };

  return (
    <View
      style={styles.container}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Route ${prediction.routeShortName} to ${prediction.headsign}, departing in ${etaText}${prediction.scheduleBased ? ', scheduled time' : ''}${prediction.crowding ? `, ${prediction.crowding} crowding` : ''}`}
    >
      {/* Route Badge */}
      <RouteBadge
        shortName={prediction.routeShortName}
        color={prediction.routeColor || '#666666'}
        textColor="#FFFFFF"
        size="medium"
      />

      {/* Headsign and details */}
      <View style={styles.details}>
        <Text
          style={[styles.headsign, { color: colors.text }]}
          numberOfLines={1}
        >
          {prediction.headsign}
        </Text>
        <View style={styles.metaRow}>
          {prediction.scheduleBased && (
            <View style={[styles.chip, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                📅 Schedule
              </Text>
            </View>
          )}
          {prediction.crowding && (
            <View style={[styles.chip, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.chipText, { color: colors.textSecondary }]}>
                {crowdingEmoji[prediction.crowding]} {prediction.crowding}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ETA */}
      <View
        style={[
          styles.etaBadge,
          isApproaching && { backgroundColor: colors.accent },
        ]}
      >
        <Text
          style={[
            styles.etaText,
            { color: isApproaching ? '#FFFFFF' : colors.text },
            isApproaching && styles.etaTextBold,
          ]}
        >
          {etaText}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  details: {
    flex: 1,
    gap: 4,
  },
  headsign: {
    fontSize: 16,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 12,
  },
  etaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  etaText: {
    fontSize: 16,
    fontWeight: '600',
  },
  etaTextBold: {
    fontWeight: '700',
  },
});

