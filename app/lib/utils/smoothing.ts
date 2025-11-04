/**
 * ETA smoothing and prediction deduplication utilities
 * Implements PRD requirements for handling stale/jittery data
 */

import type { Prediction } from '../../types/api';

/**
 * Clamp negative ETAs to 0 (show "Approaching" instead of negative times)
 */
export function clampNegativeETA(seconds: number): number {
  return Math.max(0, seconds);
}

/**
 * Deduplicate predictions by route+headsign combination
 * Keeps the earliest arrival for each unique route+direction
 */
export function dedupePredictions(predictions: Prediction[]): Prediction[] {
  const seen = new Map<string, Prediction>();

  for (const prediction of predictions) {
    const key = `${prediction.routeId}-${prediction.headsign}-${prediction.direction}`;
    const existing = seen.get(key);

    if (!existing || prediction.secondsUntilArrival < existing.secondsUntilArrival) {
      seen.set(key, prediction);
    }
  }

  return Array.from(seen.values());
}

/**
 * Smooth ETA jitter using exponential moving average
 * Reduces visual "jumping" when ETAs fluctuate slightly between updates
 * 
 * @param currentETA - New ETA from API (seconds)
 * @param previousETA - Last displayed ETA (seconds)
 * @param alpha - Smoothing factor (0-1, higher = more responsive)
 */
export function smoothETA(currentETA: number, previousETA: number | null, alpha: number = 0.3): number {
  if (previousETA === null) {
    return currentETA;
  }

  // If the difference is large (>60s), don't smooth (likely a real change)
  const diff = Math.abs(currentETA - previousETA);
  if (diff > 60) {
    return currentETA;
  }

  // Apply exponential moving average
  return Math.round(alpha * currentETA + (1 - alpha) * previousETA);
}

/**
 * Filter out stale predictions (older than 5 minutes)
 * Prevents showing predictions that haven't updated
 */
export function filterStalePredictions(
  predictions: Prediction[],
  maxAgeMinutes: number = 5,
): Prediction[] {
  const now = new Date();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  return predictions.filter((prediction) => {
    try {
      const predictedTime = new Date(prediction.predictedTime);
      const age = now.getTime() - predictedTime.getTime();
      return age < maxAgeMs;
    } catch {
      // If timestamp is invalid, keep it (let UI show error state)
      return true;
    }
  });
}

/**
 * Sort predictions by ETA (ascending)
 */
export function sortByETA(predictions: Prediction[]): Prediction[] {
  return [...predictions].sort((a, b) => a.secondsUntilArrival - b.secondsUntilArrival);
}

/**
 * Apply all smoothing operations to a list of predictions
 * This is the main function to use in components
 */
export function processPredictions(
  predictions: Prediction[],
  previousPredictions?: Prediction[],
): Prediction[] {
  // 1. Clamp negative ETAs
  let processed = predictions.map((p) => ({
    ...p,
    secondsUntilArrival: clampNegativeETA(p.secondsUntilArrival),
  }));

  // 2. Smooth ETAs if we have previous data
  if (previousPredictions && previousPredictions.length > 0) {
    const prevMap = new Map(
      previousPredictions.map((p) => [
        `${p.routeId}-${p.headsign}-${p.direction}`,
        p.secondsUntilArrival,
      ]),
    );

    processed = processed.map((p) => {
      const key = `${p.routeId}-${p.headsign}-${p.direction}`;
      const prevETA = prevMap.get(key);
      
      return {
        ...p,
        secondsUntilArrival: smoothETA(p.secondsUntilArrival, prevETA ?? null),
      };
    });
  }

  // 3. Deduplicate
  processed = dedupePredictions(processed);

  // 4. Filter stale
  processed = filterStalePredictions(processed);

  // 5. Sort by ETA
  processed = sortByETA(processed);

  return processed;
}
