import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../services/api/dashboard';

export const useDashboard = (params) => {
  return useQuery({
    queryKey: ['dashboard', params],
    queryFn: () => getDashboardData(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
  });
};
