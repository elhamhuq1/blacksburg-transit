/**
 * TypeScript interfaces for API data
 * These mirror the proxy's JSON schemas
 */

export interface Route {
  id: string;
  name: string;
  shortName: string;
  color: string;
  textColor: string;
  directions: RouteDirection[];
  serviceHours?: string;
}

export interface RouteDirection {
  id: number;
  name: string;
}

export interface NearbyStop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  routes: string[];
  distanceMeters: number;
  walkingTimeSeconds: number;
}

export interface Prediction {
  routeId: string;
  routeShortName: string; // Changed from routeName to match component
  headsign: string;
  direction?: string;
  predictedTime: string; // ISO 8601
  scheduledTime?: string; // ISO 8601
  secondsUntilArrival: number; // Changed from etaSeconds to match component
  scheduleBased: boolean;
  vehicleId?: string;
  crowding?: 'low' | 'medium' | 'high';
}

export interface StopDepartures {
  stopId: string;
  stopName: string;
  predictions: Prediction[];
  cached: boolean;
  lastUpdated: string; // ISO 8601
}

export interface RouteStop {
  id: string;
  name: string;
  sequence: number;
  lat: number;
  lon: number;
}

export interface RouteStops {
  routeId: string;
  direction: number;
  directionName: string;
  stops: RouteStop[];
}

export interface Vehicle {
  vehicleId: string;
  routeId: string;
  lat: number;
  lon: number;
  heading: number;
  speed: number;
  lastUpdated: string; // ISO 8601
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  cause: string;
  effect: string;
  description: string;
  affectedRoutes: string[];
  affectedStops: string[];
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  postedAt: string; // ISO 8601
}

export interface HealthCheck {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  cache_hit_rate: number;
  upstream_latency_p95_ms: number;
  requests_last_hour: number;
  circuit_breaker_state: 'open' | 'closed' | 'half_open';
}

// API error response
export interface APIError {
  error: string;
  message?: string;
  statusCode?: number;
}

// ==========================================
// Trip Planner Types (for new feature)
// ==========================================

export interface TripStep {
  type: 'walk' | 'bus' | 'transfer';
  from?: string;
  to?: string;
  routeId?: string;
  routeName?: string;
  routeColor?: string;
  duration: number; // in minutes
  distance?: number; // in meters
  stops?: number; // number of stops
}

export interface TripOption {
  id: string;
  departureTime: string; // ISO 8601
  arrivalTime: string; // ISO 8601
  duration: number; // in minutes
  steps: TripStep[];
  walkingDistance: number; // in meters
  transfers: number;
}

// ==========================================
// Type Aliases for v0 Components
// ==========================================

// Map v0's simpler Stop interface to our NearbyStop
export type Stop = Pick<NearbyStop, 'id' | 'name' | 'lat' | 'lon'> & {
  number: string;
  distance?: number;
};

// Map our Prediction to v0's Departure interface
export interface Departure {
  routeId: string;
  routeName: string;
  routeColor: string;
  destination: string; // headsign
  minutesUntil: number;
  occupancy: 'available' | 'standing' | 'full';
  isAccessible: boolean;
}

// Helper function to convert crowding to occupancy
export function crowdingToOccupancy(
  crowding?: 'low' | 'medium' | 'high'
): 'available' | 'standing' | 'full' {
  if (!crowding || crowding === 'low') return 'available';
  if (crowding === 'medium') return 'standing';
  return 'full';
}

