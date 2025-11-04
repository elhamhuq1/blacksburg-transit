/**
 * Proxy API client
 * Fetches data from the SOAP→JSON proxy
 */

import { API_BASE_URL } from '../constants/Config';
import type {
  Route,
  NearbyStop,
  StopDepartures,
  RouteStops,
  Vehicle,
  Alert,
  HealthCheck,
  APIError,
} from '../types/api';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    console.log('[API] Initialized with baseURL:', this.baseURL);
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error: APIError = await response.json().catch(() => ({
          error: 'Unknown error',
          statusCode: response.status,
        }));
        throw new Error(error.message || error.error);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network request failed');
    }
  }

  // Routes
  async getRoutes(): Promise<Route[]> {
    return this.fetch<Route[]>('/routes');
  }

  // Stops
  async getNearbyStops(lat: number, lon: number): Promise<NearbyStop[]> {
    return this.fetch<NearbyStop[]>(`/stops/nearby?lat=${lat}&lon=${lon}`);
  }

  async getStopDepartures(stopId: string): Promise<StopDepartures> {
    return this.fetch<StopDepartures>(`/stops/${stopId}/departures`);
  }

  async getStopSchedule(stopId: string): Promise<StopDepartures> {
    return this.fetch<StopDepartures>(`/stops/${stopId}/schedule`);
  }

  // Route stops
  async getRouteStops(routeId: string): Promise<any> {
    // Fetch both directions in parallel
    const [dir0, dir1] = await Promise.all([
      this.fetch<RouteStops>(`/routes/${routeId}/stops?direction=0`).catch(() => null),
      this.fetch<RouteStops>(`/routes/${routeId}/stops?direction=1`).catch(() => null),
    ]);

    // Combine into expected structure
    const directions = [];
    if (dir0) {
      directions.push({
        directionId: '0',
        name: dir0.directionName || 'Outbound',
        stops: dir0.stops,
      });
    }
    if (dir1) {
      directions.push({
        directionId: '1',
        name: dir1.directionName || 'Inbound',
        stops: dir1.stops,
      });
    }

    return {
      route: {
        id: routeId,
        shortName: routeId,
        longName: routeId, // We'll get this from the routes list if needed
        color: '#000000',
        textColor: '#FFFFFF',
      },
      directions,
    };
  }

  // Vehicles
  async getVehicles(routeId?: string): Promise<Vehicle[]> {
    const query = routeId ? `?routeId=${routeId}` : '';
    return this.fetch<Vehicle[]>(`/vehicles${query}`);
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    return this.fetch<Alert[]>('/alerts');
  }

  // Health check
  async getHealth(): Promise<HealthCheck> {
    return this.fetch<HealthCheck>('/health');
  }
}

// Export singleton instance
export const api = new APIClient();

// Export class for testing
export { APIClient };

// Export convenience functions
export const fetchRoutes = () => api.getRoutes();
export const fetchNearbyStops = (lat: number, lon: number, radius?: number) => 
  api.getNearbyStops(lat, lon);
export const fetchStopDepartures = (stopId: string) => api.getStopDepartures(stopId);
export const fetchStopSchedule = (stopId: string) => api.getStopSchedule(stopId);
export const fetchRouteStops = (routeId: string) => 
  api.getRouteStops(routeId);
export const fetchVehicles = (routeId?: string) => api.getVehicles(routeId);
export const fetchAlerts = () => api.getAlerts();
export const fetchHealth = () => api.getHealth();

