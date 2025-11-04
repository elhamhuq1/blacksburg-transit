/**
 * React Query hook for fetching nearby stops
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { CACHE_TTL } from '../../constants/Config';

export function useNearbyStops(lat?: number, lon?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ['nearbyStops', lat, lon],
    queryFn: () => {
      if (lat === undefined || lon === undefined) {
        throw new Error('Location required');
      }
      return api.getNearbyStops(lat, lon);
    },
    enabled: enabled && lat !== undefined && lon !== undefined,
    staleTime: CACHE_TTL.NEARBY_STOPS,
    gcTime: CACHE_TTL.NEARBY_STOPS * 2,
  });
}

