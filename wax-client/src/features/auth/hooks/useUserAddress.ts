import { useQuery } from '@tanstack/react-query';
import agent from '@/lib/api/agent';
import { queryKeys } from '@/lib/queryKeys';
import type { AddressResponse } from '@/lib/types/user';
import { mapAddressResponse } from '@/features/auth/utils/profileDetails';

export const useUserAddress = (enabled = true) => {
  return useQuery({
    queryKey: queryKeys.user.address(),
    queryFn: async () => {
      try {
        const response = await agent.get<AddressResponse>('/account/billing-address');
        if (response.status === 204 || !response.data) return null;
        return mapAddressResponse(response.data);
      } catch {
        return null;
      }
    },
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};
