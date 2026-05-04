import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { basketApi } from '@/features/basket/api/basketApi';
import type { Basket } from '@/features/basket/types/basket.types';

export const useBasket = (enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.basket.all,
    queryFn: async () => {
      const basket = await basketApi.getBasket();
      const cached = queryClient.getQueryData<Basket>(queryKeys.basket.all);
      // GET /basket never returns clientSecret — only POST /payment does.
      // Preserve it from the previous cache so background refetches don't wipe it.
      if (!basket.clientSecret && cached?.clientSecret) {
        return {
          ...basket,
          clientSecret: cached.clientSecret,
          paymentIntentId: cached.paymentIntentId,
        };
      }
      return basket;
    },
    enabled,
    retry: false,
  });
};
