/**
 * React Query hook for fetching stop departures
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { CACHE_TTL, POLLING_INTERVALS } from '../../constants/Config';

interface UseStopDeparturesOptions {
  enabled?: boolean;
}

export function useStopDepartures(stopId: string, options?: UseStopDeparturesOptions) {
  return useQuery({
    queryKey: ['stopDepartures', stopId],
    queryFn: () => api.getStopDepartures(stopId),
    enabled: options?.enabled ?? true,
    staleTime: CACHE_TTL.DEPARTURES,
    gcTime: CACHE_TTL.DEPARTURES * 2,
    // Poll every 10 seconds for real-time updates
    refetchInterval: POLLING_INTERVALS.DEPARTURES,
    refetchIntervalInBackground: false,
  });
}

interface UseStopScheduleOptions {
  enabled?: boolean;
}

export function useStopSchedule(stopId: string, options?: UseStopScheduleOptions) {
  return useQuery({
    queryKey: ['stopSchedule', stopId],
    queryFn: () => api.getStopSchedule(stopId),
    enabled: options?.enabled ?? false,
    staleTime: CACHE_TTL.SCHEDULE,
    gcTime: CACHE_TTL.SCHEDULE * 2,
  });
}

