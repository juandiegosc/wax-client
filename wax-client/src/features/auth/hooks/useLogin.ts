import { useMutation, useQueryClient } from '@tanstack/react-query';
import agent from '@/lib/api/agent';
import { mutationKeys, queryKeys } from '@/lib/queryKeys';
import type { Login } from '@/lib/types/user';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: mutationKeys.user.login,
    mutationFn: async (creds: Login) => {
      await agent.post('/login?useCookies=true', creds);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};
