import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import agent from '@/lib/api/agent';
import { mutationKeys, queryKeys } from '@/lib/queryKeys';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationKey: mutationKeys.user.logout,
    mutationFn: async () => {
      await agent.post('/account/logout');
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: queryKeys.user.all });
      queryClient.removeQueries({ queryKey: queryKeys.basket.all });
      navigate('/');
    },
  });
};
