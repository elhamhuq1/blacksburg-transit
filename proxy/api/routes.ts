/**
 * GET /api/routes
 * Fetch all active routes
 * Cache: 5 minutes
 */

import { fetchBT4U } from '../lib/bt4u.js';
import { parseRoutes } from '../lib/parsers.js';
import { cacheGet, cacheSet, generateCacheKey } from '../lib/cache.js';
import { canProceed, recordSuccess, recordFailure } from '../lib/circuit-breaker.js';
import { checkRateLimit, getClientIdentifier } from '../lib/rate-limit.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Rate limiting
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((rateLimit.resetTime - Date.now()) / 1000)),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  }

  // Check cache
  const cacheKey = generateCacheKey('routes');
  const cached = await cacheGet(cacheKey);

  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'HIT',
      },
    });
  }

  // Circuit breaker check
  if (!canProceed()) {
    // Try to serve stale cache
    const staleCache = await cacheGet(cacheKey, { allowStale: true });
    if (staleCache) {
      return new Response(JSON.stringify(staleCache), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'STALE',
          'Warning': '110 - "Response is Stale"',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '30',
      },
    });
  }

  try {
    // Fetch from BT4U
    const xml = await fetchBT4U('GetCurrentRoutes');
    const routes = parseRoutes(xml);

    // Cache for 5 minutes
    await cacheSet(cacheKey, routes, 300);

    recordSuccess();

    return new Response(JSON.stringify(routes), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    recordFailure();

    console.error('Error fetching routes:', error);

    // Try to serve stale cache
    const staleCache = await cacheGet(cacheKey, { allowStale: true });
    if (staleCache) {
      return new Response(JSON.stringify(staleCache), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'STALE',
          'Warning': '110 - "Response is Stale"',
        },
      });
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch routes',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

