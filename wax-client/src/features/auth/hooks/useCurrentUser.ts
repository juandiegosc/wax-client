import { useQuery } from '@tanstack/react-query';
import agent from '@/lib/api/agent';
import { queryKeys } from '@/lib/queryKeys';
import type { UserInfo } from '@/lib/types/user';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.user.current(),
    queryFn: async () => {
      const response = await agent.get<UserInfo>('/account/user-info');
      if (response.status === 204 || !response.data) return null;
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};
