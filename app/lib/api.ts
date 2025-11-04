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
  async getRouteStops(routeId: string, direction: number = 0): Promise<RouteStops> {
    return this.fetch<RouteStops>(`/routes/${routeId}/stops?direction=${direction}`);
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

