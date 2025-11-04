/**
 * Caching layer for Vercel Edge Functions
 * Uses in-memory cache (suitable for Edge runtime)
 * Note: For production with Vercel KV, this would be extended
 */

import type { CacheEntry } from '../types/bt4u.js';

// In-memory cache for Edge runtime
const cache = new Map<string, CacheEntry<any>>();

// Track cache statistics
let cacheHits = 0;
let cacheMisses = 0;

/**
 * Get value from cache
 */
export async function cacheGet<T>(
  key: string,
  options: { allowStale?: boolean } = {}
): Promise<T | null> {
  const entry = cache.get(key);

  if (!entry) {
    cacheMisses++;
    return null;
  }

  const now = Date.now();
  const age = now - entry.timestamp;

  // Check if expired
  if (age > entry.ttl * 1000) {
    if (options.allowStale) {
      // Return stale data if allowed (for fallback scenarios)
      cacheHits++;
      return entry.data as T;
    }
    cache.delete(key);
    cacheMisses++;
    return null;
  }

  cacheHits++;
  return entry.data as T;
}

/**
 * Set value in cache with TTL (in seconds)
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const entry: CacheEntry<T> = {
    data: value,
    timestamp: Date.now(),
    ttl: ttlSeconds,
  };

  cache.set(key, entry);

  // Optional: Clean up expired entries periodically (simple approach)
  if (cache.size > 1000) {
    cleanupExpiredEntries();
  }
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  cache.delete(key);
}

/**
 * Clear all cache entries
 */
export async function cacheClear(): Promise<void> {
  cache.clear();
  cacheHits = 0;
  cacheMisses = 0;
}

/**
 * Get cache hit rate (for health checks)
 */
export function getCacheHitRate(): number {
  const total = cacheHits + cacheMisses;
  if (total === 0) return 0;
  return cacheHits / total;
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { hits: number; misses: number; size: number; hitRate: number } {
  return {
    hits: cacheHits,
    misses: cacheMisses,
    size: cache.size,
    hitRate: getCacheHitRate(),
  };
}

/**
 * Clean up expired entries from cache
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of cache.entries()) {
    const age = now - entry.timestamp;
    if (age > entry.ttl * 1000) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    cache.delete(key);
  }
}

/**
 * Generate cache key for different operations
 */
export function generateCacheKey(operation: string, params: Record<string, any> = {}): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}:${params[key]}`)
    .join('|');

  return `${operation}${sortedParams ? `|${sortedParams}` : ''}`;
}

