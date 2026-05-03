import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { supportApi } from '@/features/support/api/supportApi';
import type { SupportTicketParams } from '@/features/support/types/support.types';

export const useTickets = (params: SupportTicketParams = {}) => {
  return useQuery({
    queryKey: queryKeys.tickets.list(params),
    queryFn: () => supportApi.getTickets(params),
    placeholderData: keepPreviousData,
  });
};
