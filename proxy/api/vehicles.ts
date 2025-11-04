/**
 * GET /api/vehicles?routeId={routeId}
 * Fetch live vehicle positions
 * Cache: 10 seconds (real-time data)
 */

import { fetchBT4U } from '../lib/bt4u.js';
import { parseVehicles } from '../lib/parsers.js';
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

  // Get optional routeId filter from query params
  const url = new URL(req.url);
  const routeId = url.searchParams.get('routeId');

  const cacheKey = routeId
    ? generateCacheKey('vehicles', { routeId })
    : generateCacheKey('vehicles');

  const cached = await cacheGet(cacheKey);

  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  try {
    const params = routeId ? { RouteID: routeId } : {};
    const xml = await fetchBT4U('GetVehiclePositions', params);
    let vehicles = parseVehicles(xml);

    // Filter by routeId if specified and not already filtered by API
    if (routeId) {
      vehicles = vehicles.filter((v) => v.routeId === routeId);
    }

    // Cache for 10 seconds
    await cacheSet(cacheKey, vehicles, 10);

    return new Response(JSON.stringify(vehicles), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);

    // If GetVehiclePositions doesn't exist, return empty array instead of error
    if (
      error instanceof Error &&
      (error.message.includes('404') || error.message.includes('not found'))
    ) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Feature-Available': 'false' },
      });
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch vehicles',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

