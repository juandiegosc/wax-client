import { useMutation } from '@tanstack/react-query';
import agent from '@/lib/api/agent';
import { mutationKeys } from '@/lib/queryKeys';
import type { Register } from '@/lib/types/user';

export const useRegister = () => {
  return useMutation({
    mutationKey: mutationKeys.user.register,
    mutationFn: async (creds: Register) => {
      await agent.post('/account/register', creds);
    },
  });
};
