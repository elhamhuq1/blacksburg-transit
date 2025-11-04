/**
 * TypeScript types for BT4U SOAP API responses and internal data structures
 */

// ============================================================================
// API Response Types (after JSON transformation)
// ============================================================================

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  routes: string[];
}

export interface NearbyStop extends Stop {
  distanceMeters: number;
  walkingTimeSeconds: number;
}

export interface Route {
  id: string;
  name: string;
  shortName?: string;
  color?: string;
  textColor?: string;
  directions: RouteDirection[];
  serviceHours?: string;
}

export interface RouteDirection {
  id: number;
  name: string;
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
  crowding?: 'low' | 'medium' | 'high'; // Vehicle occupancy level
}

export interface StopDepartures {
  stopId: string;
  stopName: string;
  predictions: Prediction[];
  cached: boolean;
  lastUpdated: string; // ISO 8601
}

export interface RouteStops {
  routeId: string;
  direction: number;
  directionName: string;
  stops: RouteStop[];
}

export interface RouteStop {
  id: string;
  name: string;
  sequence: number;
  lat: number;
  lon: number;
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

// ============================================================================
// SOAP Request/Response Types (raw XML structures)
// ============================================================================

export interface SOAPEnvelope {
  'soap:Envelope': {
    'soap:Body': Record<string, unknown>;
  };
}

export interface BT4UError {
  error: string;
  message: string;
  cached?: boolean;
}

// ============================================================================
// Cache & Circuit Breaker Types
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'closed' | 'open' | 'half-open';
}

// ============================================================================
// Health Check Response
// ============================================================================

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  uptime: number;
  cache_hit_rate: number;
  upstream_latency_p95_ms: number;
  requests_last_hour: number;
  circuit_breaker_state: 'closed' | 'open' | 'half-open';
}

