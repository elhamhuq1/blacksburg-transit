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
  routeName: string;
  headsign: string;
  predictedArrivalTime: string; // ISO 8601
  etaMinutes: number;
  etaSeconds: number;
  status: 'on_time' | 'delayed' | 'early' | 'scheduled';
  delayMinutes: number;
  vehicleId?: string;
  scheduleBased: boolean;
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

