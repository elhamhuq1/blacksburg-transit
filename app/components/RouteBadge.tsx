/**
 * Route badge component
 * Color-coded pill displaying route short name
 */

import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface RouteBadgeProps {
  shortName: string;
  color?: string;
  textColor?: string;
  size?: 'small' | 'medium' | 'large';
}

export function RouteBadge({
  shortName,
  color = Colors.light.primary,
  textColor = Colors.light.background,
  size = 'medium',
}: RouteBadgeProps) {
  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, minWidth: 28 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, minWidth: 36 },
    large: { paddingHorizontal: 10, paddingVertical: 6, minWidth: 44 },
  };

  const textSizeStyles = {
    small: { fontSize: 11, lineHeight: 13 },
    medium: { fontSize: 13, lineHeight: 16 },
    large: { fontSize: 15, lineHeight: 18 },
  };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color },
        sizeStyles[size],
      ]}
      accessibilityLabel={`Route ${shortName}`}
      accessibilityRole="text"
    >
      <Text
        style={[
          styles.text,
          { color: textColor },
          textSizeStyles[size],
        ]}
        numberOfLines={1}
        allowFontScaling
      >
        {shortName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
