/**
 * Map Tab Screen
 * Shows interactive map with routes and live vehicle positions
 */

import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';

export default function MapScreen() {
  // TODO: Integrate v0 map-view component here
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <EmptyState
          icon="🗺️"
          title="Map View"
          subtitle="Interactive map coming soon! This will show all routes and live bus positions."
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

