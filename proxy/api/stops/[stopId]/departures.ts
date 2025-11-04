/**
 * GET /api/stops/{stopId}/departures
 * Fetch real-time predictions for a stop
 * Cache: 10 seconds (core real-time data)
 */

import { fetchBT4U } from '../../../lib/bt4u.js';
import { parsePredictions } from '../../../lib/parsers.js';
import { cacheGet, cacheSet, generateCacheKey } from '../../../lib/cache.js';
import { canProceed, recordSuccess, recordFailure } from '../../../lib/circuit-breaker.js';
import { checkRateLimit, getClientIdentifier } from '../../../lib/rate-limit.js';
import { validateStopId } from '../../../lib/validation.js';

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

  // Extract stopId from URL path
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const stopId = pathParts[pathParts.length - 2]; // /api/stops/{stopId}/departures

  // Validate stop ID
  const validation = validateStopId(stopId);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cache
  const cacheKey = generateCacheKey('departures', { stopId });
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
      return new Response(JSON.stringify({ ...staleCache, cached: true }), {
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
    // BT4U's GetNextDepartures requires BOTH routeShortName AND stopCode
    // So we need to: 1) Get all routes, 2) Query each route for this stop, 3) Aggregate
    
    // Step 1: Get all active routes
    const routesXml = await fetchBT4U('GetCurrentRoutes');
    const { parseRoutes } = await import('../../../lib/parsers.js');
    const routes = parseRoutes(routesXml);

    if (routes.length === 0) {
      throw new Error('No active routes found');
    }

    // Step 2: Fetch departures for each route at this stop (in parallel)
    const departurePromises = routes.map(async (route) => {
      try {
        const xml = await fetchBT4U('GetNextDepartures', {
          routeShortName: route.shortName,
          stopCode: stopId,
        });
        return parsePredictions(xml, stopId);
      } catch (err) {
        // Route might not serve this stop - that's ok, skip it
        console.log(`[BT4U] Route ${route.shortName} does not serve stop ${stopId}`);
        return null;
      }
    });

    const allDepartures = await Promise.all(departurePromises);

    // Step 3: Aggregate predictions from all routes
    const validDepartures = allDepartures.filter((d) => d !== null && d.predictions.length > 0);
    
    if (validDepartures.length === 0) {
      // No departures found for this stop
      const result = {
        stopId,
        stopName: '',
        predictions: [],
        cached: false,
        lastUpdated: new Date().toISOString(),
      };
      await cacheSet(cacheKey, result, 10);
      recordSuccess();
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
      });
    }

    // Merge all predictions and sort by arrival time
    const allPredictions = validDepartures.flatMap((d) => d?.predictions || []);
    allPredictions.sort(
      (a, b) =>
        new Date(a.predictedArrivalTime).getTime() - new Date(b.predictedArrivalTime).getTime()
    );

    const stopName = validDepartures[0]?.stopName || '';

    const departures = {
      stopId,
      stopName,
      predictions: allPredictions,
      cached: false,
      lastUpdated: new Date().toISOString(),
    };

    // Cache for 10 seconds (critical real-time data)
    await cacheSet(cacheKey, departures, 10);
    recordSuccess();

    return new Response(JSON.stringify(departures), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    recordFailure();
    console.error(`Error fetching departures for stop ${stopId}:`, error);

    const staleCache = await cacheGet(cacheKey, { allowStale: true });
    if (staleCache) {
      return new Response(JSON.stringify({ ...staleCache, cached: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'STALE' },
      });
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch departures',
        message: error instanceof Error ? error.message : 'Unknown error',
        stopId,
        stopName: '',
        predictions: [],
        cached: false,
        lastUpdated: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

