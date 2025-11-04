/**
 * Prediction row component
 * Displays route badge, headsign, and ETA for a single departure
 */

import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { RouteBadge } from './RouteBadge';
import { Colors } from '../constants/Colors';
import { formatETA } from '../lib/utils/time';
import type { Prediction } from '../types/api';

interface PredictionRowProps {
  prediction: Prediction;
}

export function PredictionRow({ prediction }: PredictionRowProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const etaMinutes = Math.floor(prediction.secondsUntilArrival / 60);
  const eta = formatETA(etaMinutes, prediction.secondsUntilArrival);
  const isApproaching = prediction.secondsUntilArrival < 60;
  const isScheduleBased = prediction.scheduleBased;

  // Status indicator color
  const getStatusColor = () => {
    if (isApproaching) return colors.success;
    if (isScheduleBased) return colors.textSecondary;
    return colors.primary;
  };

  // Crowding indicator
  const getCrowdingEmoji = () => {
    switch (prediction.crowding) {
      case 'low':
        return '○';
      case 'medium':
        return '◐';
      case 'high':
        return '●';
      default:
        return null;
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityLabel={`Route ${prediction.routeShortName} to ${prediction.headsign}, arriving in ${eta}${isScheduleBased ? ' (scheduled)' : ''}`}
      accessibilityRole="text"
    >
      {/* Route badge */}
      <RouteBadge
        shortName={prediction.routeShortName}
        size="medium"
      />

      {/* Headsign and direction */}
      <View style={styles.content}>
        <Text
          style={[styles.headsign, { color: colors.text }]}
          numberOfLines={1}
          allowFontScaling
        >
          {prediction.headsign}
        </Text>
        {prediction.direction && (
          <Text
            style={[styles.direction, { color: colors.textSecondary }]}
            numberOfLines={1}
            allowFontScaling
          >
            {prediction.direction}
          </Text>
        )}
      </View>

      {/* ETA and crowding */}
      <View style={styles.etaContainer}>
        <View style={styles.etaRow}>
          {/* Status indicator dot */}
          <View
            style={[styles.statusDot, { backgroundColor: getStatusColor() }]}
            accessibilityLabel={isScheduleBased ? 'Scheduled time' : 'Real-time prediction'}
          />
          
          <Text
            style={[
              styles.eta,
              {
                color: isApproaching ? colors.success : colors.text,
                fontWeight: isApproaching ? '700' : '600',
              },
            ]}
            allowFontScaling
          >
            {eta}
          </Text>
        </View>

        {/* Crowding indicator */}
        {getCrowdingEmoji() && (
          <Text
            style={[styles.crowding, { color: colors.textSecondary }]}
            accessibilityLabel={`Crowding: ${prediction.crowding}`}
          >
            {getCrowdingEmoji()}
          </Text>
        )}
      </View>

      {/* Schedule-based chip */}
      {isScheduleBased && (
        <View style={[styles.scheduleChip, { backgroundColor: colors.surface }]}>
          <Text style={[styles.scheduleText, { color: colors.textSecondary }]} allowFontScaling>
            Schedule
          </Text>
        </View>
      )}
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
    minHeight: 64,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  headsign: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  direction: {
    fontSize: 13,
  },
  etaContainer: {
    alignItems: 'flex-end',
    minWidth: 70,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eta: {
    fontSize: 16,
  },
  crowding: {
    fontSize: 12,
    marginTop: 2,
  },
  scheduleChip: {
    position: 'absolute',
    top: 8,
    right: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scheduleText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
