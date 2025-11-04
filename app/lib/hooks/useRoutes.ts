/**
 * React Query hook for fetching routes
 */

import { useQuery } from '@tanstack/react-query';
import { api } from '../api';
import { CACHE_TTL } from '../../constants/Config';

export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: () => api.getRoutes(),
    staleTime: CACHE_TTL.ROUTES,
    gcTime: CACHE_TTL.ROUTES * 2,
  });
}

