/**
 * GET /api/stops/nearby?lat={lat}&lon={lon}&radius={meters}
 * Fetch stops near given coordinates
 * Cache: 30 seconds
 */

import { fetchBT4U } from '../../lib/bt4u.js';
import { parseNearbyStops } from '../../lib/parsers.js';
import { cacheGet, cacheSet, generateCacheKey } from '../../lib/cache.js';
import { canProceed, recordSuccess, recordFailure } from '../../lib/circuit-breaker.js';
import { checkRateLimit, getClientIdentifier } from '../../lib/rate-limit.js';
import { validateCoordinates, validateRadius } from '../../lib/validation.js';

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

  // Parse query parameters
  const url = new URL(req.url);
  const latParam = url.searchParams.get('lat');
  const lonParam = url.searchParams.get('lon');
  const radiusParam = url.searchParams.get('radius') || '800';

  if (!latParam || !lonParam) {
    return new Response(JSON.stringify({ error: 'Missing lat or lon query parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lat = parseFloat(latParam);
  const lon = parseFloat(lonParam);
  const radius = parseInt(radiusParam, 10);

  // Validate inputs
  const coordValidation = validateCoordinates(lat, lon);
  if (!coordValidation.valid) {
    return new Response(JSON.stringify({ error: coordValidation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const radiusValidation = validateRadius(radius);
  if (!radiusValidation.valid) {
    return new Response(JSON.stringify({ error: radiusValidation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cache (round coords to 3 decimal places for cache key)
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLon = Math.round(lon * 1000) / 1000;
  const cacheKey = generateCacheKey('nearby', { lat: roundedLat, lon: roundedLon, radius });
  const cached = await cacheGet(cacheKey);

  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  if (!canProceed()) {
    const staleCache = await cacheGet(cacheKey, { allowStale: true });
    if (staleCache) {
      return new Response(JSON.stringify(staleCache), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'STALE' },
      });
    }
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const xml = await fetchBT4U('GetNearestStops', {
      Latitude: lat,
      Longitude: lon,
      Radius: radius,
    });

    const stops = parseNearbyStops(xml, lat, lon);

    // Cache for 30 seconds
    await cacheSet(cacheKey, stops, 30);
    recordSuccess();

    return new Response(JSON.stringify(stops), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    recordFailure();
    console.error('Error fetching nearby stops:', error);

    const staleCache = await cacheGet(cacheKey, { allowStale: true });
    if (staleCache) {
      return new Response(JSON.stringify(staleCache), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'STALE' },
      });
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch nearby stops',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

