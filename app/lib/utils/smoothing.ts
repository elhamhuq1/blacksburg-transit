/**
 * ETA smoothing and deduplication utilities
 * Implements smoothing logic from PRD section 7.6
 */

import type { Prediction } from '../../types/api';

/**
 * Clamp negative ETAs to 0 (show "Approaching" instead of negative minutes)
 */
export function clampNegativeETA(prediction: Prediction): Prediction {
  return {
    ...prediction,
    minutesUntilArrival: Math.max(0, prediction.minutesUntilArrival),
    minutesUntilDeparture: Math.max(0, prediction.minutesUntilDeparture),
  };
}

/**
 * Deduplicate predictions based on route, headsign, and similar arrival times
 * Two predictions are considered duplicates if:
 * - Same route ID
 * - Same headsign
 * - Arrival times within 1 minute of each other
 */
export function dedupePredictions(predictions: Prediction[]): Prediction[] {
  const seen = new Map<string, Prediction>();

  for (const prediction of predictions) {
    const key = `${prediction.routeId}:${prediction.headsign}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, prediction);
      continue;
    }

    // If arrival times are within 1 minute, keep the earlier one (or real-time over schedule-based)
    const timeDiff = Math.abs(prediction.minutesUntilArrival - existing.minutesUntilArrival);
    
    if (timeDiff <= 1) {
      // Prefer real-time over schedule-based
      if (!prediction.scheduleBased && existing.scheduleBased) {
        seen.set(key, prediction);
      } else if (prediction.scheduleBased === existing.scheduleBased) {
        // If both same type, keep the earlier one
        if (prediction.minutesUntilArrival < existing.minutesUntilArrival) {
          seen.set(key, prediction);
        }
      }
    } else {
      // Different enough times - need a different key
      const timeKey = `${key}:${Math.floor(prediction.minutesUntilArrival / 2)}`;
      seen.set(timeKey, prediction);
    }
  }

  return Array.from(seen.values());
}

/**
 * Sort predictions by arrival time (earliest first)
 */
export function sortPredictionsByArrival(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => a.minutesUntilArrival - b.minutesUntilArrival);
}

/**
 * Smooth ETA jitter by rounding to nearest minute for ETAs > 2 minutes
 * For ETAs <= 2 minutes, show exact time to avoid "jumpy" countdowns
 */
export function smoothETA(minutes: number): number {
  if (minutes <= 2) {
    return minutes; // Show exact time for imminent arrivals
  }
  
  return Math.round(minutes); // Round to nearest minute for longer waits
}

/**
 * Filter out predictions that are too far in the future (> 60 minutes)
 * These are likely schedule-based predictions that aren't useful for real-time tracking
 */
export function filterFuturePredictions(
  predictions: Prediction[],
  maxMinutes: number = 60
): Prediction[] {
  return predictions.filter((p) => p.minutesUntilArrival <= maxMinutes);
}

/**
 * Main smoothing pipeline: clamp, dedupe, sort, and filter predictions
 */
export function smoothPredictions(
  predictions: Prediction[],
  options: {
    maxMinutes?: number;
    dedupe?: boolean;
  } = {}
): Prediction[] {
  const { maxMinutes = 60, dedupe = true } = options;

  let result = predictions.map(clampNegativeETA);
  
  if (dedupe) {
    result = dedupePredictions(result);
  }
  
  result = filterFuturePredictions(result, maxMinutes);
  result = sortPredictionsByArrival(result);

  return result;
}

/**
 * Get display text for ETA based on minutes until arrival
 */
export function getETADisplayText(minutes: number): string {
  if (minutes < 1) {
    return 'Approaching';
  }
  
  if (minutes === 1) {
    return '1 min';
  }
  
  const smoothed = smoothETA(minutes);
  return `${smoothed} min`;
}

/**
 * Check if predictions are stale (haven't been updated recently)
 * Used to show "data may be stale" warnings
 */
export function arePredictionsStale(lastUpdated: string, thresholdMinutes: number = 2): boolean {
  const lastUpdateTime = new Date(lastUpdated).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastUpdateTime) / (1000 * 60);
  
  return diffMinutes > thresholdMinutes;
}

