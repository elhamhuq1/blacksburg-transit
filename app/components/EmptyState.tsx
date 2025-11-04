/**
 * Empty state component
 * Displays icon, title, and subtitle for empty screens/lists
 */

import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = '🚌', title, subtitle, action }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <View style={styles.container} accessibilityRole="text">
      <Text style={styles.icon} accessibilityLabel={`${icon} icon`}>
        {icon}
      </Text>
      <Text
        style={[styles.title, { color: colors.text }]}
        allowFontScaling
        accessibilityRole="header"
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={[styles.subtitle, { color: colors.textSecondary }]}
          allowFontScaling
        >
          {subtitle}
        </Text>
      )}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  action: {
    marginTop: 24,
  },
});
