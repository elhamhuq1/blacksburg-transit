/**
 * React Query hook for fetching service alerts
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { CACHE_TTL, POLLING_INTERVALS } from '../../constants/Config';

export function useAlerts(enabled: boolean = true) {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: () => api.getAlerts(),
    enabled,
    staleTime: CACHE_TTL.ALERTS,
    gcTime: CACHE_TTL.ALERTS * 2,
    refetchInterval: POLLING_INTERVALS.ALERTS,
  });
}

