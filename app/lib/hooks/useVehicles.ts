/**
 * React Query hook for fetching vehicle positions
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { CACHE_TTL, POLLING_INTERVALS } from '../../constants/Config';

export function useVehicles(routeId?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['vehicles', routeId],
    queryFn: () => api.getVehicles(routeId),
    enabled,
    staleTime: CACHE_TTL.VEHICLES,
    gcTime: CACHE_TTL.VEHICLES * 2,
    // Poll every 10 seconds for real-time updates
    refetchInterval: POLLING_INTERVALS.VEHICLES,
    refetchIntervalInBackground: false,
  });
}

