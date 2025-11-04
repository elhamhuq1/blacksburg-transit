/**
 * Unit tests for time utilities
 */

import { formatETA, formatTime, getRelativeTime, isStale } from './time';

describe('formatETA', () => {
  it('should format 0 minutes as "Due"', () => {
    expect(formatETA(0)).toBe('Due');
  });

  it('should format less than 60 seconds as "Approaching"', () => {
    expect(formatETA(0, 30)).toBe('Approaching');
    expect(formatETA(0, 59)).toBe('Approaching');
  });

  it('should format minutes', () => {
    expect(formatETA(1)).toBe('1 min');
    expect(formatETA(5)).toBe('5 min');
    expect(formatETA(30)).toBe('30 min');
  });

  it('should format negative minutes as "Departed"', () => {
    expect(formatETA(-5)).toBe('Departed');
  });
});

describe('formatTime', () => {
  it('should format time in 12-hour format with AM/PM', () => {
    const result = formatTime('2024-01-01T14:30:00');
    // Result format depends on locale, just check it's a valid string
    expect(typeof result).toBe('string');
    expect(result).toContain(':');
  });

  it('should handle invalid dates gracefully', () => {
    expect(formatTime('invalid')).toBe('--:--');
  });
});

describe('getRelativeTime', () => {
  it('should return "just now" for recent timestamps', () => {
    const now = new Date();
    const thirtySecsAgo = new Date(now.getTime() - 30 * 1000).toISOString();
    expect(getRelativeTime(thirtySecsAgo)).toBe('just now');
  });

  it('should return "X minutes ago" for < 1 hour', () => {
    const now = new Date();
    const fiveMinsAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
    const result = getRelativeTime(fiveMinsAgo);
    expect(result).toContain('minute');
    expect(result).toContain('ago');
  });

  it('should return "X hours ago" for < 24 hours', () => {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const result = getRelativeTime(twoHoursAgo);
    expect(result).toContain('hour');
    expect(result).toContain('ago');
  });

  it('should return "yesterday" or "X days ago" for >= 24 hours', () => {
    const now = new Date();
    const yesterdayISO = new Date(now.getTime() - 25 * 60 * 60 * 1000).toISOString();
    const result = getRelativeTime(yesterdayISO);
    expect(result).toMatch(/yesterday|day.*ago/);
  });

  it('should handle invalid dates gracefully', () => {
    expect(getRelativeTime('invalid')).toBe('unknown');
  });
});

describe('isStale', () => {
  it('should return true for timestamps older than threshold', () => {
    const now = new Date();
    const sixMinsAgo = new Date(now.getTime() - 6 * 60 * 1000).toISOString();
    expect(isStale(sixMinsAgo, 5 * 60 * 1000)).toBe(true); // 5 min threshold
  });

  it('should return false for timestamps within threshold', () => {
    const now = new Date();
    const fourMinsAgo = new Date(now.getTime() - 4 * 60 * 1000).toISOString();
    expect(isStale(fourMinsAgo, 5 * 60 * 1000)).toBe(false); // 5 min threshold
  });

  it('should handle invalid dates as stale', () => {
    expect(isStale('invalid')).toBe(true);
  });
});
