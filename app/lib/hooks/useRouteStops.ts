/**
 * React Query hook for fetching stops on a route
 */

import { useQuery } from '@tanstack/react-query';
import { fetchRouteStops } from '../api';
import { POLLING_INTERVALS } from '../../constants/Config';

export function useRouteStops(routeId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['routeStops', routeId],
    queryFn: () => fetchRouteStops(routeId),
    enabled: enabled && !!routeId,
    staleTime: POLLING_INTERVALS.ROUTE_STOPS,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
}

