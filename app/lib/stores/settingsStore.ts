/**
 * Zustand store for app settings
 * Persisted using AsyncStorage
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Theme = 'light' | 'dark' | 'system';
export type UnitsDistance = 'metric' | 'imperial';

interface SettingsState {
  theme: Theme;
  unitsDistance: UnitsDistance;
  locationPermissionGranted: boolean;
  analyticsEnabled: boolean;
  setTheme: (theme: Theme) => void;
  setUnitsDistance: (units: UnitsDistance) => void;
  setLocationPermissionGranted: (granted: boolean) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  hydrate: () => Promise<void>;
}

const STORAGE_KEYS = {
  theme: '@blacksburg_transit:theme',
  unitsDistance: '@blacksburg_transit:unitsDistance',
  locationPermissionGranted: '@blacksburg_transit:locationPermissionGranted',
  analyticsEnabled: '@blacksburg_transit:analyticsEnabled',
};

// Load persisted settings from AsyncStorage
async function loadSettings(): Promise<Partial<SettingsState>> {
  try {
    const [theme, unitsDistance, locationPermissionGranted, analyticsEnabled] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.theme),
      AsyncStorage.getItem(STORAGE_KEYS.unitsDistance),
      AsyncStorage.getItem(STORAGE_KEYS.locationPermissionGranted),
      AsyncStorage.getItem(STORAGE_KEYS.analyticsEnabled),
    ]);

    return {
      theme: (theme as Theme) || 'system',
      unitsDistance: (unitsDistance as UnitsDistance) || 'imperial',
      locationPermissionGranted: locationPermissionGranted === 'true',
      analyticsEnabled: analyticsEnabled === 'true',
    };
  } catch {
    return {};
  }
}

// Save settings to AsyncStorage
async function saveSetting(key: string, value: string | boolean) {
  try {
    await AsyncStorage.setItem(key, String(value));
  } catch (error) {
    console.error(`Failed to save setting ${key}:`, error);
  }
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'system',
  unitsDistance: 'imperial',
  locationPermissionGranted: false,
  analyticsEnabled: false,

  setTheme: (theme) => {
    set({ theme });
    saveSetting(STORAGE_KEYS.theme, theme);
  },

  setUnitsDistance: (unitsDistance) => {
    set({ unitsDistance });
    saveSetting(STORAGE_KEYS.unitsDistance, unitsDistance);
  },

  setLocationPermissionGranted: (locationPermissionGranted) => {
    set({ locationPermissionGranted });
    saveSetting(STORAGE_KEYS.locationPermissionGranted, locationPermissionGranted);
  },

  setAnalyticsEnabled: (analyticsEnabled) => {
    set({ analyticsEnabled });
    saveSetting(STORAGE_KEYS.analyticsEnabled, analyticsEnabled);
  },

  hydrate: async () => {
    const settings = await loadSettings();
    set(settings);
  },
}));

// Hydrate settings on store creation
useSettingsStore.getState().hydrate();

