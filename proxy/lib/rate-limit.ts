/**
 * Rate limiting for API endpoints
 * Simple in-memory rate limiter (100 req/min per IP)
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT = 100; // requests per window
const WINDOW_MS = 60_000; // 1 minute window

/**
 * Check if request is allowed under rate limit
 */
export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  // No entry or expired window - allow request
  if (!entry || now >= entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });

    return {
      allowed: true,
      remaining: RATE_LIMIT - 1,
      resetTime: now + WINDOW_MS,
    };
  }

  // Check if limit exceeded
  if (entry.count >= RATE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count and allow
  entry.count++;

  return {
    allowed: true,
    remaining: RATE_LIMIT - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers
  const headers = request.headers;

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to a generic identifier (not ideal but prevents crashes)
  return 'unknown';
}

/**
 * Clean up expired rate limit entries (periodic cleanup)
 */
export function cleanupRateLimits(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  for (const [key, entry] of rateLimitMap.entries()) {
    if (now >= entry.resetTime) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    rateLimitMap.delete(key);
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimits, 5 * 60 * 1000);
}

