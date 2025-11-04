/**
 * Tests for smoothing utility functions
 */

import {
  clampNegativeETA,
  dedupePredictions,
  sortPredictionsByArrival,
  smoothETA,
  filterFuturePredictions,
  smoothPredictions,
  getETADisplayText,
  arePredictionsStale,
} from './smoothing';
import type { Prediction } from '../../types/api';

// Mock prediction factory
const createPrediction = (overrides: Partial<Prediction> = {}): Prediction => ({
  routeId: '1',
  routeShortName: 'CAS',
  routeColor: '#FF0000',
  headsign: 'Downtown',
  direction: 'Inbound',
  arrivalTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  departureTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  minutesUntilArrival: 5,
  minutesUntilDeparture: 5,
  scheduleBased: false,
  ...overrides,
});

describe('clampNegativeETA', () => {
  it('should clamp negative ETAs to 0', () => {
    const prediction = createPrediction({
      minutesUntilArrival: -2,
      minutesUntilDeparture: -3,
    });

    const result = clampNegativeETA(prediction);

    expect(result.minutesUntilArrival).toBe(0);
    expect(result.minutesUntilDeparture).toBe(0);
  });

  it('should not change positive ETAs', () => {
    const prediction = createPrediction({
      minutesUntilArrival: 5,
      minutesUntilDeparture: 6,
    });

    const result = clampNegativeETA(prediction);

    expect(result.minutesUntilArrival).toBe(5);
    expect(result.minutesUntilDeparture).toBe(6);
  });
});

describe('dedupePredictions', () => {
  it('should remove duplicate predictions with same route and headsign', () => {
    const predictions = [
      createPrediction({ routeId: '1', headsign: 'Downtown', minutesUntilArrival: 5 }),
      createPrediction({ routeId: '1', headsign: 'Downtown', minutesUntilArrival: 5 }),
    ];

    const result = dedupePredictions(predictions);

    expect(result).toHaveLength(1);
  });

  it('should keep predictions with different headsigns', () => {
    const predictions = [
      createPrediction({ routeId: '1', headsign: 'Downtown', minutesUntilArrival: 5 }),
      createPrediction({ routeId: '1', headsign: 'Uptown', minutesUntilArrival: 5 }),
    ];

    const result = dedupePredictions(predictions);

    expect(result).toHaveLength(2);
  });

  it('should prefer real-time over schedule-based', () => {
    const predictions = [
      createPrediction({ routeId: '1', headsign: 'Downtown', minutesUntilArrival: 5, scheduleBased: true }),
      createPrediction({ routeId: '1', headsign: 'Downtown', minutesUntilArrival: 5, scheduleBased: false }),
    ];

    const result = dedupePredictions(predictions);

    expect(result).toHaveLength(1);
    expect(result[0].scheduleBased).toBe(false);
  });
});

describe('sortPredictionsByArrival', () => {
  it('should sort predictions by arrival time (earliest first)', () => {
    const predictions = [
      createPrediction({ minutesUntilArrival: 10 }),
      createPrediction({ minutesUntilArrival: 2 }),
      createPrediction({ minutesUntilArrival: 5 }),
    ];

    const result = sortPredictionsByArrival(predictions);

    expect(result[0].minutesUntilArrival).toBe(2);
    expect(result[1].minutesUntilArrival).toBe(5);
    expect(result[2].minutesUntilArrival).toBe(10);
  });
});

describe('smoothETA', () => {
  it('should not round ETAs <= 2 minutes', () => {
    expect(smoothETA(1)).toBe(1);
    expect(smoothETA(2)).toBe(2);
    expect(smoothETA(1.5)).toBe(1.5);
  });

  it('should round ETAs > 2 minutes', () => {
    expect(smoothETA(5.4)).toBe(5);
    expect(smoothETA(5.6)).toBe(6);
    expect(smoothETA(10.2)).toBe(10);
  });
});

describe('filterFuturePredictions', () => {
  it('should filter out predictions beyond max minutes', () => {
    const predictions = [
      createPrediction({ minutesUntilArrival: 5 }),
      createPrediction({ minutesUntilArrival: 65 }),
      createPrediction({ minutesUntilArrival: 30 }),
    ];

    const result = filterFuturePredictions(predictions, 60);

    expect(result).toHaveLength(2);
    expect(result.every((p) => p.minutesUntilArrival <= 60)).toBe(true);
  });
});

describe('smoothPredictions', () => {
  it('should apply full smoothing pipeline', () => {
    const predictions = [
      createPrediction({ minutesUntilArrival: -1, minutesUntilDeparture: -1 }), // Negative - should be clamped
      createPrediction({ minutesUntilArrival: 70 }), // Too far - should be filtered
      createPrediction({ routeId: '1', headsign: 'Downtown', minutesUntilArrival: 5 }),
      createPrediction({ routeId: '1', headsign: 'Downtown', minutesUntilArrival: 5 }), // Duplicate
      createPrediction({ minutesUntilArrival: 2 }),
    ];

    const result = smoothPredictions(predictions);

    // Should have: clamped, unique, filtered, sorted
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.minutesUntilArrival >= 0)).toBe(true);
    expect(result.every((p) => p.minutesUntilArrival <= 60)).toBe(true);
    // Check sorting
    for (let i = 1; i < result.length; i++) {
      expect(result[i].minutesUntilArrival).toBeGreaterThanOrEqual(
        result[i - 1].minutesUntilArrival
      );
    }
  });
});

describe('getETADisplayText', () => {
  it('should show "Approaching" for < 1 minute', () => {
    expect(getETADisplayText(0)).toBe('Approaching');
    expect(getETADisplayText(0.5)).toBe('Approaching');
  });

  it('should show "1 min" for exactly 1 minute', () => {
    expect(getETADisplayText(1)).toBe('1 min');
  });

  it('should show minutes for > 1 minute', () => {
    expect(getETADisplayText(5)).toBe('5 min');
    expect(getETADisplayText(15)).toBe('15 min');
  });
});

describe('arePredictionsStale', () => {
  it('should return false for recent updates', () => {
    const now = new Date().toISOString();
    expect(arePredictionsStale(now, 2)).toBe(false);
  });

  it('should return true for old updates', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(arePredictionsStale(fiveMinutesAgo, 2)).toBe(true);
  });
});

