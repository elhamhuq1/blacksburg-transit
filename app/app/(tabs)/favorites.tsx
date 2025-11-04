/**
 * Favorites Tab Screen
 * Shows user's favorited stops and routes
 */

import { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useFavoritesStore } from '../../lib/stores/favoritesStore';
import { StopCard } from '../../components/StopCard';
import { RouteBadge } from '../../components/RouteBadge';
import { EmptyState } from '../../components/EmptyState';
import { Colors } from '../../constants/Colors';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);

  const stops = favorites.filter((f) => f.type === 'stop');
  const routes = favorites.filter((f) => f.type === 'route');

  const handleStopPress = useCallback((stopId: string) => {
    router.push(`/stop/${stopId}`);
  }, []);

  const handleRoutePress = useCallback((routeId: string) => {
    router.push(`/route/${routeId}`);
  }, []);

  const handleRemoveFavorite = useCallback(
    (id: string) => {
      removeFavorite(id);
    },
    [removeFavorite]
  );

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
        </View>
        <EmptyState
          icon="⭐"
          title="No favorites yet"
          subtitle="Tap the star icon on any stop or route to add it to your favorites"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Favorites</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Favorite stops */}
        {stops.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.text }]}
              accessibilityRole="header"
              allowFontScaling
            >
              Favorite Stops ({stops.length})
            </Text>
            {stops.map((favorite) => (
              <View key={favorite.id} style={styles.favoriteItem}>
                <View style={{ flex: 1 }}>
                  <StopCard
                    id={favorite.id}
                    name={favorite.name}
                    onPress={() => handleStopPress(favorite.id)}
                  />
                </View>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemoveFavorite(favorite.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${favorite.name} from favorites`}
                >
                  <Text style={styles.removeIcon}>🗑️</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Favorite routes */}
        {routes.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: colors.text }]}
              accessibilityRole="header"
              allowFontScaling
            >
              Favorite Routes ({routes.length})
            </Text>
            {routes.map((favorite) => (
              <View key={favorite.id} style={styles.favoriteItem}>
                <Pressable
                  style={[styles.routeItem, { backgroundColor: colors.surface }]}
                  onPress={() => handleRoutePress(favorite.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Route ${favorite.name}`}
                >
                  <RouteBadge shortName={favorite.id} size="medium" />
                  <Text
                    style={[styles.routeName, { color: colors.text }]}
                    numberOfLines={1}
                    allowFontScaling
                  >
                    {favorite.name}
                  </Text>
                </Pressable>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemoveFavorite(favorite.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${favorite.name} from favorites`}
                >
                  <Text style={styles.removeIcon}>🗑️</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  favoriteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  removeButton: {
    padding: 12,
    marginRight: 16,
  },
  removeIcon: {
    fontSize: 20,
  },
});
