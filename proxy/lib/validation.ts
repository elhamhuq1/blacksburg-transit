/**
 * Input validation using Zod schemas
 * Validates and sanitizes user inputs
 */

import { z } from 'zod';

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Blacksburg lat/lon boundaries
 * Blacksburg is approximately at: 37.23° N, -80.42° W
 * Reasonable bounds: ±0.2 degrees (~22km radius)
 */
const BLACKSBURG_LAT_MIN = 37.1;
const BLACKSBURG_LAT_MAX = 37.3;
const BLACKSBURG_LON_MIN = -80.5;
const BLACKSBURG_LON_MAX = -80.3;

/**
 * Stop ID validation
 */
export const stopIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, 'Stop ID must be alphanumeric')
  .min(1)
  .max(20);

/**
 * Route ID validation
 */
export const routeIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, 'Route ID must be alphanumeric')
  .min(1)
  .max(20);

/**
 * Latitude validation (Blacksburg bounds)
 */
export const latitudeSchema = z
  .number()
  .min(BLACKSBURG_LAT_MIN, 'Latitude out of Blacksburg bounds')
  .max(BLACKSBURG_LAT_MAX, 'Latitude out of Blacksburg bounds');

/**
 * Longitude validation (Blacksburg bounds)
 */
export const longitudeSchema = z
  .number()
  .min(BLACKSBURG_LON_MIN, 'Longitude out of Blacksburg bounds')
  .max(BLACKSBURG_LON_MAX, 'Longitude out of Blacksburg bounds');

/**
 * Radius validation (in meters)
 */
export const radiusSchema = z
  .number()
  .min(100, 'Radius must be at least 100m')
  .max(5000, 'Radius must be at most 5000m');

/**
 * Direction validation (0 or 1)
 */
export const directionSchema = z.union([z.literal(0), z.literal(1)]);

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate stop ID
 */
export function validateStopId(stopId: string): { valid: boolean; error?: string } {
  const result = stopIdSchema.safeParse(stopId);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0]?.message || 'Invalid stop ID' };
  }
  return { valid: true };
}

/**
 * Validate route ID
 */
export function validateRouteId(routeId: string): { valid: boolean; error?: string } {
  const result = routeIdSchema.safeParse(routeId);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0]?.message || 'Invalid route ID' };
  }
  return { valid: true };
}

/**
 * Validate coordinates
 */
export function validateCoordinates(
  lat: number,
  lon: number
): { valid: boolean; error?: string } {
  const latResult = latitudeSchema.safeParse(lat);
  if (!latResult.success) {
    return { valid: false, error: latResult.error.errors[0]?.message || 'Invalid latitude' };
  }

  const lonResult = longitudeSchema.safeParse(lon);
  if (!lonResult.success) {
    return { valid: false, error: lonResult.error.errors[0]?.message || 'Invalid longitude' };
  }

  return { valid: true };
}

/**
 * Validate radius
 */
export function validateRadius(radius: number): { valid: boolean; error?: string } {
  const result = radiusSchema.safeParse(radius);
  if (!result.success) {
    return { valid: false, error: result.error.errors[0]?.message || 'Invalid radius' };
  }
  return { valid: true };
}

/**
 * Validate direction
 */
export function validateDirection(direction: number): { valid: boolean; error?: string } {
  const result = directionSchema.safeParse(direction);
  if (!result.success) {
    return { valid: false, error: 'Direction must be 0 or 1' };
  }
  return { valid: true };
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>'"&]/g, '');
}

