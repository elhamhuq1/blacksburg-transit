/**
 * Occupancy Indicator Component
 * Shows bus capacity status with color-coded icon
 */

import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface OccupancyIndicatorProps {
  occupancy: 'available' | 'standing' | 'full';
  showLabel?: boolean;
  colorScheme?: 'light' | 'dark';
}

export function OccupancyIndicator({
  occupancy,
  showLabel = true,
  colorScheme = 'light',
}: OccupancyIndicatorProps) {
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const config = {
    available: {
      color: Colors.light.statusSuccess,
      bgColor: `${Colors.light.statusSuccess}20`, // 20% opacity
      label: 'Seats Available',
      icon: '👥',
    },
    standing: {
      color: Colors.light.statusWarning,
      bgColor: `${Colors.light.statusWarning}20`,
      label: 'Standing Room',
      icon: '🧍',
    },
    full: {
      color: Colors.light.statusError,
      bgColor: `${Colors.light.statusError}20`,
      label: 'Full',
      icon: '🚫',
    },
  };

  const { color, bgColor, label, icon } = config[occupancy];

  return (
    <View
      style={[styles.container, { backgroundColor: bgColor }]}
      accessibilityLabel={`Bus occupancy: ${label}`}
      accessibilityRole="text"
    >
      <Text style={styles.icon}>{icon}</Text>
      {showLabel && (
        <Text style={[styles.label, { color }]} allowFontScaling>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  icon: {
    fontSize: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

