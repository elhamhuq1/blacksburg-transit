/**
 * Near Me Tab Screen (MVP Placeholder)
 * Full implementation in Task 6.0 with GPS integration
 */

import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { EmptyState } from '../../components/EmptyState';
import { useRouter } from 'expo-router';

export default function NearMeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Near Me</Text>
      </View>

      {/* Placeholder content */}
      <View style={styles.content}>
        <EmptyState
          icon="📍"
          title="Find stops near you"
          subtitle="This feature will show nearby bus stops based on your location. Full implementation coming in Task 6.0!"
        />

        {/* Quick action - go to search instead */}
        <Pressable
          onPress={() => router.push('/search')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 },
          ]}
          accessible
          accessibilityRole="button"
          accessibilityLabel="Go to search"
          accessibilityHint="Navigate to search tab to find routes and stops"
        >
          <Text style={styles.buttonText}>🔍 Search for Routes & Stops</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 24,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 32,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
