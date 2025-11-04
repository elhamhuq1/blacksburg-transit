/**
 * Geographic utility functions
 * Distance calculations, coordinate validation
 */

import { LOCATION } from '../../constants/Config';

/**
 * Calculate distance between two points using Haversine formula
 * @param lat1 - First point latitude
 * @param lon1 - First point longitude
 * @param lat2 - Second point latitude
 * @param lon2 - Second point longitude
 * @returns Distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Format distance to human-readable string
 * @param meters - Distance in meters
 * @param units - 'metric' or 'imperial'
 * @returns Formatted string like "250 m", "0.2 mi"
 */
export function formatDistance(meters: number, units: 'metric' | 'imperial' = 'imperial'): string {
  if (units === 'metric') {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  // Imperial
  const feet = meters * 3.28084;
  if (feet < 528) {
    // Less than 0.1 mi
    return `${Math.round(feet)} ft`;
  }
  const miles = meters * 0.000621371;
  return `${miles.toFixed(1)} mi`;
}

/**
 * Validate if coordinates are within Blacksburg bounds
 * @param lat - Latitude
 * @param lon - Longitude
 * @returns true if within bounds
 */
export function isWithinBlacksburg(lat: number, lon: number): boolean {
  return (
    lat >= LOCATION.BOUNDS.MIN_LAT &&
    lat <= LOCATION.BOUNDS.MAX_LAT &&
    lon >= LOCATION.BOUNDS.MIN_LON &&
    lon <= LOCATION.BOUNDS.MAX_LON
  );
}

/**
 * Estimate walking time based on distance
 * @param meters - Distance in meters
 * @param speedMps - Walking speed in meters per second (default: 1.4 m/s)
 * @returns Walking time in seconds
 */
export function estimateWalkingTime(meters: number, speedMps: number = 1.4): number {
  return Math.round(meters / speedMps);
}

