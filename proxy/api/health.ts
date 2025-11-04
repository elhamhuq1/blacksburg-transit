/**
 * GET /api/health
 * Health check endpoint with metrics
 */

import { checkBT4UHealth } from '../lib/bt4u.js';
import { getCacheStats } from '../lib/cache.js';
import { getCircuitState } from '../lib/circuit-breaker.js';
import type { HealthResponse } from '../types/bt4u.js';

export const config = {
  runtime: 'edge',
};

const startTime = Date.now();

export default async function handler(_req: Request) {
  try {
    // Check upstream BT4U health
    const bt4uHealth = await checkBT4UHealth();

    // Get cache statistics
    const cacheStats = getCacheStats();

    // Get circuit breaker state
    const circuitState = getCircuitState();

    // Calculate uptime
    const uptime = Date.now() - startTime;

    // Determine overall status
    let status: HealthResponse['status'] = 'ok';
    if (!bt4uHealth.available) {
      status = circuitState.state === 'open' ? 'down' : 'degraded';
    }

    const health: HealthResponse = {
      status,
      uptime: Math.floor(uptime / 1000), // seconds
      cache_hit_rate: Math.round(cacheStats.hitRate * 100) / 100,
      upstream_latency_p95_ms: bt4uHealth.latency,
      requests_last_hour: cacheStats.hits + cacheStats.misses, // Rough estimate
      circuit_breaker_state: circuitState.state,
    };

    return new Response(JSON.stringify(health), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return new Response(
      JSON.stringify({
        status: 'down',
        error: error instanceof Error ? error.message : 'Health check failed',
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

