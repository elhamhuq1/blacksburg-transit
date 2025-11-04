/**
 * GET /api/stops/{stopId}/schedule
 * Fetch scheduled (not real-time) stop information - fallback when live data unavailable
 * Cache: 1 hour (static schedule data)
 */

import { fetchBT4U } from '../../../lib/bt4u.js';
import { parsePredictions } from '../../../lib/parsers.js';
import { cacheGet, cacheSet, generateCacheKey } from '../../../lib/cache.js';
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

  // Extract stopId from URL
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/');
  const stopId = pathParts[pathParts.length - 2];

  const validation = validateStopId(stopId);
  if (!validation.valid) {
    return new Response(JSON.stringify({ error: validation.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cache (longer TTL for schedule data)
  const cacheKey = generateCacheKey('schedule', { stopId });
  const cached = await cacheGet(cacheKey);

  if (cached) {
    return new Response(JSON.stringify(cached), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
    });
  }

  try {
    const xml = await fetchBT4U('GetScheduledStopInfo', { StopID: stopId });
    const schedule = parsePredictions(xml, stopId);

    // Mark all predictions as schedule-based
    const scheduleData = {
      ...schedule,
      predictions: schedule.predictions.map((p) => ({ ...p, scheduleBased: true })),
    };

    // Cache for 1 hour
    await cacheSet(cacheKey, scheduleData, 3600);

    return new Response(JSON.stringify(scheduleData), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error(`Error fetching schedule for stop ${stopId}:`, error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch schedule',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

