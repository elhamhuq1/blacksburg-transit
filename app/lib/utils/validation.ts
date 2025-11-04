/**
 * Zod schemas for validating API responses
 * Ensures type safety and runtime validation
 */

import { z } from 'zod';

// Route schema
export const RouteSchema = z.object({
  id: z.string(),
  shortName: z.string(),
  longName: z.string(),
  description: z.string().optional(),
  color: z.string(),
  textColor: z.string(),
  sortOrder: z.number().optional(),
});

export type ValidatedRoute = z.infer<typeof RouteSchema>;

// Route Direction schema
export const RouteDirectionSchema = z.object({
  directionId: z.number(),
  directionName: z.string(),
});

export type ValidatedRouteDirection = z.infer<typeof RouteDirectionSchema>;

// Prediction schema
export const PredictionSchema = z.object({
  routeId: z.string(),
  routeShortName: z.string(),
  routeColor: z.string().optional(),
  headsign: z.string(),
  direction: z.string().optional(),
  arrivalTime: z.string(), // ISO 8601
  departureTime: z.string(), // ISO 8601
  minutesUntilArrival: z.number(),
  minutesUntilDeparture: z.number(),
  scheduleBased: z.boolean(),
  vehicleId: z.string().optional(),
  crowding: z.enum(['low', 'medium', 'high']).optional(),
});

export type ValidatedPrediction = z.infer<typeof PredictionSchema>;

// Stop Departures schema
export const StopDeparturesSchema = z.object({
  stopId: z.string(),
  stopName: z.string(),
  predictions: z.array(PredictionSchema),
  cached: z.boolean().optional(),
  lastUpdated: z.string(), // ISO 8601
});

export type ValidatedStopDepartures = z.infer<typeof StopDeparturesSchema>;

// Nearby Stop schema
export const NearbyStopSchema = z.object({
  stopId: z.string(),
  stopName: z.string(),
  stopCode: z.string().optional(),
  lat: z.number(),
  lon: z.number(),
  distance: z.number(), // meters
  routes: z.array(z.string()),
});

export type ValidatedNearbyStop = z.infer<typeof NearbyStopSchema>;

// Route Stop schema
export const RouteStopSchema = z.object({
  stopId: z.string(),
  stopName: z.string(),
  stopCode: z.string().optional(),
  lat: z.number(),
  lon: z.number(),
  sequence: z.number(),
});

export type ValidatedRouteStop = z.infer<typeof RouteStopSchema>;

// Route Stops (with direction) schema
export const RouteStopsSchema = z.object({
  routeId: z.string(),
  routeName: z.string(),
  direction: RouteDirectionSchema.optional(),
  stops: z.array(RouteStopSchema),
});

export type ValidatedRouteStops = z.infer<typeof RouteStopsSchema>;

// Vehicle schema
export const VehicleSchema = z.object({
  vehicleId: z.string(),
  routeId: z.string(),
  routeShortName: z.string(),
  lat: z.number(),
  lon: z.number(),
  heading: z.number().optional(),
  speed: z.number().optional(),
  lastUpdate: z.string(), // ISO 8601
});

export type ValidatedVehicle = z.infer<typeof VehicleSchema>;

// Alert schema
export const AlertSchema = z.object({
  id: z.string(),
  routeIds: z.array(z.string()).optional(),
  stopIds: z.array(z.string()).optional(),
  severity: z.enum(['info', 'warning', 'critical']),
  header: z.string(),
  description: z.string(),
  url: z.string().url().optional(),
  startTime: z.string().optional(), // ISO 8601
  endTime: z.string().optional(), // ISO 8601
});

export type ValidatedAlert = z.infer<typeof AlertSchema>;

/**
 * Helper function to safely parse and validate API responses
 */
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = `Validation failed${context ? ` for ${context}` : ''}: ${result.error.message}`;
    console.error(errorMessage, result.error.errors);
    throw new Error(errorMessage);
  }
  
  return result.data;
}

/**
 * Helper function to validate arrays of data
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[],
  context?: string
): T[] {
  return data.map((item, index) => {
    try {
      return validateResponse(schema, item, context ? `${context}[${index}]` : `item ${index}`);
    } catch (error) {
      console.warn(`Skipping invalid item at index ${index}:`, error);
      return null;
    }
  }).filter((item): item is T => item !== null);
}

