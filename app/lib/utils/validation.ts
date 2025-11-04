/**
 * Zod schemas for validating API responses
 */

import { z } from 'zod';

// Stop schema
export const StopSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  routes: z.array(z.string()).optional(),
  address: z.string().optional(),
});

// Route schema
export const RouteSchema = z.object({
  id: z.string(),
  shortName: z.string(),
  longName: z.string(),
  color: z.string(),
  textColor: z.string(),
  type: z.string().optional(),
  directions: z.array(z.string()).optional(),
});

// Prediction schema
export const PredictionSchema = z.object({
  routeId: z.string(),
  routeShortName: z.string(),
  headsign: z.string(),
  direction: z.string(),
  predictedTime: z.string(), // ISO 8601
  scheduledTime: z.string().optional(),
  secondsUntilArrival: z.number(),
  scheduleBased: z.boolean(),
  vehicleId: z.string().optional(),
  crowding: z.enum(['low', 'medium', 'high']).optional(),
});

// StopDepartures schema
export const StopDeparturesSchema = z.object({
  stopId: z.string(),
  stopName: z.string(),
  predictions: z.array(PredictionSchema),
  cached: z.boolean(),
  lastUpdated: z.string(),
});

// NearbyStop schema
export const NearbyStopSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  distance: z.number(),
  lat: z.number(),
  lon: z.number(),
  routes: z.array(z.string()).optional(),
});

// Alert schema
export const AlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(['info', 'warning', 'critical']),
  affectedRoutes: z.array(z.string()).optional(),
  affectedStops: z.array(z.string()).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

// Vehicle schema
export const VehicleSchema = z.object({
  id: z.string(),
  routeId: z.string(),
  routeShortName: z.string(),
  lat: z.number(),
  lon: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  lastUpdate: z.string(),
});

// Export types
export type Stop = z.infer<typeof StopSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type Prediction = z.infer<typeof PredictionSchema>;
export type StopDepartures = z.infer<typeof StopDeparturesSchema>;
export type NearbyStop = z.infer<typeof NearbyStopSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;

// Helper function to safely parse API responses
export function parseApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      };
    }
    return { success: false, error: 'Unknown validation error' };
  }
}
