import { useQuery } from '@tanstack/react-query';
import { getAuditLogs } from '../services/api/auditLogs';

export const useAuditLogs = (params = {}) => {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => getAuditLogs(params),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
};
