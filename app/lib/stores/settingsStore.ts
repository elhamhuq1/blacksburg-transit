/**
 * Zustand store for app settings
 * Persisted using MMKV
 */

import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'settings' });

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
  hydrate: () => void;
}

// Load persisted settings from MMKV
function loadSettings(): Partial<SettingsState> {
  try {
    return {
      theme: (storage.getString('theme') as Theme) || 'system',
      unitsDistance: (storage.getString('unitsDistance') as UnitsDistance) || 'imperial',
      locationPermissionGranted: storage.getBoolean('locationPermissionGranted') || false,
      analyticsEnabled: storage.getBoolean('analyticsEnabled') || false,
    };
  } catch {
    return {};
  }
}

// Save settings to MMKV
function saveSetting(key: string, value: string | boolean) {
  try {
    if (typeof value === 'boolean') {
      storage.set(key, value);
    } else {
      storage.set(key, value);
    }
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
    saveSetting('theme', theme);
  },

  setUnitsDistance: (unitsDistance) => {
    set({ unitsDistance });
    saveSetting('unitsDistance', unitsDistance);
  },

  setLocationPermissionGranted: (locationPermissionGranted) => {
    set({ locationPermissionGranted });
    saveSetting('locationPermissionGranted', locationPermissionGranted);
  },

  setAnalyticsEnabled: (analyticsEnabled) => {
    set({ analyticsEnabled });
    saveSetting('analyticsEnabled', analyticsEnabled);
  },

  hydrate: () => {
    const settings = loadSettings();
    set(settings);
  },
}));

// Hydrate settings on store creation
useSettingsStore.getState().hydrate();

