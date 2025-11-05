/**
 * Trip Planner Tab Screen
 * Allows users to plan trips from A to B with preferences
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';

export default function PlanTripScreen() {
  // TODO: Integrate v0 trip-planner component here
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <EmptyState
          icon="🧭"
          title="Plan Your Trip"
          subtitle="Trip planner coming soon! Plan routes from any stop to another with preferences."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});

