/**
 * Tests for time utility functions
 */

import {
  formatETA,
  formatTime,
  getRelativeTime,
  isStale,
} from './time';

describe('formatETA', () => {
  it('should format seconds as minutes', () => {
    expect(formatETA(120)).toBe('2 min');
    expect(formatETA(300)).toBe('5 min');
  });

  it('should handle 1 minute specially', () => {
    expect(formatETA(60)).toBe('1 min');
  });

  it('should show "Approaching" for < 60 seconds', () => {
    expect(formatETA(30)).toBe('Approaching');
    expect(formatETA(0)).toBe('Approaching');
    expect(formatETA(59)).toBe('Approaching');
  });

  it('should handle negative values (show "Now")', () => {
    expect(formatETA(-30)).toBe('Now');
  });

  it('should show hours for > 60 minutes', () => {
    expect(formatETA(3600)).toBe('1 hr');
    expect(formatETA(7200)).toBe('2 hrs');
    expect(formatETA(5400)).toBe('1 hr 30 min');
  });
});

describe('formatTime', () => {
  it('should format ISO timestamps as time strings', () => {
    const isoString = '2025-11-04T14:30:00-05:00';
    const result = formatTime(isoString);
    expect(result).toMatch(/2:30 PM/); // May vary by locale
  });

  it('should handle invalid timestamps gracefully', () => {
    expect(formatTime('invalid')).toBe('Invalid time');
  });
});

describe('getRelativeTime', () => {
  it('should show "just now" for very recent times', () => {
    const now = new Date().toISOString();
    expect(getRelativeTime(now)).toBe('just now');
  });

  it('should show minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(getRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago');
  });

  it('should show hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twoHoursAgo)).toBe('2 hours ago');
  });
});

describe('isStale', () => {
  it('should return false for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(isStale(now, 5)).toBe(false);
  });

  it('should return true for old timestamps', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(isStale(tenMinutesAgo, 5)).toBe(true);
  });

  it('should respect custom threshold', () => {
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    expect(isStale(threeMinutesAgo, 5)).toBe(false);
    expect(isStale(threeMinutesAgo, 2)).toBe(true);
  });
});

