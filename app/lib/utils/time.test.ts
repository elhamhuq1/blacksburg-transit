/**
 * Unit tests for time utilities
 */

import { formatETA, formatTime, getRelativeTime, isStale } from './time';

describe('formatETA', () => {
  it('should format seconds under 60 as "Approaching"', () => {
    expect(formatETA(0)).toBe('Approaching');
    expect(formatETA(30)).toBe('Approaching');
    expect(formatETA(59)).toBe('Approaching');
  });

  it('should format seconds 60-3540 as minutes', () => {
    expect(formatETA(60)).toBe('1 min');
    expect(formatETA(120)).toBe('2 mins');
    expect(formatETA(300)).toBe('5 mins');
    expect(formatETA(3540)).toBe('59 mins');
  });

  it('should format seconds >= 3600 as hours and minutes', () => {
    expect(formatETA(3600)).toBe('1 hr');
    expect(formatETA(3660)).toBe('1 hr 1 min');
    expect(formatETA(7200)).toBe('2 hrs');
    expect(formatETA(7320)).toBe('2 hrs 2 mins');
  });

  it('should handle negative ETAs by showing "Approaching"', () => {
    expect(formatETA(-10)).toBe('Approaching');
    expect(formatETA(-120)).toBe('Approaching');
  });
});

describe('formatTime', () => {
  it('should format time in 12-hour format with AM/PM', () => {
    expect(formatTime('2024-01-01T09:30:00')).toBe('9:30 AM');
    expect(formatTime('2024-01-01T14:45:00')).toBe('2:45 PM');
    expect(formatTime('2024-01-01T00:00:00')).toBe('12:00 AM');
    expect(formatTime('2024-01-01T12:00:00')).toBe('12:00 PM');
  });

  it('should handle invalid dates gracefully', () => {
    expect(formatTime('invalid')).toBe('Invalid time');
  });
});

describe('getRelativeTime', () => {
  const now = new Date('2024-01-01T12:00:00').getTime();

  it('should return "Just now" for recent timestamps', () => {
    const recent = new Date('2024-01-01T11:59:50').toISOString();
    expect(getRelativeTime(recent, now)).toBe('Just now');
  });

  it('should return "X seconds ago" for < 1 minute', () => {
    const thirtySecsAgo = new Date('2024-01-01T11:59:30').toISOString();
    expect(getRelativeTime(thirtySecsAgo, now)).toBe('30 seconds ago');
  });

  it('should return "X minutes ago" for < 1 hour', () => {
    const fiveMinsAgo = new Date('2024-01-01T11:55:00').toISOString();
    expect(getRelativeTime(fiveMinsAgo, now)).toBe('5 minutes ago');
  });

  it('should return "X hours ago" for < 24 hours', () => {
    const twoHoursAgo = new Date('2024-01-01T10:00:00').toISOString();
    expect(getRelativeTime(twoHoursAgo, now)).toBe('2 hours ago');
  });

  it('should return "X days ago" for >= 24 hours', () => {
    const twoDaysAgo = new Date('2023-12-30T12:00:00').toISOString();
    expect(getRelativeTime(twoDaysAgo, now)).toBe('2 days ago');
  });

  it('should handle invalid dates gracefully', () => {
    expect(getRelativeTime('invalid', now)).toBe('Unknown');
  });
});

describe('isStale', () => {
  const now = new Date('2024-01-01T12:00:00').getTime();

  it('should return true for timestamps older than threshold', () => {
    const sixMinsAgo = new Date('2024-01-01T11:54:00').toISOString();
    expect(isStale(sixMinsAgo, 5, now)).toBe(true);
  });

  it('should return false for timestamps within threshold', () => {
    const fourMinsAgo = new Date('2024-01-01T11:56:00').toISOString();
    expect(isStale(fourMinsAgo, 5, now)).toBe(false);
  });

  it('should handle invalid dates as stale', () => {
    expect(isStale('invalid', 5, now)).toBe(true);
  });
});
