/**
 * React Query hook for fetching stop departures
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { CACHE_TTL, POLLING_INTERVALS } from '../../constants/Config';

export function useStopDepartures(stopId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['stopDepartures', stopId],
    queryFn: () => api.getStopDepartures(stopId),
    enabled,
    staleTime: CACHE_TTL.DEPARTURES,
    gcTime: CACHE_TTL.DEPARTURES * 2,
    // Poll every 10 seconds for real-time updates
    refetchInterval: POLLING_INTERVALS.DEPARTURES,
    refetchIntervalInBackground: false,
  });
}

export function useStopSchedule(stopId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['stopSchedule', stopId],
    queryFn: () => api.getStopSchedule(stopId),
    enabled,
    staleTime: CACHE_TTL.SCHEDULE,
    gcTime: CACHE_TTL.SCHEDULE * 2,
  });
}

