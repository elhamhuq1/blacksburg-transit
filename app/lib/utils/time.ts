/**
 * Time utility functions
 * ETA formatting, relative time, date helpers
 */

import { ETA_THRESHOLDS } from '../../constants/Config';

/**
 * Format ETA in minutes to human-readable string
 * @param etaMinutes - ETA in minutes
 * @param etaSeconds - ETA in seconds (for sub-minute precision)
 * @returns Formatted string like "5 min", "Approaching", "Due"
 */
export function formatETA(etaMinutes: number, etaSeconds?: number): string {
  // Handle approaching (<1 min)
  if (etaSeconds !== undefined && etaSeconds < ETA_THRESHOLDS.APPROACHING) {
    return 'Approaching';
  }

  // Handle due/arriving now
  if (etaMinutes === 0) {
    return 'Due';
  }

  // Handle negative (hide if configured)
  if (etaMinutes < 0 && ETA_THRESHOLDS.HIDE_NEGATIVE) {
    return 'Departed';
  }

  // Standard format
  return `${etaMinutes} min`;
}

/**
 * Format ISO 8601 timestamp to time string
 * @param isoString - ISO 8601 datetime
 * @returns Formatted time like "2:30 PM"
 */
export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return '--:--';
    }
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '--:--';
  }
}

/**
 * Get relative time string (e.g., "2 minutes ago", "just now")
 * @param isoString - ISO 8601 datetime
 * @returns Relative time string
 */
export function getRelativeTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return 'unknown';
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes === 1) return '1 minute ago';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'yesterday';
    return `${diffDays} days ago`;
  } catch {
    return 'unknown';
  }
}

/**
 * Check if a timestamp is stale (older than threshold)
 * @param isoString - ISO 8601 datetime
 * @param thresholdMs - Staleness threshold in milliseconds (default: 5 minutes)
 * @returns true if stale
 */
export function isStale(isoString: string, thresholdMs: number = 300000): boolean {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return true;
    }
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    return diffMs > thresholdMs;
  } catch {
    return true;
  }
}

/**
 * Format seconds to human-readable walking time
 * @param seconds - Walking time in seconds
 * @returns Formatted string like "3 min walk"
 */
export function formatWalkingTime(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 1) return '< 1 min walk';
  if (minutes === 1) return '1 min walk';
  return `${minutes} min walk`;
}

