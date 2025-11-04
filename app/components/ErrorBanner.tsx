/**
 * Dismissible error banner component
 * Shows error messages at the top of screens
 */

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
}

export function ErrorBanner({
  message,
  type = 'error',
  onDismiss,
}: ErrorBannerProps) {
  const [visible, setVisible] = useState(true);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) {
    return null;
  }

  const typeStyles = {
    error: { backgroundColor: colors.error, color: '#FFFFFF' },
    warning: { backgroundColor: colors.warning, color: '#000000' },
    info: { backgroundColor: colors.primary, color: '#FFFFFF' },
  };

  const icons = {
    error: '⚠️',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: typeStyles[type].backgroundColor },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Text style={styles.icon}>{icons[type]}</Text>
      <Text
        style={[styles.message, { color: typeStyles[type].color }]}
        numberOfLines={2}
      >
        {message}
      </Text>
      <Pressable
        onPress={handleDismiss}
        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
        accessible
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
      >
        <Text style={[styles.dismissText, { color: typeStyles[type].color }]}>
          ✕
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  icon: {
    fontSize: 18,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  dismissText: {
    fontSize: 20,
    fontWeight: '600',
  },
});

