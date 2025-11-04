/**
 * Circuit breaker pattern implementation
 * Prevents cascading failures by monitoring upstream errors
 */

import type { CircuitBreakerState } from '../types/bt4u.js';

const FAILURE_THRESHOLD = 7; // Open circuit after 7 failures in last 10 requests
const WINDOW_SIZE = 10; // Track last 10 requests
const OPEN_DURATION = 30_000; // Keep circuit open for 30 seconds
const HALF_OPEN_SUCCESS_THRESHOLD = 1; // One success closes the circuit

// Track recent requests (1 = success, 0 = failure)
const recentRequests: number[] = [];
let circuitState: CircuitBreakerState['state'] = 'closed';
let lastFailureTime = 0;
let halfOpenAttempts = 0;

/**
 * Check if circuit breaker allows request
 */
export function canProceed(): boolean {
  const now = Date.now();

  // If circuit is open, check if enough time has passed to try half-open
  if (circuitState === 'open') {
    const timeSinceFailure = now - lastFailureTime;

    if (timeSinceFailure >= OPEN_DURATION) {
      // Transition to half-open state
      circuitState = 'half-open';
      halfOpenAttempts = 0;
      return true;
    }

    return false; // Circuit still open, reject request
  }

  // Allow requests in closed or half-open states
  return true;
}

/**
 * Record successful request
 */
export function recordSuccess(): void {
  recentRequests.push(1);
  if (recentRequests.length > WINDOW_SIZE) {
    recentRequests.shift();
  }

  // If in half-open state, successful request closes the circuit
  if (circuitState === 'half-open') {
    halfOpenAttempts++;
    if (halfOpenAttempts >= HALF_OPEN_SUCCESS_THRESHOLD) {
      circuitState = 'closed';
      recentRequests.length = 0; // Reset failure tracking
    }
  }
}

/**
 * Record failed request
 */
export function recordFailure(): void {
  recentRequests.push(0);
  if (recentRequests.length > WINDOW_SIZE) {
    recentRequests.shift();
  }

  lastFailureTime = Date.now();

  // Count failures in recent window
  const failures = recentRequests.filter((r) => r === 0).length;

  // Open circuit if too many failures
  if (failures >= FAILURE_THRESHOLD) {
    circuitState = 'open';
  }

  // If in half-open state, failure immediately opens circuit again
  if (circuitState === 'half-open') {
    circuitState = 'open';
  }
}

/**
 * Get current circuit breaker state
 */
export function getCircuitState(): CircuitBreakerState {
  const failures = recentRequests.filter((r) => r === 0).length;

  return {
    failures,
    lastFailureTime,
    state: circuitState,
  };
}

/**
 * Reset circuit breaker (for testing or manual intervention)
 */
export function resetCircuit(): void {
  recentRequests.length = 0;
  circuitState = 'closed';
  lastFailureTime = 0;
  halfOpenAttempts = 0;
}

