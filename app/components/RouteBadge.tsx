/**
 * Route badge pill component
 * Displays route number with color-coded background
 */

import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

interface RouteBadgeProps {
  shortName: string;
  color: string;
  textColor: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export function RouteBadge({
  shortName,
  color,
  textColor,
  size = 'medium',
  style,
}: RouteBadgeProps) {
  const sizeStyles = {
    small: styles.badgeSmall,
    medium: styles.badgeMedium,
    large: styles.badgeLarge,
  };

  const textSizeStyles = {
    small: styles.textSmall,
    medium: styles.textMedium,
    large: styles.textLarge,
  };

  return (
    <View
      style={[
        styles.badge,
        sizeStyles[size],
        { backgroundColor: color },
        style,
      ]}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`Route ${shortName}`}
    >
      <Text
        style={[styles.text, textSizeStyles[size], { color: textColor }]}
        numberOfLines={1}
      >
        {shortName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 40,
  },
  badgeSmall: {
    minWidth: 32,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMedium: {
    minWidth: 40,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLarge: {
    minWidth: 48,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
});

