/**
 * App configuration constants
 */

// API Configuration
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// Polling intervals (milliseconds)
export const POLLING_INTERVALS = {
  DEPARTURES: 10000, // 10 seconds - real-time arrivals
  NEARBY_STOPS: 30000, // 30 seconds - nearby stops
  ROUTES: 300000, // 5 minutes - route list
  VEHICLES: 10000, // 10 seconds - vehicle positions
  ALERTS: 300000, // 5 minutes - service alerts
} as const;

// Cache TTLs (milliseconds)
export const CACHE_TTL = {
  DEPARTURES: 10000,
  NEARBY_STOPS: 30000,
  ROUTES: 300000,
  ROUTE_STOPS: 300000,
  VEHICLES: 10000,
  ALERTS: 300000,
  SCHEDULE: 3600000, // 1 hour
} as const;

// Location configuration
export const LOCATION = {
  // Blacksburg, VA bounding box
  BOUNDS: {
    MIN_LAT: 37.2,
    MAX_LAT: 37.3,
    MIN_LON: -80.5,
    MAX_LON: -80.3,
  },
  // Default center (VT campus)
  DEFAULT: {
    LAT: 37.2296,
    LON: -80.4139,
  },
  // Distance threshold for background fetch (meters)
  BACKGROUND_FETCH_THRESHOLD: 100,
} as const;

// Performance budgets
export const PERFORMANCE = {
  COLD_START_TARGET: 2500, // ms
  INTERACTION_LATENCY: 100, // ms
  LIST_SCROLL_FPS: 60,
} as const;

// Accessibility
export const A11Y = {
  MIN_TAP_TARGET: 44, // points
  MIN_SPACING: 8, // points between interactive elements
} as const;

// ETA display thresholds
export const ETA_THRESHOLDS = {
  APPROACHING: 60, // < 60 seconds show "Approaching"
  HIDE_NEGATIVE: true, // Don't show negative ETAs
} as const;

