import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { supportApi } from '@/features/support/api/supportApi';

export const useTicket = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: () => supportApi.getTicket(id),
    enabled: Boolean(id),
  });
};
