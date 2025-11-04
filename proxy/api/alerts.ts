/**
 * GET /api/alerts
 * Fetch service alerts
 * Cache: 5 minutes
 */

import { fetchBT4U } from '../lib/bt4u.js';
import { parseAlerts } from '../lib/parsers.js';
import { cacheGet, cacheSet, generateCacheKey } from '../lib/cache.js';
import { checkRateLimit, getClientIdentifier } from '../lib/rate-limit.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const clientId = getClientIdentifier(req);
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const cacheKey = generateCacheKey('alerts');
  const cached = await cacheGet(cacheKey);

  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  try {
    // Get all active alerts (current and future)
    const xml = await fetchBT4U('GetActiveAlerts');
    const alerts = parseAlerts(xml);

    // Cache for 5 minutes
    await cacheSet(cacheKey, alerts, 300);

    return new Response(JSON.stringify(alerts), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);

    // If GetAlerts doesn't exist, return empty array
    if (
      error instanceof Error &&
      (error.message.includes('404') || error.message.includes('not found'))
    ) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Feature-Available': 'false' },
      });
    }

    const staleCache = await cacheGet(cacheKey, { allowStale: true });
    if (staleCache) {
      return new Response(JSON.stringify(staleCache), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'STALE' },
      });
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch alerts',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

