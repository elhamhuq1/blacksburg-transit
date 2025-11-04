/**
 * Zustand store for managing favorite stops and routes
 * Persisted using MMKV
 */

import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'favorites' }) as MMKV;

interface Favorite {
  id: string;
  type: 'stop' | 'route';
  name: string;
  addedAt: string; // ISO 8601
}

interface FavoritesState {
  favorites: Favorite[];
  addFavorite: (id: string, type: 'stop' | 'route', name: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  getFavoritesByType: (type: 'stop' | 'route') => Favorite[];
  hydrate: () => void;
}

// Load persisted favorites from MMKV
function loadFavorites(): Favorite[] {
  try {
    const stored = storage.getString('favorites');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save favorites to MMKV
function saveFavorites(favorites: Favorite[]) {
  try {
    storage.set('favorites', JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  addFavorite: (id, type, name) => {
    const { favorites } = get();
    
    // Don't add duplicates
    if (favorites.some((f) => f.id === id)) {
      return;
    }

    const newFavorite: Favorite = {
      id,
      type,
      name,
      addedAt: new Date().toISOString(),
    };

    const updated = [newFavorite, ...favorites];
    set({ favorites: updated });
    saveFavorites(updated);
  },

  removeFavorite: (id) => {
    const { favorites } = get();
    const updated = favorites.filter((f) => f.id !== id);
    set({ favorites: updated });
    saveFavorites(updated);
  },

  isFavorite: (id) => {
    return get().favorites.some((f) => f.id === id);
  },

  getFavoritesByType: (type) => {
    return get().favorites.filter((f) => f.type === type);
  },

  hydrate: () => {
    const favorites = loadFavorites();
    set({ favorites });
  },
}));

// Hydrate favorites on store creation
useFavoritesStore.getState().hydrate();

