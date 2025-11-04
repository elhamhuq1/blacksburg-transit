/**
 * Favorite button component
 * Star toggle button for favoriting stops and routes
 */

import { Pressable, StyleSheet, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
}

export function FavoriteButton({
  isFavorite,
  onToggle,
  size = 24,
}: FavoriteButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed ? 0.6 : 1 },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={
        isFavorite ? 'Remove from favorites' : 'Add to favorites'
      }
      accessibilityHint={
        isFavorite
          ? 'Double tap to remove from favorites'
          : 'Double tap to add to favorites'
      }
      hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
    >
      <Text style={[styles.icon, { fontSize: size }]}>
        {isFavorite ? '★' : '☆'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
  icon: {
    color: '#FFA500', // Orange star
  },
});

