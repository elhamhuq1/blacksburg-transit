/**
 * GET /api/routes/{routeId}/stops?direction={0|1}
 * Fetch stops for a specific route and direction
 * Cache: 5 minutes (semi-static data)
 */

import { fetchBT4U } from '../../../lib/bt4u.js';
import { parseRouteStops } from '../../../lib/parsers.js';
import { cacheGet, cacheSet, generateCacheKey } from '../../../lib/cache.js';
import { checkRateLimit, getClientIdentifier } from '../../../lib/rate-limit.js';
import { validateRouteId, validateDirection } from '../../../lib/validation.js';

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

  // Extract routeId from URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const routeId = pathParts[pathParts.length - 2];

  // Get direction from query params (default to 0)
  const directionParam = url.searchParams.get('direction') || '0';
  const direction = parseInt(directionParam, 10);

  // Validate inputs
  const routeValidation = validateRouteId(routeId);
  if (!routeValidation.valid) {
    return new Response(JSON.stringify({ error: routeValidation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const directionValidation = validateDirection(direction);
  if (!directionValidation.valid) {
    return new Response(JSON.stringify({ error: directionValidation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cache
  const cacheKey = generateCacheKey('route-stops', { routeId, direction });
  const cached = await cacheGet(cacheKey);

  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  try {
    const xml = await fetchBT4U('GetRouteStops', { RouteID: routeId, Direction: direction });
    const routeStops = parseRouteStops(xml, routeId, direction);

    // Cache for 5 minutes
    await cacheSet(cacheKey, routeStops, 300);

    return new Response(JSON.stringify(routeStops), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error(`Error fetching stops for route ${routeId}:`, error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch route stops',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

